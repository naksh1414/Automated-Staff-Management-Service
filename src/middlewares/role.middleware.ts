import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error";

export const validateRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      console.log(req.user);
      console.log(allowedRoles);
      if (!req.user) {
        throw new CustomError("User not authenticated", 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new CustomError("Unauthorized access", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
