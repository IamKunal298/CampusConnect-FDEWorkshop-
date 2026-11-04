import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Loader2, Sparkles, User, Mail, Phone, Calendar, Briefcase, FileText } from 'lucide-react';
import { registerForEvent } from '../utils/api.js';

export default function RegistrationModal({ 
  isOpen, 
  onClose, 
  event, 
  currentUser, 
  onSuccess,
  onViewExistingPass
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '21',
    phone: '+1 (555) 234-8901',
    role: 'Undergraduate - CS Jr.',
    department: 'School of Engineering',
    notes: 'Excited to attend and collaborate!'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  // Sync form with currentUser whenever opened
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || 'Karan Gupta',
        email: currentUser.email || 'karan.gupta@campus.edu',
        role: currentUser.roleDescription || 'Undergraduate Student'
      }));
    }
    setConflictError(null);
  }, [currentUser, event, isOpen]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setConflictError(null);

    try {
      const payload = {
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age, 10) || 20,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        notes: formData.notes
      };

      const response = await registerForEvent(payload, currentUser);
      setIsSubmitting(false);
      onSuccess(response.registration, event);
    } catch (err) {
      setIsSubmitting(false);
      console.error('Registration failed with error:', err);

      if (err.status === 409) {
        setConflictError({
          code: err.data?.code || 'CONFLICT',
          message: err.data?.message || 'Registration conflict occurred.',
          details: err.data?.details
        });
      } else {
        setConflictError({
          code: 'ERROR',
          message: err.message || 'An unexpected error occurred during registration.'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header - Wireframe (3) Title: 'Registration form' */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg font-heading shadow-xs">
              3
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                Wireframe (3) Implementation
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                Registration Form
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Event Micro-Banner */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Selected Event</span>
            <strong className="text-slate-800">{event.title}</strong>
          </div>
          <div className="text-right text-[11px] text-slate-500 font-medium">
            <span>{event.date} • {event.time}</span>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Conflict 409 Warning Banner if returned by server */}
          {conflictError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 animate-in shake duration-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <strong className="text-xs uppercase tracking-wider font-extrabold text-rose-900">
                      HTTP 409 Conflict: {conflictError.code}
                    </strong>
                    <span className="text-[9px] bg-rose-200 text-rose-800 font-mono font-bold px-1.5 py-0.5 rounded">
                      POST /api/registrations
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-rose-700">
                    {conflictError.message}
                  </p>
                  {conflictError.details && (
                    <div className="text-[11px] text-rose-800 font-mono pt-1">
                      Existing Ticket: <strong>{conflictError.details.ticketCode}</strong>
                    </div>
                  )}
                  {conflictError.code === 'DUPLICATE_REGISTRATION' && onViewExistingPass && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewExistingPass();
                      }}
                      className="mt-2 inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                    >
                      <span>Open My Digital Ticket Pass</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Wireframe (3) Fields: Name, Email, Age, Phone, Role/Occupation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Name: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full student name"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.name@campus.edu"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                .edu
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age: <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="16"
                max="99"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="21"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone: <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role / Occupation: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Undergraduate - Computer Science Jr."
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department / Major:
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. School of Design & Computing"
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dietary / Accessibility Notes:
            </label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any dietary restrictions (vegan, halal, nut allergy) or accessibility requirements..."
              className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </button>

            {/* Wireframe (3) Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
