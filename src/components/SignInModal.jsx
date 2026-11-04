import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, Shield, Check, ArrowRight } from 'lucide-react';

export default function SignInModal({ isOpen, onClose, onLogin, userPersonas }) {
  const [email, setEmail] = useState('karan.gupta@campus.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginFeedback, setLoginFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginFeedback('Signing in...');
    setTimeout(() => {
      // Find matching persona or default to student
      const matched = userPersonas.find(p => p.email.toLowerCase() === email.toLowerCase());
      onLogin(matched || userPersonas[0]);
      onClose();
    }, 400);
  };

  const handleSelectPersona = (persona) => {
    setEmail(persona.email);
    setPassword('campuspass2026');
    setLoginFeedback(`Switched credentials to ${persona.name} (${persona.role})`);
    setTimeout(() => {
      onLogin(persona);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Faithfully replicating Image 4 */}
        <div className="md:w-5/12 bg-[#0B192C] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                C
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider text-blue-400 block font-semibold">01</span>
                <span className="text-lg font-bold tracking-tight text-white block">Campus Connect</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium block">
                  YOUR CAMPUS, CONNECTED
                </span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3 font-heading">
              Your campus life, <br />
              all in one place.
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Stay in the loop with events, communities, and opportunities built around you.
            </p>
          </div>

          {/* Center Interactive Widget Card (Image 4) */}
          <div className="relative z-10 my-8 p-5 rounded-2xl bg-[#142338] border border-slate-700/60 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-700/50">
                LIVE HUB
              </span>
            </div>

            <div className="space-y-2.5">
              <button 
                type="button"
                onClick={() => { onClose(); }}
                className="w-full text-left font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white shadow-md transition flex items-center justify-between group"
              >
                <span>FIND WORKSHOPS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                type="button"
                onClick={() => { onClose(); }}
                className="w-full text-left font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-md transition flex items-center justify-between group"
              >
                <span>MEET YOUR PEOPLE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bottom Caption */}
          <div className="relative z-10">
            <p className="text-[11px] text-slate-400 italic">
              Made for the moments that make campus yours.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form (Faithfully matching Image 4) */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                Welcome back
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your Campus Connect account.
              </p>
            </div>

            {/* Quick Demo Persona Pickers */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                ⚡ Quick 1-Click Persona Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                {userPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectPersona(persona)}
                    className="flex items-center space-x-2 p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 text-left transition shadow-2xs"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      persona.role === 'organizer' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {persona.avatarInitials}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">{persona.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{persona.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  College email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                    .edu
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your college email!')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {loginFeedback && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg font-medium animate-pulse">
                  {loginFeedback}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition active:scale-[0.99]"
              >
                Sign in
              </button>
            </form>

            {/* Social Logins (From Image 4) */}
            <div className="mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleSelectPersona(userPersonas[0])}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                >
                  <span className="font-bold text-blue-600">G</span>
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPersona(userPersonas[0])}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                >
                  <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                    <span className="bg-[#f25022]"></span>
                    <span className="bg-[#7fba00]"></span>
                    <span className="bg-[#00a4ef]"></span>
                    <span className="bg-[#ffb900]"></span>
                  </div>
                  <span>Continue with Microsoft</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Security Note (From Image 4) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              New to Campus Connect?{' '}
              <button 
                onClick={() => alert('Campus Connect accounts are automatically provisioned via your .edu SSO login.')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Create an account
              </button>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Your account details stay private and secure.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
