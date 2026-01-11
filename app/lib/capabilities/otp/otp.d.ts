export interface createOtpDTO {
    userId: string,
    otpHash: string,
    purpose: otpPurpose,
    expiresAtTimestamp?: number,
    expiresAt: Date,
    createdAt? : Date

}

export type otpPurpose = 'signup_verification' | '2fa_login'
