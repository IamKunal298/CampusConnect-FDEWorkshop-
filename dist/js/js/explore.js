import {
  apiFetch,
  getCurrentUser,
  initNavbarUserMenu,
  showToast,
  getEventImage
} from './api.js';

let allEvents = [];
let userRegistrations = [];
let activeDrawerEvent = null;

let currentCategory = 'All';
let currentLocation = 'all';
let currentDate = 'all';
let availableOnly = false;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  initNavbarUserMenu();
  setupEventListeners();
  updateUserWelcome();
  await loadData();
});

function updateUserWelcome() {
  const user = getCurrentUser();
  const heading = document.getElementById('welcomeHeroHeading');
  if (heading) {
    const firstName = user.name ? user.name.split(' ')[0] : 'Student';
    heading.textContent = `Hey ${firstName}! What are you getting into this week?`;
  }
}

async function loadData() {
  const grid = document.getElementById('eventsGrid');
  grid.innerHTML = `
    <div class="col-span-full py-16 flex flex-col items-center justify-center text-center gap-3">
      <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
      <p class="text-sm font-semibold text-on-surface-variant">Connecting to Supabase & Fetching Campus Events...</p>
    </div>
  `;

  try {
    const user = getCurrentUser();
    const [eventsRes, regsRes] = await Promise.all([
      apiFetch('/api/events'),
      apiFetch(`/api/me/registrations?email=${encodeURIComponent(user.email)}`).catch(() => ({ registrations: [] }))
    ]);

    allEvents = eventsRes?.events || [];
    userRegistrations = regsRes?.registrations || [];

    updateMetrics();
    populateVenuesDropdown();
    renderEvents();
  } catch (err) {
    console.error('Failed to load events:', err);
    grid.innerHTML = `
      <div class="col-span-full py-12 px-6 rounded-2xl bg-rose-50 border border-rose-200 text-center flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-4xl text-rose-600">cloud_off</span>
        <h3 class="text-lg font-bold text-rose-900">Unable to Connect to Campus API Server</h3>
        <p class="text-sm text-rose-700 max-w-md">
          Please verify that the backend is running on <code>http://localhost:5000</code>.
        </p>
        <button id="retryLoadBtn" class="mt-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700">
          Retry Connection
        </button>
      </div>
    `;
    document.getElementById('retryLoadBtn')?.addEventListener('click', loadData);
  }
}

function updateMetrics() {
  const eventsCount = allEvents.length;
  const seatsAvailable = allEvents.reduce((acc, e) => acc + (e.seatsLeft || 0), 0);
  const myPassesCount = userRegistrations.length;

  document.getElementById('metricEventsCount').textContent = eventsCount;
  document.getElementById('metricSeatsAvailable').textContent = seatsAvailable;
  document.getElementById('metricUserPasses').textContent = myPassesCount;
}

function populateVenuesDropdown() {
  const select = document.getElementById('locationSelect');
  if (!select) return;

  const venues = Array.from(new Set(allEvents.map((e) => e.location || 'Campus Hub'))).filter(Boolean);
  select.innerHTML = '<option value="all">📍 All Campus Venues</option>';
  venues.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  const userRegEventIds = new Set(userRegistrations.map((r) => r.eventId || r.event?.id));

  // Filter events
  const filtered = allEvents.filter((e) => {
    // Category filter
    if (currentCategory !== 'All') {
      const cat = (e.category || '').toLowerCase();
      const matchCat = currentCategory.toLowerCase();
      if (!cat.includes(matchCat) && !(matchCat === 'tech' && cat.includes('career'))) {
        return false;
      }
    }

    // Location filter
    if (currentLocation !== 'all' && e.location !== currentLocation) {
      return false;
    }

    // Available only
    if (availableOnly && e.isSoldOut) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = (e.title || '').toLowerCase();
      const desc = (e.description || '').toLowerCase();
      const loc = (e.location || '').toLowerCase();
      const org = (e.organizer || e.organizerName || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !loc.includes(q) && !org.includes(q)) {
        return false;
      }
    }

    // Date filter
    if (currentDate !== 'all' && e.date) {
      const d = e.date.toLowerCase();
      if (currentDate === 'today' && !d.includes('nov 05')) return false;
      if (currentDate === 'weekend' && !d.includes('nov 07') && !d.includes('nov 08')) return false;
    }

    return true;
  });

  document.getElementById('feedMatchesCount').textContent = `${filtered.length} MATCHES`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center flex flex-col items-center justify-center gap-3">
        <span class="material-symbols-outlined text-4xl text-outline">search_off</span>
        <h3 class="text-base font-bold text-on-surface">No campus events match your filters</h3>
        <p class="text-xs text-on-surface-variant max-w-sm">Try resetting search keywords or choosing "All Events" to view upcoming gatherings.</p>
        <button id="resetFiltersBtn" class="mt-2 px-4 py-2 rounded-lg bg-surface-container text-primary font-semibold text-xs hover:bg-surface-container-high transition-colors">
          Reset All Filters
        </button>
      </div>
    `;
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
    return;
  }

  grid.innerHTML = filtered
    .map((evt) => {
      const isRegistered = userRegEventIds.has(evt.id);
      const isSoldOut = evt.isSoldOut || evt.seatsLeft === 0;
      const imageUrl = getEventImage(evt.category, evt.title);
      const percentFilled = evt.percentFilled || Math.round(((evt.capacity - evt.seatsLeft) / evt.capacity) * 100);

      const [month = 'NOV', day = '15'] = (evt.date || 'NOV 15').split(' ');

      return `
      <article class="event-card group bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-outline-variant/30">
        <!-- Event Card Image Header -->
        <div class="relative h-48 w-full overflow-hidden bg-surface-container">
          <img src="${imageUrl}" alt="${evt.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>
          
          <!-- Date Badge -->
          <div class="absolute top-3 left-3 bg-surface/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-center border border-outline-variant/20">
            <span class="block text-[10px] text-secondary font-extrabold uppercase leading-tight">${month}</span>
            <span class="block text-xl font-extrabold text-on-surface leading-none">${day}</span>
          </div>

          <!-- Perk Badges -->
          <div class="absolute top-3 right-3 flex flex-col gap-1 items-end">
            ${
              isSoldOut
                ? `<span class="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">SOLD OUT</span>`
                : isRegistered
                ? `<span class="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <span class="material-symbols-outlined text-[12px]">check</span> Pass Active
                   </span>`
                : `<span class="bg-surface/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-outline-variant/20">
                    ${evt.seatsLeft} Spots Left
                   </span>`
            }
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold text-primary tracking-wider uppercase">${evt.category || 'WORKSHOP'}</span>
              <span class="text-outline-variant">•</span>
              <span class="text-[10px] text-outline font-semibold uppercase">${evt.badge || 'CC'} TRACK</span>
            </div>
            
            <h3 class="text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1 leading-snug">
              ${evt.title}
            </h3>
            
            <p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
              ${evt.description || 'Join peers across campus quad halls for this curated workshop and showcase.'}
            </p>
          </div>

          <!-- Metadata & Capacity -->
          <div class="space-y-3 pt-1">
            <div class="flex items-center justify-between text-xs text-on-surface-variant font-medium">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px] text-outline">location_on</span>
                ${evt.location || 'Campus Hub'}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px] text-outline">schedule</span>
                ${evt.time || '6:30 PM'}
              </span>
            </div>

            <!-- Capacity Progress Bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-semibold">
                <span class="text-on-surface">${evt.capacity - evt.seatsLeft} / ${evt.capacity} Filled</span>
                <span class="${isSoldOut ? 'text-rose-600 font-bold' : 'text-secondary font-bold'}">
                  ${isSoldOut ? 'Full (Waitlist)' : `${percentFilled}% Full`}
                </span>
              </div>
              <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div class="${isSoldOut ? 'bg-rose-500' : 'bg-secondary-container'} h-full rounded-full transition-all duration-500" style="width: ${percentFilled}%"></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2 pt-2">
              <a href="event-details.html?id=${evt.id}" class="w-full text-center py-2 px-3 rounded-lg text-xs font-bold bg-surface-container hover:bg-surface-container-high text-primary transition-colors">
                Details &rarr;
              </a>
              <button class="quick-rsvp-btn w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 ${
                isRegistered
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                  : isSoldOut
                  ? 'bg-surface-container text-outline cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }" data-event-id="${evt.id}" ${isSoldOut || isRegistered ? 'disabled' : ''}>
                ${
                  isRegistered
                    ? '<span class="material-symbols-outlined text-[14px]">task_alt</span> Registered'
                    : isSoldOut
                    ? 'Sold Out'
                    : 'Quick RSVP'
                }
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
    })
    .join('');

  // Attach Quick RSVP Drawer openers
  grid.querySelectorAll('.quick-rsvp-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventId = btn.getAttribute('data-event-id');
      const event = allEvents.find((x) => x.id === eventId);
      if (event) openQuickDrawer(event);
    });
  });
}

function openQuickDrawer(event) {
  activeDrawerEvent = event;
  const drawer = document.getElementById('eventDrawer');
  const panel = document.getElementById('drawerPanel');
  const body = document.getElementById('drawerBody');
  const fullPageLink = document.getElementById('drawerFullPageLink');
  const confirmBtn = document.getElementById('drawerConfirmRsvpBtn');

  fullPageLink.href = `event-details.html?id=${event.id}`;

  const isSoldOut = event.isSoldOut || event.seatsLeft === 0;
  const user = getCurrentUser();

  body.innerHTML = `
    <div class="space-y-4">
      <div class="relative h-44 rounded-xl overflow-hidden shadow-sm">
        <img src="${getEventImage(event.category, event.title)}" class="w-full h-full object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-3 left-3 text-white">
          <span class="text-[10px] font-bold uppercase tracking-wider bg-primary/80 px-2 py-0.5 rounded-md">${event.category}</span>
          <h3 class="text-base font-bold mt-1">${event.title}</h3>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span class="text-outline uppercase text-[10px] font-bold block">Date &amp; Schedule</span>
          <span class="font-bold text-on-surface mt-0.5 block">${event.date} • ${event.time}</span>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span class="text-outline uppercase text-[10px] font-bold block">Venue Location</span>
          <span class="font-bold text-on-surface mt-0.5 block">${event.location || 'Campus Hub'}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-1">
        <div class="flex justify-between text-xs font-bold">
          <span>Capacity Status</span>
          <span class="text-secondary">${event.seatsLeft} of ${event.capacity} seats left</span>
        </div>
        <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
          <div class="bg-secondary-container h-full rounded-full" style="width: ${event.percentFilled || 20}%"></div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">Registering Student</label>
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
          <img src="${user.avatar}" class="w-9 h-9 rounded-full object-cover"/>
          <div>
            <div class="text-xs font-bold text-on-surface">${user.name}</div>
            <div class="text-[11px] text-on-surface-variant font-mono">${user.email}</div>
          </div>
        </div>
      </div>

      <p class="text-xs text-on-surface-variant leading-relaxed">
        ${event.description}
      </p>
    </div>
  `;

  if (isSoldOut) {
    confirmBtn.disabled = true;
    confirmBtn.className = 'w-full bg-surface-container text-outline py-3 px-4 rounded-xl font-bold text-sm cursor-not-allowed';
    confirmBtn.innerHTML = 'Event is Sold Out (Waitlist Only)';
  } else {
    confirmBtn.disabled = false;
    confirmBtn.className = 'w-full bg-primary hover:bg-primary-container text-on-primary py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2';
    confirmBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Confirm Instant RSVP';
  }

  drawer.classList.remove('hidden');
  requestAnimationFrame(() => {
    drawer.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  });
}

function closeQuickDrawer() {
  const drawer = document.getElementById('eventDrawer');
  const panel = document.getElementById('drawerPanel');
  drawer.classList.add('opacity-0');
  panel.classList.add('translate-x-full');
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 300);
}

async function handleConfirmRsvp() {
  if (!activeDrawerEvent) return;
  const user = getCurrentUser();
  const btn = document.getElementById('drawerConfirmRsvpBtn');

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Reserving Spot...';

  try {
    const res = await apiFetch('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: activeDrawerEvent.id,
        name: user.name,
        email: user.email,
        role: user.department || 'Student'
      })
    });

    showToast(`Registered successfully! Pass #${res.registration?.ticketCode || 'CC-PASS'} issued.`, 'success');

    btn.className = 'w-full bg-emerald-100 text-emerald-800 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2';
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">task_alt</span> Spot Confirmed! Digital Pass Ready';

    setTimeout(async () => {
      closeQuickDrawer();
      await loadData();
    }, 1200);
  } catch (err) {
    if (err.status === 409) {
      showToast('You are already registered for this event.', 'warning');
      btn.className = 'w-full bg-amber-100 text-amber-900 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2';
      btn.innerHTML = 'Already Registered (Check My Passes)';
    } else {
      showToast(err.message || 'Registration failed. Capacity may be full.', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Try Again';
    }
  }
}

function resetFilters() {
  currentCategory = 'All';
  currentLocation = 'all';
  currentDate = 'all';
  availableOnly = false;
  searchQuery = '';

  document.getElementById('eventSearchInput').value = '';
  document.getElementById('locationSelect').value = 'all';
  document.getElementById('availableOnlyCheck').checked = false;

  document.querySelectorAll('.cat-pill').forEach((p) => {
    p.classList.remove('bg-primary', 'text-on-primary');
    p.classList.add('bg-surface-container', 'text-on-surface-variant');
  });
  document.querySelector('.cat-pill[data-category="All"]')?.classList.add('bg-primary', 'text-on-primary');

  document.querySelectorAll('.date-filter').forEach((b) => {
    b.classList.remove('bg-surface', 'text-primary', 'shadow-sm');
    b.classList.add('text-on-surface-variant');
  });
  document.querySelector('.date-filter[data-date="all"]')?.classList.add('bg-surface', 'text-primary', 'shadow-sm');

  renderEvents();
}

function setupEventListeners() {
  // Category pills
  document.querySelectorAll('.cat-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach((p) => {
        p.classList.remove('bg-primary', 'text-on-primary');
        p.classList.add('bg-surface-container', 'text-on-surface-variant');
      });
      pill.classList.remove('bg-surface-container', 'text-on-surface-variant');
      pill.classList.add('bg-primary', 'text-on-primary');
      currentCategory = pill.getAttribute('data-category');
      renderEvents();
    });
  });

  // Date filters
  document.querySelectorAll('.date-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.date-filter').forEach((b) => {
        b.classList.remove('bg-surface', 'text-primary', 'shadow-sm');
        b.classList.add('text-on-surface-variant');
      });
      btn.classList.add('bg-surface', 'text-primary', 'shadow-sm');
      btn.classList.remove('text-on-surface-variant');
      currentDate = btn.getAttribute('data-date');
      renderEvents();
    });
  });

  // Location selector
  document.getElementById('locationSelect')?.addEventListener('change', (e) => {
    currentLocation = e.target.value;
    renderEvents();
  });

  // Available only checkbox
  document.getElementById('availableOnlyCheck')?.addEventListener('change', (e) => {
    availableOnly = e.target.checked;
    renderEvents();
  });

  // Search input
  const searchInput = document.getElementById('eventSearchInput');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderEvents();
  });

  // Nav global search focus
  document.getElementById('navGlobalSearch')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    if (searchInput) searchInput.value = searchQuery;
    renderEvents();
  });

  // Keyboard shortcut Ctrl+K / Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // Drawer backdrop & close
  document.getElementById('drawerBackdrop')?.addEventListener('click', closeQuickDrawer);
  document.getElementById('closeDrawerBtn')?.addEventListener('click', closeQuickDrawer);
  document.getElementById('drawerConfirmRsvpBtn')?.addEventListener('click', handleConfirmRsvp);
}
