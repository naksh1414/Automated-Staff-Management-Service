import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import { Database } from "./config/database";
// Import routes
import staffRoutes from "./routes/staff.routes";

export class App {
  public app: Application;
  private database: Database;
  constructor() {
    this.app = express();
    this.database = Database.getInstance();
    console.log("📱 Initializing application...");
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    console.log("✅ Application initialized successfully");
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.database.connect();
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    console.log("⚙️  Initializing middlewares...");

    // Security middlewares
    this.app.use(helmet());
    console.log("🔒 Helmet middleware initialized");

    this.app.use(
      cors({
        origin: "http://localhost:3000/",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    console.log("🌐 CORS middleware initialized");

    // Request logging middleware
    this.app.use((req: Request, res: Response, next) => {
      console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    // Request parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    console.log("📦 Request parsing middlewares initialized");

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: "Too many requests from this IP, please try again later.",
    });
    this.app.use("/api", limiter);
    console.log("⚡ Rate limiting middleware initialized");

    console.log("✅ All middlewares initialized successfully");
  }

  private initializeRoutes(): void {
    console.log("🛣️  Initializing routes...");

    // Health check endpoint
    this.app.get("/health", (req: Request, res: Response) => {
      console.log("💓 Health check requested");
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API version prefix
    const apiPrefix = `/api/v1`;
    console.log(`🔗 API prefix set to: ${apiPrefix}`);

    // Mount routes
    this.app.use(`${apiPrefix}/staff`, staffRoutes);
    console.log("👥 Staff routes mounted");

    // Handle undefined routes
    this.app.use("*", (req: Request, res: Response) => {
      console.warn(
        `⚠️  Undefined route accessed: ${req.method} ${req.originalUrl}`
      );
      res.status(404).json({
        status: "error",
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    });

    console.log("✅ All routes initialized successfully");
  }

  private initializeErrorHandling(): void {
    console.log("🔧 Initializing error handling...");

    // Error logging middleware
    this.app.use((err: Error, req: Request, res: Response, next: any) => {
      console.error("❌ Error occurred:", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
      });
      next(err);
    });

    this.app.use(errorHandler);
    console.log("✅ Error handling initialized successfully");
  }

  public async listen(): Promise<void> {
    try {
      await this.initializeDatabase();
      const port = process.env.PORT || 3000;
      this.app.listen(port, () => {
        console.log("================================================");
        console.log(`🚀 Server running on port ${port}`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔍 Health check: http://localhost:${port}/health`);
        console.log("================================================");

        // Log server information
        console.log("📊 Server Information:", {
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        });
      });
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }
}
