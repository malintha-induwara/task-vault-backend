import { Request, Response, NextFunction } from "express";
import { AuthenticationError, verifyToken } from "../utils/jwt.utils";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided", code: "NO_TOKEN" });
    return;
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET as string);

    if (decoded) {
      req.user = { id: decoded.userId.toString() };
    }
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      if (error.code === "ACCESS_TOKEN_EXPIRED") {
        res.status(401).json({ message: error.message, code: error.code });
      } else {
        res.status(401).json({ message: error.message, code: error.code || "AUTHENTICATION_FAILED" });
      }
    } else {
      next(error);
    }
  }
};
