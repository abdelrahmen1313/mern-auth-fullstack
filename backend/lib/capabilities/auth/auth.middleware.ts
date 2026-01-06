import type { Request, NextFunction, Response }
    from "express";
import { AuthService } from "./auth.service.js";
import HttpException from "../../core/Exceptions/http.exception.js";
import { SessionService } from "../../ressources/Session/session.service.js";
import { VerifyPublicJWT, verifyTokenWithType } from "./auth.utils.js";
import { success } from "zod";

const authService = new AuthService();
const sessionService = new SessionService();

// Routes accessible with public (unverified) tokens
const PUBLIC_ROUTES = [
    '/verify-otp',
    '/resend-otp',
    '/logout',
    '/login'
];

// POST SIGNUP - Create a new user and session
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { user } = req.body;
        const browserPreferences = req.body.browserPreferences

        if (!user || !user.email || !user.password) {
            throw new HttpException(400, "Invalid credentials. Email and password are required.");
        }

        const result = await authService.signup(user, browserPreferences);
        res
            .status(201)
            .json(result);
    } catch (error) {
        next(error);
    }
}

// POST LOGIN - Authenticate user and create session
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.body.user;
        const browserPreferences = req.body.browserPreferences;

        console.log(user);
        console.log(browserPreferences);

        if (!user || !user.email || !user.password) {
            throw new HttpException(400, "Invalid credentials. Email and password are required.");
        }

        const result = await authService.login(user, browserPreferences);
        console.log(result)
        res
            .status(201)
            .json(result);
    } catch (error) {
        next(error);
    }
}

// PUT LOGOUT - Revoke a single session
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const sessId = req.get("X-SESSID") || "";

        if (!sessId) {
            throw new HttpException(400, "Session ID is required");
        }

        await authService.logout(sessId);
        res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
}

// POST LOGOUT FROM ALL DEVICES - Revoke all sessions for a user
export async function logoutForAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.params.userId || "";

        if (!userId) {
            throw new HttpException(400, "User ID is required");
        }

        await authService.logoutAllDevices(userId);
        res
            .status(200)
            .json({ success: true, message: "Logged out from all devices" });
    } catch (error) {
        next(error);
    }
}

// verify public session
export async function verifyPublicToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.get("authorization");
    if (!authHeader) {
        throw new HttpException(401, 'Token Not Provided')
    }

    // Extract token (handle "Bearer <token>" format)
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

    const payload =  VerifyPublicJWT(token);
    if (payload.isValid === false) {
        throw new HttpException(403, 'INVALID OR EXPIRED TOKEN')
    }
    next()

}

// verify public token

// GET VERIFY TOKEN VALIDITY - Check if session is valid and has appropriate access
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.get("authorization");
        const sessId = req.get("X-SESSID") || "";
        const requestPath = req.path;

        if (!authHeader) {
            throw new HttpException(401, "Token is required");
        }

        // Extract token (handle "Bearer <token>" format)
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

            // Determine if route is public-accessible
        const isPublicRoute = PUBLIC_ROUTES.some(route => requestPath.includes(route));
            /*
        if (!sessId) {
            throw new HttpException(401, "Session ID is required");
        } */

        // Verify token type
        const tokenVerification = await verifyTokenWithType(token);
        if (!tokenVerification.isValid) {
            throw new HttpException(401, "Invalid or expired token");
        }

        // Verify session
        if (sessId === "" && isPublicRoute) {
            return next()
        }

        const sessionVerification = await sessionService.verifySession(sessId);
        if (!sessionVerification.isValid) {
            throw new HttpException(401, "Invalid or expired session");
        }

        // Check if session token matches
        if (sessionVerification.sessionToken !== token) {
            throw new HttpException(401, "Token does not match session");
        }

        

        // If accessing a protected route, require verified session
        if (!isPublicRoute && !sessionVerification.isVerified) {
            throw new HttpException(403, "Access denied. Please verify your account first.");
        }

        // Attach user info to request for downstream use
        (req as any).userId = sessionVerification.userId;
        (req as any).sessionId = sessId;
        (req as any).isVerified = sessionVerification.isVerified;

        next();
    } catch (error) {
        next(error);
    }
}

// Middleware specifically for verified sessions only (full access)
export async function requireVerifiedToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.get("authorization");
        const sessId = req.get("X-SESSID") || "";

        if (!authHeader) {
            throw new HttpException(401, "Token is required");
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

        if (!sessId) {
            throw new HttpException(401, "Session ID is required");
        }

        // Verify token type - must be verified
        const tokenVerification = await verifyTokenWithType(token);
        if (!tokenVerification.isValid || tokenVerification.tokenType !== 'verified') {
            throw new HttpException(403, "Verified token required for this endpoint");
        }

        // Verify session
        const sessionVerification = await sessionService.verifySession(sessId);
        if (!sessionVerification.isValid || !sessionVerification.isVerified) {
            throw new HttpException(403, "Verified session required for this endpoint");
        }

        // Check if session token matches
        if (sessionVerification.sessionToken !== token) {
            throw new HttpException(401, "Token does not match session");
        }

        // Attach user info to request
        (req as any).userId = sessionVerification.userId;
        (req as any).sessionId = sessId;
        (req as any).isVerified = true;

        next();
    } catch (error) {
        next(error);
    }
}

// Middleware to verify-otp
export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const otp = req.body.otp;
        const userId = req.body.user.userId;

        console.log(otp);
        console.log(userId);

        const otpValidation = await authService.validateOtp(userId, otp)
        if (otpValidation?.valid === false) {
            throw new HttpException(403, otpValidation.reason)
        }
        next()

    } catch (err) {
        next(err)
    }
}

// validate user
export async function validateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

        const { userId, email } = req.body.user;
        const browserPreferences = req.body.browserPreferences;
        const userSession = await authService.validateUser(userId, email, browserPreferences)
        if (!userSession) {
            throw new Error("Could not validate User")
        }
        res.status(200).json({
            message: "User Validated Successefully",
            userId: userId,
            sessId: userSession._id.toString(),
            deviceId: userSession.deviceId,
            token: userSession.sessionToken,
            verified: true
        })

    } catch (error) {
        next(error)
    }


}

// resend otp
export async function resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { userId, email } = req.body.user
        await authService.resendOtp(userId, email)
        res.status(200).json({ message: "OTP SENT" })

    } catch (error) {
        next(error)
    }
}