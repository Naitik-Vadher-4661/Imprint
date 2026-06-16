"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileSchema = exports.ResetPasswordSchema = exports.RequestPasswordResetSchema = exports.RefreshTokenSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string(),
});
exports.RequestPasswordResetSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    country: zod_1.z.string().optional(),
    householdSize: zod_1.z.number().min(1).optional(),
    primaryTransport: zod_1.z.string().optional(),
    dietaryPreference: zod_1.z.string().optional(),
    homeEnergySource: zod_1.z.string().optional(),
    avgCommuteKm: zod_1.z.number().min(0).optional(),
    measurementSystem: zod_1.z.enum(['metric', 'imperial']).optional(),
    onboardingComplete: zod_1.z.boolean().optional(),
});
