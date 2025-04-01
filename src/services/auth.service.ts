import prisma from "../config/prisma";
import { User, TokenType } from "@prisma/client";
import { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, ResetPasswordParams } from "../validators/auth.validator";
import * as jwtUtils from "../utils/jwt.utils";
import * as bcryptUtils from "../utils/bcrypt.utils";
import { sendPasswordResetEmail } from "./email.service";
import { parseDuration } from "../utils/durationParser.utils";
import { exclude } from "../utils/keyExcluder.utils";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const registerUser = async (input: RegisterInput): Promise<Omit<User, "password">> => {
  const { email, password, name } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcryptUtils.hashData(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  return exclude(user, ["password"]);
};

export const loginUser = async (input: LoginInput): Promise<AuthTokens> => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatch = await bcryptUtils.compareData(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwtUtils.generateAccessToken(user.id);
  const refreshToken = jwtUtils.generateRefreshToken(user.id);

  await storeRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (incomingRefreshToken: string): Promise<{ accessToken: string }> => {
  const decoded = jwtUtils.verifyToken(incomingRefreshToken, process.env.JWT_REFRESH_SECRET as string);
  if (!decoded) {
    throw new Error("Invalid or expired refresh token signature");
  }
  const userId = decoded.userId.toString();

  const storedToken = await prisma.token.findFirst({
    where: {
      userId: userId,
      type: TokenType.REFRESH,
      expires: { gt: new Date() },
    },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found");
  }

  const isTokenValid = await bcryptUtils.compareData(incomingRefreshToken, storedToken.token);

  if (!isTokenValid) {
    throw new Error("Refresh token is mismatched");
  }

  const newAccessToken = jwtUtils.generateAccessToken(userId);
  return { accessToken: newAccessToken };
};

export const logoutUser = async (incomingRefreshToken: string): Promise<void> => {
  const decoded = jwtUtils.verifyToken(incomingRefreshToken, process.env.JWT_REFRESH_SECRET as string);
  if (!decoded || !decoded.userId) {
    console.warn("Attempting logout with invalid refresh token signature.");
  }

  const userId = decoded.userId.toString();

  try {
    const storedToken = await prisma.token.findFirst({
      where: {
        userId,
        type: TokenType.REFRESH,
        expires: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new Error("Refresh token not found");
    }

    const result = await prisma.token.deleteMany({
      where: { userId: storedToken.userId, type: TokenType.REFRESH },
    });

    if (result.count === 0) {
      console.warn("Logout attempt: Refresh token not found in DB.");
    }
  } catch (hashError) {
    console.error("Error hashing refresh token during logout:", hashError);
    throw new Error("Logout failed due to internal error");
  }
};

const storeRefreshToken = async (userId: string, token: string): Promise<void> => {
  const hashedToken = await bcryptUtils.hashData(token);
  const expires = new Date(Date.now() + parseDuration(process.env.JWT_REFRESH_EXPIRATION as string));

  await prisma.token.deleteMany({
    where: { userId: userId, type: TokenType.REFRESH },
  });

  await prisma.token.create({
    data: {
      userId: userId,
      token: hashedToken,
      type: TokenType.REFRESH,
      expires: expires,
    },
  });
};

export const handleForgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
  const { email } = input;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`Password reset requested for non-existent email: ${email}`);
    return;
  }

  const resetToken = jwtUtils.generateResetToken(user.id);
  const hashedResetToken = await bcryptUtils.hashData(resetToken);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete existing reset tokens
  await prisma.token.deleteMany({
    where: { userId: user.id, type: TokenType.RESET },
  });

  // Store new reset token
  await prisma.token.create({
    data: {
      userId: user.id,
      token: hashedResetToken,
      type: TokenType.RESET,
      expires: expires,
    },
  });

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    throw new Error("Could not send password reset email.");
  }
};

export const handleResetPassword = async (params: ResetPasswordParams, body: ResetPasswordInput): Promise<void> => {
  const { token: resetToken } = params;
  const { password: newPassword } = body;

  const decoded = jwtUtils.verifyToken(resetToken, process.env.JWT_RESET_PASSWORD_SECRET as string);

  if (!decoded) {
    throw new Error("Invalid or expired password reset token");
  }

  const userId = decoded.userId.toString();

  const storedToken = await prisma.token.findFirst({
    where: {
      userId,
      type: TokenType.RESET,
      expires: { gt: new Date() },
    },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found");
  }

  const isTokenValid = await bcryptUtils.compareData(resetToken, storedToken.token);
  if (!isTokenValid) {
    throw new Error("Reset token is mismatched");
  }

  const hashedNewPassword = await bcryptUtils.hashData(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  await prisma.token.delete({ where: { id: storedToken.id } });

  await prisma.token.deleteMany({
    where: { userId: userId, type: TokenType.REFRESH },
  });
};
