import { Response } from "express";
import { CustomError } from "./custom-error";
import { Logger } from "./logger";
import dotenv from "dotenv";
dotenv.config();

const logger = new Logger("ErrorHandler");

export const handleError = (error: any, res: Response): void => {
  logger.error("Error occurred:", error);

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
