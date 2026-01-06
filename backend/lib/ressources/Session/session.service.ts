import type { sessionUser } from "../../capabilities/auth/auth.js";
import { createToken, createVerifiedToken } from "../../capabilities/auth/auth.utils.js";
import HttpException from "../../core/Exceptions/http.exception.js";
import { createDeviceId, createExpiresAt } from "../../utils/utils.js";
import { SessionRepository } from "./session.repository.js";

export class SessionService {
    private sessionRepository: SessionRepository;

    constructor() {
        this.sessionRepository = new SessionRepository();
    }

    async createUserSession(user: sessionUser, TTL: number, browserPreferences?: any, isVerifiedSession: boolean = false) {

        try {

            // create token
            const token = isVerifiedSession
                ? await createVerifiedToken(user.email + user.id)
                : await createToken(user.email)

            // create device id
            const deviceId = createDeviceId();

            // create timestamps
            const { createdAt, expiresAt, expiresAtTimestamp } = createExpiresAt(TTL);

            const sessionData = {
                userId: user.id.toString(),
                sessionToken: token,
                deviceId: deviceId,
                createdAt: createdAt,
                lastRevoked: false,
                expiresAt: expiresAt,
                expiresAtTimestamp: expiresAtTimestamp,
                isVerified: isVerifiedSession, // Track session verification status
                ...(browserPreferences && { deviceFingerPrint: browserPreferences }),
            }

            const session = await this.sessionRepository.createSession(sessionData);
            return session;

        } catch (error) {
            // If session creation fails but it's due to missing deviceFingerprint,
            // retry without it
            if (
                error instanceof Error &&
                (error.message.includes("deviceFingerPrint") ||
                    error.message.includes("device"))
            ) {
                // handling edge cases for old browsers that does not support our fingerprinting process
                // very rare case
                console.log("creating a session without fp..")
                const token = isVerifiedSession
                    ? await createVerifiedToken(user.email)
                    : await createToken(user.email);
                const deviceId = createToken(createDeviceId());

                const {
                    createdAt, expiresAt, expiresAtTimestamp
                } = createExpiresAt(TTL)


                const sessionDataFallback = {
                    userId: user.id,
                    sessionToken: token,
                    deviceId: deviceId,
                    createdAt: createdAt,
                    lastRevoked: false,
                    expiresAt: expiresAt,
                    expiresAtTimestamp: expiresAtTimestamp,
                    isVerified: isVerifiedSession,
                };

                return await this.sessionRepository.createSession(sessionDataFallback);
            }
            throw error;
        }
    }

    async revokeUserSession(sessionId: string) {
        return await this.sessionRepository.revokeSession(sessionId)
    }

    async revokeAllUserSessions(userId: string) {
        return await this.sessionRepository.revokeMultipleSessions(userId);
    }

    async verifySession(sessionId: string): Promise<{
        isValid: boolean;
        isVerified?: boolean;
        userId?: string;
        sessionToken?: string;
    }> {
        try {
            const session = await this.sessionRepository.findSessionById(sessionId)
            if (!session) {
                throw new HttpException(401, "Session not found");
            }
            if (
                session.lastRevoked === true ||
                (session.expiredAtTimestamp as number) < Date.now()
            ) {
                return { isValid: false};
            }
            return {
                isValid: true,
                isVerified: session.isVerified || false,
                userId: session.userId,
                sessionToken: session.sessionToken
            };

        } catch (error) {
            throw error;
        }
    }
}