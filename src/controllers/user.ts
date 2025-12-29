import type { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";
import handleUpload from "../config/cloudinary.js";
import bcrypt from "bcryptjs";



export const updateProfile = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { firstname, lastname, companyname, industry, address, specialty, website, github, linkedin, password, about, university, level, course } = req.body;
    if(!userId) return res.status(400).json({ message: "User Id is required!" });
    const foundUser = await prisma.user.findUnique({ where: { id: userId } });
    if(!foundUser) return res.status(404).json({ message: "User doesn't exist!" });
    if(req.file){
        let result;
        if(foundUser.profileId){
            result = await handleUpload(req.file.buffer, "profile", foundUser.profileId);            
        } else {
            result = await handleUpload(req.file.buffer, "profile", null);
        }

        if(result?.secure_url && result?.public_id){
            try{
                await prisma.user.update({
                    where: { id: userId },
                    data: { profileUrl: result.secure_url, profileId: result.public_id }
                });                
            } catch(err){
                console.log(err);
            }
        } }
    if(firstname) await prisma.student.update({ where: { userId }, data: { firstname } });
    if(lastname) await prisma.student.update({ where: { userId }, data: { lastname } });
    if(specialty) await prisma.student.update({ where: { userId }, data: { specialty } });
    if(university) await prisma.student.update({ where: { userId }, data: { university } });
    if(course) await prisma.student.update({ where: { userId }, data: { course } });
    if(level) await prisma.student.update({ where: { userId }, data: { level } });
    if(companyname) await prisma.company.update({ where: { userId }, data: { companyname } });   
    if(industry) await prisma.company.update({ where: { userId }, data: { industry } }); 
    if(address) await prisma.user.update({ where: { id: userId }, data: { address } }); 
    if(website) await prisma.user.update({ where: { id: userId }, data: { website } }); 
    if(github) await prisma.user.update({ where: { id: userId }, data: { github } }); 
    if(linkedin) await prisma.user.update({ where: { id: userId }, data: { linkedin } }); 
    if(about) await prisma.user.update({ where: { id: userId }, data: { about } }); 
    if(password) {
        const hashPwd = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: userId }, data: { password: hashPwd } }); }
    await prisma.user.update({ where: { id: userId }, data: { isNewUser: false } });

    const updatedUser = await prisma.user.findUnique({ where: {id: userId}, include: { student: true, company: true } });
    if(!updatedUser) return res.status(500).json({ message: "Server Error: Unable to update user!" })
    const newUserDetails = updatedUser.role === "COMPANY" ? {
        companyname: updatedUser.company?.companyname,
        industry: updatedUser.company?.industry,
        profileUrl: updatedUser.profileUrl,
        id: updatedUser.id,
        email: updatedUser.email,
        isNewUser: updatedUser.isNewUser,
        address: updatedUser.address,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        website: updatedUser.website,
        about: updatedUser.about,
        role: "COMPANY"
    } : {
        firstname: updatedUser.student?.firstname,
        lastname: updatedUser.student?.lastname,
        specialty: updatedUser.student?.specialty,
        university: updatedUser.student?.university,
        level: updatedUser.student?.level,
        course: updatedUser.student?.course,
        id: updatedUser.id,
        email: updatedUser.email,
        isNewUser: updatedUser.isNewUser,
        address: updatedUser.address,
        linkedin: updatedUser.linkedin,
        profileUrl: updatedUser.profileUrl,
        github: updatedUser.github,
        website: updatedUser.website,
        about: updatedUser.about,
        role: "STUDENT"
    }
    return res.status(200).json(newUserDetails);
}



export const uploadResume = async (req: Request, res: Response) => {
    const userId = req.params.id;
    if(!userId) return res.status(400).json({ message: "User Id is required!" });
    const foundUser = await prisma.user.findUnique({ where: { id: userId }, include: { student: true } });
    if(!foundUser) return res.status(404).json({ message: "User doesn't exist!" });
    if(req.file){
        let result;
        if(foundUser.student?.resumeId){
            result = await handleUpload(req.file.buffer, "resumes", foundUser.student.resumeId);      
        } else {
            result = await handleUpload(req.file.buffer, "resumes", null);
        } 

        if(result?.secure_url && result?.public_id){
            try{
                await prisma.student.update({
                    where: { userId },
                    data: { resumeUrl: result.secure_url, resumeId: result.public_id }
                });                
            } catch(err){
                console.log(err);
            }
        } }
    const updatedUser = await prisma.user.findUnique({ where: {id: userId}, include: { student: true, company: true } });
    if(!updatedUser) return res.status(500).json({ message: "Server Error: Unable to update user!" });
    const newUserDetails = updatedUser.role === "COMPANY" ? {
        companyname: updatedUser.company?.companyname,
        industry: updatedUser.company?.industry,
        companyId: updatedUser.company?.id,        
        profileUrl: updatedUser.profileUrl,
        id: updatedUser.id,
        email: updatedUser.email,
        isNewUser: updatedUser.isNewUser,
        address: updatedUser.address,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        website: updatedUser.website,
        about: updatedUser.about,
        role: "COMPANY"
    } : {
        firstname: updatedUser.student?.firstname,
        lastname: updatedUser.student?.lastname,
        specialty: updatedUser.student?.specialty,
        university: updatedUser.student?.university,
        level: updatedUser.student?.level,
        course: updatedUser.student?.course,
        studentId: updatedUser.student?.id,        
        resumeUrl: updatedUser.student?.resumeUrl,
        id: updatedUser.id,
        email: updatedUser.email,
        isNewUser: updatedUser.isNewUser,
        address: updatedUser.address,
        linkedin: updatedUser.linkedin,
        profileUrl: updatedUser.profileUrl,
        github: updatedUser.github,
        website: updatedUser.website,
        about: updatedUser.about,
        role: "STUDENT"
    }
    return res.status(200).json(newUserDetails);
}



export const getUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
    if(!userId) return res.status(400).json({ message: "User Id is required!" });
    const foundUser = await prisma.user.findUnique({ where: { id: userId }, include: { student: true, company: true } });
    if(!foundUser) return res.status(404).json({ message: "User doesn't exist!" });    
    const userDetails = foundUser.role === "COMPANY" ? {
        companyname: foundUser.company?.companyname,
        industry: foundUser.company?.industry,
        profileUrl: foundUser.profileUrl,
        companyId: foundUser.company?.id,
        id: foundUser.id,
        email: foundUser.email,
        isNewUser: foundUser.isNewUser,
        address: foundUser.address,
        linkedin: foundUser.linkedin,
        github: foundUser.github,
        website: foundUser.website,
        about: foundUser.about,
        role: "COMPANY"
    } : {
        firstname: foundUser.student?.firstname,
        lastname: foundUser.student?.lastname,
        specialty: foundUser.student?.specialty,
        university: foundUser.student?.university,
        level: foundUser.student?.level,
        course: foundUser.student?.course,
        studentId: foundUser.student?.id,
        resumeUrl: foundUser.student?.resumeUrl,
        id: foundUser.id,
        email: foundUser.email,
        isNewUser: foundUser.isNewUser,
        address: foundUser.address,
        linkedin: foundUser.linkedin,
        profileUrl: foundUser.profileUrl,
        github: foundUser.github,
        website: foundUser.website,
        about: foundUser.about,
        role: "STUDENT"
    }
    return res.status(200).json(userDetails);
}