import { Types, type QueryFilter } from "mongoose"
import { MongoDbRepository } from "../../core/repostitory/mdbRepo.js"
import type { IResetToken, saveTokenDTO } from "./resetToken.js"
import resetTokenModel from "./resetToken.model.js"
import { createTokenHash } from "./resetToken.utils.js"
import { createExpiresAt } from "../../utils/utils.js"

interface updateTokenDto {
    resetTokenHash : string,
    expiresAt : Date 
}

export class ResetTokenRepository extends MongoDbRepository<IResetToken> {
    constructor() {
        super(resetTokenModel)
    }

    // METHODS //

    /** CREATE (SAVE) ResetToken */
    saveResetToken = async (tokenData: saveTokenDTO) => {
        return this.safeExec(() => this.model.create(tokenData))
    }

    /** Find Token By ID */
    findTokenById = async (tokenId : string) => {
        return this.safeExec( () => this.model.findById(tokenId))
    }

    /** Find a reset Token */
    findToken = async (query: QueryFilter<IResetToken>) => {
        return this.safeExec(() => this.model.findOne(query))
    }
   

    /** Find User Reset Token */
    findUserResetToken = async (userId: string) => {
        return this.safeExec(() => this.model.findOne({ userId: userId }))
    }

    /** Incerement Attempts */
    incrementAttempts = async (tokenId: string | undefined) => {
        return this.safeExec(() => this.model.findByIdAndUpdate({ tokenId }, { $inc: { attempts: 1 } }, { new : true}))
    }

    /** Update Token by id */
    updateTokenWithId = async (tokenId : string, updates : updateTokenDto) => {
        return this.safeExec(() => this.model.findByIdAndUpdate({ tokenId }, updates, {new : true}))
    } 

    /** Create Refresh Token (update existing document) */
    createRefreshToken = async (tokenId : string) => {
        //const id = new Types.ObjectId(tokenId)
        const _refreshToken = createTokenHash(16)
        const { expiresAt } = createExpiresAt(15); // 15 minutes TTL
        const expDate = new Date(expiresAt)
        return this.safeExec( () => this.model.findByIdAndUpdate( tokenId , { $set : { resetTokenHash : _refreshToken , expiresAt : expDate}, $inc : {attempts : 1}} , { new : true }) )
    }

    /** Delete a token -userId- */
    deleteUserResetToken = async (userId: string) => {
        return this.safeExec(() => this.model.findOneAndDelete({ userId: userId }))
    }
}