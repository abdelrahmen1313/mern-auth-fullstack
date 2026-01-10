import { Document, Schema, model, type ObjectId, type SaveOptions } from "mongoose";

import type { ISession, IDevice , screen } from "./session.js";
import { getSessionLocation } from "./session.utils.js";

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
        required: true,
    },
    refreshToken : {
        type : "string",
        default: function (this: ISession) { return this.sessionToken; },
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
        required: true,
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

    country : {
        type : "string"
    },
    city : {
        type : "string"
    },

    deviceFingerPrint: deviceSchema

})

// TTL index ensures sessions are removed automatically after `expiresAt`
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

sessionSchema.pre("save", async function (this : ISession) {
    if (this.ip) {
        const {country , city} = await getSessionLocation(this.ip)
        if (typeof country == "string" && typeof city == "string") {
            this.country = country;
            this.city = city;
        }
    }
})




const Session = model<ISession>("Session", sessionSchema);
export default Session;