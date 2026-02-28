import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/input';
import {
    Brain,
    ArrowRight,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    ChevronLeft,
} from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';

type LoginMethod = 'email' | 'phone';
type LoginStep = 'input' | 'otp';

export function Login() {
    const navigate = useNavigate();
    const { login, sendOtp, verifyOtp, googleAuth } = useAuth();

    const [method, setMethod] = useState<LoginMethod>('email');
    const [step, setStep] = useState<LoginStep>('input');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [demoOtp, setDemoOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
        setError(''); setIsLoading(true);
        try {
            const otpCode = await sendOtp(phone);
            setDemoOtp(otpCode);
            setStep('otp');
        } catch (err: any) { setError(err.message || 'Failed to send OTP'); }
        finally { setIsLoading(false); }
    };

    const handleVerifyOTP = async () => {
        if (otp.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }
        setError(''); setIsLoading(true);
        try { await verifyOtp(phone, otp); navigate('/'); }
        catch (err: any) { setError(err.message || 'Invalid or expired OTP'); }
        finally { setIsLoading(false); }
    };

    const handleEmailLogin = async () => {
        if (!email) { setError('Please enter your email'); return; }
        if (!password) { setError('Please enter your password'); return; }
        setError(''); setIsLoading(true);
        try { await login(email, password); navigate('/'); }
        catch (err: any) { setError(err.message || 'Invalid email or password'); }
        finally { setIsLoading(false); }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try { await googleAuth(); navigate('/'); }
        catch (err: any) { setError(err.message || 'Google sign-in failed'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Sky gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#a8d8f0] via-[#c5e6f6] to-[#e8f4fc]" />
            {/* Cloud-like shapes */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%]"
                style={{
                    background: 'radial-gradient(ellipse 80% 60% at 20% 100%, rgba(255,255,255,0.8) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 60% 100%, rgba(255,255,255,0.7) 0%, transparent 55%), radial-gradient(ellipse 90% 40% at 80% 100%, rgba(255,255,255,0.6) 0%, transparent 50%)',
                }}
            />
            {/* Subtle circle arcs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] border border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] border border-white/10 rounded-full" />

            {/* Top bar with logo */}
            <div className="relative z-10 px-6 py-5">
                <Link to="/" className="flex items-center gap-2.5 w-fit">
                    <div className="w-9 h-9 bg-[#08BD80] rounded-xl flex items-center justify-center shadow-md">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-[#1a1a2e]">AI Learning OS</span>
                </Link>
            </div>

            {/* Centered card */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-[420px]">
                    <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/70 p-8 sm:p-10">

                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-[#3C4852]" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="text-2xl font-bold text-center text-[#1a1a2e] mb-1.5">
                            {method === 'email' ? 'Sign in with email' : step === 'otp' ? 'Verify OTP' : 'Sign in with phone'}
                        </h1>
                        <p className="text-sm text-center text-[#6b7280] mb-7">
                            Continue your AI-powered learning journey. For free
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5 border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Email Form */}
                        {method === 'email' && (
                            <div className="space-y-3.5">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl bg-[#f3f4f6] border-0 pl-11 text-sm placeholder:text-[#9ca3af] focus-visible:ring-2 focus-visible:ring-[#08BD80]/30"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-xl bg-[#f3f4f6] border-0 pl-11 pr-11 text-sm placeholder:text-[#9ca3af] focus-visible:ring-2 focus-visible:ring-[#08BD80]/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                                    >
                                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex justify-end">
                                    <button className="text-xs font-semibold text-[#3C4852] hover:text-[#08BD80] transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleEmailLogin}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-[#1a1a2e] hover:bg-[#2d2d44] text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Get Started'}
                                </button>
                            </div>
                        )}

                        {/* Phone Input */}
                        {method === 'phone' && step === 'input' && (
                            <div className="space-y-3.5">
                                <div className="flex gap-2">
                                    <div className="flex items-center px-3.5 bg-[#f3f4f6] rounded-xl text-sm font-medium text-[#6b7280] shrink-0 h-12">
                                        +91
                                    </div>
                                    <div className="relative flex-1">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Phone number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="h-12 rounded-xl bg-[#f3f4f6] border-0 pl-11 text-sm placeholder:text-[#9ca3af] focus-visible:ring-2 focus-visible:ring-[#08BD80]/30"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-[#1a1a2e] hover:bg-[#2d2d44] text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Send OTP'}
                                </button>
                            </div>
                        )}

                        {/* OTP Step */}
                        {method === 'phone' && step === 'otp' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => { setStep('input'); setOtp(''); setDemoOtp(''); setError(''); }}
                                    className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Change number
                                </button>
                                <p className="text-sm text-center text-[#6b7280]">
                                    We sent a 6-digit code to <span className="font-semibold text-[#1a1a2e]">+91 {phone}</span>
                                </p>
                                {demoOtp && (
                                    <div className="bg-[#f0fdf4] border border-[#08BD80]/20 rounded-xl px-4 py-3 text-center">
                                        <p className="text-xs text-[#6b7280] mb-1">Demo OTP</p>
                                        <p className="text-2xl font-bold text-[#08BD80] tracking-[0.3em]">{demoOtp}</p>
                                    </div>
                                )}
                                <div className="flex justify-center py-2">
                                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <InputOTPSlot key={i} index={i} className="w-11 h-13 text-lg font-semibold rounded-xl border-0 bg-[#f3f4f6]" />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-[#1a1a2e] hover:bg-[#2d2d44] text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Verify & Login'}
                                </button>
                                <button onClick={handleSendOTP} className="text-sm text-[#08BD80] font-medium hover:underline w-full text-center">
                                    Resend OTP
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 border-t border-dashed border-[#d1d5db]" />
                            <span className="text-xs text-[#9ca3af] font-medium">Or sign in with</span>
                            <div className="flex-1 border-t border-dashed border-[#d1d5db]" />
                        </div>

                        {/* Social buttons */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="flex-1 h-12 bg-white rounded-xl border border-[#e5e7eb] hover:border-[#d1d5db] hover:shadow-sm transition-all flex items-center justify-center"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="flex-1 h-12 bg-white rounded-xl border border-[#e5e7eb] hover:border-[#d1d5db] hover:shadow-sm transition-all flex items-center justify-center"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMethod(method === 'email' ? 'phone' : 'email'); setStep('input'); setError(''); }}
                                className="flex-1 h-12 bg-white rounded-xl border border-[#e5e7eb] hover:border-[#d1d5db] hover:shadow-sm transition-all flex items-center justify-center"
                            >
                                {method === 'email' ? <Phone className="w-5 h-5 text-[#3C4852]" /> : <Mail className="w-5 h-5 text-[#3C4852]" />}
                            </button>
                        </div>

                        {/* Sign up link */}
                        <p className="text-center text-sm text-[#6b7280] mt-6">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-[#08BD80] hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
