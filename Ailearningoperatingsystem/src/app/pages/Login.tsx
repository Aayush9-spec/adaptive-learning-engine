import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import {
    Brain,
    Sparkles,
    ArrowRight,
    Phone,
    Mail,
    Lock,
    ChevronLeft,
    Target,
    Zap,
    TrendingUp,
    Shield,
} from 'lucide-react';

type LoginMethod = 'phone' | 'email';
type LoginStep = 'input' | 'otp';

export function Login() {
    const navigate = useNavigate();
    const { login, sendOtp, verifyOtp, googleAuth } = useAuth();

    const [method, setMethod] = useState<LoginMethod>('phone');
    const [step, setStep] = useState<LoginStep>('input');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [demoOtp, setDemoOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const otpCode = await sendOtp(phone);
            setDemoOtp(otpCode);
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length < 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await verifyOtp(phone, otp);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await googleAuth();
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: Target,
            title: 'AI-Powered Learning GPS',
            desc: 'Personalized learning paths that adapt to you',
        },
        {
            icon: Zap,
            title: 'Flow Mode',
            desc: 'Deep focus sessions with AI coaching',
        },
        {
            icon: TrendingUp,
            title: 'Predictive Analytics',
            desc: 'Know your progress before it happens',
        },
        {
            icon: Shield,
            title: 'Smart Assessments',
            desc: 'AI-generated tests that find your gaps',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-[#7c3aed]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />

                <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">AI Learning OS</span>
                    </div>

                    {/* Hero Text */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                            Learn Smarter,
                            <br />
                            <span className="bg-gradient-to-r from-[#2d5bff] to-[#7c3aed] bg-clip-text text-transparent">
                                Not Harder
                            </span>
                        </h1>
                        <p className="text-lg text-white/60 max-w-md leading-relaxed">
                            Your AI-powered operating system for accelerated learning. Personalized paths, real-time insights, and predictive coaching.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.1] transition-all duration-300 group cursor-default"
                            >
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
                        <div>
                            <div className="text-2xl font-bold text-white">50K+</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Active Learners</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <div className="text-2xl font-bold text-white">200+</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Courses</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <div className="text-2xl font-bold text-white">94%</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Auth Panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
                {/* Subtle Background Decor */}
                <div className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-secondary/5 rounded-full blur-3xl" />

                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-foreground">AI Learning OS</span>
                </div>

                <div className="w-full max-w-[420px] relative z-10">
                    {/* Auth Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-8 lg:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#05A672] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                Log in to continue your learning journey
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 mb-6 border border-destructive/20 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-destructive rounded-full shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Phone Login */}
                        {method === 'phone' && step === 'input' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                                        Phone Number
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 bg-muted/60 border border-border/40 rounded-xl text-sm font-medium text-muted-foreground shrink-0">
                                            +91
                                        </div>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="h-12 rounded-xl bg-muted/30 border-border/40 focus-visible:border-primary text-base"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSendOTP}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#4169ff] hover:from-primary/90 hover:to-[#4169ff]/90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send OTP
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* OTP Verification Step */}
                        {method === 'phone' && step === 'otp' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button
                                    onClick={() => { setStep('input'); setOtp(''); setDemoOtp(''); setError(''); }}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Change number
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        We sent a 6-digit code to{' '}
                                        <span className="font-semibold text-foreground">+91 {phone}</span>
                                    </p>
                                </div>

                                {/* Demo OTP display */}
                                {demoOtp && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Demo OTP (shown for testing)</p>
                                        <p className="text-2xl font-bold text-primary tracking-[0.3em]">{demoOtp}</p>
                                    </div>
                                )}

                                <div className="flex justify-center py-2">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <InputOTPSlot
                                                    key={i}
                                                    index={i}
                                                    className="w-12 h-14 text-lg font-semibold rounded-xl border-border/60 bg-muted/30 first:rounded-l-xl last:rounded-r-xl"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <Button
                                    onClick={handleVerifyOTP}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#4169ff] hover:from-primary/90 hover:to-[#4169ff]/90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Verify & Login
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={handleSendOTP}
                                    className="text-sm text-primary font-medium hover:underline w-full text-center"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        )}

                        {/* Email Login */}
                        {method === 'email' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 rounded-xl bg-muted/30 border-border/40 pl-10 focus-visible:border-primary text-base"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 rounded-xl bg-muted/30 border-border/40 pl-10 focus-visible:border-primary text-base"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button className="text-xs text-primary font-medium hover:underline">
                                        Forgot password?
                                    </button>
                                </div>

                                <Button
                                    onClick={handleEmailLogin}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#4169ff] hover:from-primary/90 hover:to-[#4169ff]/90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Log In
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <Separator className="flex-1 bg-border/40" />
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
                            <Separator className="flex-1 bg-border/40" />
                        </div>

                        {/* Google Sign In */}
                        <Button
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl border-border/60 bg-white hover:bg-gray-50 text-foreground font-medium text-sm transition-all hover:shadow-md"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>

                        {/* Toggle Login Method */}
                        <button
                            onClick={() => {
                                setMethod(method === 'phone' ? 'email' : 'phone');
                                setStep('input');
                                setError('');
                            }}
                            className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/50"
                        >
                            {method === 'phone' ? (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Continue with Email
                                </>
                            ) : (
                                <>
                                    <Phone className="w-4 h-4" />
                                    Continue with Phone
                                </>
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center mt-6 pt-6 border-t border-border/30">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-muted-foreground/60 mt-6">
                        By continuing, you agree to our{' '}
                        <button className="underline hover:text-muted-foreground">Terms of Service</button>
                        {' '}and{' '}
                        <button className="underline hover:text-muted-foreground">Privacy Policy</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
