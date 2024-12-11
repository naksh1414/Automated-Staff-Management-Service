import jwt from "jsonwebtoken";
import { AuthTokenPayload } from "../types/staff.types";

interface TokenOptions {
  expiresIn?: string | number;
}

export class JWTUtil {
  /**
   * Generate a JWT token
   * @param payload Token payload
   * @param options Token generation options
   * @returns Generated JWT token
   */
  static generateToken(
    payload: AuthTokenPayload,
    options: TokenOptions = {}
  ): string {
    const secret = this.getSecretKey();

    return jwt.sign(payload, secret, {
      expiresIn: options.expiresIn || "7d", // Default 7 days
      algorithm: "HS256",
    });
  }

  /**
   * Verify and decode JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  static verifyToken(token: string): AuthTokenPayload {
    const secret = this.getSecretKey();

    try {
      return jwt.verify(token, secret) as AuthTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }

  /**
   * Generate a refresh token
   * @param payload Token payload
   * @returns Refresh token
   */
  static generateRefreshToken(payload: AuthTokenPayload): string {
    const secret = this.getSecretKey();

    return jwt.sign(payload, secret, {
      expiresIn: "30d", // Longer expiration for refresh token
    });
  }

  /**
   * Get secret key from environment
   * @returns JWT secret key
   */
  private static getSecretKey(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT secret is not defined");
    }

    return secret;
  }

  /**
   * Check if token is about to expire
   * @param token JWT token
   * @param thresholdSeconds Expiration threshold (default: 1 hour)
   * @returns Boolean indicating if token is close to expiration
   */
  static isTokenExpiringSoon(
    token: string,
    thresholdSeconds: number = 3600
  ): boolean {
    try {
      const decoded = this.verifyToken(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // @ts-ignore
      return decoded.exp - currentTime <= thresholdSeconds;
    } catch {
      return true; // Consider invalid tokens as expired
    }
  }
}
