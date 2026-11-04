import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { 
  subscribeToApiLogs, 
  getEvents, 
  getEventDetails, 
  registerForEvent, 
  getMyRegistrations, 
  getEventRegistrations 
} from '../utils/api.js';

export default function ApiConsole({ isOpen, onClose, currentUser }) {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'playground'
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Playground state
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState('/api/events');
  const [customEventId, setCustomEventId] = useState('evt_1');
  const [playgroundBody, setPlaygroundBody] = useState(JSON.stringify({
    eventId: 'evt_1',
    name: 'Karan Gupta',
    email: 'karan.gupta@campus.edu',
    age: 21,
    phone: '+1 (555) 234-8901',
    role: 'Computer Science Jr.'
  }, null, 2));

  useEffect(() => {
    const unsubscribe = subscribeToApiLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      if (!selectedLog) {
        setSelectedLog(newLog);
      }
    });
    return unsubscribe;
  }, [selectedLog]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRunPlayground = async (endpointType) => {
    setIsExecuting(true);
    try {
      if (endpointType === 'get_events') {
        await getEvents();
      } else if (endpointType === 'get_event_detail') {
        await getEventDetails(customEventId);
      } else if (endpointType === 'post_register') {
        const parsed = JSON.parse(playgroundBody);
        await registerForEvent(parsed, currentUser);
      } else if (endpointType === 'get_my_regs') {
        await getMyRegistrations(currentUser);
      } else if (endpointType === 'get_event_regs') {
        await getEventRegistrations(customEventId, currentUser);
      }
    } catch (e) {
      console.log('Playground call captured by inspector');
    } finally {
      setIsExecuting(false);
    }
  };

  const setDuplicateTestPayload = () => {
    setPlaygroundBody(JSON.stringify({
      eventId: 'evt_2',
      name: 'Karan Gupta',
      email: 'karan.gupta@campus.edu', // Already registered on evt_2!
      age: 21,
      phone: '+1 (555) 234-8901',
      role: 'Student'
    }, null, 2));
  };

  const setCapacityFullTestPayload = () => {
    setPlaygroundBody(JSON.stringify({
      eventId: 'evt_6', // Community Care Day: 50/50 capacity!
      name: 'Taylor Swift',
      email: 'taylor@campus.edu',
      age: 22,
      phone: '+1 (555) 888-9999',
      role: 'Senior Music Major'
    }, null, 2));
  };

  const setValidTestPayload = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setPlaygroundBody(JSON.stringify({
      eventId: 'evt_1',
      name: `Student Tester ${rand}`,
      email: `student.${rand}@campus.edu`,
      age: 20,
      phone: `+1 (555) 444-${rand}`,
      role: 'Computer Science So.'
    }, null, 2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-slate-100 border-t border-slate-700 shadow-2xl flex flex-col h-96 transition-all duration-200">
      
      {/* Console Header Bar */}
      <div className="h-11 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span>LIVE API INSPECTOR & CONSOLE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Traffic Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'playground' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              API Playground & Test Suite
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'logs' && logs.length > 0 && (
            <button
              onClick={() => { setLogs([]); setSelectedLog(null); }}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1 px-2 py-0.5 rounded transition"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Console Body Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {activeTab === 'logs' ? (
          <>
            {/* Logs List Pane (Left) */}
            <div className="w-full md:w-5/12 border-r border-slate-800 overflow-y-auto divide-y divide-slate-800/80 font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const is2xx = log.status >= 200 && log.status < 300;
                  const is409 = log.status === 409;
                  const is403 = log.status === 403;
                  const is4xx = log.status >= 400 && !is409 && !is403;

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-2.5 px-3 cursor-pointer flex items-center justify-between transition ${
                        isSelected ? 'bg-slate-800/90 border-l-2 border-emerald-400' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {/* HTTP Method Badge */}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET' ? 'bg-blue-900/60 text-blue-300' :
                          log.method === 'POST' ? 'bg-emerald-900/60 text-emerald-300' :
                          'bg-purple-900/60 text-purple-300'
                        }`}>
                          {log.method}
                        </span>

                        <span className="text-slate-200 truncate">{log.endpoint}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Status Code Badge */}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          is2xx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          is409 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          is403 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.status}
                        </span>

                        <span className="text-[10px] text-slate-500">
                          {log.durationMs}ms
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No API traffic recorded yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Interact with the website or use the Playground to inspect responses.</p>
                </div>
              )}
            </div>

            {/* Selected Log Inspector Detail Pane (Right) */}
            <div className="w-full md:w-7/12 overflow-y-auto p-4 font-mono text-xs bg-slate-900">
              {selectedLog ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">{selectedLog.method}</span>
                      <span className="text-slate-300 font-bold">{selectedLog.endpoint}</span>
                      <span className="text-slate-500 text-[10px]">({selectedLog.timestamp})</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(selectedLog.responseBody, 'resp')}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-2 py-1 bg-slate-800 rounded"
                    >
                      {copiedId === 'resp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'resp' ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  {/* Headers */}
                  {selectedLog.headers && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Request Headers:</span>
                      <pre className="p-2 rounded bg-slate-950 text-slate-300 text-[11px] overflow-x-auto border border-slate-800">
                        {JSON.stringify(selectedLog.headers, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Request Body if POST */}
                  {selectedLog.requestBody && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Request Payload:</span>
                      <pre className="p-2 rounded bg-slate-950 text-amber-300 text-[11px] overflow-x-auto border border-slate-800">
                        {JSON.stringify(selectedLog.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response Body */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Response ({selectedLog.status} {selectedLog.statusText}):
                    </span>
                    <pre className="p-2.5 rounded bg-slate-950 text-emerald-300 text-[11px] overflow-x-auto border border-slate-800">
                      {JSON.stringify(selectedLog.responseBody, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Select an API request on the left to inspect headers, payload, and response.
                </div>
              )}
            </div>
          </>
        ) : (
          /* API PLAYGROUND TAB */
          <div className="w-full h-full overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Test Triggers */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Execute Required API Endpoints:
              </h4>

              <div className="space-y-2">
                
                {/* 1. GET /api/events */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-300">GET</span>
                      <span className="text-xs font-mono font-bold">/api/events</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Browse all campus events</span>
                  </div>
                  <button
                    onClick={() => handleRunPlayground('get_events')}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                </div>

                {/* 2. GET /api/events/{id} */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-300">GET</span>
                      <span className="text-xs font-mono font-bold">/api/events/{customEventId}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Single event details & capacity</span>
                  </div>
                  <button
                    onClick={() => handleRunPlayground('get_event_detail')}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                </div>

                {/* 3. GET /api/me/registrations */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-300">GET</span>
                      <span className="text-xs font-mono font-bold">/api/me/registrations</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Current user's registrations</span>
                  </div>
                  <button
                    onClick={() => handleRunPlayground('get_my_regs')}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                </div>

                {/* 4. GET /api/events/{id}/registrations (Owning organizer only) */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-900 text-purple-300">GET</span>
                      <span className="text-xs font-mono font-bold">/api/events/{customEventId}/registrations</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Attendee list (Owning organizer only)</span>
                  </div>
                  <button
                    onClick={() => handleRunPlayground('get_event_regs')}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                </div>

              </div>
            </div>

            {/* POST /api/registrations with 201 & 409 Conflict Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  POST /api/registrations (201 / 409 Testing)
                </h4>
                <div className="flex space-x-1 text-[10px]">
                  <button
                    onClick={setValidTestPayload}
                    className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-semibold hover:bg-emerald-900"
                  >
                    Load 201 Payload
                  </button>
                  <button
                    onClick={setDuplicateTestPayload}
                    className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-semibold hover:bg-amber-900"
                  >
                    Load 409 Duplicate
                  </button>
                  <button
                    onClick={setCapacityFullTestPayload}
                    className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded font-semibold hover:bg-rose-900"
                  >
                    Load 409 Full
                  </button>
                </div>
              </div>

              <textarea
                value={playgroundBody}
                onChange={(e) => setPlaygroundBody(e.target.value)}
                rows="6"
                className="w-full p-2.5 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                onClick={() => handleRunPlayground('post_register')}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Play className="w-4 h-4" />
                <span>Submit POST /api/registrations</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
