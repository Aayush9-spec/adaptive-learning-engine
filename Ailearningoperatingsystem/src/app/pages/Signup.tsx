import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import {
    Brain,
    UserPlus,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    GraduationCap,
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const goals = [
        'JEE Main & Advanced', 'NEET UG', 'UPSC Civil Services', 'SSC Exams',
        'Coding & Development', 'Data Science & AI', 'Gate', 'CAT & MBA', 'Other',
    ];

    const handleSignup = async () => {
        if (!name.trim()) { setError('Please enter your full name'); return; }
        if (!email.trim()) { setError('Please enter your email address'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
        if (!phone || phone.length < 10) { setError('Please enter a valid phone number'); return; }
        if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (!goal) { setError('Please select your learning goal'); return; }
        if (!agreedToTerms) { setError('Please agree to the Terms & Conditions'); return; }

        setError(''); setIsLoading(true);
        try {
            await signup({ name: name.trim(), email: email.trim(), phone, password, goal });
            navigate('/');
        } catch (err: any) { setError(err.message || 'Registration failed'); }
        finally { setIsLoading(false); }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try { await googleAuth(); navigate('/'); }
        catch (err: any) { setError(err.message || 'Google sign-up failed'); }
        finally { setIsLoading(false); }
    };

    const inputClass = "w-full h-12 rounded-xl bg-[#f3f4f6] border-0 pl-11 text-sm placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#08BD80]/30 transition-shadow";

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#a8d8f0] via-[#c5e6f6] to-[#e8f4fc]" />
            <div className="absolute bottom-0 left-0 right-0 h-[40%]" style={{
                background: 'radial-gradient(ellipse 80% 60% at 20% 100%, rgba(255,255,255,0.8) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 60% 100%, rgba(255,255,255,0.7) 0%, transparent 55%), radial-gradient(ellipse 90% 40% at 80% 100%, rgba(255,255,255,0.6) 0%, transparent 50%)',
            }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] border border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] border border-white/10 rounded-full" />

            {/* Top bar */}
            <div className="relative z-10 px-6 py-5">
                <Link to="/" className="flex items-center gap-2.5 w-fit">
                    <div className="w-9 h-9 bg-[#08BD80] rounded-xl flex items-center justify-center shadow-md">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-[#1a1a2e]">AI Learning OS</span>
                </Link>
            </div>

            {/* Card */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-[440px]">
                    <form noValidate onSubmit={(e) => e.preventDefault()} className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/70 p-8 sm:p-10">

                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-[#3C4852]" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-center text-[#1a1a2e] mb-1.5">Create your account</h1>
                        <p className="text-sm text-center text-[#6b7280] mb-6">Start your AI-powered learning journey. For free</p>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5 border border-red-100">{error}</div>
                        )}

                        <div className="space-y-3">
                            {/* Name */}
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                <input type="text" autoComplete="name" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                <input type="text" inputMode="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                            </div>

                            {/* Phone */}
                            <div className="flex gap-2">
                                <div className="flex items-center px-3.5 bg-[#f3f4f6] rounded-xl text-sm font-medium text-[#6b7280] shrink-0 h-12">+91</div>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                    <input type="text" inputMode="numeric" autoComplete="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputClass} />
                                </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                    <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
                                        {showPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                    <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClass} pr-10`} />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
                                        {showConfirm ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Goal */}
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                                <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full h-12 rounded-xl bg-[#f3f4f6] border-0 pl-11 pr-4 text-sm text-[#3C4852] outline-none focus:ring-2 focus:ring-[#08BD80]/30 appearance-none cursor-pointer transition-shadow">
                                    <option value="" disabled>What do you want to learn?</option>
                                    {goals.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-2.5 cursor-pointer py-1">
                                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-[#08BD80] cursor-pointer" />
                                <span className="text-xs text-[#6b7280] leading-relaxed">
                                    I agree to the <button type="button" className="text-[#08BD80] font-medium hover:underline">Terms</button> and <button type="button" className="text-[#08BD80] font-medium hover:underline">Privacy Policy</button>
                                </span>
                            </label>

                            {/* Submit */}
                            <button type="button" onClick={handleSignup} disabled={isLoading} className="w-full h-12 rounded-xl bg-[#1a1a2e] hover:bg-[#2d2d44] text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 border-t border-dashed border-[#d1d5db]" />
                            <span className="text-xs text-[#9ca3af] font-medium">Or sign up with</span>
                            <div className="flex-1 border-t border-dashed border-[#d1d5db]" />
                        </div>

                        {/* Social */}
                        <div className="flex items-center justify-center gap-3">
                            <button type="button" onClick={handleGoogleSignup} className="flex-1 h-12 bg-white rounded-xl border border-[#e5e7eb] hover:border-[#d1d5db] hover:shadow-sm transition-all flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </button>
                            <button type="button" className="flex-1 h-12 bg-white rounded-xl border border-[#e5e7eb] hover:border-[#d1d5db] hover:shadow-sm transition-all flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            <button type="button" className="flex-1 h-12 bg-white rounded-xl border border-[#e5e7eb] hover:border-[#d1d5db] hover:shadow-sm transition-all flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-center text-sm text-[#6b7280] mt-5">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-[#08BD80] hover:underline">Log in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
