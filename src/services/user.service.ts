import prisma from '../config/prisma';
import { User, TokenType } from '@prisma/client';
import * as bcryptUtils from '../utils/bcrypt.utils'; 
import { ChangePasswordInput } from '../validators/user.validator';
import { exclude } from '../utils/keyExcluder.utils';

export const getUserProfile = async (userId: string): Promise<Omit<User, 'password'>> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Exclude password before returning
    return exclude(user, ['password']);
};

export const changeUserPassword = async (userId: string, input: ChangePasswordInput): Promise<void> => {
    const { oldPassword, newPassword } = input;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('User not found'); 
    }

    const isPasswordMatch = await bcryptUtils.compareData(oldPassword, user.password);
    if (!isPasswordMatch) {
        throw new Error('Incorrect old password');
    }

    const hashedNewPassword = await bcryptUtils.hashData(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    // Invalidate all existing refresh tokens for this user
    await prisma.token.deleteMany({
        where: { userId: userId, type: TokenType.REFRESH },
    });
};
