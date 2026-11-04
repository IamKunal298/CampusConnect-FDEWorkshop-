import React, { useState } from 'react';
import { 
  Sparkles, 
  Ticket, 
  ShieldCheck, 
  Terminal, 
  User, 
  ChevronDown, 
  Palette, 
  LogOut, 
  BookOpen, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  currentUser, 
  setCurrentUser, 
  userPersonas, 
  myPassesCount,
  onOpenAuthModal,
  onOpenWireframeModal,
  toggleApiConsole,
  isApiConsoleOpen,
  themeColor,
  setThemeColor
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions = [
    { id: 'indigo', name: 'Campus Indigo', color: '#4f46e5', badge: 'bg-indigo-600' },
    { id: 'emerald', name: 'Emerald Quad', color: '#10b981', badge: 'bg-emerald-600' },
    { id: 'amber', name: 'Sunset Amber', color: '#f59e0b', badge: 'bg-amber-500' },
    { id: 'violet', name: 'Cyber Violet', color: '#8b5cf6', badge: 'bg-violet-600' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Brand - faithfully matching Image 5: '02 C Campus Connect' */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveView('discover')}>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md group-hover:scale-105 transition-transform">
                C
              </div>
              <span className="absolute -top-1.5 -left-1.5 text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-md shadow-xs">
                02
              </span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                  Campus Connect
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Your Campus, Connected
                </span>
              </div>
              <span className="text-xs text-slate-500 hidden md:inline">
                Find your people. Learn something new. Make it memorable.
              </span>
            </div>
          </div>

          {/* Center Links - 'Discover • Connect • Grow' (from Image 5) */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            <button
              onClick={() => setActiveView('discover')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeView === 'discover' 
                  ? 'text-blue-600 font-semibold bg-blue-50/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Discover
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setActiveView('discover')}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Connect
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setActiveView('discover')}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Grow
            </button>

            <span className="text-slate-200 mx-2">|</span>

            {/* Wireframe Inspector Pill */}
            <button
              onClick={onOpenWireframeModal}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Compare with uploaded wireframes & design ideas"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Wireframes & Specs</span>
            </button>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center space-x-3">
            
            {/* My Passes Pill (/api/me/registrations) */}
            <button
              onClick={() => setActiveView('passes')}
              className={`relative inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
                activeView === 'passes'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Passes</span>
              {myPassesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeView === 'passes' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                }`}>
                  {myPassesCount}
                </span>
              )}
            </button>

            {/* Organizer Portal Pill (/api/events/:id/registrations) */}
            <button
              onClick={() => setActiveView('organizer')}
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
                activeView === 'organizer'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                  : currentUser.role === 'organizer'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Organizer Attendee Roster (Restricted to Owning Organizer)"
            >
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span className="hidden md:inline">Organizer Portal</span>
              {currentUser.role === 'organizer' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Live API Console Toggle */}
            <button
              onClick={toggleApiConsole}
              className={`p-2 rounded-xl border transition ${
                isApiConsoleOpen
                  ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Live API Inspector & Console"
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* College Personalization Color Switcher */}
            <div className="relative">
              <button
                onClick={() => { setShowThemeMenu(!showThemeMenu); setShowUserMenu(false); }}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition"
                title="Personalize College Theme Color"
              >
                <Palette className="w-4 h-4 text-blue-500" />
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    College Spirit Theme
                  </div>
                  <div className="space-y-1">
                    {themeOptions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setThemeColor(t.id); setShowThemeMenu(false); }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition ${
                          themeColor === t.id ? 'bg-slate-100 ring-1 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${t.badge}`}></span>
                          <span>{t.name}</span>
                        </div>
                        {themeColor === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar - Faithfully matching 'KG' avatar in Image 5 */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowThemeMenu(false); }}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition hover:shadow-xs"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                  currentUser.role === 'organizer' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {currentUser.avatarInitials}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona / Account Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      <span>Role:</span>
                      <strong className={currentUser.role === 'organizer' ? 'text-purple-600' : 'text-blue-600'}>
                        {currentUser.role.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  <div className="py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                      Switch Persona (Role Testing)
                    </p>
                    {userPersonas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => {
                          setCurrentUser(persona);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                          currentUser.id === persona.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                            persona.role === 'organizer' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {persona.avatarInitials}
                          </div>
                          <div>
                            <div className="text-xs font-medium">{persona.name}</div>
                            <div className="text-[10px] text-slate-500">{persona.roleDescription}</div>
                          </div>
                        </div>
                        {currentUser.id === persona.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Sign-in Showcase (Image 4)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
