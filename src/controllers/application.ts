import type { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";
import { sendShortlistEmail } from "../utils/emails.js";
import { format } from "date-fns";
import type { Application } from "@prisma/client";

export const internshipApplication = async (req: Request, res: Response) => {
    const { internshipId, studentId } = req.body;
    if(!internshipId) return res.status(400).json({ message: "Internship Id is required!" });
    if(!studentId) return res.status(400).json({ message: "Student Id is required!" });
    const duplicate = await prisma.application.findFirst({ where: { studentId, internshipId } });
    if(duplicate) return res.status(409).json({ message: "You already applied for this internship!" });
    try{
        const newApplication = await prisma.application.create({ data: {
            internshipId, studentId
        }, include: { internship: true, student: true } });  
        return res.status(200).json(newApplication);      
    } catch(err){
        return res.status(500).json({ message: "Server error: Unable to apply for internship!" });
    } }


export const removeApplications = async (req: Request, res: Response): Promise<Response> => {
    const internshipId = req.params.id;
    const { selected } = req.body;
    if (!internshipId) return res.status(400).json({ message: "Internship ID is required." });
    if (!selected) return res.status(400).json({ message: "Selected field is required." });
    let applicants: string[];
    try { applicants = JSON.parse(selected); } catch { return res.status(400).json({ message: "Selected must be a valid JSON array." }); }
    if (!Array.isArray(applicants) || applicants.length === 0) return res.status(400).json({ message: "No applicants to remove." });

    try {
        const result = await prisma.application.deleteMany({
            where: {
                internshipId,
                studentId: {
                    in: applicants,
                },
            }, });

        return res.status(200).json({ message: "Applicants removed successfully.", deletedCount: result.count, });
    } catch (error) {
        console.error("Remove applications error:", error);
        return res.status(500).json({ message: "Server error: Unable to remove applications.", });
    }
};



export const getApplicationsByStudent = async (req: Request, res: Response) => {
    const studentId = req.params.id;
    if(!studentId) return res.status(400).json({ message: "Student Id is required!" });
    try{
        const foundApplications = await prisma.application.findMany({ where: { studentId }, include: { student: true, internship: { include: { company: { include: { user: true } } } } } });
        if(foundApplications.length < 1) return res.status(200).json([]);
        const applications = foundApplications.map((application) => {
            if(application.internship.shortlisted === false) return ({
            internship: {companyname: application.internship.company.companyname,
                profileUrl: application.internship.company.user.profileUrl,
                address: application.internship.company.user.address,
                deadline: application.internship.deadline,
                description: application.internship.description,
                duration: application.internship.duration,
                title: application.internship.title,
                type: application.internship.type,
                id: application.internshipId },
            id: application.id,
            studentId: application.studentId,
            internshipId: application.internshipId,
            student: application.student,
        })});
        return res.status(200).json(applications);      
    } catch(err){
        return res.status(500).json({ message: "Server error: Unable to get applications!" });
    } }

    

export const getApplicationsByInternship = async (req: Request, res: Response) => {
    const internshipId = req.params.id;
    if(!internshipId) return res.status(400).json({ message: "Internship Id is required!" });
    try{
        const foundApplications = await prisma.application.findMany({ where: { internshipId }, include: { student: { include:{ user: true }}, internship: true } });
        if(foundApplications.length < 1) return res.status(200).json([]);
        const applications = foundApplications.map(application => ({
            internship: application.internship,
            id: application.id,
            studentId: application.studentId,
            internshipId: application.internshipId,
            student: {
                id: application.studentId,
                firstname: application.student.firstname,
                userId: application.student.userId,
                lastname: application.student.lastname,
                university: application.student.university,
                course: application.student.course,
                address: application.student.user.address,
                profileUrl: application.student.user.profileUrl
            }
        }));
        return res.status(200).json(applications);      
    } catch(err){
        return res.status(500).json({ message: "Server error: Unable to get applications!" });
    } }



export const shortlistApplicants = async (req: Request, res: Response) => {
    const internshipId = req.params.id;
    const { selected, datetime, location, type  } = req.body;
    if (!internshipId) return res.status(400).json({ message: "Internship ID is required!" });
    if (!selected) return res.status(400).json({ message: "Selected field is required!" });
    if (!datetime) return res.status(400).json({ message: "Datetime field is required!" });
    if (!type) return res.status(400).json({ message: "Type field is required!" });
    let applicants: string[];
    try { applicants = JSON.parse(selected); } catch { return res.status(400).json({ message: "Selected must be a valid JSON array!" }); }
    if (!Array.isArray(applicants) || applicants.length === 0) return res.status(400).json({ message: "No applicants to shortlist!" });
    const internship = await prisma.internship.findUnique({ where: { id: internshipId }, include: { company: { include: { user: true } } } });
    if(!internship?.company) return res.status(500).json({ message: "Server Error: Unable to fetch internship!" });
    try {
        for(const id of applicants){
            const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
            if(!student?.user) return res.status(500).json({ message: "Server Error: Unable to fetch student!" });
            const details = {
                email: student?.user.email,
                date: format(datetime, "PPP"),
                time: format(datetime, "p"),
                profileUrl: internship?.company.user.profileUrl ?? undefined,
                location,
                studentName: student?.firstname,
                companyName: internship?.company.companyname,
                title: internship.title,
                type
            }
            await sendShortlistEmail(details);
        }
        await prisma.internship.update({ where: { id: internship.id }, data: { shortlisted: true } })

        return res.status(200).json({ message: "Applicants shortlisted successfully." });
    } catch (error) {
        console.error("Remove applications error:", error);
        return res.status(500).json({ message: "Server error: Unable to remove applications.", });
    } }