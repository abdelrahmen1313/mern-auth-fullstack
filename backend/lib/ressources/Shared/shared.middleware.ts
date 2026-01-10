import type { Request, NextFunction, Response } from "express";

const authAllowedOrigins = new Set([
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

    if (authAllowedOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, authorization,X-SESSID,X-DEVICE-ID");
        // Quick exit for preflight

        return next();
    }

    // Block disallowed origins explicitly (use 403 instead of confusing 404)
    res.status(403).json({ error: "Forbidden Origin" });
}