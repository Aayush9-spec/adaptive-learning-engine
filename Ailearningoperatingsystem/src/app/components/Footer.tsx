import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="bg-[#1a1a2e] text-white/80">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">AI Learning OS</span>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed mb-6">
                            AI Learning OS is democratizing education, making it adaptive and accessible to all. Join the revolution, learn on India's smartest learning platform.
                        </p>

                        {/* App Badges */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/15 transition-colors">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                <div>
                                    <p className="text-[8px] text-white/60 leading-none">Download on the</p>
                                    <p className="text-xs font-semibold text-white leading-none mt-0.5">App Store</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/15 transition-colors">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.564 1.484c.435.252.435.886 0 1.138l-2.564 1.483-2.545-2.545 2.545-2.56zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" /></svg>
                                <div>
                                    <p className="text-[8px] text-white/60 leading-none">GET IT ON</p>
                                    <p className="text-xs font-semibold text-white leading-none mt-0.5">Google Play</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-sm font-medium text-white mb-1">Reach out to us</p>
                            <p className="text-xs text-white/40">Get your questions answered about learning with AI Learning OS.</p>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3">
                            {['About Us', 'Careers', 'Blogs', 'Privacy Policy', 'Terms and Conditions'].map((item) => (
                                <li key={item}>
                                    <span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Popular Goals</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Full Stack Dev', path: '/explore' },
                                { label: 'Data Science', path: '/explore' },
                                { label: 'Machine Learning', path: '/explore' },
                                { label: 'Backend Dev', path: '/explore' },
                                { label: 'DevOps', path: '/explore' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <span onClick={() => navigate(item.path)} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Study Material</h4>
                        <ul className="space-y-3">
                            {[
                                'DSA Study Material',
                                'Python Study Material',
                                'System Design Notes',
                                'Interview Prep Guide',
                                'Project Ideas'
                            ].map((item) => (
                                <li key={item}>
                                    <span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-xs text-white/40">© 2026 AI Learning OS. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        {/* Social Icons */}
                        {['facebook', 'youtube', 'twitter', 'instagram', 'linkedin'].map((social) => (
                            <span key={social} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                <span className="text-[10px] text-white/60 font-bold uppercase">{social[0]}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
