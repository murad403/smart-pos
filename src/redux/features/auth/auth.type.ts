export interface UserData {
    id: number;
    slug: string;
    name: string;
    role: string;
    isActive: boolean;
    email: string;
    phone: string | null;
    photoUrl: string | null;
    address: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    resetToken: string | null;
    resetTokenExpiry: string | null;
    otp: string | null;
    otpExpiry: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SignInResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: UserData;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        resetToken: string;
    };
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
}

