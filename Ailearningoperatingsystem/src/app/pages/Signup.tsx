import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import {
    Brain,
    ArrowRight,
    User,
    Mail,
    Phone,
    Lock,
    GraduationCap,
    Target,
    Zap,
    TrendingUp,
    Shield,
    CheckCircle2,
} from 'lucide-react';

export function Signup() {
    const navigate = useNavigate();
    const { signup, googleAuth } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [goal, setGoal] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const goals = [
        'JEE Main & Advanced',
        'NEET UG',
        'UPSC Civil Services',
        'SSC Exams',
        'Coding & Development',
        'Data Science & AI',
        'Gate',
        'CAT & MBA',
        'Other',
    ];

    const handleSignup = async () => {
        // Validation
        if (!name.trim()) { setError('Please enter your full name'); return; }
        if (!email.trim()) { setError('Please enter your email address'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
        if (!phone || phone.length < 10) { setError('Please enter a valid phone number'); return; }
        if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (!goal) { setError('Please select your learning goal'); return; }
        if (!agreedToTerms) { setError('Please agree to the Terms & Conditions'); return; }

        setError('');
        setIsLoading(true);
        try {
            await signup({
                name: name.trim(),
                email: email.trim(),
                phone,
                password,
                goal,
            });
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try {
            await googleAuth();
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Google sign-up failed');
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

    const benefits = [
        'Unlimited access to AI-powered courses',
        'Personalized learning path optimization',
        'Real-time progress tracking & insights',
        'AI coaching available 24/7',
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
                            Start Your
                            <br />
                            <span className="bg-gradient-to-r from-[#10b981] to-[#2d5bff] bg-clip-text text-transparent">
                                Learning Journey
                            </span>
                        </h1>
                        <p className="text-lg text-white/60 max-w-md leading-relaxed">
                            Join thousands of learners who are accelerating their growth with AI-powered personalized education.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4 mb-12">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                                </div>
                                <span className="text-white/70 text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Feature Cards (Compact) */}
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.1] transition-all duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                                        <feature.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-white">{feature.title}</h3>
                                        <p className="text-[10px] text-white/40">{feature.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Auth Panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-green-50/20 relative">
                {/* Subtle Background Decor */}
                <div className="absolute top-10 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />

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
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#05A672] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/25">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                            <p className="text-sm text-muted-foreground mt-1.5">
                                Join for free and start learning today
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 mb-5 border border-destructive/20 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-destructive rounded-full shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Google Signup (Top) */}
                        <Button
                            variant="outline"
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl border-border/60 bg-white hover:bg-gray-50 text-foreground font-medium text-sm transition-all hover:shadow-md mb-5"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign up with Google
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-5">
                            <Separator className="flex-1 bg-border/40" />
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
                            <Separator className="flex-1 bg-border/40" />
                        </div>

                        {/* Signup Form */}
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 rounded-xl bg-muted/30 border-border/40 pl-10 focus-visible:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="signup-email" className="text-xs font-medium">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl bg-muted/30 border-border/40 pl-10 focus-visible:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <Label htmlFor="signup-phone" className="text-xs font-medium">Phone Number</Label>
                                <div className="flex gap-2">
                                    <div className="flex items-center px-3 bg-muted/60 border border-border/40 rounded-xl text-xs font-medium text-muted-foreground shrink-0">
                                        +91
                                    </div>
                                    <div className="relative flex-1">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="signup-phone"
                                            type="tel"
                                            placeholder="Phone number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="h-11 rounded-xl bg-muted/30 border-border/40 pl-10 focus-visible:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="signup-password" className="text-xs font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="Min 6 chars"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 rounded-xl bg-muted/30 border-border/40 pl-9 focus-visible:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirm-password" className="text-xs font-medium">Confirm</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="Re-enter"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-11 rounded-xl bg-muted/30 border-border/40 pl-9 focus-visible:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Goal Selection */}
                            <div className="space-y-1.5">
                                <Label htmlFor="goal" className="text-xs font-medium">
                                    <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
                                    What do you want to learn?
                                </Label>
                                <select
                                    id="goal"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="w-full h-11 rounded-xl bg-muted/30 border border-border/40 px-3.5 text-sm text-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select your goal</option>
                                    {goals.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Terms & Conditions */}
                            <label className="flex items-start gap-3 cursor-pointer group py-1">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded border-border/60 text-primary focus:ring-primary/20 cursor-pointer accent-[var(--primary)]"
                                />
                                <span className="text-xs text-muted-foreground leading-relaxed">
                                    I agree to the{' '}
                                    <button className="text-primary font-medium hover:underline">Terms of Service</button>
                                    {' '}and{' '}
                                    <button className="text-primary font-medium hover:underline">Privacy Policy</button>
                                </span>
                            </label>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSignup}
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-secondary to-[#2d5bff] hover:from-secondary/90 hover:to-[#2d5bff]/90 text-white font-semibold text-base shadow-lg shadow-secondary/25 transition-all hover:shadow-xl hover:shadow-secondary/30"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center mt-5 pt-5 border-t border-border/30">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
