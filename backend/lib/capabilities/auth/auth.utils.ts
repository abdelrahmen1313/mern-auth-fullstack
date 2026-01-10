import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 2;
    const secret = process.env.u_pwd_hash_secret;
    const hashedPassword = await bcrypt.hash(secret + password, saltRounds);
    return hashedPassword;
};

export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const secret = process.env.u_pwd_hash_secret;
    // Must compare against the same plaintext used in hashPassword: secret + password
    return await bcrypt.compare(String(secret) + password, hashedPassword);
}


const h_secret = process.env.jwt_h_secret?.toString() || ""
const v_secret = process.env.jwt_refresh_secret?.toString() || ""

export function VerifyPublicJWT(token: string): {
    isValid: boolean;
    tokenType: 'public' | 'verified' | null;
    payload: any;
} {

    const payload = jwt.verify(token, h_secret)
    if (!payload) { return { isValid: false, tokenType: null, payload: null } }
    return { isValid: true, tokenType: 'public', payload };

}
/**
 * Verify token and return its type
 * @returns { isValid: boolean, tokenType: 'public' | 'verified' | null, payload: any }
 */
export async function verifyTokenWithType(token: string): Promise<{
    isValid: boolean;
    tokenType: 'public' | 'verified' | null;
    payload: any;
}> {
    // Try verified token first (longer expiry)
    try {
        const payload = jwt.verify(token, v_secret);
        return { isValid: true, tokenType: 'verified', payload };
    } catch (error) {
        // Not a verified token, try public token
    }

    // Try public token
    try {
        const payload = jwt.verify(token, h_secret);
        return { isValid: true, tokenType: 'public', payload };
    } catch (error) {
        // Invalid token
        return { isValid: false, tokenType: null, payload: null };
    }
}

export async function createToken(email: string): Promise<string> {
    return jwt.sign({ id: email }, h_secret, { expiresIn: "60DAYS" })
}

export async function createVerifiedToken(email: string): Promise<string> {
    return jwt.sign({ id: email }, v_secret, { expiresIn: "460DAYS" })
}

