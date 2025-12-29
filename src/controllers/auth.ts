import type { Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { prisma } from "../config/connectDB.js";
import { sendVerificationEmail } from "../utils/emails.js";
import bcrypt from "bcryptjs";

interface EmailPayload { email: string; }
export interface UserPayload { 
    id: string;
    firstname?: string;
    lastname?: string;
    companyname?: string;
    industry?: string;
    specialty?: string;
    email: string; 
    role: string;
    isNewUser: boolean;
    student: { firstname: string, lastname: string, specialty: string }
    company: { companyname: string, industry: string }
    profileUrl: string; }

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if(!email) return res.status(400).json({ message: "Email is required!" });
    if(!password) return res.status(400).json({ message: "Password is required!" });
    const foundUser = await prisma.user.findUnique({ where: { email }, include: { student: true, company: true } });
    if(!foundUser) return res.status(404).json({ message: "User with email doesn't exist!" });
    if(!foundUser.isVerified) {
        await sendVerificationEmail(email)
        return res.status(203).json({ message: "We've sent a verification link to your email!" })};
    const matches = await bcrypt.compare(password, foundUser.password!);
    if(!matches) return res.status(401).json({ message: "Password is incorrect!" });

    const payload = foundUser.role === "COMPANY" ? {
        companyname: foundUser.company?.companyname,
        industry: foundUser.company?.industry,
        companyId: foundUser.company?.id,
        profileUrl: foundUser.profileUrl,
        id: foundUser.id,
        email: foundUser.email,
        isNewUser: foundUser.isNewUser,
        address: foundUser.address,
        about: foundUser.about,
        linkedin: foundUser.linkedin,
        github: foundUser.github,
        website: foundUser.website,
        role: "COMPANY"
    } : {
        firstname: foundUser.student?.firstname,
        lastname: foundUser.student?.lastname,
        specialty: foundUser.student?.specialty,
        university: foundUser.student?.university,
        course: foundUser.student?.course,
        studentId: foundUser.student?.id,
        id: foundUser.id,
        email: foundUser.email,
        profileUrl: foundUser.profileUrl,
        isNewUser: foundUser.isNewUser,
        address: foundUser.address,
        about: foundUser.about,
        level: foundUser.student?.level,
        linkedin: foundUser.linkedin,
        github: foundUser.github,
        website: foundUser.website,
        role: "STUDENT"
    }

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN!,
        { expiresIn: "30m" });

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN!,
        { expiresIn: "1d" });

    try{await prisma.user.update({ where: { email }, data: { refreshToken } });}
    catch(err) {return res.status(500).json({ message: "Couldn't save refresh token!" })}
    if(process.env.DEV_TYPE === "PROD") res.cookie("jwt", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 });
    else res.cookie("jwt", refreshToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    return res.status(200).json({ user: payload, token: accessToken })}


    
export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;
    if(!token)return res.status(400).json({ message: "Verification token is required!" });
    jwt.verify(
        token,
        process.env.EMAIL_VERIFICATION_TOKEN!,
        async (err: VerifyErrors | null, decoded: JwtPayload | undefined | string) => {
            if(err) return res.status(401).json({ message: "Couldn't verify token!" });
            const email = (decoded as EmailPayload).email;
            if(!email) return res.status(401).json({ message: "Email is required for verification!" });
            const foundUser = await prisma.user.findFirst({ where: { email } });
            if(!foundUser) return res.status(404).json({ message: "User not found!" });
            await prisma.user.update({ where: { id: foundUser.id }, data: { isVerified: true } });
            return res.status(200).json({ message: "Your email has been verified. Signin to your account!" });});}


    
export const refresh = async (req: Request, res: Response) => {
    const { jwt: token } = req.cookies;
    if(!token)return res.status(403).json({ message: "Token is required for refresh!" });
    const foundUser = await prisma.user.findFirst({ where: { refreshToken: token }, include: { student: true, company: true } });
    if(!foundUser)return res.status(403).json({ message: "Couldn't find user with token!" });
    jwt.verify(
        token,
        process.env.REFRESH_TOKEN!,
        async (err: VerifyErrors | null, decoded: JwtPayload | undefined | string) => {
            if(err) return res.status(401).json({ message: "Couldn't verify token!" });
            const payload = foundUser.role === "COMPANY" ? {
                companyname: foundUser.company?.companyname,
                industry: foundUser.company?.industry,
                companyId: foundUser.company?.id,
                profileUrl: foundUser.profileUrl,
                id: foundUser.id,
                email: foundUser.email,
                isNewUser: foundUser.isNewUser,
                address: foundUser.address,
                about: foundUser.about,
                linkedin: foundUser.linkedin,
                github: foundUser.github,
                website: foundUser.website,
                role: "COMPANY"
            } : {
                firstname: foundUser.student?.firstname,
                lastname: foundUser.student?.lastname,
                specialty: foundUser.student?.specialty,
                university: foundUser.student?.university,
                course: foundUser.student?.course,
                studentId: foundUser.student?.id,
                id: foundUser.id,
                email: foundUser.email,
                isNewUser: foundUser.isNewUser,
                address: foundUser.address,
                profileUrl: foundUser.profileUrl,
                about: foundUser.about,
                linkedin: foundUser.linkedin,
                github: foundUser.github,
                level: foundUser.student?.level,
                website: foundUser.website,
                role: "STUDENT"
            }
            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN!,
                { expiresIn: "30m" });
            return res.status(200).json({ user: payload, token: accessToken });});}


    
export const signout = async (req: Request, res: Response) => {
    const {jwt: token} = req.cookies;
    if(!token)return res.status(403).json({ message: "Token is required for signout!" });
    const foundUser = await prisma.user.findFirst({ where: { refreshToken: token } });
    if(!foundUser)return res.status(403).json({ message: "Couldn't find user with token!" });
    const updatedUser = await prisma.user.update({ where: { id: foundUser.id }, data: { refreshToken: "" } });
    if(!updatedUser) return res.status(500).json({ message: "Couldn't empty refreshToken!" });
    res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: "Successfully signed out!" }) }

export const googleCallback = async (req: Request, res: Response) => {
    const user = req.user as UserPayload;
    if(!user) return res.json({ message: "User doesn't exist!" });
    const payload = user.student ? {
        id: user.id,
        firstname: user.student?.firstname,
        lastname: user.student?.lastname,
        specialty: user.student?.specialty ?? null,
        isNewUser: user.isNewUser,
        email: user.email,
        role: user.role,
        profileUrl: user.profileUrl 
    } : user.company ? {
        id: user.id,
        companyname: user.company?.companyname,
        industry: user.company?.industry ?? null,
        isNewUser: user.isNewUser,
        email: user.email,
        role: user.role,
        profileUrl: user.profileUrl 
    } : {}
    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN!,
        { expiresIn: "30m" },
    );
    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN!,
        { expiresIn: "1d" }
    );
    
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });
    if(process.env.DEV_TYPE === "PROD") res.cookie("jwt", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 });
    else res.cookie("jwt", refreshToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    
    res.redirect(`${process.env.CLIENT_URL}/googleoauth?token=${accessToken}`); }


export const getUserAndAccessToken = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });
        const token = authHeader.split(" ")[1];
        if(!token) return res.status(401).json({ message: "Missing Authorization header" });
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN!) as JwtPayload;
        const foundUser = await prisma.user.findUnique({ where: { id: decoded.id }, include: { student:true, company: true } });
        if(!foundUser)return res.status(404).json({ message: "User doesn't exist!" });
        const payload = foundUser.role === "COMPANY" ? {
            companyname: foundUser.company?.companyname,
            industry: foundUser.company?.industry,
            companyId: foundUser.company?.id,        
            profileUrl: foundUser.profileUrl,
            id: foundUser.id,
            email: foundUser.email,
            isNewUser: foundUser.isNewUser,
            address: foundUser.address,
            about: foundUser.about,
            linkedin: foundUser.linkedin,
            github: foundUser.github,
            website: foundUser.website,
            role: "COMPANY"
        } : {
            firstname: foundUser.student?.firstname,
            lastname: foundUser.student?.lastname,
            specialty: foundUser.student?.specialty,
            university: foundUser.student?.university,
            course: foundUser.student?.course,
            studentId: foundUser.student?.id,        
            id: foundUser.id,
            profileUrl: foundUser.profileUrl,
            email: foundUser.email,
            isNewUser: foundUser.isNewUser,
            address: foundUser.address,
            about: foundUser.about,
            linkedin: foundUser.linkedin,
            github: foundUser.github,
            level: foundUser.student?.level,
            website: foundUser.website,
            role: "STUDENT"
        }
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN!,
            { expiresIn: "30m" }
        );
        return res.status(200).json({ token: accessToken, user: foundUser });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token!" });
    }
};