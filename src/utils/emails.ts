import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



export const sendVerificationEmail = async (email: string) => {
    const token = jwt.sign(
        { email },
        process.env.EMAIL_VERIFICATION_TOKEN!,
        { expiresIn: "1h" }
    );
    const mailOptions = {
        from: `"Kuusor" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Confirm your Email to activate your Kuusor account!",
        html: `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                        <div style="margin:0 auto; padding: 0 25px; font-family:'Inter', 'Segoe UI', Arial, sans-serif;">
                        <div style="max-width:480px; margin:40px auto; background:#ffffff; overflow:hidden;">
                            

                            <a href="http://localhost:5173"><img src="https://lh3.googleusercontent.com/a-/ALV-UjXYycCWru4v9qrkbJogrY2zaSJwE_Umwu5OCCTf_0SZYDYPfjQ=s40-p" style="width: 40px;" alt=""></a>

                            
                            <div>
                                <p style="font-size:0.95rem; font-weight: bold; margin:18px 0 24px; width: 300px;">
                                    Confirm your email address to start browsing or posting internships.
                                </p>

                                <p style="color:#747474; font-size:0.85rem; margin-top:20px; line-height:1.5;">
                                    Once you verify <a href='mailto:${email}'>${email}</a> is your email, you can have full access to your account. Click the button below to confirm.
                                </p>

                                <a href="http://localhost:5173/verifyemail?token=${token}"
                                    style="display:inline-block; background:#10367D; padding:10px 22px; border-radius:5px; 
                                    color:white; font-size:0.75rem; text-decoration:none;">
                                    Confirm Email Address
                                </a>

                                <p style="color:#989898; font-size:0.85rem; margin-top:20px; line-height:1.5;">
                                    If you didn’t create an account or request this, no action is required.
                                </p>
                            </div>

                            
                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;">

                            
                            <div style="padding:24px 0;">
                                <p style="margin:0; font-size:0.85rem; color:#989898;">Thanks for joining us,</p>
                                <p style="margin:4px 0 0; font-size:0.9rem; font-weight:900; color:#111827;">
                                    Kuusor Team
                                </p>
                            </div>

                                <p style="color:#cbcbcb; font-size:0.75rem; margin-top:15px; line-height:1.5;">
                                    TelaStudio Inc. • 0001 First Block Avenue, The Village. MC, SL
                                </p>                
                        </div>
                        </div>

            </body>
            </html>
        `,
    }
    return await transporter.sendMail(mailOptions);
}

export interface ShortListEmailDetails {
    email: string;
    date: string;
    time: string;
    profileUrl?: string;
    location?: string;
    studentName: string;
    companyName: string;
    title: string;
    type: "online" | "in-person";
}


export const sendShortlistEmail = async (details: ShortListEmailDetails) => {
    const mailOptions = {
        from: `"Kuusor" <${process.env.EMAIL_USER}>`,
        to: details.email,
        subject: "You've been shortlisted for an Internship!",
        html: `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                        <div style="margin:0 auto; padding: 0 25px; font-family:'Inter', 'Segoe UI', Arial, sans-serif;">
                        <div style="max-width:480px; margin:40px auto; background:#ffffff; overflow:hidden;">
                            

                            <a href="http://localhost:5173"><img src=${details.profileUrl ? details.profileUrl : "https://lh3.googleusercontent.com/a-/ALV-UjXYycCWru4v9qrkbJogrY2zaSJwE_Umwu5OCCTf_0SZYDYPfjQ=s40-p"} style="width: 40px; border-radius: 50%; aspect-ratio: 1/1; object-fit: cover; object-position: top;" alt=""></a>

                            
                            <div>
                                <p style="font-size:0.95rem; font-weight: bold; margin:18px 0 24px; width: 300px;">
                                    Dear ${details.studentName},
                                </p>

                                <p style="color:#1F2937; font-size:0.85rem; margin-top:20px; line-height:1.5;">
                                    We are pleased to inform you that you have been shortlisted for the <span style="font-weight: 700;">${details.title}</span> at <span style="font-weight: 700;">${details.companyName}</span>. We would like to invite you for an interview scheduled for <span style="font-weight: 700;">${details.date}</span> at <span style="font-weight: 700;">${details.time}</span>, ${details.type === "in-person" ? `which will be held <span style="font-weight: 700;">${details.location}</span>.` : 'which will be conducted online. Confirmed candidates will receive their individual interview time and meeting link.'}

                                    If the scheduled time is not convenient, kindly let us know so we can make alternative arrangements.

                                    We look forward to speaking with you.
                                </p>
                            </div>

                            
                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;">

                            
                            <div style="padding:24px 0;">
                                <p style="margin:0; font-size:0.85rem; color:#1F2937;">Best Regards,</p>
                                <p style="margin:4px 0 0; font-size:0.9rem; font-weight:900; color:#111827;">
                                    ${details.companyName}
                                </p>
                            </div>

                                <p style="color:#989898; font-size:0.75rem; margin-top:15px; line-height:1.5;">
                                    TelaStudio Inc. • 0001 First Block Avenue, The Village. MC, SL
                                </p>                
                        </div>
                        </div>

            </body>
            </html>
        `,
    }
    return await transporter.sendMail(mailOptions);
}


export const sendPasswordResetEmail = async (email: string) => {
    const token = jwt.sign(
        { email },
        process.env.PASSWORD_RESET_TOKEN!,
        { expiresIn: "1h" }
    );
    const mailOptions = {
        from: `"Kuusor" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Kuusor Password!",
        html: `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                        <div style="margin:0 auto; padding: 0 25px; font-family:'Inter', 'Segoe UI', Arial, sans-serif;">
                        <div style="max-width:480px; margin:40px auto; background:#ffffff; overflow:hidden;">
                            

                            <a href="http://localhost:5173"><img src="https://lh3.googleusercontent.com/a-/ALV-UjXYycCWru4v9qrkbJogrY2zaSJwE_Umwu5OCCTf_0SZYDYPfjQ=s40-p" style="width: 40px;" alt=""></a>

                            
                            <div>
                                <p style="font-size:0.95rem; font-weight: bold; margin:18px 0 24px; width: 300px;">
                                    Reset Your password to access your Kuusor account again!
                                </p>

                                <p style="color:#747474; font-size:0.85rem; margin-top:20px; line-height:1.5;">
                                    Reset your password by creating a new one. Click the button below to get it done in some seconds and access your account!
                                </p>

                                <a href="http://localhost:5173/resetpassword?token=${token}"
                                    style="display:inline-block; background:#10367D; padding:10px 22px; border-radius:5px; 
                                    color:white; font-size:0.75rem; text-decoration:none;">
                                    Reset your password
                                </a>

                                <p style="color:#989898; font-size:0.85rem; margin-top:20px; line-height:1.5;">
                                    If you didn’t create an account or request this, no action is required.
                                </p>
                            </div>

                            
                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;">

                            
                            <div style="padding:24px 0;">
                                <p style="margin:0; font-size:0.85rem; color:#989898;">Best Regards,</p>
                                <p style="margin:4px 0 0; font-size:0.9rem; font-weight:900; color:#111827;">
                                    Kuusor Team
                                </p>
                            </div>

                                <p style="color:#c3c3c3; font-size:0.75rem; margin-top:15px; line-height:1.5;">
                                    TelaStudio Inc. • 0001 First Block Avenue, The Village. MC, SL
                                </p>                
                        </div>
                        </div>
            </body>
            </html>
        `,
    }
    return await transporter.sendMail(mailOptions);
}