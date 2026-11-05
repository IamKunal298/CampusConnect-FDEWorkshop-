import {
  apiFetch,
  getCurrentUser,
  initNavbarUserMenu,
  showToast,
  getEventImage
} from './api.js';

let currentEvent = null;
let isAlreadyRegistered = false;

document.addEventListener('DOMContentLoaded', async () => {
  initNavbarUserMenu();
  populateFormUser();
  setupEventListeners();
  await loadEvent();
});

function populateFormUser() {
  const user = getCurrentUser();
  const avatar = document.getElementById('formUserAvatar');
  const name = document.getElementById('formUserName');
  const email = document.getElementById('formUserEmail');

  if (avatar) avatar.src = user.avatar;
  if (name) name.textContent = user.name;
  if (email) email.textContent = user.email;
}

async function loadEvent() {
  const params = new URLSearchParams(window.location.search);
  let eventId = params.get('id');

  try {
    // If no ID provided in URL, grab the first available event from database
    if (!eventId) {
      const allRes = await apiFetch('/api/events');
      if (allRes?.events?.length > 0) {
        eventId = allRes.events[0].id;
        window.history.replaceState({}, '', `event-details.html?id=${eventId}`);
      }
    }

    if (!eventId) throw new Error('No event found in system.');

    // Fetch Event Details
    const event = await apiFetch(`/api/events/${eventId}`);
    currentEvent = event;

    // Check user registration status for this event
    const user = getCurrentUser();
    try {
      const meRes = await apiFetch(`/api/me/registrations?email=${encodeURIComponent(user.email)}`);
      const userRegs = meRes?.registrations || [];
      isAlreadyRegistered = userRegs.some((r) => r.eventId === event.id || r.event?.id === event.id);
    } catch (e) {
      isAlreadyRegistered = false;
    }

    renderEventDetails(event);
  } catch (err) {
    console.error('Failed to load event:', err);
    document.getElementById('eventDetailsTitle').textContent = 'Event Not Found';
    document.getElementById('eventFullDescription').textContent =
      'The requested event could not be retrieved from the database. Please return to Explore Events.';
    showToast('Failed to load event details.', 'error');
  }
}

function renderEventDetails(event) {
  document.title = `${event.title} | Campus Pulse`;
  document.getElementById('eventBreadcrumbId').textContent = `EVENT ID #${event.id.substring(0, 8)}...`;
  document.getElementById('eventDetailsTitle').textContent = event.title;
  document.getElementById('eventFullDescription').textContent =
    event.description || 'Join students and faculty across campus for this curated session.';

  // Images
  const imgUrl = getEventImage(event.category, event.title);
  document.getElementById('eventHeroBanner').src = imgUrl;

  // Badges
  document.getElementById('eventCategoryBadge').textContent = `${event.category || 'WORKSHOP'} • ${event.badge || 'CC'}`;

  const isSoldOut = event.isSoldOut || event.seatsLeft === 0;
  const urgencyBadge = document.getElementById('eventUrgencyBadge');
  const urgencyText = document.getElementById('eventUrgencyText');

  if (isSoldOut) {
    urgencyBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm';
    urgencyText.textContent = 'SOLD OUT • WAITLIST ONLY';
  } else if (event.seatsLeft <= 5) {
    urgencyBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm';
    urgencyText.textContent = `URGENT • ONLY ${event.seatsLeft} SPOTS LEFT`;
  } else {
    urgencyText.textContent = `${event.seatsLeft} SPOTS AVAILABLE`;
  }

  // Host Info
  document.getElementById('eventHostName').textContent = event.organizerName || event.organizer || 'Campus Organizer';
  document.getElementById('eventHostEmail').textContent = event.organizerEmail || 'organizer@campus.edu';

  // Schedule & Venue
  document.getElementById('eventDetailsDate').textContent = `${event.date} • ${event.time}`;
  document.getElementById('eventDetailsVenue').textContent = event.location || 'Campus Hub';

  // Capacity Progress
  const registeredCount = event.capacity - event.seatsLeft;
  document.getElementById('eventDetailsSeatsRatio').textContent = `${registeredCount} / ${event.capacity} Registered`;
  document.getElementById('eventDetailsPercentText').textContent = `${event.percentFilled || 0}% full • ${event.seatsLeft} seats left`;
  document.getElementById('eventDetailsProgressBar').style.width = `${event.percentFilled || 0}%`;

  // Submit Button & Feedback state
  const submitBtn = document.getElementById('submitRegBtn');
  const alertBox = document.getElementById('feedbackAlert');

  if (isAlreadyRegistered) {
    submitBtn.disabled = true;
    submitBtn.className = 'w-full py-3.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm flex items-center justify-center gap-2 cursor-default';
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">task_alt</span><span>Already Registered (RSVP Active)</span>';

    alertBox.className = 'p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-3';
    alertBox.innerHTML = `
      <span class="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
      <div class="flex-1">
        <strong class="font-bold block text-sm">Pass Active &amp; Confirmed</strong>
        <p class="mt-0.5 text-emerald-800">Your spot is secured! View or download your digital QR ticket pass in your student wallet.</p>
        <a href="my-registrations.html" class="inline-block mt-2 font-bold text-primary hover:underline">Go to My Passes &rarr;</a>
      </div>
    `;
    alertBox.classList.remove('hidden');
  } else if (isSoldOut) {
    submitBtn.disabled = true;
    submitBtn.className = 'w-full py-3.5 px-4 rounded-xl bg-surface-container text-outline font-bold text-sm cursor-not-allowed';
    submitBtn.innerHTML = 'Event Capacity Reached (Sold Out)';

    alertBox.className = 'p-4 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs flex items-start gap-3';
    alertBox.innerHTML = `
      <span class="material-symbols-outlined text-rose-600 text-[20px]">error</span>
      <div>
        <strong class="font-bold block">Capacity Full (400)</strong>
        <span>All ${event.capacity} seats have been reserved. Check back later in case seats open up.</span>
      </div>
    `;
    alertBox.classList.remove('hidden');
  }
}

async function handleRegistrationSubmit(e) {
  e.preventDefault();
  if (!currentEvent) return;

  const user = getCurrentUser();
  const track = document.getElementById('trackSelect').value;
  const submitBtn = document.getElementById('submitRegBtn');
  const alertBox = document.getElementById('feedbackAlert');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Posting to /api/registrations...</span>';

  try {
    const res = await apiFetch('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: currentEvent.id,
        name: user.name,
        email: user.email,
        role: `${user.department || 'Student'} (${track})`
      })
    });

    isAlreadyRegistered = true;
    const ticketCode = res.registration?.ticketCode || 'CC-PASS-CONFIRMED';

    alertBox.className = 'p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-3';
    alertBox.innerHTML = `
      <span class="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <strong class="text-sm font-bold">Registration Confirmed! (201 Created)</strong>
          <span class="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">${ticketCode}</span>
        </div>
        <p class="mt-1 text-emerald-800">
          Spot secured for <strong>${user.name}</strong>. A digital pass with QR check-in credentials has been generated in your wallet.
        </p>
        <div class="mt-2.5 flex items-center gap-3">
          <a href="my-registrations.html" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors">
            View Digital Pass &rarr;
          </a>
        </div>
      </div>
    `;
    alertBox.classList.remove('hidden');

    submitBtn.className = 'w-full py-3.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm flex items-center justify-center gap-2 cursor-default';
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">task_alt</span><span>Already Registered (RSVP Active)</span>';

    showToast(`Pass ${ticketCode} created successfully!`, 'success');

    // Refresh event capacity
    const updated = await apiFetch(`/api/events/${currentEvent.id}`).catch(() => null);
    if (updated) renderEventDetails(updated);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">how_to_reg</span><span>Register with Student ID (One-Click RSVP)</span>';

    if (err.status === 409) {
      alertBox.className = 'p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-start gap-3';
      alertBox.innerHTML = `
        <span class="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
        <div class="flex-1">
          <strong class="font-bold text-sm block">Status 409 Conflict</strong>
          <p class="mt-0.5 text-amber-800">
            Student <strong>${user.email}</strong> is already registered for this event. Duplicate enrollments are rejected by API policy.
          </p>
          <a href="my-registrations.html" class="inline-block mt-2 font-bold text-primary hover:underline">
            Visit 'My Registrations' to view your ticket &rarr;
          </a>
        </div>
      `;
      alertBox.classList.remove('hidden');
      showToast('Registration Conflict (409): Already enrolled.', 'warning');
    } else {
      alertBox.className = 'p-4 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs flex items-start gap-3';
      alertBox.innerHTML = `
        <span class="material-symbols-outlined text-rose-600 text-[20px]">error</span>
        <div>
          <strong class="font-bold text-sm block">Registration Failed (${err.status || 400})</strong>
          <span class="mt-0.5 block text-rose-800">${err.message || 'Unable to complete RSVP.'}</span>
        </div>
      `;
      alertBox.classList.remove('hidden');
      showToast(err.message || 'Registration failed.', 'error');
    }
  }
}

function handleDownloadIcal() {
  if (!currentEvent) return;

  const startIso = currentEvent.isoDate ? new Date(currentEvent.isoDate).toISOString().replace(/-|:|\.\d+/g, '') : '20261112T130000Z';
  const endIso = '20261112T160000Z';

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campus Pulse//Campus Event Manager//EN
BEGIN:VEVENT
UID:${currentEvent.id}@campus.edu
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}
DTSTART:${startIso}
DTEND:${endIso}
SUMMARY:${currentEvent.title}
DESCRIPTION:${currentEvent.description || 'Campus Event'}
LOCATION:${currentEvent.location || 'Campus Hub'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${currentEvent.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('Calendar .ics file downloaded!', 'success');
}

function setupEventListeners() {
  document.getElementById('registrationForm')?.addEventListener('submit', handleRegistrationSubmit);
  document.getElementById('downloadIcalBtn')?.addEventListener('click', handleDownloadIcal);

  // Contact Modal
  const modal = document.getElementById('contactModal');
  const openBtn = document.getElementById('openContactModalBtn');
  const closeBtn = document.getElementById('closeContactModalBtn');
  const cancelBtn = document.getElementById('cancelContactBtn');
  const sendBtn = document.getElementById('sendContactBtn');

  openBtn?.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  sendBtn?.addEventListener('click', () => {
    const subject = document.getElementById('contactSubjectInput')?.value;
    closeModal();
    showToast(`Inquiry sent to organizer desk: "${subject}"`, 'success');
  });
}
