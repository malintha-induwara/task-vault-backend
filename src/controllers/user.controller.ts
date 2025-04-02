import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { ChangePasswordInput } from '../validators/user.validator';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authenticated' });
        return ;
    }
    try {
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json(user);
    } catch (error: any) {
         if (error.message.includes('User not found')) {
            res.status(404).json({ message: error.message });
            return;
        }
        next(error);
    }
};

export const changePassword = async (req: Request<{}, {}, ChangePasswordInput>, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        await userService.changeUserPassword(req.user.id, req.body);
        res.status(200).json({ message: 'Password changed successfully. Please log in again if necessary.' });
    } catch (error: any) {
        if (error.message.includes('User not found')) {
            res.status(404).json({ message: error.message });
            return;
        }
        if (error.message.includes('Incorrect old password')) {
            res.status(400).json({ message: error.message });
            return;
        }
        next(error);
    }
};
