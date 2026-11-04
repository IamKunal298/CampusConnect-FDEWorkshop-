import React, { useState } from 'react';
import { Search, Filter, Sparkles, RefreshCw, X, Flame, AlertTriangle } from 'lucide-react';
import EventCard from './EventCard.jsx';

export default function EventsGrid({ 
  events, 
  isLoading, 
  serverError,
  onRetryEvents,
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  onSelectEvent,
  onRegisterClick,
  registeredEventIds,
  onResetData
}) {
  const [availableOnly, setAvailableOnly] = useState(false);

  // Exact categories from Image 5 plus culture & volunteer
  const categories = [
    { id: 'All events', label: 'All events' },
    { id: 'Workshops', label: 'Workshops' },
    { id: 'Social', label: 'Social' },
    { id: 'Career', label: 'Career' },
    { id: 'Sports', label: 'Sports' },
    { id: 'Culture', label: 'Culture' },
    { id: 'Volunteer', label: 'Volunteer' },
  ];

  const filteredEvents = events.filter((evt) => {
    // Category match
    const categoryMatch = 
      selectedCategory === 'All events' || 
      evt.category.toLowerCase() === selectedCategory.toLowerCase() ||
      evt.tag.toLowerCase() === selectedCategory.toLowerCase();

    // Search query match
    const query = searchTerm.trim().toLowerCase();
    const searchMatch = !query || 
      evt.title.toLowerCase().includes(query) ||
      evt.location.toLowerCase().includes(query) ||
      evt.description.toLowerCase().includes(query) ||
      evt.tag.toLowerCase().includes(query) ||
      evt.organizer.toLowerCase().includes(query);

    // Available only filter
    const seatsMatch = !availableOnly || (evt.registeredCount < evt.capacity);

    return categoryMatch && searchMatch && seatsMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* HERO / SEARCH SECTION - Faithfully matching Image 5 */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading mb-3">
          What’s happening on campus?
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
          Handpicked experiences for your next great campus moment.
        </p>

        {/* Search Bar Input (Matching Image 5) */}
        <div className="mt-7 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events, clubs, workshops..."
              className="w-full pl-12 pr-10 py-3.5 bg-white text-sm sm:text-base rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs transition placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Matching Image 5) */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-2 ring-blue-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Quick Available Seats Filter */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`ml-auto hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition ${
              availableOnly 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Open Seats Only</span>
          </button>
        </div>

      </div>

      {/* SECTION HEADER - 'UPCOMING EVENTS' (From Image 5) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
            UPCOMING EVENTS
          </h2>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {filteredEvents.length}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onResetData}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1 transition"
            title="Reset event seat counts to defaults"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo Seats</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('All events'); setSearchTerm(''); setAvailableOnly(false); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View all</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* EVENTS GRID */}
      {serverError ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 sm:p-10 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Backend Server Is Not Running
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Live Server only serves the frontend webpage. To load your Supabase campus events, the backend API server must be running.
          </p>
          <div className="my-4 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs text-left max-w-sm mx-auto">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Terminal Command:</div>
            <code className="text-emerald-400">node server.js</code>
          </div>
          <button
            onClick={onRetryEvents}
            className="mt-2 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-3xl border border-slate-200"></div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onSelectEvent={onSelectEvent}
              onRegisterClick={onRegisterClick}
              isUserRegistered={registeredEventIds.includes(evt.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No campus events match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or clear category filters to explore more campus gatherings.
          </p>
          <button
            onClick={() => { setSelectedCategory('All events'); setSearchTerm(''); setAvailableOnly(false); }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
