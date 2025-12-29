import passport from "passport";
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import { prisma } from "./connectDB.js";
import { configDotenv } from "dotenv";
import type { User } from "@prisma/client";

configDotenv();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.DEV_TYPE === "PROD" ? "https://kuusor.onrender.com" : "http://localhost/api/v1"}/auth/google/callback`,
    passReqToCallback: true,
}, async (req, _accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try{
        let user: User | object = {};
        let foundUser;
        const state = req.query.state ? JSON.parse(req.query.state as string) : {};
        const role = state.role || "STUDENT";
        if(profile.emails) foundUser = await prisma.user.findUnique({ where: { email: profile?.emails[0]?.value! } }) as User;
        if(foundUser){
            user = await prisma.user.update({
                where: { email: foundUser.email },
                data: { googleId: profile.id },
                include: { student: true, company: true }
            });
        }
        if(!foundUser && profile.emails){
            if(role === "STUDENT"){
                user = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        email: profile.emails[0]?.value!,
                        profileUrl: profile.photos?.[0]?.value ?? "",
                        role: "STUDENT",
                        student: { create: { firstname: profile.name?.givenName ?? "",
                        lastname: profile.name?.familyName ?? "" } },
                        isVerified: true
                    },
                    include: { student: true }
                }) as User;                
            }
            if(role === "COMPANY"){
                user = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        email: profile.emails[0]?.value!,
                        profileUrl: profile.photos?.[0]?.value ?? "",
                        role: "COMPANY",
                        company: { create: { companyname: (`${profile.name?.givenName} ${profile.name?.familyName}`) || "" } },
                        isVerified: true
                    },
                    include: { company: true }
                });                
            }
        }
        done(null, user);
    } catch(error){
        done(error, undefined);
    }
}))