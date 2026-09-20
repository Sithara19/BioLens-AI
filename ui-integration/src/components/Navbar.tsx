import React, { useState } from 'react';
import {
  LayoutDashboard,
  Scan,
  History,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Logo } from './Logo';
import { AppView, UserProfile } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: UserProfile | null;
  onLogout: () => void;
  isCapturing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  isCapturing = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'consent', label: 'Screening', icon: Scan },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (view: AppView) => {
    if (isCapturing && (currentView === 'capture' || currentView === 'all-captured' || currentView === 'review')) {
      const confirmLeave = window.confirm('You have an active screening in progress. Are you sure you want to navigate away? Your current step will be paused.');
      if (!confirmLeave) return;
    }
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const isNavActive = (id: AppView) => {
    if (id === 'consent') {
      return (
        currentView === 'consent' ||
        currentView === 'capture' ||
        currentView === 'all-captured' ||
        currentView === 'review' ||
        currentView === 'analysis' ||
        currentView === 'results'
      );
    }
    return currentView === id;
  };

  // If user is not logged in and on landing/login/signup
  const isAuthOrLanding = currentView === 'landing' || currentView === 'login' || currentView === 'signup';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
          className="cursor-pointer transition-opacity hover:opacity-90"
        >
          <Logo size="md" showTagline={false} />
        </div>

        {/* Desktop Navigation Links */}
        {!isAuthOrLanding && user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const active = isNavActive(item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-slate-800">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-teal-600 font-medium">
                    Verified User
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          {user ? (
            <>
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{user.name}</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs text-rose-600 font-semibold px-2 py-1 bg-rose-50 rounded-md"
                >
                  Logout
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isNavActive(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold ${
                        active
                          ? 'bg-teal-50 text-teal-800 border border-teal-200/60'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 text-center"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-xs font-semibold text-white text-center shadow-xs"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
