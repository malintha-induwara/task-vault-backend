import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { parseDuration } from "./durationParser.utils";

interface TokenPayload extends JwtPayload {
  userId: string;
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export const generateResetToken = (userId: string): string => {
  const payload = { userId };
  return jwt.sign(payload, process.env.JWT_RESET_PASSWORD_SECRET as string, {
    expiresIn: parseDuration(process.env.JWT_RESET_PASSWORD_EXPIRATION as string),
  });
};

export const generateAccessToken = (userId: string): string => {
  const payload = { userId };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: parseDuration(process.env.JWT_ACCESS_EXPIRATION as string),
  });
};

export const generateRefreshToken = (userId: string): string => {
  const payload = { userId };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: parseDuration(process.env.JWT_REFRESH_EXPIRATION as string),
  });
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    if (!decoded || !decoded.userId) {
      throw new AuthenticationError("Invalid token payload", "INVALID_PAYLOAD");
    }
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AuthenticationError("Access token expired", "ACCESS_TOKEN_EXPIRED");
    } else if (error instanceof JsonWebTokenError) {
      throw new AuthenticationError(`Invalid token: ${error.message}`, "INVALID_TOKEN");
    } else {
      console.error("Unexpected token verification error:", error);
      throw new AuthenticationError("Token verification failed", "VERIFICATION_FAILED");
    }
  }
};
