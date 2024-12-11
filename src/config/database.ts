// src/config/database.ts

import mongoose from "mongoose";

export class Database {
  private static instance: Database;
  private readonly mongoUri: string;
  private readonly options: mongoose.ConnectOptions;

  private constructor() {
    this.mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://nakshatramanglik14:naksh1414@cluster0.3lrl1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    this.options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      console.log("🔌 Connecting to MongoDB...");

      mongoose.connection.on("connecting", () => {
        console.log("⌛ Establishing database connection...");
      });

      mongoose.connection.on("connected", () => {
        console.log("✅ Successfully connected to MongoDB");
      });

      mongoose.connection.on("error", (error) => {
        console.error("❌ MongoDB connection error:", error);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected");
      });

      // Handle application termination
      process.on("SIGINT", async () => {
        try {
          await mongoose.connection.close();
          console.log("💤 MongoDB connection closed through app termination");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error closing MongoDB connection:", error);
          process.exit(1);
        }
      });

      await mongoose.connect(this.mongoUri, this.options);
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      throw error;
    }
  }
}
