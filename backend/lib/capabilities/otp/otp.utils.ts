import bcrypt from "bcryptjs";

export async function hashOtp(otp: string): Promise<string> {
    const saltRounds = 2;
    const secret = process.env.otp_h_secret;
    const hashedOTP = await bcrypt.hash(secret + otp, saltRounds);
    return hashedOTP;
}

export async function verifyOtp(otp: string, hashedOtp: string): Promise<boolean> {
    const secret = process.env.otp_h_secret;
    return await bcrypt.compare(String(secret) + otp, hashedOtp);

}

export function createOTPExpDate(TTL : number) {
    return new Date(Date.now() + TTL * 60 * 1000)
}