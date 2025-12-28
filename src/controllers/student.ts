import type { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";

export const getStudents = async (req: Request, res: Response) => {
    const foundStudents = await prisma.student.findMany({ include: { user: true } });
    if(foundStudents.length < 1) return res.status(404).json([]);
    const students = foundStudents.map(student => ({
        profileUrl: student.user.profileUrl,
        address: student.user.address,
        about: student.user.about,
        firstname: student.firstname,
        lastname: student.lastname,
        university: student.university,
        course: student.course,
        level: student.level,
        specialty: student.specialty,
        resumeUrl: student.resumeUrl,
        isVerified: student.user.isVerified,
        id: student.userId,
    }));
    return res.status(200).json(students);
}