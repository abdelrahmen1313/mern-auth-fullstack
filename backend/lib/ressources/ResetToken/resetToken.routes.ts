import HttpException from "../../core/Exceptions/http.exception.js";
import type { Route } from "../../core/Interfaces/Route.interface.js";
import type { Request, Response, NextFunction } from "express";
import { ResetTokenService } from "./resetToken.service.js";
import { object, safeParse, email as zemail} from "zod";
import { UserRepository } from "../User/user.repository.js";
import { hashPassword } from "../../capabilities/auth/auth.utils.js";
        const userIdRegex = /^[A-Za-z0-9]+$/;

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
                path : "/password/reset",
                method : "put",
                handler : [ this.updateUserPassword]
            }
        ]
    }

    // POST /password/request-reset
    async requestReset(req: Request, res: Response, next: NextFunction): Promise<void> {
        const requestBodySchema = object({
            email: zemail()
        })
        const isValidRequest = safeParse(requestBodySchema, req.body)
        if (!isValidRequest) throw new HttpException(400, "Invalid Request 😥")
        console.log("someone exploiting us")
        let email = req.body.email;
        try {
            const { tokenHash, userId, expiresAt } = await resetTokenService.requestReset(email);
            res.status(201).json({ tokenHash: tokenHash, userId: userId, expiresAt: expiresAt })
        } catch (error: any) {
            console.log(error);
            next(error)
        }
    }

    // GET /password/verify/${tokenHash}/${userId}
    async validateResetRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        let tokenHash = req.params.tokenHash as string;
        let userId = req.params.userId as string;
        const tokenHashRegex = /^[A-Za-z0-9.]+$/
        const validId = userIdRegex.test(userId)
        const validTokenHash = tokenHashRegex.test(tokenHash)


        if (!validId || !validTokenHash) {
            console.log("-------------------------------------")
            console.warn(req.ip, " ", req.originalUrl, " ", "is messing with our customers security!")
            console.log("User In Danger ?", userId)
            console.log("-------------------------------------")
            throw new HttpException(400, "Invalid Request 😥")
        }



        try {
            const { valid } = await resetTokenService.validateToken(userId);
            if (!valid) { res.status(403).end() }
            res.status(200).end()


        } catch (error: any) {
            console.log(error)
            next(error)
        }
    }

    // PUT /password/update-pwd
    // 
    async updateUserPassword( req: Request, res: Response, next: NextFunction): Promise<void>
    {
        const { userId, newPassword} = req.body
        const isValidUserId = userIdRegex.test(userId);
        if (!isValidUserId) throw new HttpException(404, "Cannot Find a user with this id")
        if (typeof newPassword != "string") throw new HttpException(400, "Invalid Request")
        try {
    
            const hashedPassword = await hashPassword(newPassword)
            await userRepository.updateUserPassword("pwdUpdateISecret", userId, hashedPassword)
            res.status(200).end( () => { console.log("updated user password")})

        } catch(error) {
            next(error)
        }
    }
}

export default ResetTokenRoutes