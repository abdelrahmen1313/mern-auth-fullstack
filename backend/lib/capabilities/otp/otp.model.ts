import {Schema, Document, model} from "mongoose";

export interface IOTP extends Document {
    userId : string,
    otpHash : string,
    purpose : 'signup_verification' | '2fa_login',
    expiresAtTimestamp : number,
    expiresAt : Date,
    attempts? : number,
    maxAttempts? : number,
    consumedAt? : Date,
    createdAt : Date,

}

const OTPSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 4,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    /**
     * TTL FIELD
     * MongoDB will automatically delete the document
     * once this date is reached.
     */
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);
/*
OTPSchema.index(
  { consumedAt: 1 },
  {
    expireAfterSeconds: 300,
    partialFilterExpression: { consumedAt: { $exists: true } },
  }
);
*/ // we manually deleting otp after consumption

const OTP = model<IOTP>("OTP", OTPSchema)
export default OTP;