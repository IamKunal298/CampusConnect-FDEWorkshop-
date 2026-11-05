import {
  apiFetch,
  getCurrentUser,
  initNavbarUserMenu,
  showToast,
  generateQRCodeSVG
} from './api.js';

let allRegistrations = [];
let activeTab = 'upcoming'; // 'upcoming' | 'attended' | 'waitlist'

document.addEventListener('DOMContentLoaded', async () => {
  initNavbarUserMenu();
  setupEventListeners();
  await loadRegistrations();
});

async function loadRegistrations() {
  const container = document.getElementById('passesList');
  container.innerHTML = `
    <div class="py-16 text-center flex flex-col items-center justify-center gap-3">
      <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
      <p class="text-sm font-semibold text-on-surface-variant">Retrieving Digital Passes from Database...</p>
    </div>
  `;

  try {
    const user = getCurrentUser();
    const res = await apiFetch(`/api/me/registrations?email=${encodeURIComponent(user.email)}`);
    allRegistrations = res?.registrations || [];

    updateTabCounts();
    renderPasses();
  } catch (err) {
    console.error('Failed to load registrations:', err);
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-4xl text-rose-600">cloud_off</span>
        <h3 class="text-base font-bold text-rose-900">Unable to Fetch Registered Passes</h3>
        <p class="text-xs text-rose-700">Please make sure the backend server is running on port 5000.</p>
        <button id="retryPassesBtn" class="mt-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold">
          Retry
        </button>
      </div>
    `;
    document.getElementById('retryPassesBtn')?.addEventListener('click', loadRegistrations);
  }
}

function updateTabCounts() {
  const upcoming = allRegistrations.filter((r) => !r.checkedIn).length;
  const attended = allRegistrations.filter((r) => r.checkedIn).length;

  document.getElementById('countUpcoming').textContent = upcoming;
  document.getElementById('countAttended').textContent = attended;
}

function renderPasses() {
  const container = document.getElementById('passesList');
  const user = getCurrentUser();

  const filtered = allRegistrations.filter((r) => {
    if (activeTab === 'upcoming') return !r.checkedIn;
    if (activeTab === 'attended') return r.checkedIn;
    if (activeTab === 'waitlist') return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
        <div class="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-3xl">confirmation_number</span>
        </div>
        <h3 class="text-lg font-bold text-on-surface">No ${activeTab} passes found</h3>
        <p class="text-xs text-on-surface-variant max-w-sm">
          ${
            activeTab === 'upcoming'
              ? 'You have no active event reservations yet. Explore campus sessions and reserve your spot in one click!'
              : 'You have not checked in to any campus events yet.'
          }
        </p>
        <a href="index.html" class="mt-3 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-colors inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">explore</span>
          <span>Browse Campus Events</span>
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((reg) => {
      const event = reg.event || {};
      const ticketCode = reg.ticketCode || `CC-PASS-${reg.id.substring(0, 4).toUpperCase()}`;
      const isCheckedIn = Boolean(reg.checkedIn);
      const eventId = reg.eventId || event.id;

      const qrPayload = `CAMPUS-PASS:${reg.id}:${user.email}:${eventId}`;
      const qrSvg = generateQRCodeSVG(qrPayload, 130);

      return `
      <div class="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden border border-outline-variant/30 group">
        <div class="absolute -top-16 -right-16 w-52 h-52 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header Ribbon -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
              isCheckedIn
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-secondary-fixed text-on-secondary-fixed'
            } text-xs font-bold">
              <span class="w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-600' : 'bg-secondary-container animate-pulse'}"></span>
              ${isCheckedIn ? 'Checked In' : 'Confirmed'} • Ticket #${ticketCode}
            </span>
            <span class="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              ${event.category || 'WORKSHOP'} • ${event.badge || 'CC'}
            </span>
          </div>

          <button class="show-fullscreen-pass-btn inline-flex items-center gap-1.5 text-primary hover:text-primary-container text-xs font-bold transition-colors" data-reg-id="${reg.id}">
            <span class="material-symbols-outlined text-[18px]">qr_code_2</span>
            <span>Show Fullscreen Pass</span>
          </button>
        </div>

        <!-- Ticket Card Grid -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <!-- Event Info -->
          <div class="md:col-span-8 flex flex-col justify-between gap-4">
            <div class="space-y-1">
              <a href="event-details.html?id=${eventId}" class="text-xl font-bold text-on-surface hover:text-primary transition-colors leading-snug block">
                ${event.title || 'Campus Event'}
              </a>
              <div class="flex items-center gap-1 text-on-surface-variant text-xs">
                <span class="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>${event.host || event.organizer || 'Hosted by Campus Community'}</span>
              </div>
            </div>

            <!-- Schedule & Venue Strip -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
              <div class="flex items-start gap-2.5">
                <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">event</span>
                <div>
                  <span class="text-[10px] font-bold text-outline uppercase block">Date &amp; Schedule</span>
                  <span class="text-xs font-bold text-on-surface">${event.date || 'TBD'} • ${event.time || 'TBD'}</span>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="material-symbols-outlined text-secondary text-[20px] mt-0.5">pin_drop</span>
                <div>
                  <span class="text-[10px] font-bold text-outline uppercase block">Location</span>
                  <span class="text-xs font-bold text-on-surface">${event.location || 'Campus Hub'}</span>
                </div>
              </div>
            </div>

            <!-- Action Strip -->
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button class="wallet-export-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-colors" data-ticket="${ticketCode}" data-title="${event.title || 'Event'}">
                <span class="material-symbols-outlined text-[16px]">wallet</span>
                <span>Export Pass</span>
              </button>
              
              <button class="cal-sync-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-colors" data-title="${event.title || 'Event'}" data-loc="${event.location || 'Campus Hub'}">
                <span class="material-symbols-outlined text-[16px]">calendar_add_on</span>
                <span>Add to Calendar</span>
              </button>

              <button class="cancel-rsvp-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors ml-auto" data-reg-id="${reg.id}" data-title="${event.title || 'Event'}">
                <span class="material-symbols-outlined text-[16px]">cancel</span>
                <span>Cancel RSVP</span>
              </button>
            </div>
          </div>

          <!-- Dynamic QR Code Container -->
          <div class="md:col-span-4 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-center gap-2">
            <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
              ${qrSvg}
            </div>
            <span class="text-[10px] font-mono font-bold text-outline uppercase tracking-wider">Fast-Scan Entry Badge</span>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  // Attach event handlers
  container.querySelectorAll('.show-fullscreen-pass-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const regId = btn.getAttribute('data-reg-id');
      const reg = allRegistrations.find((x) => x.id === regId);
      if (reg) openPassModal(reg);
    });
  });

  container.querySelectorAll('.cancel-rsvp-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const regId = btn.getAttribute('data-reg-id');
      const title = btn.getAttribute('data-title');
      if (confirm(`Are you sure you want to cancel your registration for "${title}"? This will release your reserved seat to other students.`)) {
        await cancelRegistration(regId);
      }
    });
  });

  container.querySelectorAll('.wallet-export-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ticket = btn.getAttribute('data-ticket');
      const title = btn.getAttribute('data-title');
      downloadWalletFile(ticket, title);
    });
  });

  container.querySelectorAll('.cal-sync-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const loc = btn.getAttribute('data-loc');
      window.open(
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&location=${encodeURIComponent(loc)}`,
        '_blank'
      );
    });
  });
}

function openPassModal(reg) {
  const modal = document.getElementById('passModal');
  const user = getCurrentUser();
  const event = reg.event || {};
  const ticketCode = reg.ticketCode || `CC-PASS-${reg.id.substring(0, 4).toUpperCase()}`;

  document.getElementById('modalEventTitle').textContent = event.title || 'Campus Event';
  document.getElementById('modalTicketCode').textContent = ticketCode;
  document.getElementById('modalStudentName').textContent = user.name;
  document.getElementById('modalStudentEmail').textContent = user.email;
  document.getElementById('modalEventDate').textContent = `${event.date || 'TBD'} • ${event.time || 'TBD'}`;
  document.getElementById('modalEventVenue').textContent = event.location || 'Campus Hub';

  const qrPayload = `CAMPUS-PASS:${reg.id}:${user.email}:${reg.eventId || event.id}`;
  document.getElementById('modalQrCodeContainer').innerHTML = generateQRCodeSVG(qrPayload, 180);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePassModal() {
  const modal = document.getElementById('passModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function cancelRegistration(registrationId) {
  const user = getCurrentUser();
  try {
    await apiFetch(`/api/registrations/${registrationId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Email': user.email
      }
    });

    showToast('RSVP cancelled successfully. Spot released.', 'info');
    await loadRegistrations();
  } catch (err) {
    showToast(err.message || 'Failed to cancel registration.', 'error');
  }
}

function downloadWalletFile(ticketCode, eventTitle) {
  const ticketData = {
    passType: 'university.campus.pulse.ticket',
    ticketNumber: ticketCode,
    eventTitle,
    student: getCurrentUser().name,
    email: getCurrentUser().email,
    issuedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${ticketCode}_Pass.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast(`Digital Pass ${ticketCode} downloaded!`, 'success');
}

function setupEventListeners() {
  // Tab switcher
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
        b.classList.add('text-on-surface-variant', 'font-semibold');
      });
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
      btn.classList.remove('text-on-surface-variant', 'font-semibold');
      activeTab = btn.getAttribute('data-tab');
      renderPasses();
    });
  });

  // Modal close buttons
  document.getElementById('closePassModalBtn')?.addEventListener('click', closePassModal);
  document.getElementById('modalDoneBtn')?.addEventListener('click', closePassModal);
  document.getElementById('modalPrintPassBtn')?.addEventListener('click', () => {
    window.print();
  });
}
