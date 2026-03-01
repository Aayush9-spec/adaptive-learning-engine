import { useNavigate, useLocation } from 'react-router';
import { Compass, Brain, Target, TrendingUp, User, BookOpen, Bot } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Compass, label: 'Command' },
    { path: '/explore', icon: BookOpen, label: 'Explore' },
    { path: '/tutor-hub', icon: Bot, label: 'AI Tutor' },
    { path: '/gps', icon: Target, label: 'GPS' },
    { path: '/flow', icon: Brain, label: 'Flow' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-background/90 backdrop-blur-xl border-r border-border/50 z-50 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
        {/* Logo / Brand */}
        <div className="px-6 py-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-[var(--radius-lg)] flex items-center justify-center shadow-md shadow-primary/20">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">LearnOS</h2>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI-Powered</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] transition-all duration-200 group ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(45,91,255,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="px-6 py-4 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider text-center">
            Adaptive Learning Engine
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-lg mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center p-2 rounded-[var(--radius-lg)] transition-all duration-300 ${isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] mb-0.5 transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(45,91,255,0.5)]' : 'scale-100'}`} />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
