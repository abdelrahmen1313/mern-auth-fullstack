import { MongoDbRepository } from "../../core/repostitory/mdbRepo.js"
import Session, { type ISession } from "./session.model.js"


export class SessionRepository extends MongoDbRepository<ISession> {

    constructor() {
        super(Session)
    }

    // create a new session
    async createSession(sessionData: object) {
        return this.safeExec(() => this.model.create(sessionData))
    }

    // delete a session by id
    async deleteSession(sessId: string) {
        return this.safeExec(() => this.model.deleteOne({ _id: sessId }))
    }

    // find a session by id
    async findSessionById(sessId: string) {
        return this.safeExec(() => this.model.findOne({ _id: sessId }))
    }

    // revoke session
    async revokeSession(sessId: string) {
        return this.safeExec(() =>
            this.model.findByIdAndUpdate(sessId, { lastRevoked: true }, { new: true })
        )
    }

    // revoke multiple sessions
    async revokeMultipleSessions(userId: string) {
        return this.safeExec(() =>
            this.model.updateMany({ userId: userId },
                { lastRevoked: true }

            ))
    }
}