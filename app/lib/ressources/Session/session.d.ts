import type { Document } from "mongoose";

export interface ISession extends Document {
    userId: string,
    sessionToken: string,
    refreshToken? : string,
    deviceId: string,
    ip?: string,
    createdAt: string,
    lastUsedAt?: Date,
    expiresAt?: Date,
    lastRevoked?: Boolean,
    expiredAtTimestamp: number,
    isVerified: boolean,
    country?: string,
     city?: string,
}

export interface screen {
    width: number,
    height: number,
    colorDepth: number,
    pixelDepth: number
}

export interface IDevice extends Document {
    userAgent: string,
    platform: string,
    language: string,
    screen: string,
    timezone: string,
    clientTimestamp: number

}