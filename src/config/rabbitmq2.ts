// src/config/rabbitmq.ts

import amqp, { Channel, Connection } from "amqplib";
import { config } from "dotenv";

config();

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly exchangeName = "bus_booking_events";
  private readonly exchangeType = "direct";
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly queues = {
    staff: "staff_events",
    bus: "bus_events",
    route: "route_events",
  };

  private constructor() {}

  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  private async createConnection(): Promise<void> {
    try {
      // Get CloudAMQP URL from environment variables
      const amqpUrl =
        "amqps://ijkrsadb:L70-2AHWZjsJsX6UUN0L1Vz6N0VsL_Pd@rabbit.lmq.cloudamqp.com/ijkrsadb";

      if (!amqpUrl) {
        throw new Error(
          "CLOUDAMQP_URL or RABBITMQ_URL must be set in environment variables"
        );
      }

      // Connect to CloudAMQP
      this.connection = await amqp.connect(amqpUrl);

      console.log("Successfully connected to CloudAMQP");

      // Create channel
      this.channel = await this.connection.createChannel();

      // Assert exchange
      await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
        durable: true,
      });

      // Assert all queues
      await Promise.all(
        Object.entries(this.queues).map(([_, queueName]) =>
          this.channel!.assertQueue(queueName, {
            durable: true,
            deadLetterExchange: `${this.exchangeName}.dlx`,
          })
        )
      );

      // Assert Dead Letter Exchange
      await this.channel.assertExchange(`${this.exchangeName}.dlx`, "direct", {
        durable: true,
      });

      // Bind queues to exchange with appropriate routing keys
      await this.channel.bindQueue(
        this.queues.staff,
        this.exchangeName,
        "staff.*"
      );

      // Handle connection events
      this.connection.on("error", (error) => {
        console.error("❌ CloudAMQP connection error:", error);
        this.isInitialized = false;
        this.retryConnect();
      });

      this.connection.on("close", () => {
        console.warn("⚠️  CloudAMQP connection closed");
        this.isInitialized = false;
        this.retryConnect();
      });

      this.isInitialized = true;
      console.log("✅ CloudAMQP connected successfully");
    } catch (error) {
      console.error("❌ Failed to connect to CloudAMQP:", error);
      throw error;
    }
  }

  public async ensureConnection(): Promise<void> {
    if (!this.isInitialized || !this.channel) {
      await this.initialize();
    }
  }

  public getChannel(): Channel | null {
    return this.channel;
  }

  public async initialize(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.isInitialized) {
      return Promise.resolve();
    }

    console.log("🐰 Connecting to RabbitMQ...");

    // Create new initialization promise
    this.initializationPromise = this.createConnection().finally(() => {
      this.initializationPromise = null;
    });

    return this.initializationPromise;
  }

  private async retryConnect(): Promise<void> {
    console.log("🔄 Attempting to reconnect to RabbitMQ...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      await this.initialize();
    } catch (error) {
      console.error("❌ RabbitMQ reconnection failed:", error);
      this.retryConnect(); // Keep trying to reconnect
    }
  }

  public async publishEvent(routingKey: string, data: any): Promise<void> {
    try {
      await this.ensureConnection();

      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }

      this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true,
          messageId: new Date().getTime().toString(),
          timestamp: new Date().getTime(),
          contentType: "application/json",
        }
      );

      console.log(`📨 Event published to ${routingKey}:`, data);
    } catch (error) {
      console.error(`❌ Failed to publish event to ${routingKey}:`, error);
      throw error;
    }
  }

  public async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isInitialized = false;
      console.log("👋 RabbitMQ connection closed gracefully");
    } catch (error) {
      console.error("❌ Error closing RabbitMQ connection:", error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.isInitialized && this.channel !== null;
  }
}

// Example consumer setup
export class EventConsumer {
  private static instance: EventConsumer;
  private client: RabbitMQClient;

  private constructor() {
    this.client = RabbitMQClient.getInstance();
  }

  public static getInstance(): EventConsumer {
    if (!EventConsumer.instance) {
      EventConsumer.instance = new EventConsumer();
    }
    return EventConsumer.instance;
  }

  public async startConsuming(
    queueName: string,
    handler: (msg: any) => Promise<void>
  ): Promise<void> {
    await this.client.ensureConnection();
    const channel = this.client.getChannel();

    if (!channel) {
      throw new Error("Channel not initialized");
    }

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel.ack(msg);
        } catch (error) {
          console.error(`Error processing message from ${queueName}:`, error);
          // Reject the message and requeue if it's not a parsing error
          channel.nack(msg, false, error instanceof SyntaxError ? false : true);
        }
      }
    });
  }
}
