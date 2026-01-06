import {type NextFunction, type Request, type Response} from "express";

const logger = (req : Request, res : Response, next : NextFunction) => {
    console.log("\n incoming request from ", req.ip);
    console.log("request url ", req.url);
    next();
}

export default logger;