import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client"; 

interface ErrorResponse {
  message: string;
  code?: string; 
  stack?: string;
  errors?: any;
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error("ERROR:", err);

  let statusCode = err.statusCode || 500;
  const response: ErrorResponse = {
    message: err.message || "An unexpected error occurred",
  };

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    response.message = "Input validation failed";
    response.errors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  }
  // Handle Prisma Known Request Errors 
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    response.code = err.code; 
    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = 409; // Conflict
        // Extract field name from meta if available
        const field = (err.meta?.target as string[])?.join(", ");
        response.message = `Record already exists${field ? ` on field: ${field}` : ""}.`;
        break;
      case "P2014": // Required relation violation
      case "P2011": // Null constraint violation
        statusCode = 400;
        response.message = `Missing required field or relation: ${err.meta?.target || "Unknown"}`;
        break;
      case "P2025": // Record to update/delete not found
        statusCode = 404;
        response.message = `Record not found. ${err.meta?.cause || ""}`;
        break;
      default:
        statusCode = 500;
        response.message = `Database request error: ${err.code}`;
        break;
    }
  }
  // Handle Prisma Validation Errors 
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    response.message = "Invalid data provided for database operation.";
    console.error("Prisma Validation Error Details:", err.message);
  }
  // Handle custom AppErrors
  else if (err.statusCode) {
    statusCode = err.statusCode;
    response.message = err.message;
  }

  // Handle development server errors
  if (process.env.ENVIROMENT === "development" && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
