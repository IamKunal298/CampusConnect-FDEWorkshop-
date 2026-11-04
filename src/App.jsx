import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import EventsGrid from './components/EventsGrid.jsx';
import EventDetailModal from './components/EventDetailModal.jsx';
import RegistrationModal from './components/RegistrationModal.jsx';
import SuccessModal from './components/SuccessModal.jsx';
import MyPassesView from './components/MyPassesView.jsx';
import OrganizerView from './components/OrganizerView.jsx';
import SignInModal from './components/SignInModal.jsx';
import ApiConsole from './components/ApiConsole.jsx';
import WireframeComparisonDrawer from './components/WireframeComparisonDrawer.jsx';
import { getEvents, getMyRegistrations, resetDatabase } from './utils/api.js';
import { Terminal, Shield, Sparkles, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const USER_PERSONAS = [
  {
    id: 'usr_student_kg',
    name: 'Karan Gupta',
    avatarInitials: 'KG', // Faithfully matching Image 5 top-right badge
    email: 'karan.gupta@campus.edu',
    role: 'student',
    roleDescription: 'Undergraduate • Computer Science Jr.',
    department: 'School of Computing & Media',
    studentId: 'CC-2026-8819'
  },
  {
    id: 'usr_organizer_elena',
    name: 'Elena Rostova',
    avatarInitials: 'ER',
    email: 'elena.rostova@campus.edu',
    role: 'organizer',
    organizerId: 'org_elena',
    roleDescription: 'Lead Event Organizer • Campus Guild',
    department: 'Campus Activities Board',
    studentId: 'ORG-DESIGN-2026'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(USER_PERSONAS[0]);
  const [activeView, setActiveView] = useState('discover'); // 'discover' | 'passes' | 'organizer'
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All events');
  const [themeColor, setThemeColor] = useState('indigo');

  // User passes & registrations tracking
  const [myPasses, setMyPasses] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  // Modals state
  const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);
  const [selectedRegisterEvent, setSelectedRegisterEvent] = useState(null);
  const [successData, setSuccessData] = useState(null); // { registration, event }
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWireframeModalOpen, setIsWireframeModalOpen] = useState(false);
  const [isApiConsoleOpen, setIsApiConsoleOpen] = useState(false);
  const [organizerPreselectedEventId, setOrganizerPreselectedEventId] = useState(null);

  // Load events
  const loadEvents = async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await getEvents();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
      setServerError(
        'Backend server is not running on port 5000. Live Server only hosts the frontend HTML. Please open a terminal in VS Code and run "node server.js".'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load current user's passes (/api/me/registrations)
  const loadMyPasses = async () => {
    try {
      const data = await getMyRegistrations(currentUser);
      const passes = data.registrations || [];
      setMyPasses(passes);
      setRegisteredEventIds(passes.map((p) => p.eventId));
    } catch (err) {
      console.error('Failed to load user passes:', err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadMyPasses();
  }, [currentUser]);

  // Handle successful registration (Wireframe 3 -> Wireframe 4)
  const handleRegistrationSuccess = (newReg, event) => {
    setSelectedRegisterEvent(null);
    setSuccessData({ registration: newReg, event });
    loadEvents();
    loadMyPasses();
  };

  // Handle demo database reset
  const handleResetData = async () => {
    if (confirm('Reset event seat registrations to default demo values?')) {
      try {
        await resetDatabase();
        await loadEvents();
        await loadMyPasses();
      } catch (e) {
        alert('Reset failed: ' + e.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        userPersonas={USER_PERSONAS}
        myPassesCount={myPasses.length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenWireframeModal={() => setIsWireframeModalOpen(true)}
        toggleApiConsole={() => setIsApiConsoleOpen(!isApiConsoleOpen)}
        isApiConsoleOpen={isApiConsoleOpen}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-24">
        {activeView === 'discover' && (
          <EventsGrid
            events={events}
            isLoading={isLoading}
            serverError={serverError}
            onRetryEvents={loadEvents}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
            onRegisterClick={(evt) => setSelectedRegisterEvent(evt)}
            registeredEventIds={registeredEventIds}
            onResetData={handleResetData}
          />
        )}

        {activeView === 'passes' && (
          <MyPassesView
            currentUser={currentUser}
            onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
            onBackToDiscover={() => setActiveView('discover')}
          />
        )}

        {activeView === 'organizer' && (
          <OrganizerView
            events={events}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            userPersonas={USER_PERSONAS}
            selectedEventId={organizerPreselectedEventId}
            setSelectedEventId={setOrganizerPreselectedEventId}
          />
        )}
      </main>

      {/* Floating Quick Evaluation Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/80 text-xs">
        <button
          onClick={() => setIsApiConsoleOpen(!isApiConsoleOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold transition ${
            isApiConsoleOpen ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>API Console</span>
        </button>

        <span className="text-slate-600">|</span>

        <button
          onClick={() => setIsWireframeModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>Wireframe Comparison</span>
        </button>

        <span className="text-slate-600 hidden sm:inline">|</span>

        {/* Persona quick display */}
        <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 pl-1">
          <span>Active:</span>
          <strong className={currentUser.role === 'organizer' ? 'text-purple-400' : 'text-blue-400'}>
            {currentUser.name.split(' ')[0]} ({currentUser.role})
          </strong>
        </div>
      </div>

      {/* MODALS */}

      {/* Event Details Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
          onRegisterClick={(evt) => setSelectedRegisterEvent(evt)}
          isUserRegistered={registeredEventIds.includes(selectedDetailEvent.id)}
          currentUser={currentUser}
          onOpenOrganizerView={(evtId) => {
            setOrganizerPreselectedEventId(evtId);
            setActiveView('organizer');
          }}
        />
      )}

      {/* Wireframe (3) Registration Modal */}
      {selectedRegisterEvent && (
        <RegistrationModal
          isOpen={!!selectedRegisterEvent}
          onClose={() => setSelectedRegisterEvent(null)}
          event={selectedRegisterEvent}
          currentUser={currentUser}
          onSuccess={handleRegistrationSuccess}
          onViewExistingPass={() => {
            setSelectedRegisterEvent(null);
            setActiveView('passes');
          }}
        />
      )}

      {/* Wireframe (4) Success Confirmation Modal */}
      {successData && (
        <SuccessModal
          isOpen={!!successData}
          onClose={() => setSuccessData(null)}
          registration={successData.registration}
          event={successData.event}
          onViewMyPasses={() => {
            setSuccessData(null);
            setActiveView('passes');
          }}
        />
      )}

      {/* Inspiration Showcase 01 Sign-in Modal */}
      <SignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(persona) => {
          setCurrentUser(persona);
          setIsAuthModalOpen(false);
        }}
        userPersonas={USER_PERSONAS}
      />

      {/* Wireframes & Refinement Map Drawer */}
      <WireframeComparisonDrawer
        isOpen={isWireframeModalOpen}
        onClose={() => setIsWireframeModalOpen(false)}
      />

      {/* Live API Console & Playground */}
      <ApiConsole
        isOpen={isApiConsoleOpen}
        onClose={() => setIsApiConsoleOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
}
