import { type Route } from "../../core/Interfaces/Route.interface.js";
import { authenticateToken, signup, login, logout, logoutForAllDevices, verifyOtp, validateUser, resendOtp, verifyPublicToken } from "./auth.middleware.js";
import type { Request, NextFunction, Response, RequestHandler } from "express";
const allowedOrigins = new Set([
    // Common local dev origins (no trailing slash)
    "http://localhost:3000",
    "http://localhost:8080",

    "http://127.0.0.1:8080",
]);

function normalizeOrigin(origin?: string | null): string | null {
    if (!origin) return null;
    return origin.trim().replace(/\/$/, "");
}

export function CorsMiddlewareAuth(req: Request, res: Response, next: NextFunction): void {
    const origin = normalizeOrigin(req.get("origin"));

    // Allow non-browser clients (no Origin header) to proceed
    if (!origin) {
        return next();
    }

    if (allowedOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, authorization,X-SESSID,X-DEVICE-ID");
        // Quick exit for preflight

        return next();
    }

    // Block disallowed origins explicitly (use 403 instead of confusing 404)
    res.status(403).json({ error: "Forbidden Origin" });
}
// add swagger documentation here
class authRoutes {

    public getRouterMiddleware(): RequestHandler[] {
        return [CorsMiddlewareAuth];
    }

    public getRoutes(): Route[] {
        return [
            {
                path: '/signup',
                method: "post",
                handler: [signup]
            },
            {
                path: '/login',
                method: "post",
                handler: [login]
            },
            {
                path: '/check',
                method: "get",
                handler: [authenticateToken]
            },
            {
                path: '/logout',
                method: "put",
                handler: [authenticateToken, logout]
            },
            {
                path: '/logout-all/:userId',
                method: "post",
                handler: [authenticateToken, logoutForAllDevices]
            },
            {
                path: '/verify-otp',
                method: "post",
                handler: [verifyOtp, validateUser]
            },
            {
                path: '/resend-otp',
                method: "post",
                handler: [verifyPublicToken, resendOtp]
            }
        ]
    }
}

export default authRoutes;

