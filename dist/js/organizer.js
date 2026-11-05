import {
  apiFetch,
  getCurrentUser,
  setCurrentUser,
  DEMO_USERS,
  initNavbarUserMenu,
  showToast
} from './api.js';

let allEvents = [];
let currentEvent = null;
let currentAttendees = [];
let activeStatusFilter = 'all'; // 'all' | 'checkedin' | 'pending'
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  initNavbarUserMenu();
  setupEventListeners();
  await initializeOrganizerView();
});

async function initializeOrganizerView() {
  const user = getCurrentUser();
  const sidebarOrgName = document.getElementById('sidebarOrgName');
  if (sidebarOrgName) sidebarOrgName.textContent = `${user.name} (${user.label})`;

  // If user is currently a student, show helpful notice
  const isOrganizer = user.role === 'organiser' || user.role === 'organizer';
  const authText = document.getElementById('authContextText');
  if (authText) {
    authText.textContent = isOrganizer
      ? `Viewing as Owning Organizer (${user.name})`
      : `Preview Mode: Signed in as ${user.name} (Student)`;
  }

  try {
    // 1. Fetch all events
    const eventsRes = await apiFetch('/api/events');
    allEvents = eventsRes?.events || [];

    const select = document.getElementById('eventSwitcherSelect');
    if (allEvents.length === 0) {
      select.innerHTML = '<option value="">No events available</option>';
      return;
    }

    // Populate dropdown
    select.innerHTML = allEvents
      .map(
        (e) => `
        <option value="${e.id}">
          ${e.title} (${e.capacity - e.seatsLeft}/${e.capacity} Registered • ${e.date})
        </option>
      `
      )
      .join('');

    // If active user is an organizer, pick an event they own if possible
    let preferredEvent = allEvents.find(
      (e) => e.organizerId === user.id || e.organiser_id === user.id
    ) || allEvents[0];

    select.value = preferredEvent.id;
    await loadEventRoster(preferredEvent.id);
  } catch (err) {
    console.error('Failed to initialize organizer hub:', err);
    showToast('Failed to load events for organizer hub.', 'error');
  }
}

async function loadEventRoster(eventId) {
  const tableBody = document.getElementById('rosterTableBody');
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="py-12 text-center text-on-surface-variant">
        <div class="flex flex-col items-center justify-center gap-2">
          <span class="material-symbols-outlined text-3xl text-primary animate-spin">sync</span>
          <span class="text-xs font-semibold">Loading attendee roster for event...</span>
        </div>
      </td>
    </tr>
  `;

  currentEvent = allEvents.find((e) => e.id === eventId);
  const user = getCurrentUser();

  try {
    const res = await apiFetch(`/api/events/${eventId}/registrations`, {
      headers: {
        'X-User-Role': user.role,
        'X-User-Id': user.id,
        'X-Organizer-Id': user.id
      }
    });

    currentAttendees = res?.attendees || [];
    updateCapacityGauge(res?.event || currentEvent, currentAttendees);
    updateRosterCounts();
    renderAttendeeTable();
  } catch (err) {
    console.warn('Organizer roster access:', err);
    if (err.status === 403) {
      const owningOrgId = err.data?.owningOrganizer?.id;
      const matchingUser = DEMO_USERS.find((u) => u.id === owningOrgId);
      const orgName = matchingUser ? matchingUser.name : 'Owning Organizer';

      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center px-4">
            <div class="max-w-md mx-auto p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col items-center gap-3">
              <span class="material-symbols-outlined text-3xl text-amber-600">lock</span>
              <h4 class="text-sm font-bold">Attendee Roster Restricted (403 Forbidden)</h4>
              <p class="text-xs text-amber-800 leading-relaxed">
                By API security policy, only the owning organizer (<strong>${orgName}</strong>) can view and check in attendees for this specific event.
              </p>
              ${
                matchingUser
                  ? `<button id="switchOwnerBtn" class="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">switch_account</span>
                      <span>Switch to ${matchingUser.name} (${matchingUser.label})</span>
                     </button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `;

      document.getElementById('switchOwnerBtn')?.addEventListener('click', () => {
        if (matchingUser) {
          setCurrentUser(matchingUser);
          showToast(`Switched to ${matchingUser.name}!`, 'success');
          setTimeout(() => window.location.reload(), 400);
        }
      });
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-10 text-center text-rose-600 text-xs font-semibold">
            Failed to load attendee roster: ${err.message}
          </td>
        </tr>
      `;
    }
  }
}

function updateCapacityGauge(event, attendees) {
  if (!event) return;
  const capacity = event.capacity || 50;
  const registered = attendees.length;
  const percent = Math.min(100, Math.round((registered / capacity) * 100));
  const remaining = Math.max(0, capacity - registered);

  document.getElementById('gaugePercentText').textContent = `${percent}%`;
  document.getElementById('gaugeRegisteredCount').textContent = registered;
  document.getElementById('gaugeCapacityCount').textContent = `/ ${capacity} Capacity`;
  document.getElementById('gaugeSpotsRemaining').textContent = `${remaining} spots remaining`;

  // SVG ring stroke-dashoffset (113.09 circumference)
  const offset = 113.09 - (113.09 * percent) / 100;
  document.getElementById('gaugeProgressCircle').style.strokeDashoffset = offset;
  document.getElementById('gaugeBar').style.width = `${percent}%`;
}

function updateRosterCounts() {
  const total = currentAttendees.length;
  const checkedIn = currentAttendees.filter((a) => a.checkedIn).length;
  const pending = total - checkedIn;

  document.getElementById('countAllAttendees').textContent = total;
  document.getElementById('countCheckedIn').textContent = checkedIn;
  document.getElementById('countPending').textContent = pending;
}

function renderAttendeeTable() {
  const tableBody = document.getElementById('rosterTableBody');

  const filtered = currentAttendees.filter((a) => {
    if (activeStatusFilter === 'checkedin' && !a.checkedIn) return false;
    if (activeStatusFilter === 'pending' && a.checkedIn) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (a.name || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      const ticket = (a.ticketCode || a.id || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !ticket.includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-on-surface-variant text-xs">
          No attendees match the filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered
    .map((att) => {
      const isCheckedIn = Boolean(att.checkedIn);
      const initials = (att.name || att.email || 'ST')
        .split(/[ ._@]/)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase() || '')
        .join('');

      return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <!-- Student Name & Avatar -->
        <td class="py-3.5 px-4 pl-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-container text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
              ${initials}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-on-surface truncate">${att.name || 'Student Attendee'}</span>
              <span class="text-[10px] text-on-surface-variant flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px] text-primary">school</span>
                ${att.department || 'Campus Community'}
              </span>
            </div>
          </div>
        </td>

        <!-- Email -->
        <td class="py-3.5 px-4 font-mono text-on-surface-variant text-[11px]">
          ${att.email || 'N/A'}
        </td>

        <!-- Ticket Code -->
        <td class="py-3.5 px-4 font-mono font-bold text-primary text-[11px]">
          #${att.ticketCode || att.id.substring(0, 8)}
        </td>

        <!-- Role / Dept -->
        <td class="py-3.5 px-4 text-on-surface font-medium">
          ${att.role || 'Student'}
        </td>

        <!-- Status Badge -->
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
            isCheckedIn
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          } font-bold text-[10px] uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-emerald-600' : 'bg-amber-600'}"></span>
            ${isCheckedIn ? 'Checked In' : 'Pending'}
          </span>
        </td>

        <!-- Check-in Action Toggle Button -->
        <td class="py-3.5 px-4 pr-6 text-right">
          <button class="toggle-checkin-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
            isCheckedIn
              ? 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
          }" data-reg-id="${att.id}" data-name="${att.name || 'Student'}">
            <span class="material-symbols-outlined text-[16px]">${isCheckedIn ? 'undo' : 'how_to_reg'}</span>
            <span>${isCheckedIn ? 'Undo' : 'Check In'}</span>
          </button>
        </td>
      </tr>
    `;
    })
    .join('');

  // Attach checkin toggle handlers
  tableBody.querySelectorAll('.toggle-checkin-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const regId = btn.getAttribute('data-reg-id');
      const studentName = btn.getAttribute('data-name');
      await toggleAttendeeCheckin(regId, studentName);
    });
  });
}

async function toggleAttendeeCheckin(registrationId, studentName) {
  if (!currentEvent) return;
  const user = getCurrentUser();

  try {
    const res = await apiFetch(`/api/events/${currentEvent.id}/registrations/${registrationId}/checkin`, {
      method: 'PATCH',
      headers: {
        'X-User-Role': user.role,
        'X-User-Id': user.id,
        'X-Organizer-Id': user.id
      }
    });

    const isNowCheckedIn = res.checkedIn;
    showToast(
      isNowCheckedIn
        ? `✓ ${studentName} is now Checked In!`
        : `Check-in reverted for ${studentName}.`,
      isNowCheckedIn ? 'success' : 'info'
    );

    // Update local state
    const attendee = currentAttendees.find((a) => a.id === registrationId);
    if (attendee) attendee.checkedIn = isNowCheckedIn;

    updateRosterCounts();
    renderAttendeeTable();
  } catch (err) {
    showToast(err.message || 'Check-in failed.', 'error');
  }
}

function handleExportCsv() {
  if (!currentEvent || currentAttendees.length === 0) {
    showToast('No attendees to export for this event.', 'warning');
    return;
  }

  const headers = ['Student Name', 'Email', 'Ticket Code', 'Role', 'Status', 'Registered Date'];
  const rows = currentAttendees.map((a) => [
    `"${a.name || ''}"`,
    `"${a.email || ''}"`,
    `"${a.ticketCode || a.id}"`,
    `"${a.role || 'Student'}"`,
    `"${a.checkedIn ? 'Checked In' : 'Pending'}"`,
    `"${a.registeredAt || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${currentEvent.title.replace(/\s+/g, '_')}_Attendees.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast(`Exported ${currentAttendees.length} attendees to CSV!`, 'success');
}

function setupEventListeners() {
  // Event switcher
  document.getElementById('eventSwitcherSelect')?.addEventListener('change', async (e) => {
    if (e.target.value) {
      await loadEventRoster(e.target.value);
    }
  });

  // Export CSV
  document.getElementById('exportCsvBtn')?.addEventListener('click', handleExportCsv);

  // Status Filter tabs
  document.querySelectorAll('.roster-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.roster-filter-btn').forEach((b) => {
        b.classList.remove('bg-white', 'text-primary', 'font-bold', 'shadow-sm');
        b.classList.add('text-on-surface-variant', 'font-semibold');
      });
      btn.classList.add('bg-white', 'text-primary', 'font-bold', 'shadow-sm');
      btn.classList.remove('text-on-surface-variant', 'font-semibold');
      activeStatusFilter = btn.getAttribute('data-status');
      renderAttendeeTable();
    });
  });

  // Search input
  document.getElementById('rosterSearchInput')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderAttendeeTable();
  });

  // Modals
  const scannerModal = document.getElementById('scannerModal');
  const openScannerBtn = document.getElementById('openScannerModalBtn');
  const sidebarScannerBtn = document.getElementById('sidebarScannerBtn');
  const closeScannerBtn = document.getElementById('closeScannerModalBtn');

  const openScanner = () => {
    scannerModal.classList.remove('hidden');
    scannerModal.classList.add('flex');
    document.getElementById('manualTicketInput')?.focus();
  };

  const closeScanner = () => {
    scannerModal.classList.add('hidden');
    scannerModal.classList.remove('flex');
    document.getElementById('scannerResultBox')?.classList.add('hidden');
  };

  openScannerBtn?.addEventListener('click', openScanner);
  sidebarScannerBtn?.addEventListener('click', openScanner);
  closeScannerBtn?.addEventListener('click', closeScanner);

  // Manual Scanner Verify
  document.getElementById('manualVerifyBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('manualTicketInput')?.value.trim();
    if (!input) return;

    const match = currentAttendees.find(
      (a) =>
        (a.ticketCode && a.ticketCode.toLowerCase().includes(input.toLowerCase())) ||
        (a.id && a.id.toLowerCase().includes(input.toLowerCase())) ||
        (a.email && a.email.toLowerCase().includes(input.toLowerCase()))
    );

    const resultBox = document.getElementById('scannerResultBox');
    const resultText = document.getElementById('scannerResultText');

    if (match) {
      await toggleAttendeeCheckin(match.id, match.name);
      resultText.textContent = `Scanned & Verified: ${match.name} (${match.ticketCode || match.id})`;
      resultBox.className = 'w-full p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200';
      resultBox.classList.remove('hidden');
      document.getElementById('manualTicketInput').value = '';
    } else {
      resultText.textContent = `No attendee found matching "${input}" for this event.`;
      resultBox.className = 'w-full p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2 border border-rose-200';
      resultBox.classList.remove('hidden');
    }
  });

  // Broadcast Modal
  const broadcastModal = document.getElementById('broadcastModal');
  const openBroadcastBtn = document.getElementById('openBroadcastModalBtn');
  const sidebarBroadcastBtn = document.getElementById('sidebarBroadcastBtn');
  const closeBroadcastBtn = document.getElementById('closeBroadcastModalBtn');
  const cancelBroadcastBtn = document.getElementById('cancelBroadcastBtn');

  const openBroadcast = () => {
    broadcastModal.classList.remove('hidden');
    broadcastModal.classList.add('flex');
  };

  const closeBroadcast = () => {
    broadcastModal.classList.add('hidden');
    broadcastModal.classList.remove('flex');
  };

  openBroadcastBtn?.addEventListener('click', openBroadcast);
  sidebarBroadcastBtn?.addEventListener('click', openBroadcast);
  closeBroadcastBtn?.addEventListener('click', closeBroadcast);
  cancelBroadcastBtn?.addEventListener('click', closeBroadcast);

  document.getElementById('broadcastForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentEvent) return;

    const subject = document.getElementById('broadcastSubject').value;
    const message = document.getElementById('broadcastMessage').value;
    const audience = document.getElementById('broadcastAudience').value;
    const highPriority = document.getElementById('broadcastHighPriority').checked;

    try {
      await apiFetch('/api/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          eventId: currentEvent.id,
          subject,
          message,
          audience,
          highPriority
        })
      });

      closeBroadcast();
      showToast(`Broadcast "${subject}" dispatched to ${currentAttendees.length} attendees!`, 'success');
      document.getElementById('broadcastSubject').value = '';
      document.getElementById('broadcastMessage').value = '';
    } catch (err) {
      showToast('Failed to dispatch broadcast.', 'error');
    }
  });
}
