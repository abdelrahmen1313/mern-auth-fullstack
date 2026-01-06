export interface SignupRequest {
    email: string;
    password: string;
    fullName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    browserPreferences?: any;
}

export interface AuthResponse {
    success: boolean;
    userId: string;
    sessId?: string;
    deviceId?: string;
    token: string;
    verified: boolean;
}

export interface sessionUser {
    id: string,
    email: string
}

