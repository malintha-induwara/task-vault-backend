import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, ResetPasswordParams } from "../validators/auth.validator";
import { parseDuration } from "../utils/durationParser.utils";

// Utility to set refresh token cookie
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: (process.env.ENVIROMENT as string) === "production",
    sameSite: "lax",
    maxAge: parseDuration(process.env.JWT_REFRESH_EXPIRATION as string) * 1000, 
  });
};

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    if (error.message.includes("User with this email already exists")) {
      res.status(409).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = await authService.loginUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error: any) {
    if (error.message.includes("Invalid email or password")) {
      res.status(401).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token not found" });
    return;
  }

  try {
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ message: "Token refreshed successfully", accessToken });
  } catch (error: any) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.ENVIROMENT === "production", sameSite: "strict" });
    if (error.message.includes("Refresh token is mismatched") || error.message.includes("Invalid or expired refresh token signature") || error.message.includes("Refresh token not found")) {
      res.status(403).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;

  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.ENVIROMENT === "production", sameSite: "strict" });

  if (!refreshToken) {
    res.status(200).json({ message: "Logout successful (no token cookie found)" });
    return;
  }

  try {
    await authService.logoutUser(refreshToken);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during server-side logout token invalidation:", error);
    res.status(200).json({ message: "Logout processed, session cleared" });
  }
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response, next: NextFunction) => {
  try {
    await authService.handleForgotPassword(req.body);
    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error: any) {
    if (error.message.includes("Could not send password reset email")) {
      console.error(error);
      res.status(500).json({ message: "Failed to process password reset. Please try again later." });
      return;
    }
    next(error);
  }
};

export const resetPassword = async (req: Request<ResetPasswordParams, {}, ResetPasswordInput>, res: Response, next: NextFunction) => {
  try {
    await authService.handleResetPassword(req.params, req.body);
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error: any) {
    if (error.message.includes("Invalid or expired")) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error.message.includes("User associated with token not found")) {
      res.status(400).json({ message: "Password reset failed. Invalid request." }); 
      return;
    }
    next(error);
  }
};
