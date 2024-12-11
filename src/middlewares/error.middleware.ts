import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error";
import { Logger } from "../utils/logger";

const logger = new Logger("ErrorMiddleware");

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
