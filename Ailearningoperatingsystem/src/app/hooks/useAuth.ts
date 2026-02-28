import { useState, useEffect, useCallback } from 'react';
import { authApi, type User } from '../lib/api';

const TOKEN_KEY = 'ai_learning_os_token';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
}

export type { User };

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
        user: null,
        isLoading: true,
    });

    const getToken = () => localStorage.getItem(TOKEN_KEY);

    // Load user profile on mount if token exists
    useEffect(() => {
        const token = getToken();
        if (token) {
            authApi.getMe(token)
                .then((data) => {
                    setAuthState({ isAuthenticated: true, user: data.user, isLoading: false });
                })
                .catch(() => {
                    // Token invalid/expired — clear it
                    localStorage.removeItem(TOKEN_KEY);
                    setAuthState({ isAuthenticated: false, user: null, isLoading: false });
                });
        } else {
            setAuthState({ isAuthenticated: false, user: null, isLoading: false });
        }
    }, []);

    const handleAuthSuccess = useCallback((token: string, user: User) => {
        localStorage.setItem(TOKEN_KEY, token);
        setAuthState({ isAuthenticated: true, user, isLoading: false });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        handleAuthSuccess(data.token, data.user);
        return data.user;
    }, [handleAuthSuccess]);

    const signup = useCallback(async (userData: {
        name: string; email: string; phone: string; password: string; goal: string;
    }) => {
        const data = await authApi.signup(userData);
        handleAuthSuccess(data.token, data.user);
        return data.user;
    }, [handleAuthSuccess]);

    const sendOtp = useCallback(async (phone: string) => {
        const data = await authApi.sendOtp(phone);
        return data.demo_otp; // For demo — in production, OTP is sent via SMS
    }, []);

    const verifyOtp = useCallback(async (phone: string, otp: string) => {
        const data = await authApi.verifyOtp(phone, otp);
        handleAuthSuccess(data.token, data.user);
        return data.user;
    }, [handleAuthSuccess]);

    const googleAuth = useCallback(async (email?: string, name?: string) => {
        const data = await authApi.google(email, name);
        handleAuthSuccess(data.token, data.user);
        return data.user;
    }, [handleAuthSuccess]);

    const logout = useCallback(async () => {
        const token = getToken();
        if (token) {
            try { await authApi.logout(token); } catch { /* ignore */ }
        }
        localStorage.removeItem(TOKEN_KEY);
        setAuthState({ isAuthenticated: false, user: null, isLoading: false });
    }, []);

    return {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading: authState.isLoading,
        login,
        signup,
        sendOtp,
        verifyOtp,
        googleAuth,
        logout,
    };
}
