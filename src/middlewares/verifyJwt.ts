import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { UserPayload } from "../controllers/auth.js";

export interface ReqWithUser extends Request { user: UserPayload }

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization as string || req.headers.Authorization as string;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized: No token provided." });
    const token = authHeader.split(" ")[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN!,
        (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
            if (err) return res.status(403).json({ message: "Forbidden: Invalid or expired token." });
            (req as ReqWithUser).user = decoded as UserPayload;
            next();
        }
    );
};

export default verifyJWT;