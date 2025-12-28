import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/connectDB.js";
import type { Request, Response } from "express";
import { sendPasswordResetEmail } from "../utils/emails.js";
import type { VerifyErrors, JwtPayload } from "jsonwebtoken";

interface EmailPayload { email: string; }

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if(!email) return res.status(401).json({ message: "Email is required for password recovery!" });
    await sendPasswordResetEmail(email);
    return res.status(200).json({ message: "We've sent a password reset link to your email!" });}



export const resetPassword = async (req: Request, res: Response) => {
    const { password, token } = req.body;
    if(!password) return res.status(401).json({ message: "Password is required!" });
    if(!token)return res.status(400).json({ message: "Password reset token is required!" });
    jwt.verify(
        token,
        process.env.PASSWORD_RESET_TOKEN!,
        async (err: VerifyErrors | null, decoded: JwtPayload | undefined | string) => {
            if(err) return res.status(401).json({ message: "Couldn't verify token!" });
            const email = (decoded as EmailPayload).email;
            if(!email) return res.status(401).json({ message: "Email is required for password reset!" });
            const foundUser = await prisma.user.findUnique({ where: { email } });
            if(!foundUser) return res.status(404).json({ message: "User not found!" });
            const hashPwd = await bcrypt.hash(password, 10);
            const updatedUser = await prisma.user.update({ where: { email }, data: { password: hashPwd, refreshToken: "" } });
            if(!updatedUser) return res.status(500).json({ message: "Couldn't reset user password!" });
            return res.status(200).json({ message: "Your password has been reset, you can now sign in!" });})}