import type { Request, NextFunction, Response } from "express";

export function CorsMiddlewareStar(req: Request, res: Response, next: NextFunction): void {

   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
   res.header("Access-Control-Allow-Headers", "Content-Type, authorization,X-SESSID,X-DEVICE-ID");
   if (req.method === 'OPTIONS') {
       res.sendStatus(200);
   }
   return next();
}

