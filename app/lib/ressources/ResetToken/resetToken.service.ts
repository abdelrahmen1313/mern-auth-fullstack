import HttpException from "../../core/Exceptions/http.exception.js";
import { UserRepository } from "../User/user.repository.js";
import { ResetTokenRepository } from "./resetToken.repository.js";
import { createTokenHash } from "./resetToken.utils.js";
import { createExpiresAt } from "../../utils/utils.js";
import { sendPasswordResetEmail } from "../../core/internalServices/Email/email.service.js";

export class ResetTokenService {
    private resetTokenRepository: ResetTokenRepository;
    private userRepository: UserRepository;

    constructor() {
        this.resetTokenRepository = new ResetTokenRepository();
        this.userRepository = new UserRepository();
    }

    // SERVICES // METHODS // LOGIC //


    validateToken = async (tokenHash: string) => {
        const token = await this.resetTokenRepository.findToken({ tokenHash: tokenHash });

        if (!token) throw new HttpException(404, "Token Not Found Or Expired");
        if (token && token.isConsumed === true) throw new HttpException(403, "Consumed Error");

        return { valid: true, expiresAt: token.expiresAt }

        // NOTE : Tokens are self expiring with mongoose TTL index. 
    }


    generatePasswordResetUrl = async (tokenHash: string, userId: string) => {
        return `http://localhost:3003/reset-password/${tokenHash}/${userId}`
    }

    /** request reset password */
    requestReset = async (email: string) => {
        // check user exist
        const userExists = await this.userRepository.findUser({ email: email });
        if (!userExists) throw new HttpException(404, "User Not Found");

        const userId = userExists._id.toString();


        // check if user is having a pending request (already have a token)
        const pendingToken = await this.resetTokenRepository.findUserResetToken(userId);
        if (pendingToken) {
            if (pendingToken.isConsumed == true) {
                throw new HttpException(403, "Invalid Credentials") // flag suspecious attempt
            } else {
                await this.resetTokenRepository.deleteToken(pendingToken._id.toString())
            }
        }


        const { createdAt, expiresAt } = createExpiresAt(15) // TTL
        const tokenData = {
            userId: userExists._id.toString(),
            tokenHash: createTokenHash(16),
            expiresAt: new Date(expiresAt),
            createdAt: new Date(createdAt),
        }

        const newToken = await this.resetTokenRepository.saveResetToken(tokenData)
        if (!newToken) throw new HttpException(500, "Internal Server Error, Try Again Later")

        // generate verification link
        const verificationLink = await this.generatePasswordResetUrl(newToken?.resetTokenHash as string, userId)

        // send a reset email with link
        await sendPasswordResetEmail(email, verificationLink)

    }

    /** consume token */
    consumeToken = async (tokenHash : string) => {
       return await this.resetTokenRepository.consumeToken(tokenHash);
    } 
    
}