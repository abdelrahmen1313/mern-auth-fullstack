import { Document, Schema, model, type ObjectId } from "mongoose";

export interface ISession extends Document {
    userId: string,
    sessionToken: string,
    deviceId: string,
    ip?: string,
    createdAt: string,
    lastUsedAt?: Date,
    expiresAt?: Date,
    lastRevoked?: Boolean,
    expiredAtTimestamp: number,
    isVerified : boolean
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

const deviceSchema = new Schema({
    userAgent: {
        type: "string"
    },
    platform: {
        type: "string"
    },
    language: {
        type: "string"
    },
    screen: {
        type: "string"
    },
    timezone: {
        type: "string"
    },
    clientTimestamp: {
        type: "number"
    }
})

const sessionSchema = new Schema({

    userId: {
        type: "string",
        required: true,

    },
    sessionToken: {
        type: "string",
        unique: true,
    },
    deviceId: {
        type: "string",
        required: true,
    },
    ip: {
        type: "string"
    },
    createdAt: {
        type: Schema.Types.String,
        required: true,
    },
    lastUsedAt: {
        type: Schema.Types.Date,
        // required: true,
    },
    expiresAt: {
        type: Schema.Types.Date,
        // required: true,
    },
    expiredAtTimestamp: {
        type: Schema.Types.Number,

    },
    lastRevoked: {
        type: Schema.Types.Boolean,

    },
    isVerified: {
        type: "boolean",
        default: false
    },

    deviceFingerPrint: deviceSchema

})
// add indexes later

const Session = model<ISession>("Session", sessionSchema);
export default Session;