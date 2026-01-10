import HttpException from "../../core/Exceptions/http.exception.js";
import type { Route } from "../../core/Interfaces/Route.interface.js";
import type { Request, Response, NextFunction } from "express";
import { ResetTokenService } from "./resetToken.service.js";
import { object, safeParse, email as zemail } from "zod";
import { UserRepository } from "../User/user.repository.js";
import { hashPassword } from "../../capabilities/auth/auth.utils.js";
const userIdRegex = /^[A-Za-z0-9]+$/;
const tokenHashRegex = /^[A-Za-z0-9.]+$/
const resetTokenService = new ResetTokenService();
const userRepository = new UserRepository();
// import cors later, let's test now
class ResetTokenRoutes {

    // PARENT ROUTE /reset

    public getRoutes(): Route[] {
        return [
            {
                path: "/password/request-reset",
                method: "post",
                handler: [this.requestReset]
            },
            {
                path: "/password/verify/:tokenHash/:userId",
                method: "get",
                handler: [this.validateResetRequest]
            },
            {
                path: "/password/reset/:tokenHash",
                method: "put",
                handler: [this.updateUserPassword]
            }
        ]
    }

    // POST /password/request-reset
    async requestReset(req: Request, res: Response, next: NextFunction): Promise<void> {
        const requestBodySchema = object({
            email: zemail()
        })
        const isValidRequest = safeParse(requestBodySchema, req.body)
        if (!isValidRequest.success) throw new HttpException(400, "Invalid Request 😥")

        let email = req.body.email;
        try {
            await resetTokenService.requestReset(email);
            res.status(200).end()
        } catch (error: any) {
            console.log(error);
            next(error)
        }
    }

    // GET /password/verify/${tokenHash}/${userId}
    async validateResetRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        let tokenHash = req.params.tokenHash as string;
        let userId = req.params.userId as string;


        const validId = userIdRegex.test(userId)
        const validTokenHash = tokenHashRegex.test(tokenHash)


        if (!validId || !validTokenHash) {
            throw new HttpException(400, "Invalid Request")
        }



        try {
            const { valid } = await resetTokenService.validateToken(tokenHash);
            console.log(valid)
            if (!valid) { res.status(403).end() }
            res.status(200).end()


        } catch (error: any) {
            console.log(error)
            next(error)
        }
    }

    // PUT /password/update-pwd
    // 
    async updateUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId, newPassword } = req.body;
        const tokenHash = req.params.tokenHash as string;

        const validTokenHash = tokenHashRegex.test(tokenHash);
        console.log(tokenHash)
        console.log(validTokenHash)
        const isValidUserId = userIdRegex.test(userId);
        if (!userId || !tokenHash || !isValidUserId || !validTokenHash) throw new HttpException(403, "Invalid Credentials")
        if (typeof newPassword != "string") throw new HttpException(400, "Invalid Request")
        try {

            await resetTokenService.consumeToken(tokenHash)
            const hashedPassword = await hashPassword(newPassword)
            await userRepository.updateUserPassword("pwdUpdateISecret", userId, hashedPassword)
            res.status(200).end(() => { console.log("updated user password") })

        } catch (error) {
            next(error)
        }
    }
}

export default ResetTokenRoutes