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


    validateToken = async (userId: string) => {
        const token = await this.resetTokenRepository.findUserResetToken(userId);

        if (!token) throw new HttpException(404, "Token Not Found Or Expired");
        if (token.isConsumed) throw new HttpException(403, "Consumed Error");

        return { valid: true, expiresAt: token.expiresAt }

        // NOTE : Tokens are self expiring with mongoose TTL index. So no need to expiresAtTimestamp here..
    }


    generatePasswordResetUrl = async (tokenHash: string, userId: string) => {
        return `http://localhost:3003/api/reset/password/verify/${tokenHash}/${userId}`
    }

    /** request reset password */
    requestReset = async (email : string) => {
        // check user exist
        const userExists = await this.userRepository.findUser({ email : email});
        if (!userExists) throw new HttpException(404, "User Not Found");
 
        const userId = userExists._id.toString();
        

        // check if user is having a pending request (already have a token)
        const pendingToken = await this.resetTokenRepository.findUserResetToken(userId);
       // console.log("pending token" , pendingToken);
        if (pendingToken) {
            let pendingTokenId = pendingToken?._id.toString();
            const refreshTokenDoc = await this.resetTokenRepository.createRefreshToken(pendingTokenId)
           // console.log("refresh token doc" , refreshTokenDoc)
            const refreshTokenHash = refreshTokenDoc?.resetTokenHash;

             return {
                tokenHash : refreshTokenHash,
                userId : userId,
                expiresAt : refreshTokenDoc?.expiresAt
            }

            // generate verification link
            //const verificationLink = await this.generatePasswordResetUrl(refreshTokenHash as string, userId)

            // send a reset email with link
          //  await sendPasswordResetEmail(email, verificationLink)
        } else {
            // Create a new resetPwdToken and save it
            // generating token
            const { createdAt, expiresAt } = createExpiresAt(15) // TTL
            const tokenData = {
                userId: userExists._id.toString(),
                tokenHash: createTokenHash(16),
                expiresAt: new Date(expiresAt),
                createdAt: new Date(createdAt),
            }
            const newToken = await this.resetTokenRepository.saveResetToken(tokenData)

            return {
                tokenHash : newToken.resetTokenHash,
                userId : userId,
                expiresAt : expiresAt
            }

        }



    }
}