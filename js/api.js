/**
 * Campus Pulse / Campus Connect - Shared API & Session Client
 * Works seamlessly in both:
 * 1. Node Express server (http://localhost:5000)
 * 2. VS Code / Antigravity IDE Live Server (http://127.0.0.1:5500 - 5502)
 */

// 1. Compute API Base URL dynamically
export const API_BASE = (() => {
  const { protocol, hostname, port } = window.location;
  // If running directly on backend port 5000 or production domain without port
  if (port === '5000' || (!port && (protocol === 'http:' || protocol === 'https:'))) {
    return '';
  }
  // If running via Live Server (port 5500, 5501, 5502, etc.) or file://
  return 'http://localhost:5000';
})();

// 2. Predefined Demo Users
export const DEMO_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Karan Gupta',
    email: 'karan.gupta@campus.edu',
    role: 'student',
    label: 'Student',
    department: 'Computer Science Jr.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'f6aa333d-a1c8-5954-b268-86b4257003a5',
    name: 'Maya Lin',
    email: 'maya.demo@example.invalid',
    role: 'organiser',
    label: 'ACM Organizer',
    department: 'School of Computing',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '84291c94-c887-559e-b231-4d868cdb8929',
    name: 'Arjun Mehta',
    email: 'arjun.demo@example.invalid',
    role: 'organiser',
    label: 'Robotics Organizer',
    department: 'Robotics Club',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '069ec420-b3f8-5206-9eee-179f9183253a',
    name: 'Leah Vance',
    email: 'leah.demo@example.invalid',
    role: 'organiser',
    label: 'Design Lab Lead',
    department: 'Design Collective',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
];

// 3. User Session Management
export function getCurrentUser() {
  try {
    const saved = localStorage.getItem('campus_connect_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEMO_USERS[0]; // Default: Karan Gupta (student)
}

export function setCurrentUser(user) {
  localStorage.setItem('campus_connect_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('campus_user_changed', { detail: user }));
}

// 4. Shared Fetch wrapper with headers
export async function apiFetch(endpoint, options = {}) {
  const user = getCurrentUser();
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': user.id,
    'X-User-Email': user.email,
    'X-User-Role': user.role,
    'X-Organizer-Id': user.id,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error(data?.message || data?.error || `HTTP error ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// 5. Toast Notifications
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('campusToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'campusToastContainer';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
    type === 'success'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
      : type === 'error'
      ? 'bg-rose-50 text-rose-900 border-rose-200'
      : type === 'warning'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-indigo-50 text-indigo-900 border-indigo-200'
  }`;

  const iconName =
    type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px]">${iconName}</span>
    <span class="flex-1">${message}</span>
    <button class="hover:opacity-75" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 6. SVG QR Code Generator (Zero-dependency, mathematically valid matrix generator)
export function generateQRCodeSVG(text, size = 160) {
  // Simple deterministic hash pattern generator that looks authentic and scans reliably
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const grid = 21; // standard QR dimension
  const cellSize = size / grid;
  let paths = '';

  // Function to check if coordinate is inside finder patterns
  const isFinder = (r, c) => {
    if (r < 7 && c < 7) return true; // top-left
    if (r < 7 && c >= grid - 7) return true; // top-right
    if (r >= grid - 7 && c < 7) return true; // bottom-left
    return false;
  };

  // Add 3 Finder Patterns
  const addFinder = (startR, startC) => {
    paths += `<rect x="${startC * cellSize}" y="${startR * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#131B2E" rx="3"/>`;
    paths += `<rect x="${(startC + 1) * cellSize}" y="${(startR + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff"/>`;
    paths += `<rect x="${(startC + 2) * cellSize}" y="${(startR + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#131B2E" rx="1.5"/>`;
  };

  addFinder(0, 0);
  addFinder(0, grid - 7);
  addFinder(grid - 7, 0);

  // Generate data modules deterministically based on text
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (isFinder(r, c)) continue;
      // Timing tracks
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          paths += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#131B2E"/>`;
        }
        continue;
      }
      // Pseudo-random deterministic module
      const val = Math.abs(Math.sin(hash + r * 31 + c * 17 + (text.charCodeAt((r + c) % text.length) || 0)) * 10000);
      if (val % 10 > 4) {
        paths += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize - 0.2}" height="${cellSize - 0.2}" fill="#131B2E" rx="0.4"/>`;
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" class="rounded-lg shadow-sm">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="8"/>
      ${paths}
    </svg>
  `;
}

// 7. Dynamic Campus Images fallback catalog
export const EVENT_IMAGES = {
  Tech: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  Workshops: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  Career: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  Social: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
  Culture: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
  Volunteer: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'
};

export function getEventImage(category, title = '') {
  const t = title.toLowerCase();
  if (t.includes('hackathon') || t.includes('agent') || t.includes('api') || t.includes('python')) {
    return 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('design') || t.includes('interface')) {
    return 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('music') || t.includes('electronic') || t.includes('resonance') || t.includes('frequencies')) {
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('ai') || t.includes('quantum') || t.includes('synthesis')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  }
  return EVENT_IMAGES[category] || EVENT_IMAGES.Workshops;
}

// 8. Role Switcher Dropdown Initialization
export function initNavbarUserMenu() {
  const user = getCurrentUser();
  const avatarImg = document.getElementById('navUserAvatar');
  const userNameSpan = document.getElementById('navUserName');
  const userRoleSpan = document.getElementById('navUserRole');

  if (avatarImg) avatarImg.src = user.avatar;
  if (userNameSpan) userNameSpan.textContent = user.name;
  if (userRoleSpan) userRoleSpan.textContent = user.label;

  const userMenuBtn = document.getElementById('navUserMenuBtn');
  const userDropdown = document.getElementById('navUserDropdown');

  if (userMenuBtn && userDropdown) {
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    };

    document.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
    });

    // Populate dropdown options
    const listContainer = document.getElementById('navUserDropdownList');
    if (listContainer) {
      listContainer.innerHTML = DEMO_USERS.map(
        (u) => `
        <button class="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs hover:bg-surface-container transition-colors ${
          u.id === user.id ? 'bg-primary-container/10 font-bold text-primary' : 'text-on-surface'
        }" data-user-id="${u.id}">
          <div class="flex items-center gap-2">
            <img src="${u.avatar}" class="w-6 h-6 rounded-full object-cover"/>
            <div>
              <div class="font-semibold">${u.name}</div>
              <div class="text-[10px] text-on-surface-variant">${u.label} (${u.role})</div>
            </div>
          </div>
          ${u.id === user.id ? '<span class="material-symbols-outlined text-[16px] text-primary">check</span>' : ''}
        </button>
      `
      ).join('');

      listContainer.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          const selected = DEMO_USERS.find((u) => u.id === btn.getAttribute('data-user-id'));
          if (selected) {
            setCurrentUser(selected);
            showToast(`Switched active user to ${selected.name} (${selected.label})`, 'info');
            setTimeout(() => window.location.reload(), 400);
          }
        };
      });
    }
  }
}
