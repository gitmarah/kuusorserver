import type { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";

export const postInternship = async (req: Request, res: Response) => {
    const { title, description, duration, deadline, type, companyId, responsibilities, requirements, benefits } = req.body;
    if(!title) return res.status(400).json({ message: "Title is required!" });
    if(!description) return res.status(400).json({ message: "Description is required!" });
    if(!responsibilities) return res.status(400).json({ message: "Responsibilities entry is required!" });
    if(!duration) return res.status(400).json({ message: "Duration is required!" });
    if(!deadline) return res.status(400).json({ message: "Deadline is required!" });
    if(!type) return res.status(400).json({ message: "Type is required!" });
    if(!companyId) return res.status(400).json({ message: "Company Id is required!" });
    const foundCompany = await prisma.company.findUnique({ where: { id: companyId } });
    if(!foundCompany) return res.status(404).json({ message: "Company does not exist!" });
    try{
        const internship = await prisma.internship.create({ data: { title, description, duration, deadline: new Date(deadline), type, companyId, responsibilities, requirements: requirements || null, benefits: benefits || null } });
        return res.status(200).json(internship);
    } catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server Error: Unable to create internship!" });
    } }


export const updateInternship = async (req: Request, res: Response) => {
    const internshipId = req.params.id;
    if(!internshipId) return res.status(400).json({ message: "Internship Id is required!" });
    const foundInternship = await prisma.internship.findUnique({ where: {id: internshipId} });
    if(!foundInternship) return res.status(404).json({ message: "Internship does not exist!" });
    const { title, description, duration, deadline, type, responsibilities, requirements, benefits } = req.body;
    try{
        if(title) await prisma.internship.update({ where: { id: internshipId }, data: { title } });
        if(description) await prisma.internship.update({ where: { id: internshipId }, data: { description } });
        if(duration) await prisma.internship.update({ where: { id: internshipId }, data: { duration } });
        if(deadline) {
            const formatedDeadline = new Date(deadline);
            await prisma.internship.update({ where: { id: internshipId }, data: { deadline: formatedDeadline } });
        }
        if(type) await prisma.internship.update({ where: { id: internshipId }, data: { type } });
        if(responsibilities) await prisma.internship.update({ where: { id: internshipId }, data: { responsibilities } });
        if(requirements) await prisma.internship.update({ where: { id: internshipId }, data: { requirements } });
        if(benefits) await prisma.internship.update({ where: { id: internshipId }, data: { benefits } });
        const updatedInternship = await prisma.internship.findUnique({ where: { id: internshipId }, include: { company: { include: { user: true } } } });
        if(!updatedInternship) return res.status(500).json({ message: "Server error: Unable to update internship!" });
        const internship = {
            companyname: updatedInternship.company.companyname,
            profileUrl: updatedInternship.company.user.profileUrl,
            address: updatedInternship.company.user.address,
            deadline: updatedInternship.deadline,
            description: updatedInternship.description,
            duration: updatedInternship.duration,
            title: updatedInternship.title,
            requirements: updatedInternship.requirements,
            benefits: updatedInternship.benefits,
            companyId: updatedInternship.companyId,
            type: updatedInternship.type,
            responsibilities: updatedInternship.responsibilities,
            id: updatedInternship.id,
            shortlisted: updatedInternship.shortlisted,
        }
        return res.status(200).json(internship);
    } catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server Error: Unable to create internship!" });
    } }


export const getInternship = async (req: Request, res: Response) => {
    const internshipId = req.params.id;
    if(!internshipId) return res.status(400).json({ message: "Internship Id is required!" });
    const foundInternship = await prisma.internship.findUnique({ where: {id: internshipId}, include: { company: { include: { user: true } } } });
    if(!foundInternship) return res.status(404).json({ message: "Internship does not exist!" });
    const internship = {
        companyname: foundInternship.company.companyname,
        profileUrl: foundInternship.company.user.profileUrl,
        address: foundInternship.company.user.address,
        deadline: foundInternship.deadline,
        description: foundInternship.description,
        duration: foundInternship.duration,
        title: foundInternship.title,
        requirements: foundInternship.requirements,
        benefits: foundInternship.benefits,
        companyId: foundInternship.companyId,
        type: foundInternship.type,
        responsibilities: foundInternship.responsibilities,
        id: foundInternship.id,
        shortlisted: foundInternship.shortlisted,
    }
    return res.status(200).json(internship); }


export const getInternshipsByCompany = async (req: Request, res: Response) => {
    const companyId = req.params.id;
    if(!companyId) return res.status(400).json({ message: "Company Id is required!" });
    const foundInternships = await prisma.internship.findMany({ where: { companyId}, include: { company: { include: { user: true } } } });
    if(foundInternships.length < 1) return res.status(404).json([]);
    const internships = foundInternships.sort((a, b) => Number(Boolean(a.shortlisted)) - Number(Boolean(b.shortlisted))).map(internship => ({
        companyname: internship.company.companyname,
        profileUrl: internship.company.user.profileUrl,
        address: internship.company.user.address,
        deadline: internship.deadline,
        description: internship.description,
        duration: internship.duration,
        title: internship.title,
        requirements: internship.requirements,
        benefits: internship.benefits,
        companyId: internship.companyId,
        type: internship.type,
        responsibilities: internship.responsibilities,
        id: internship.id,
        shortlisted: internship.shortlisted,
    }));
    return res.status(200).json(internships); }


export const getInternships = async (req: Request, res: Response) => {
    const foundInternships = await prisma.internship.findMany({ include: { company: { include: { user: true } } } });
    if(foundInternships.length < 1) return res.status(404).json([]);
    const internships = foundInternships.map(internship => ({
        companyname: internship.company.companyname,
        profileUrl: internship.company.user.profileUrl,
        address: internship.company.user.address,
        deadline: internship.deadline,
        description: internship.description,
        duration: internship.duration,
        title: internship.title,
        requirements: internship.requirements,
        benefits: internship.benefits,
        companyId: internship.companyId,
        type: internship.type,
        responsibilities: internship.responsibilities,
        id: internship.id,
        shortlisted: internship.shortlisted,
    }));
    return res.status(200).json(internships);
}


export const deleteInternship = async (req: Request, res: Response) => {
    const internshipId = req.params.id;
    if(!internshipId) return res.status(400).json({ message: "Internship Id is required!" });
    const foundInternship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if(!foundInternship) return res.status(404).json({ message: "Internship not found!!" });
    try{
        await prisma.internship.delete({ where: { id: internshipId } });        
    } catch(err){
        console.error(err);
    }
    return res.status(200).json({ message: "Successfully deleted internship!" });
}


