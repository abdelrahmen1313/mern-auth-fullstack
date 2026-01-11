import type { Request, Response, NextFunction } from "express";

export type RouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export interface Route {
    path: string;
    method: "get" | "post" | "put" | "delete" | "patch";
    handler: RouteHandler[];
}
