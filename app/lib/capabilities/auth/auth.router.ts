import { type Route } from "../../core/Interfaces/Route.interface.js";
import { authenticateToken, signup, login, logout, logoutForAllDevices, verifyOtp, validateUser, resendOtp, verifyPublicToken } from "./auth.middleware.js";
import type { Request, NextFunction, Response, RequestHandler } from "express";
import { CorsMiddlewareAuth } from "../../ressources/Shared/shared.middleware.js";

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

