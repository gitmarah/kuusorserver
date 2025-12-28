import { NextFunction, Request, Response } from "express";
import { ReqWithUser } from "./verifyJwt.js";

const verifyRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as ReqWithUser)?.user?.role) return res.status(403).json({ message: "Access denied: no roles found." });
    const hasRole = allowedRoles.includes((req as ReqWithUser)?.user?.role);
    if (!hasRole) return res.status(403).json({ message: "Access denied: insufficient role." });
    next();
  };
};

export default verifyRoles;
