import { model, Schema } from "mongoose";
import type { IResetToken } from "./resetToken.js";

const resetTokenSchema = new Schema({
    userId: {
        type: "string",
        required: true
    },
    tokenHash: {
        type: "string",
        required: true
    },
    resetTokenHash : {
        type : "string",
        default : function (this : IResetToken) {
            { return this.tokenHash; }
        }
    },
    expiresAt: {
        type: Schema.Types.Date,
        index: { expires: 0 }
    },
    consumedAt: {
        type: Schema.Types.Date,
        
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true
    },
    attempts: {
        type: Schema.Types.Number,
        default: 0
    },
    maxAttempts : {
        type : Schema.Types.Number,
        default : 4
    },
    isConsumed : {
        type : Schema.Types.Boolean,
        default : false
    }

},
    { timestamps: false })

const resetTokenModel = model<IResetToken>("resetToken", resetTokenSchema);
export default resetTokenModel;