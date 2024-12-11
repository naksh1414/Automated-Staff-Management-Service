// src/config/rabbitmq.ts

import amqp, { Channel, Connection } from 'amqplib';

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly exchangeName = 'bus_booking_events';
  private readonly exchangeType = 'direct';
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  private async createConnection(): Promise<void> {
    try {
      // Connect to RabbitMQ
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://localhost:5672'
      );
      
      // Create channel
      this.channel = await this.connection.createChannel();
      
      // Assert exchange
      await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
        durable: true
      });

      // Handle connection events
      this.connection.on('error', (error) => {
        console.error('❌ RabbitMQ connection error:', error);
        this.isInitialized = false;
        this.retryConnect();
      });

      this.connection.on('close', () => {
        console.warn('⚠️  RabbitMQ connection closed');
        this.isInitialized = false;
        this.retryConnect();
      });

      this.isInitialized = true;
      console.log('✅ RabbitMQ connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
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

    console.log('🐰 Connecting to RabbitMQ...');
    
    // Create new initialization promise
    this.initializationPromise = this.createConnection().finally(() => {
      this.initializationPromise = null;
    });

    return this.initializationPromise;
  }

  private async retryConnect(): Promise<void> {
    console.log('🔄 Attempting to reconnect to RabbitMQ...');
    try {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      await this.initialize();
    } catch (error) {
      console.error('❌ RabbitMQ reconnection failed:', error);
      this.retryConnect(); // Keep trying to reconnect
    }
  }

  public async ensureConnection(): Promise<void> {
    if (!this.isInitialized || !this.channel) {
      await this.initialize();
    }
  }

  public async publishEvent(routingKey: string, data: any): Promise<void> {
    try {
      await this.ensureConnection();

      if (!this.channel) {
        throw new Error('RabbitMQ channel not initialized');
      }

      await this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true,
          messageId: new Date().getTime().toString(),
          timestamp: new Date().getTime(),
          contentType: 'application/json',
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
      console.log('👋 RabbitMQ connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing RabbitMQ connection:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.isInitialized && this.channel !== null;
  }
}

// Helper function to publish events
export const publishEvent = async (routingKey: string, data: any): Promise<void> => {
  const rabbitMQ = RabbitMQClient.getInstance();
  await rabbitMQ.publishEvent(routingKey, data);
};