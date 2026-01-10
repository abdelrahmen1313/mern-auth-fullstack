import type { Request, NextFunction, Response } from "express";
import HttpException from "../../Exceptions/http.exception.js";
function ErrorMidlleware(
    error : HttpException,
    req : Request,
    res : Response,
    next : NextFunction
) : void {

    const status = error.status || 500;
    const message = error.message || "Internal Server Error"

    console.log(error)
    res.status(status).json({errorMessage : message})
}

export default ErrorMidlleware