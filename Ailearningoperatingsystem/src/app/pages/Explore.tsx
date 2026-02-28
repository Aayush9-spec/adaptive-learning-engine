import { BottomNav } from '../components/BottomNav';
import { useNavigate } from 'react-router';
import {
    Search,
    BookOpen,
    Users,
    Star,
    Clock,
    Play,
    ChevronRight,
    Flame,
    GraduationCap,
    Code2,
    FlaskConical,
    Scale,
    BarChart3,
    Atom,
    Calculator,
    Brain,
    Sparkles,
    TrendingUp,
    ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

export function Explore() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const goalCategories = [
        { icon: Code2, name: 'Coding & Development', courses: 45, color: '#2d5bff', students: '12K+' },
        { icon: Atom, name: 'JEE Main & Advanced', courses: 120, color: '#ef4444', students: '50K+' },
        { icon: FlaskConical, name: 'NEET UG', courses: 95, color: '#10b981', students: '35K+' },
        { icon: Scale, name: 'UPSC Civil Services', courses: 80, color: '#f59e0b', students: '28K+' },
        { icon: Calculator, name: 'SSC Exams', courses: 60, color: '#7c3aed', students: '15K+' },
        { icon: BarChart3, name: 'Data Science & AI', courses: 38, color: '#0ea5e9', students: '8K+' },
        { icon: GraduationCap, name: 'CAT & MBA', courses: 42, color: '#ec4899', students: '10K+' },
        { icon: Brain, name: 'Gate', courses: 55, color: '#14b8a6', students: '18K+' },
    ];

    const featuredCourses = [
        {
            title: 'Complete Python Bootcamp',
            educator: 'Dr. Priya Sharma',
            rating: 4.9,
            students: 12400,
            duration: '42 hours',
            lessons: 156,
            level: 'Beginner to Advanced',
            color: '#2d5bff',
            tag: 'Bestseller',
        },
        {
            title: 'Data Structures & Algorithms',
            educator: 'Prof. Rajesh Kumar',
            rating: 4.8,
            students: 8900,
            duration: '56 hours',
            lessons: 210,
            level: 'Intermediate',
            color: '#7c3aed',
            tag: 'Popular',
        },
        {
            title: 'Machine Learning Masterclass',
            educator: 'Dr. Ananya Verma',
            rating: 4.7,
            students: 6300,
            duration: '38 hours',
            lessons: 124,
            level: 'Advanced',
            color: '#10b981',
            tag: 'New',
        },
        {
            title: 'System Design for Interviews',
            educator: 'Vikram Mehta',
            rating: 4.9,
            students: 5100,
            duration: '28 hours',
            lessons: 86,
            level: 'Advanced',
            color: '#f59e0b',
            tag: 'Trending',
        },
    ];

    const liveClasses = [
        { title: 'Binary Trees — Advanced Concepts', educator: 'Prof. Rajesh Kumar', time: 'Today, 4:00 PM', viewers: 1240, isLive: true },
        { title: 'Dynamic Programming Patterns', educator: 'Dr. Priya Sharma', time: 'Today, 6:30 PM', viewers: 0, isLive: false },
        { title: 'Graph Algorithms Deep Dive', educator: 'Vikram Mehta', time: 'Tomorrow, 10:00 AM', viewers: 0, isLive: false },
    ];

    return (
        <div className="min-h-screen bg-white pb-24 lg:pb-8 lg:pl-64">
            {/* Hero Section */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                <div className="absolute inset-0">
                    <div className="absolute top-10 right-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-10 w-56 h-56 bg-secondary/10 rounded-full blur-[80px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                            Crack your goal with
                            <br />
                            <span className="bg-gradient-to-r from-primary to-[#7c3aed] bg-clip-text text-transparent">
                                India's top educators
                            </span>
                        </h1>
                        <p className="text-white/60 text-base mb-6">
                            Get unlimited access to structured courses, live classes, and doubt clearing sessions
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for courses, topics, or educators..."
                                className="w-full h-13 pl-12 pr-4 bg-white rounded-2xl text-sm text-foreground placeholder:text-muted-foreground shadow-xl focus:ring-[3px] focus:ring-primary/20 outline-none border-0 py-3.5"
                            />
                        </div>
                    </div>

                    {/* Platform Stats */}
                    <div className="flex items-center gap-6 lg:gap-10 mt-8 pt-6 border-t border-white/10">
                        {[
                            { value: '60+', label: 'Exam Categories' },
                            { value: '1.5K+', label: 'Daily Live Classes' },
                            { value: '14K+', label: 'Expert Educators' },
                            { value: '1M+', label: 'Video Lessons' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-white/40">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* Popular Goals */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Popular Goals</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Select your goal to get personalized courses</p>
                        </div>
                        <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {goalCategories.map((goal, i) => (
                            <button
                                key={i}
                                className="bg-card/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group"
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${goal.color}12` }}
                                >
                                    <goal.icon className="w-6 h-6" style={{ color: goal.color }} />
                                </div>
                                <h3 className="font-semibold text-foreground text-sm mb-1">{goal.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{goal.courses} courses</span>
                                    <span>•</span>
                                    <span>{goal.students} learners</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Featured Courses */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Featured Courses</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Handpicked by our AI for maximum impact</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featuredCourses.map((course, i) => (
                            <div
                                key={i}
                                className="bg-card/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                {/* Course Header Color */}
                                <div className="h-2 w-full" style={{ backgroundColor: course.color }} />

                                <div className="p-5">
                                    {/* Tag */}
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                                        style={{
                                            backgroundColor: `${course.color}15`,
                                            color: course.color,
                                        }}
                                    >
                                        {course.tag}
                                    </span>

                                    <h3 className="font-semibold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">{course.title}</h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {course.educator.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{course.educator}</span>
                                    </div>

                                    <div className="flex items-center gap-1 mb-3">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-semibold text-foreground">{course.rating}</span>
                                        <span className="text-xs text-muted-foreground">({course.students.toLocaleString()} students)</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {course.duration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            {course.lessons} lessons
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Daily Live Classes */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Daily Live Classes</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Join interactive sessions with expert educators</p>
                        </div>
                        <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                            See Schedule <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {liveClasses.map((cls, i) => (
                            <div
                                key={i}
                                className="bg-card/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/50 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cls.isLive ? 'bg-destructive/10' : 'bg-muted/50'}`}>
                                        {cls.isLive ? (
                                            <div className="relative">
                                                <Play className="w-5 h-5 text-destructive fill-destructive" />
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
                                            </div>
                                        ) : (
                                            <Clock className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{cls.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{cls.educator} • {cls.time}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {cls.isLive && (
                                        <span className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-xs font-semibold">
                                            <Flame className="w-3 h-3" />
                                            {cls.viewers.toLocaleString()} watching
                                        </span>
                                    )}
                                    <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${cls.isLive
                                        ? 'bg-destructive text-white hover:bg-destructive/90'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                        }`}>
                                        {cls.isLive ? 'Join Now' : 'Set Reminder'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="bg-gradient-to-r from-primary to-[#7c3aed] rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                    <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-white/5 rounded-full blur-2xl" />
                    <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Start learning with AI Learning OS</h2>
                            <p className="text-white/70 max-w-lg">
                                Get unlimited access to structured courses, doubt clearing sessions, and AI-powered personalized learning.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/gps')}
                            className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg shrink-0"
                        >
                            Start Learning
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
