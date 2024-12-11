import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/custom-error";
import dotenv from "dotenv";
dotenv.config();
export interface TokenPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new CustomError("No authorization header", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new CustomError("No token provided", 401);
    }

    const decoded = jwt.verify(
      token,
      "your_super_secret_jwt_key"
    ) as TokenPayload;

    // Validate the decoded token has required fields
    if (!decoded.userId || !decoded.role) {
      throw new CustomError("Invalid token payload", 401);
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError("Invalid token", 401));
    } else {
      next(error);
    }
  }
};

// src/middlewares/role.middleware.ts
