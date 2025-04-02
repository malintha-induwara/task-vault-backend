import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

// Middleware factory
export const validateRequest = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      res.status(400).json({
        message: "Input validation failed",
        errors: formattedErrors,
      });
      return;
    }
    next(error);
  }
};
