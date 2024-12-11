import amqp from "amqplib";
import { Logger } from "./logger";
import dotenv from "dotenv";
dotenv.config();

class EventPublisher {
  private static instance: EventPublisher;
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger("EventPublisher");
  }

  static getInstance(): EventPublisher {
    if (!EventPublisher.instance) {
      EventPublisher.instance = new EventPublisher();
    }
    return EventPublisher.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.connection = await amqp.connect("amqp://localhost:5672");
      this.channel = await this.connection.createChannel();

      // Ensure exchange exists
      await this.channel.assertExchange("bus_booking_events", "topic", {
        durable: true,
      });

      this.logger.info("EventPublisher initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize EventPublisher:", error);
      throw error;
    }
  }

  async publish(routingKey: string, data: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.initialize();
      }

      this.channel!.publish(
        "bus_booking_events",
        routingKey,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
      );

      this.logger.info(`Event published: ${routingKey}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${routingKey}:`, error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.error("Error during cleanup:", error);
      throw error;
    }
  }
}

export const eventPublisher = EventPublisher.getInstance();

export const publishEvent = async (
  routingKey: string,
  data: any
): Promise<void> => {
  await eventPublisher.publish(routingKey, data);
};
