import type {  Document, ObjectId } from "mongoose";

export interface IResetToken {
    userId : string;
    tokenHash : string;
    resetTokenHash? : string;
    expiresAt : Date;
    consumedAt? : Date;
    isConsumed? : boolean;
    createdAt : Date;
    attempts? : number
}

export interface saveTokenDTO {
    userId : string,
    tokenHash : string,
    expiresAt : Date,
    createdAt : Date
}