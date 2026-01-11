import { UserRepository } from "../../ressources/User/user.repository.js";
import { hashPassword, validatePassword } from "./auth.utils.js";
import HttpException from "../../core/Exceptions/http.exception.js";
import { AppError } from "../../core/Errors/AppError.js";
import type { AuthResponse, SignupRequest, LoginRequest }
    from "./auth.js";
import type { otpPurpose }
    from "../otp/otp.js";
import { generateRandomNumbe } from "../../utils/stringUtils.js";
import { OtpRepository } from "../otp/otp.repository.js";
import { sendVerificationEmail } from "../../core/internalServices/Email/email.service.js";
import { createOTPExpDate, hashOtp, verifyOtp } from "../otp/otp.utils.js";
import { SessionService } from "../../ressources/Session/session.service.js";

export class AuthService {
    private userRepository: UserRepository;
    private sessionService: SessionService;
    private otpRepository: OtpRepository

    constructor() {
        this.userRepository = new UserRepository();
        this.sessionService = new SessionService();
        this.otpRepository = new OtpRepository();
    }

    /**
     * Generate OTP, save to database, and send verification email
     */
    private async generateAndSendOtp(userId: string, email: string, purpose: otpPurpose = 'signup_verification'): Promise<void> {
        // Generate OTP
        const otp = generateRandomNumbe(6);

        // Save OTP to database
        await this
            .otpRepository
            .createOTP({ userId: userId, otpHash: await hashOtp(otp), purpose: purpose, expiresAt: createOTPExpDate(15) });

        // Send verification email
        await sendVerificationEmail(email, otp);
    }

    /**
     * SIGNUP - Create a new user and session
     * If deviceFingerprint is not provided, the session will still be created without it
     */
    async signup(credentials: SignupRequest, ip : string , browserPreferences?: any): Promise<AuthResponse> {
        try {
            // Step 1: Check if user already exists
            const existingUser = await this
                .userRepository
                .findUser({ email: credentials.email.trim() });
            if (existingUser) {
                throw new HttpException(403, "User already exists");
            }

            // Step 2: Hash password
            const hashedPassword = await hashPassword(credentials.password);

            // Step 3: Create user and session in parallel
            const newUser = await this
                .userRepository
                .create({
                    ...credentials,
                    password: hashedPassword
                });


            // Step 5: Generate OTP, save to db, and send verification email
            await this.generateAndSendOtp(newUser._id.toString(), credentials.email, 'signup_verification');

            // Step 4: Create session with 1 hour TTL
            const session = await this
                .sessionService
                .createUserSession({
                    id: newUser
                        ._id
                        .toString(),
                    email: newUser.email
                }, 60, browserPreferences);

            return {
                success: true,
                userId: newUser
                    ._id
                    .toString(),
                email : newUser.email.trim(),
                verified: false,
                token: session.sessionToken,
                sessId : session._id.toString(),
                deviceId : session.deviceId
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw new HttpException(error.statusCode || 500, error.message || "Internal Service Error @signup");
            } else {
                throw error
            }
        }
    }

    /**
     * LOGIN - Authenticate user and create a session
     */
    async login(ip : string, credentials: LoginRequest, browserPreferences?: any): Promise<AuthResponse> {
        try {
            // Step 1: Find user by email
            const user = await this
                .userRepository
                .findUser({ email: credentials.email });
            if (!user) {
                throw new HttpException(404, "User not found");
            }

            // Step 2: Validate password
            const isPasswordValid = await validatePassword(credentials.password, user.password);
            if (!isPasswordValid) {
                throw new HttpException(401, "Password mismatch");
            }

            // Step 3: Create adequate session to TokenStrategy
            const sessionTTL = user.isVerified
                ? 525600
                : 600
            const session = await this
                .sessionService
                .createUserSession(
                    {
                    id: user._id.toString(),
                    email: user.email
                }, 
                sessionTTL, 
                browserPreferences,
                 user.isVerified
                    ? true
                    : false,
                    ip
                );

            return {
                success: true,
                userId: user
                    ._id
                    .toString(),
                sessId: session
                    ._id
                    .toString(),
                deviceId: session.deviceId,
                token: session.sessionToken,
                verified: user.isVerified
                    ? true
                    : false
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw new HttpException(error.statusCode || 500, error.message || "Internal Service Error @login");
            } else {
                throw error
            }
        }
    }

    /**
     * LOGOUT - Revoke a single session
     */
    async logout(sessionId: string): Promise<void> {
        try {
            await this
                .sessionService
                .revokeUserSession(sessionId);
        } catch (error) {
            if (error instanceof AppError) {
                throw new HttpException(error.statusCode || 500, error.message || "Internal Service Error");
            } else {
                throw error
            }
        }
    }

    /**
     * LOGOUT ALL DEVICES - Revoke all sessions for a user
     */
    async logoutAllDevices(userId: string): Promise<void> {
        try {
            await this
                .sessionService
                .revokeAllUserSessions(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * VERIFY OTP
     */
    async validateOtp(userId: string, otp: string) {
        const __otp = await this
            .otpRepository
            .findOtpByUID(userId);
        if (!__otp) {
            throw new HttpException(404, "No OTP Found For User")
        }

        const isValidOtp = await verifyOtp(otp, __otp
            ?.otpHash as string)
        if (!isValidOtp) {
            return { valid: false, reason: "Invalid Otp Code" }
        }

        if (__otp
            ?.expiresAtTimestamp as number < Date.now()) {
            return { valid: false, reason: "Expired Code" }
        }

        // Optional : Mark Otp Record as consumed -- delete it
        await this
            .otpRepository
            .findOtpAndDelete(userId)

        return {
            valid: true, reason: "valid" // compared OTP hash against saved otp
        }

    }

    /**
     * VALIDATE USER
     */
    async validateUser(userId: string, email: string, browserPreferences?: any) {
        // MARK USER AS VERIFIED
        await this
            .userRepository
            .validateUser(userId.toString());
        // GENERATE AND SEND NEW ACCESS TOKEN WITH VERIFIED SCOPE -- create a verified
        // session
        const session = await this
            .sessionService
            .createUserSession({
                id: userId,
                email: email
            }, 525600, browserPreferences, true)
        return session
    }

    /**
     * RESEND OTP
     */
    async resendOtp(userId: string, email: string) {
        await this
            .otpRepository
            .findOtpAndDelete(userId)
        await this.generateAndSendOtp(userId, email)
    }

}
