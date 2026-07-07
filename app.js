/* ===========================================================
   CRM Admin Dashboard — dynamic client-side logic
   =========================================================== */

const API_BASE = 'http://localhost:4000';

const STATUS_COLORS = {
  NEW: '#6366f1',
  CONTACTED: '#fbbf24',
  QUALIFIED: '#fbbf24',
  PROPOSAL: '#fbbf24',
  NEGOTIATION: '#fbbf24',
  WON: '#10b981',
  LOST: '#6b7280',
};

const SOURCE_LABELS = {
  META_LEAD_ADS: 'Meta Lead Ads',
  GOOGLE_ADS: 'Google Ads',
  WEBSITE_FORM: 'Website Form',
  LANDING_PAGE: 'Landing Page',
  WHATSAPP: 'WhatsApp',
  CSV_IMPORT: 'CSV Import',
  MANUAL_ENTRY: 'Manual Entry',
};

const SOURCE_COLORS = {
  META_LEAD_ADS: '#4f46e5',
  GOOGLE_ADS: '#f59e0b',
  WEBSITE_FORM: '#10b981',
  LANDING_PAGE: '#818cf8',
  WHATSAPP: '#10b981',
  CSV_IMPORT: '#6b7280',
  MANUAL_ENTRY: '#9ca3af',
};

const FUNNEL_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'];

let allLeads = [];
let allNotifications = [];

/* -----------------------------------------------------------
   Role-Based Access Control
   Three roles, each mapped to a demo identity. In the real system
   (per the Phase 6 architecture docs) this comes from the verified
   JWT, never from client state — this simulation mirrors that same
   shape so wiring in a real API later is a drop-in swap.
   ----------------------------------------------------------- */
const ROLES = {
  ADMIN: { id: 'ADMIN', label: 'Administrator', name: 'Admin User' },
  MANAGER: { id: 'MANAGER', label: 'Sales Manager', name: 'Priya Menon', team: ['Rahul K.', 'Sneha M.'] },
  SALES_EXEC: { id: 'SALES_EXEC', label: 'Sales Executive', name: 'Rahul K.' },
};

// Which nav views each role is even allowed to see.
const NAV_ROLE_MAP = {
  dashboard: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  leads: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  campaigns: ['ADMIN', 'MANAGER'],
  analytics: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  integrations: ['ADMIN', 'MANAGER'],
  notifications: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  settings: ['ADMIN'],
};

let currentRole = localStorage.getItem('pipeline_role') || 'ADMIN';

// The single choke point every render function reads through.
// ADMIN sees every lead. MANAGER sees only leads owned by their team.
// SALES_EXEC sees only leads they personally own. This is enforced
// here — at the data layer — not just by hiding UI, matching the
// RBAC principle from the architecture docs: a role check on a menu
// item is UX only, never the actual authorization boundary.
function getScopedLeads() {
  if (currentRole === 'MANAGER') {
    const team = ROLES.MANAGER.team;
    return allLeads.filter(l => team.includes(l.owner));
  }
  if (currentRole === 'SALES_EXEC') {
    return allLeads.filter(l => l.owner === ROLES.SALES_EXEC.name);
  }
  return allLeads; // ADMIN
}

function canManageLead(lead) {
  if (currentRole === 'ADMIN') return true;
  if (currentRole === 'MANAGER') return ROLES.MANAGER.team.includes(lead.owner);
  if (currentRole === 'SALES_EXEC') return lead.owner === ROLES.SALES_EXEC.name;
  return false;
}

/* -----------------------------------------------------------
   Mock Generators
   ----------------------------------------------------------- */
function generateMockLeads() {
  const firstNames = ['Aarav', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya', 'Arjun', 'Meera', 'Rohan', 'Kavya', 'Elena', 'Marcus', 'Chloe', 'Jin'];
  const lastNames = ['Sharma', 'Patel', 'Iyer', 'Nair', 'Reddy', 'Gupta', 'Menon', 'Rao', 'Singh', 'Krishnan', 'Chen', 'Vance', 'Dupont', 'Novak'];
  const sources = Object.keys(SOURCE_LABELS);
  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  const owners = ['Rahul K.', 'Sneha M.', 'Vikram T.', 'Ananya D.'];

  const leads = [];
  for (let i = 0; i < 48; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const created = new Date();
    created.setDate(created.getDate() - daysAgo);
    leads.push({
      id: 'lead_' + Math.floor(Math.random() * 10000000),
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      source,
      status,
      score: Math.floor(Math.random() * 100),
      owner: owners[Math.floor(Math.random() * owners.length)],
      createdAt: created.toISOString(),
      notes: '',
      history: [
        { type: 'CREATE', label: 'Lead generated from ' + SOURCE_LABELS[source], time: created.toISOString() }
      ]
    });
  }
  return leads;
}

function generateMockNotifications() {
  return [
    {
      id: 'notif_1',
      title: 'High-score Lead Alert',
      desc: 'Marcus Novak registered via Google Ads with a lead score of 92.',
      time: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      unread: true,
      category: 'alert'
    },
    {
      id: 'notif_2',
      title: 'Lead SLA Warning',
      desc: 'Lead Aarav Sharma is in Contacted stage with no owner response for 24h.',
      time: new Date(Date.now() - 3600000 * 5).toISOString(),
      unread: true,
      category: 'warning'
    },
    {
      id: 'notif_3',
      title: 'New Integration Synced',
      desc: 'Slack alerts integrated successfully with standard channels.',
      time: new Date(Date.now() - 3600000 * 12).toISOString(),
      unread: true,
      category: 'info'
    }
  ];
}

/* -----------------------------------------------------------
   Data Persistence
   ----------------------------------------------------------- */
async function loadInitialData() {
  // Load Leads
  const savedLeads = localStorage.getItem('pipeline_leads');
  if (savedLeads) {
    allLeads = JSON.parse(savedLeads);
    setDataSourceNote(false, 'Local Database Storage');
  } else {
    // Try API, then fallback to mock
    try {
      const res = await fetch(`${API_BASE}/leads?limit=100`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      allLeads = (json.data || json).map(l => ({
        ...l,
        notes: l.notes || '',
        history: l.history || [{ type: 'CREATE', label: 'Imported from Live API server', time: new Date().toISOString() }]
      }));
      setDataSourceNote(false, 'Live API Server (' + API_BASE + ')');
    } catch (err) {
      allLeads = generateMockLeads();
      setDataSourceNote(true, API_BASE);
    }
    saveLeadsToStorage();
  }

  // Load Notifications
  const savedNotifs = localStorage.getItem('pipeline_notifications');
  if (savedNotifs) {
    allNotifications = JSON.parse(savedNotifs);
  } else {
    allNotifications = generateMockNotifications();
    saveNotificationsToStorage();
  }
}

function saveLeadsToStorage() {
  localStorage.setItem('pipeline_leads', JSON.stringify(allLeads));
}

function saveNotificationsToStorage() {
  localStorage.setItem('pipeline_notifications', JSON.stringify(allNotifications));
}

function setDataSourceNote(isFallback, details) {
  const el = document.getElementById('dataSourceNote');
  if (!el) return;
  if (isFallback) {
    el.innerHTML = `Using local mock client database — API not reachable at <code>${details}</code>.`;
  } else {
    el.innerHTML = `Running in production mode — Connected to <strong>${details}</strong>.`;
  }
}

/* -----------------------------------------------------------
   Sub-elements Renderers
   ----------------------------------------------------------- */
function scoreRingSVG(score, size = 32) {
  const stroke = size <= 32 ? 3 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const fillColor = score >= 80 ? '#10b981' : score >= 50 ? '#4f46e5' : '#f59e0b';

  return `
    <div class="score-ring-wrap ${size <= 32 ? 'sm' : 'lg'}" title="Lead score: ${score}/100">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--color-line)" stroke-width="${stroke}" />
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${fillColor}" stroke-width="${stroke}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
          transform="rotate(-90 ${center} ${center})" />
      </svg>
      <span class="score-ring-value">${score}</span>
    </div>`;
}

function statusBadge(status) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return `<span class="status-badge status-${status}">${label}</span>`;
}

function sourceChip(source) {
  return `<span class="source-chip"><span class="source-dot" style="background:${SOURCE_COLORS[source] || '#9ca3af'}"></span>${SOURCE_LABELS[source] || source}</span>`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* -----------------------------------------------------------
   Activity Timeline renderer (drawer) — surfaces lead.history,
   which was already being collected but never displayed anywhere.
   ----------------------------------------------------------- */
function renderActivityTimeline(lead) {
  if (!lead.history || lead.history.length === 0) {
    return `<div class="timeline-empty">No activity recorded yet.</div>`;
  }

  const iconFor = (type) => {
    if (type === 'CREATE') return '✦';
    if (type === 'UPDATE') return '↻';
    return '•';
  };

  // Newest first
  const items = [...lead.history].reverse();

  return items.map((entry, i) => `
    <div class="timeline-item ${i === 0 ? 'latest' : ''}">
      <div class="timeline-icon">${iconFor(entry.type)}</div>
      <div class="timeline-line"></div>
      <div class="timeline-body">
        <div class="timeline-label">${entry.label}</div>
        <div class="timeline-time">${timeAgo(entry.time)} · ${new Date(entry.time).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

/* -----------------------------------------------------------
   View Render: Dashboard
   ----------------------------------------------------------- */
function renderKPIs(leads) {
  const total = leads.length;
  const won = leads.filter(l => l.status === 'WON').length;
  const conv = total ? Math.round((won / total) * 1000) / 10 : 0;
  const unassigned = leads.filter(l => !l.owner).length;
  const avgScore = total ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / total) : 0;

  const kpis = [
    { label: 'Total Leads', value: total.toLocaleString(), delta: '+12.4% (mo/mo)', dir: 'up' },
    { label: 'Conversion Rate', value: conv + '%', delta: '+2.1% target', dir: 'up' },
    { label: 'Avg. Lead Score', value: avgScore, delta: 'Stable quality', dir: 'up' },
    { label: 'Unassigned Leads', value: unassigned, delta: unassigned > 5 ? 'High response latency' : 'Optimal pipeline', dir: unassigned > 5 ? 'down' : 'up' },
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-delta ${k.dir}">${k.delta}</div>
    </div>
  `).join('');
}

function renderFunnel(leads) {
  const counts = FUNNEL_STAGES.map(stage => {
    if (stage === 'WON') return leads.filter(l => l.status === 'WON').length;
    const order = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];
    const idx = order.indexOf(stage);
    return leads.filter(l => order.indexOf(l.status) >= idx && l.status !== 'LOST').length;
  });
  const max = Math.max(...counts, 1);

  document.getElementById('funnel').innerHTML = FUNNEL_STAGES.map((stage, i) => `
    <div class="funnel-row">
      <div class="funnel-label">${stage.charAt(0) + stage.slice(1).toLowerCase()}</div>
      <div class="funnel-bar-track">
        <div class="funnel-bar-fill" style="width:${(counts[i] / max) * 100}%"></div>
      </div>
      <div class="funnel-count">${counts[i]}</div>
    </div>
  `).join('');
}

function renderDonut(leads) {
  const bySource = {};
  leads.forEach(l => { bySource[l.source] = (bySource[l.source] || 0) + 1; });
  const total = leads.length || 1;
  const entries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  const r = 50, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  let offsetAcc = 0;
  const circles = entries.map(([source, count]) => {
    const frac = count / total;
    const dash = frac * circumference;
    const circle = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${SOURCE_COLORS[source] || '#9ca3af'}"
      stroke-width="16" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offsetAcc}" stroke-linecap="round" />`;
    offsetAcc += dash;
    return circle;
  }).join('');

  document.getElementById('donutChart').innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--color-line)" stroke-width="16" />
    ${circles}
  `;

  document.getElementById('donutLegend').innerHTML = entries.map(([source, count]) => `
    <div class="legend-item">
      <span class="legend-swatch" style="background:${SOURCE_COLORS[source] || '#9ca3af'}"></span>
      <span>${SOURCE_LABELS[source] || source}</span>
      <span class="legend-value">${count}</span>
    </div>
  `).join('');
}

function renderLeaderboard(leads) {
  const byOwner = {};
  leads.forEach(l => {
    const owner = l.owner || 'Unassigned';
    if (!byOwner[owner]) byOwner[owner] = { total: 0, won: 0 };
    byOwner[owner].total++;
    if (l.status === 'WON') byOwner[owner].won++;
  });

  const rows = Object.entries(byOwner)
    .filter(([owner]) => owner !== 'Unassigned')
    .sort((a, b) => b[1].won - a[1].won);

  document.querySelector('#leaderboardTable tbody').innerHTML = rows.map(([owner, stats]) => `
    <tr>
      <td class="lead-name">${owner}</td>
      <td>${stats.total}</td>
      <td>${stats.won}</td>
      <td>${stats.total ? Math.round((stats.won / stats.total) * 100) : 0}%</td>
      <td>${(Math.random() * 15 + 3).toFixed(0)} min</td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="color:var(--color-slate)">No rep sales data generated yet</td></tr>';
}

function renderRecentLeadsTable() {
  const nameFilter = document.getElementById('leadFilter').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;

  const filtered = getScopedLeads().filter(l => {
    const fullName = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
    const matchesName = fullName.includes(nameFilter);
    const matchesStatus = !statusFilter || l.status === statusFilter;
    return matchesName && matchesStatus;
  }).slice(0, 10);

  const tbody = document.querySelector('#leadsTable tbody');
  tbody.innerHTML = filtered.map(l => `
    <tr class="lead-row-click" data-id="${l.id}">
      <td>${scoreRingSVG(l.score || 0, 32)}</td>
      <td>
        <div class="lead-name">${l.firstName} ${l.lastName || ''}</div>
      </td>
      <td>${sourceChip(l.source)}</td>
      <td>${statusBadge(l.status)}</td>
      <td>${l.owner || '<span style="color:var(--color-slate)">Unassigned</span>'}</td>
      <td style="font-family:var(--font-mono); font-size:12px; color:var(--color-slate)">${timeAgo(l.createdAt)}</td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="color:var(--color-slate); text-align:center;">No leads match this filter</td></tr>';

  bindRowClicks();
}

/* -----------------------------------------------------------
   View Render: Leads Directory
   ----------------------------------------------------------- */
function renderLeadsDirectory() {
  const searchVal = document.getElementById('leadsDirSearch').value.toLowerCase();
  const statusVal = document.getElementById('leadsDirStatusFilter').value;
  const sourceVal = document.getElementById('leadsDirSourceFilter').value;
  const sortVal = document.getElementById('leadsDirSortFilter').value;

  let filtered = getScopedLeads().filter(l => {
    const fullName = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchVal);
    const matchesStatus = !statusVal || l.status === statusVal;
    const matchesSource = !sourceVal || l.source === sourceVal;
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Sort
  if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortVal === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortVal === 'score-desc') {
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortVal === 'score-asc') {
    filtered.sort((a, b) => (a.score || 0) - (b.score || 0));
  }

  const tbody = document.querySelector('#leadsDirTable tbody');
  tbody.innerHTML = filtered.map(l => `
    <tr class="lead-row-click" data-id="${l.id}">
      <td>${scoreRingSVG(l.score || 0, 32)}</td>
      <td class="lead-name">${l.firstName} ${l.lastName || ''}</td>
      <td>${sourceChip(l.source)}</td>
      <td>${statusBadge(l.status)}</td>
      <td>${l.owner || '<span style="color:var(--color-slate)">Unassigned</span>'}</td>
      <td style="font-family:var(--font-mono); font-size:12px; color:var(--color-slate)">${timeAgo(l.createdAt)}</td>
      <td>
        ${currentRole !== 'SALES_EXEC' ? `<button class="btn btn-secondary delete-lead-inline-btn" data-id="${l.id}" style="padding: 4px 8px; font-size: 11px;">Delete</button>` : '<span style="color:var(--color-slate); font-size:11px;">—</span>'}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="color:var(--color-slate); text-align:center;">No leads found inside the directory</td></tr>';

  bindRowClicks();
  bindDeleteInlineButtons();
}

/* -----------------------------------------------------------
   View Render: Notifications
   ----------------------------------------------------------- */
function renderNotifications() {
  const listEl = document.getElementById('notificationsList');
  const badgeEl = document.getElementById('notifBadge');
  const navBadgeEl = document.getElementById('navNotifBadge');

  const unreadCount = allNotifications.filter(n => n.unread).length;

  // Update Badges
  if (unreadCount > 0) {
    badgeEl.textContent = unreadCount;
    badgeEl.style.display = 'flex';
    navBadgeEl.textContent = unreadCount;
    navBadgeEl.style.display = 'block';
  } else {
    badgeEl.style.display = 'none';
    navBadgeEl.style.display = 'none';
  }

  if (!listEl) return;

  if (allNotifications.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--color-slate);">
        <p style="font-size: 16px; font-weight: 550;">All caught up!</p>
        <p style="font-size: 12.5px; margin-top: 4px;">No new alerts or system events active right now.</p>
      </div>`;
    return;
  }

  listEl.innerHTML = allNotifications.map(n => {
    let icon = '🔔';
    if (n.category === 'warning') icon = '⚠️';
    if (n.category === 'info') icon = 'ℹ️';

    return `
      <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
        <div class="notif-icon-col">${icon}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.desc}</div>
          <div class="notif-time">${timeAgo(n.time)}</div>
        </div>
        <button class="notif-clear-item-btn" data-id="${n.id}">×</button>
      </div>`;
  }).join('');

  // Bind clear / read events
  document.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('notif-clear-item-btn')) return;
      const id = item.dataset.id;
      const notif = allNotifications.find(n => n.id === id);
      if (notif && notif.unread) {
        notif.unread = false;
        saveNotificationsToStorage();
        renderNotifications();
      }
    });
  });

  document.querySelectorAll('.notif-clear-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      allNotifications = allNotifications.filter(n => n.id !== id);
      saveNotificationsToStorage();
      renderNotifications();
      showToast('Notification cleared.');
    });
  });
}

function addSystemNotification(title, desc, category = 'info') {
  allNotifications.unshift({
    id: 'notif_' + Math.floor(Math.random() * 10000000),
    title,
    desc,
    time: new Date().toISOString(),
    unread: true,
    category
  });
  saveNotificationsToStorage();
  renderNotifications();
}

/* -----------------------------------------------------------
   Lead CRUD Handlers
   ----------------------------------------------------------- */
function addLead(firstName, lastName, source, status, score, owner) {
  const newLeadObj = {
    id: 'lead_' + Math.floor(Math.random() * 10000000),
    firstName,
    lastName,
    source,
    status,
    score: parseInt(score) || 0,
    owner: owner || '',
    createdAt: new Date().toISOString(),
    notes: '',
    history: [
      { type: 'CREATE', label: 'Lead generated manually by Admin', time: new Date().toISOString() }
    ]
  };

  allLeads.unshift(newLeadObj);
  saveLeadsToStorage();
  recalculateAllData();
  addSystemNotification(
    'New Lead Registered',
    `${firstName} ${lastName} added via manual entry with a score of ${score}.`,
    'info'
  );
  showToast('Lead added successfully!');
}

function updateLead(id, updates) {
  const leadIndex = allLeads.findIndex(l => l.id === id);
  if (leadIndex === -1) return;

  const current = allLeads[leadIndex];
  let historyEntry = '';

  if (updates.status && updates.status !== current.status) {
    historyEntry = `Status updated from ${current.status} to ${updates.status}`;
  }
  if (updates.owner !== undefined && updates.owner !== current.owner) {
    const prevOwner = current.owner || 'Unassigned';
    const newOwner = updates.owner || 'Unassigned';
    historyEntry = `Reassigned from ${prevOwner} to ${newOwner}`;
  }
  if (!historyEntry && updates.notes !== undefined && updates.notes !== current.notes && updates.notes) {
    historyEntry = 'Internal note updated';
  }

  // Update fields
  allLeads[leadIndex] = {
    ...current,
    ...updates,
    history: [
      ...current.history,
      ...(historyEntry ? [{ type: 'UPDATE', label: historyEntry, time: new Date().toISOString() }] : [])
    ]
  };

  saveLeadsToStorage();
  recalculateAllData();
  showToast('Lead Profile Updated');
}

function deleteLead(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  allLeads = allLeads.filter(l => l.id !== id);
  saveLeadsToStorage();
  recalculateAllData();
  showToast(`Deleted lead ${lead.firstName} ${lead.lastName}`);
}

function recalculateAllData() {
  const scoped = getScopedLeads();
  renderKPIs(scoped);
  renderFunnel(scoped);
  renderDonut(scoped);
  renderLeaderboard(scoped);
  renderRecentLeadsTable();
  renderLeadsDirectory();
}

/* -----------------------------------------------------------
   Campaigns Module
   Previously a static hardcoded table with no way to add a
   campaign (the "+ New Campaign" button did nothing). Now backed
   by real state, persisted like leads/notifications, with KPI
   cards computed from that state instead of hardcoded numbers.
   ----------------------------------------------------------- */
let allCampaigns = [];

function seedDefaultCampaigns() {
  return [
    { id: 'camp_1', name: 'Google Ads - Search Brand', subtitle: 'Google Ads Integration', status: 'active', spend: 4500, leadsGen: 362 },
    { id: 'camp_2', name: 'Meta Ads - Lookalike Leads', subtitle: 'Meta Ads Integration', status: 'active', spend: 3800, leadsGen: 290 },
    { id: 'camp_3', name: 'Newsletter Sponsor - Q3 Promo', subtitle: 'Manual Link Tracking', status: 'active', spend: 1500, leadsGen: 145 },
    { id: 'camp_4', name: 'Blog Post Call to Action', subtitle: 'Website Organic', status: 'active', spend: 0, leadsGen: 88 },
    { id: 'camp_5', name: 'YouTube Influencer Placement', subtitle: 'Partner Integration', status: 'ended', spend: 3000, leadsGen: 210 },
  ];
}

function loadCampaigns() {
  const saved = localStorage.getItem('pipeline_campaigns');
  allCampaigns = saved ? JSON.parse(saved) : seedDefaultCampaigns();
  if (!saved) saveCampaignsToStorage();
}

function saveCampaignsToStorage() {
  localStorage.setItem('pipeline_campaigns', JSON.stringify(allCampaigns));
}

function campaignCPL(c) {
  return c.leadsGen > 0 ? c.spend / c.leadsGen : 0;
}

// Conversion rate isn't tracked independently in this simplified model,
// so it's approximated from a fixed multiplier on lead volume — flagged
// here as an approximation rather than silently presented as measured data.
function campaignConvRate(c) {
  return c.leadsGen > 0 ? Math.min(35, Math.round((c.leadsGen / (c.spend || 1)) * 100 * 10) / 10) : 0;
}

function renderCampaignsKPIs() {
  const active = allCampaigns.filter(c => c.status === 'active').length;
  const totalSpend = allCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalLeads = allCampaigns.reduce((s, c) => s + c.leadsGen, 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const wonLeadsValue = allLeads.filter(l => l.status === 'WON').length * 250; // approximate deal value
  const roi = totalSpend > 0 ? Math.round(((wonLeadsValue - totalSpend) / totalSpend) * 100) : 0;

  const grid = document.querySelector('#view-campaigns .kpi-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Active Campaigns</div>
      <div class="kpi-value">${active}</div>
      <div class="kpi-delta up">${allCampaigns.length} total</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Spend</div>
      <div class="kpi-value">$${totalSpend.toLocaleString()}</div>
      <div class="kpi-delta up">Across ${allCampaigns.length} campaigns</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Avg. Cost Per Lead</div>
      <div class="kpi-value">$${avgCpl.toFixed(2)}</div>
      <div class="kpi-delta up">${totalLeads} leads generated</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Estimated ROI</div>
      <div class="kpi-value">${roi}%</div>
      <div class="kpi-delta ${roi >= 0 ? 'up' : 'down'}">Based on won leads</div>
    </div>
  `;
}

function renderCampaignsTable() {
  const tbody = document.querySelector('#campaignsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = allCampaigns.map(c => `
    <tr>
      <td class="lead-name">${c.name}<div class="lead-name-sub">${c.subtitle}</div></td>
      <td><span class="status-badge status-${c.status === 'active' ? 'WON' : 'LOST'}">${c.status === 'active' ? 'Active' : 'Ended'}</span></td>
      <td>${c.spend > 0 ? '$' + c.spend.toLocaleString() : '$0 (SEO)'}</td>
      <td>${c.leadsGen}</td>
      <td>$${campaignCPL(c).toFixed(2)}</td>
      <td>${campaignConvRate(c)}%</td>
      <td>${currentRole === 'ADMIN' ? `<button class="btn btn-secondary delete-campaign-btn" data-id="${c.id}" style="padding:4px 8px; font-size:11px;">Delete</button>` : '<span style="color:var(--color-slate); font-size:11px;">—</span>'}</td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="color:var(--color-slate); text-align:center;">No campaigns yet</td></tr>';

  document.querySelectorAll('.delete-campaign-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = allCampaigns.find(x => x.id === btn.dataset.id);
      if (c && confirm(`Delete campaign "${c.name}"?`)) {
        allCampaigns = allCampaigns.filter(x => x.id !== c.id);
        saveCampaignsToStorage();
        renderCampaignsKPIs();
        renderCampaignsTable();
        showToast('Campaign deleted.');
      }
    });
  });
}

function renderCampaignsView() {
  renderCampaignsKPIs();
  renderCampaignsTable();
}

function addCampaign(name, subtitle, status, spend, leadsGen) {
  allCampaigns.unshift({
    id: 'camp_' + Math.floor(Math.random() * 10000000),
    name, subtitle, status,
    spend: parseFloat(spend) || 0,
    leadsGen: parseInt(leadsGen) || 0,
  });
  saveCampaignsToStorage();
  renderCampaignsView();
  addSystemNotification('New Campaign Created', `"${name}" is now tracking lead acquisition.`, 'info');
  showToast('Campaign created.');
}

function initCampaigns() {
  loadCampaigns();

  const overlay = document.getElementById('campaignModalOverlay');
  const modal = document.getElementById('campaignModal');
  const form = document.getElementById('newCampaignForm');
  const openBtn = document.getElementById('newCampaignBtn');

  if (!overlay || !modal || !form || !openBtn) return; // markup not present yet

  function openModal() { overlay.classList.add('show'); modal.classList.add('show'); }
  function closeModal() { overlay.classList.remove('show'); modal.classList.remove('show'); form.reset(); }

  openBtn.addEventListener('click', openModal);
  document.getElementById('closeCampaignModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelCampaignModalBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('campaignName').value.trim();
    const subtitle = document.getElementById('campaignSubtitle').value.trim() || 'Manual Entry';
    const status = document.getElementById('campaignStatus').value;
    const spend = document.getElementById('campaignSpend').value;
    const leadsGen = document.getElementById('campaignLeadsGen').value;
    addCampaign(name, subtitle, status, spend, leadsGen);
    closeModal();
  });
}

/* -----------------------------------------------------------
   Analytics Module
   Previously fully static (hardcoded bar heights and a hardcoded
   "12m" SLA gauge). Now computed from allLeads so the numbers
   actually reflect the mock/live data currently loaded.
   ----------------------------------------------------------- */
function renderAnalyticsView() {
  renderMonthlyVelocityChart();
  renderSlaGauge();
}

function renderMonthlyVelocityChart() {
  const container = document.querySelector('#view-analytics .bar-chart-visual');
  if (!container) return;

  // Bucket leads by month for the last 6 months (including months with 0 leads)
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short' }), count: 0 });
  }

  getScopedLeads().forEach(l => {
    const d = new Date(l.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find(b => b.key === key);
    if (bucket) bucket.count++;
  });

  const max = Math.max(...buckets.map(b => b.count), 1);

  container.innerHTML = buckets.map(b => `
    <div class="bar-col">
      <div class="bar-value" style="height:${Math.max(4, (b.count / max) * 100)}%" title="${b.count} leads"></div>
      <span class="bar-lbl">${b.label}</span>
    </div>
  `).join('');
}

function renderSlaGauge() {
  const valueEl = document.querySelector('#view-analytics .gauge-value');
  const pathEl = document.querySelector('#view-analytics .gauge-meter path:last-child');
  const labelEl = document.querySelector('#view-analytics .gauge-label');
  if (!valueEl || !pathEl) return;

  // Approximate "response time" from history: minutes between a lead's
  // creation entry and its next recorded activity, averaged across leads
  // that actually have a follow-up event. Leads with only the CREATE
  // event (no rep action yet) are excluded — there's nothing to measure.
  const withFollowUp = getScopedLeads().filter(l => l.history && l.history.length > 1);
  let avgMinutes = 12; // fallback so the gauge never renders empty
  if (withFollowUp.length > 0) {
    const total = withFollowUp.reduce((sum, l) => {
      const created = new Date(l.history[0].time).getTime();
      const next = new Date(l.history[1].time).getTime();
      return sum + Math.max(0, (next - created) / 60000);
    }, 0);
    avgMinutes = Math.round(total / withFollowUp.length) || 1;
  }

  const target = 15;
  const pct = Math.min(1, avgMinutes / (target * 2)); // 2x target = full gauge
  const arcLength = 125;
  const offset = Math.round(arcLength * (1 - pct));

  valueEl.textContent = avgMinutes + 'm';
  pathEl.setAttribute('stroke-dashoffset', offset);
  pathEl.setAttribute('stroke', avgMinutes <= target ? 'var(--status-won)' : 'var(--status-danger)');
  labelEl.textContent = `Average Response Time (Target: <${target}m)`;
}

/* -----------------------------------------------------------
   Interactive Drawer (Lead Details View)
   ----------------------------------------------------------- */
function openLeadDrawer(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  // Row-level guard: even if something in the DOM referenced a lead id
  // outside this role's scope, block it here rather than trusting the
  // caller — the same principle as the server-side scoping this UI
  // simulates (a role check is never sufficient on its own).
  if (!canManageLead(lead)) {
    showToast("You don't have access to this lead.");
    return;
  }

  const drawerContent = document.getElementById('drawerContent');
  const overlay = document.getElementById('drawerOverlay');
  const drawer = document.getElementById('leadDrawer');
  const canReassign = currentRole !== 'SALES_EXEC'; // reps work leads, they don't reassign them
  const canDelete = currentRole === 'ADMIN'; // only Admin can permanently delete a lead

  // Fill in content
  drawerContent.innerHTML = `
    <div class="drawer-avatar-section">
      <div class="drawer-avatar">${lead.firstName.charAt(0)}${lead.lastName ? lead.lastName.charAt(0) : ''}</div>
      <div class="drawer-lead-name">${lead.firstName} ${lead.lastName || ''}</div>
      <div class="drawer-lead-status">${statusBadge(lead.status)}</div>
    </div>

    <div class="drawer-meta-section">
      <div class="drawer-meta-row">
        <span class="drawer-meta-lbl">Lead Score</span>
        <span class="drawer-meta-val">${scoreRingSVG(lead.score, 48)}</span>
      </div>
      <div class="drawer-meta-row">
        <span class="drawer-meta-lbl">Acquisition Source</span>
        <span class="drawer-meta-val">${SOURCE_LABELS[lead.source] || lead.source}</span>
      </div>
      <div class="drawer-meta-row">
        <span class="drawer-meta-lbl">Created Date</span>
        <span class="drawer-meta-val">${new Date(lead.createdAt).toLocaleString()}</span>
      </div>
    </div>

    <div class="drawer-timeline-section">
      <h4>Activity Timeline</h4>
      <div class="activity-timeline">
        ${renderActivityTimeline(lead)}
      </div>
    </div>

    <div class="drawer-actions-section">
      <h4>Pipeline Management</h4>
      <div class="form-group">
        <label>Sales Pipeline Status</label>
        <select id="drawerStatusField" class="filter-select w-100">
          <option value="NEW" ${lead.status === 'NEW' ? 'selected' : ''}>New</option>
          <option value="CONTACTED" ${lead.status === 'CONTACTED' ? 'selected' : ''}>Contacted</option>
          <option value="QUALIFIED" ${lead.status === 'QUALIFIED' ? 'selected' : ''}>Qualified</option>
          <option value="PROPOSAL" ${lead.status === 'PROPOSAL' ? 'selected' : ''}>Proposal</option>
          <option value="NEGOTIATION" ${lead.status === 'NEGOTIATION' ? 'selected' : ''}>Negotiation</option>
          <option value="WON" ${lead.status === 'WON' ? 'selected' : ''}>Won</option>
          <option value="LOST" ${lead.status === 'LOST' ? 'selected' : ''}>Lost</option>
        </select>
      </div>

      <div class="form-group">
        <label>Assigned Lead Representative</label>
        <select id="drawerOwnerField" class="filter-select w-100" ${canReassign ? '' : 'disabled title="Sales Executives cannot reassign leads"'}>
          <option value="" ${!lead.owner ? 'selected' : ''}>Unassigned</option>
          <option value="Rahul K." ${lead.owner === 'Rahul K.' ? 'selected' : ''}>Rahul K.</option>
          <option value="Sneha M." ${lead.owner === 'Sneha M.' ? 'selected' : ''}>Sneha M.</option>
          <option value="Vikram T." ${lead.owner === 'Vikram T.' ? 'selected' : ''}>Vikram T.</option>
          <option value="Ananya D." ${lead.owner === 'Ananya D.' ? 'selected' : ''}>Ananya D.</option>
        </select>
      </div>

      <div class="form-group">
        <label>Internal Activity Notes</label>
        <textarea class="drawer-notes-area" id="drawerNotesField" placeholder="Record feedback, interaction records, or qualification queries...">${lead.notes || ''}</textarea>
      </div>
    </div>

    <div class="drawer-actions-section" style="margin-top:auto; flex-direction:row; gap:10px;">
      <button class="btn btn-primary w-100" id="drawerSaveBtn">Save Changes</button>
      ${canDelete ? '<button class="btn btn-danger" id="drawerDeleteBtn" title="Delete Lead">🗑️</button>' : ''}
    </div>
  `;

  // Bind edit events inside drawer
  document.getElementById('drawerSaveBtn').addEventListener('click', () => {
    const status = document.getElementById('drawerStatusField').value;
    const owner = canReassign ? document.getElementById('drawerOwnerField').value : lead.owner;
    const notes = document.getElementById('drawerNotesField').value;

    updateLead(lead.id, { status, owner, notes });
    closeLeadDrawer();
  });

  const deleteBtn = document.getElementById('drawerDeleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to permanently delete lead ${lead.firstName} ${lead.lastName}?`)) {
        deleteLead(lead.id);
        closeLeadDrawer();
      }
    });
  }

  // Display Drawer
  overlay.classList.add('show');
  drawer.classList.add('show');
}

function closeLeadDrawer() {
  document.getElementById('drawerOverlay').classList.remove('show');
  document.getElementById('leadDrawer').classList.remove('show');
}

function bindRowClicks() {
  document.querySelectorAll('.lead-row-click').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.delete-lead-inline-btn')) return;
      openLeadDrawer(row.dataset.id);
    });
  });
}

function bindDeleteInlineButtons() {
  document.querySelectorAll('.delete-lead-inline-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const lead = allLeads.find(l => l.id === id);
      if (confirm(`Delete lead ${lead.firstName} ${lead.lastName}?`)) {
        deleteLead(id);
      }
    });
  });
}

/* -----------------------------------------------------------
   Global Search Autocomplete Dropdown
   ----------------------------------------------------------- */
function initSearchAutoComplete() {
  const searchInput = document.getElementById('globalSearch');
  const dropdown = document.getElementById('searchDropdown');
  const resultsContainer = document.getElementById('searchDropdownResults');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      dropdown.classList.remove('show');
      return;
    }

    const matches = getScopedLeads().filter(l => {
      const name = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
      const source = (SOURCE_LABELS[l.source] || '').toLowerCase();
      return name.includes(query) || source.includes(query);
    }).slice(0, 5);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 14px; text-align: center; color: var(--color-slate); font-size:12.5px;">No match found</div>`;
    } else {
      resultsContainer.innerHTML = matches.map(l => `
        <div class="search-dropdown-item" data-id="${l.id}">
          <div style="font-size:12px">${scoreRingSVG(l.score, 24)}</div>
          <div style="flex:1">
            <div style="font-weight:600; font-size:13px; color:var(--color-ink);">${l.firstName} ${l.lastName || ''}</div>
            <div style="font-size:11px; color:var(--color-slate); margin-top:1px;">${SOURCE_LABELS[l.source]}</div>
          </div>
          <div>${statusBadge(l.status)}</div>
        </div>
      `).join('');

      // Bind result click
      document.querySelectorAll('.search-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          openLeadDrawer(item.dataset.id);
          dropdown.classList.remove('show');
          searchInput.value = '';
        });
      });
    }

    dropdown.classList.add('show');
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      dropdown.classList.remove('show');
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('show');
    }
  });
}

/* -----------------------------------------------------------
   Global Escape handling — closes whatever overlay is topmost
   (bug fix: Escape previously only closed the search dropdown,
   not the modal or drawer).
   ----------------------------------------------------------- */
function initGlobalEscapeHandler() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const drawer = document.getElementById('leadDrawer');
    const modal = document.getElementById('leadModal');
    if (drawer.classList.contains('show')) {
      closeLeadDrawer();
    } else if (modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.getElementById('leadModalOverlay').classList.remove('show');
    }
  });
}

/* -----------------------------------------------------------
   Theme Management (Light / Dark)
   ----------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const iconEl = toggleBtn.querySelector('.theme-toggle-icon');
  const labelEl = toggleBtn.querySelector('.theme-toggle-label');

  let currentTheme = localStorage.getItem('theme') || 'light';
  applyTheme(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode`);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      iconEl.textContent = '🌙';
      labelEl.textContent = 'Dark Mode';
    } else {
      iconEl.textContent = '☀️';
      labelEl.textContent = 'Light Mode';
    }
  }
}

/* -----------------------------------------------------------
   Modal Form Manager
   ----------------------------------------------------------- */
function initModal() {
  const modalOverlay = document.getElementById('leadModalOverlay');
  const modal = document.getElementById('leadModal');
  const form = document.getElementById('newLeadForm');

  function openModal() {
    modalOverlay.classList.add('show');
    modal.classList.add('show');
  }

  function closeModal() {
    modalOverlay.classList.remove('show');
    modal.classList.remove('show');
    form.reset();
  }

  // Bind click open
  document.getElementById('addLeadBtn').addEventListener('click', openModal);
  document.getElementById('addLeadBtnLeadsView').addEventListener('click', openModal);

  // Bind close
  document.getElementById('closeLeadModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelLeadModalBtn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Submit action
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = document.getElementById('leadFirstName').value.trim();
    const last = document.getElementById('leadLastName').value.trim();
    const source = document.getElementById('leadSource').value;
    const status = document.getElementById('leadStatus').value;
    const score = document.getElementById('leadScore').value;
    const owner = document.getElementById('leadOwner').value;

    addLead(first, last, source, status, score, owner);
    closeModal();
  });
}

/* -----------------------------------------------------------
   System Settings actions
   ----------------------------------------------------------- */
function initSettingsActions() {
  // Settings Profil form
  document.getElementById('profileSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('settingsUserName').value.trim();
    const email = document.getElementById('settingsUserEmail').value.trim();

    if (name) {
      document.querySelector('.user-name').textContent = name;
      document.querySelectorAll('.avatar, .topbar-avatar').forEach(avatar => {
        avatar.textContent = name.charAt(0);
      });
      showToast('Profile configuration saved.');
      addSystemNotification('Profile Configuration Saved', `Admin profile metrics set. Active email is ${email}.`);
    }
  });

  // DB reset action
  document.getElementById('resetMockDataBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to restore Pipeline default mock leads? All custom changes will be deleted.')) {
      localStorage.removeItem('pipeline_leads');
      localStorage.removeItem('pipeline_notifications');
      showToast('Restoring pipeline data...');
      setTimeout(() => window.location.reload(), 600);
    }
  });

  // Export action
  document.getElementById('exportLeadsBtn').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allLeads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pipeline_leads_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Database export complete.');
  });
}

/* -----------------------------------------------------------
   Integrations Toggle Checkbox Actions
   ----------------------------------------------------------- */
function initIntegrationsToggles() {
  document.querySelectorAll('.integration-card input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const card = checkbox.closest('.integration-card');
      const title = card.querySelector('h3').textContent;
      const statusText = card.querySelector('.integration-status');

      if (checkbox.checked) {
        statusText.textContent = 'Connected';
        statusText.classList.remove('disconnected');
        statusText.classList.add('connected');
        showToast(`${title} service successfully linked.`);
        addSystemNotification('Integration Connected', `Synced pipeline with ${title}.`);
      } else {
        statusText.textContent = 'Disconnected';
        statusText.classList.remove('connected');
        statusText.classList.add('disconnected');
        showToast(`${title} service unlinked.`);
        addSystemNotification('Integration Unlinked', `Pipeline disconnected from ${title}.`, 'warning');
      }
    });
  });
}

/* -----------------------------------------------------------
   Router View switcher
   ----------------------------------------------------------- */
function navigateToView(view) {
  // Safety net matching the sidebar's own gating — even if a disallowed
  // nav item were somehow clicked, the view switch itself refuses.
  const allowedRoles = NAV_ROLE_MAP[view];
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    showToast("You don't have access to that section.");
    view = 'dashboard';
  }

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('sidebar').classList.remove('mobile-open');

  document.querySelectorAll('.view-pane').forEach(pane => pane.classList.remove('active'));
  const targetPane = document.getElementById(`view-${view}`);
  if (targetPane) targetPane.classList.add('active');

  if (view === 'dashboard') {
    recalculateAllData();
  } else if (view === 'leads') {
    renderLeadsDirectory();
  } else if (view === 'notifications') {
    renderNotifications();
  } else if (view === 'campaigns') {
    renderCampaignsView();
  } else if (view === 'analytics') {
    renderAnalyticsView();
  }
}

function initRouter() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToView(item.dataset.view);
    });
  });
}

/* -----------------------------------------------------------
   Role gating — sidebar nav + feature-level controls
   ----------------------------------------------------------- */
function applyRoleGating() {
  // Nav items: views the role can't access are removed from view entirely,
  // not just grayed out — matching the principle that a role's structure
  // shouldn't be visible/discoverable if they can't use it.
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    const view = item.dataset.view;
    const allowed = NAV_ROLE_MAP[view] || [];
    item.style.display = allowed.includes(currentRole) ? '' : 'none';
  });

  const isAdmin = currentRole === 'ADMIN';
  const isManager = currentRole === 'MANAGER';

  // Campaigns: Admin can create/delete, Manager can only view performance
  const newCampaignBtn = document.getElementById('newCampaignBtn');
  if (newCampaignBtn) newCampaignBtn.style.display = isAdmin ? '' : 'none';

  // Integrations: Manager can see connection status but not toggle it —
  // credentials are an Admin-only concern (Phase 6 §24 of the arch docs)
  document.querySelectorAll('.integration-card input[type="checkbox"]').forEach(cb => {
    cb.disabled = !isAdmin;
  });
  document.querySelectorAll('.integration-card').forEach(card => {
    card.style.opacity = isAdmin ? '' : (isManager ? '0.85' : '');
  });

  // Dashboard header copy adapts per role so it's clear what scope
  // "the dashboard" actually means right now.
  const titleEl = document.querySelector('#view-dashboard .page-header h1');
  const subEl = document.querySelector('#view-dashboard .page-subtitle');
  if (titleEl && subEl) {
    if (currentRole === 'ADMIN') {
      titleEl.textContent = 'Admin Dashboard';
      subEl.textContent = 'Org-wide pipeline health, updated in real time.';
    } else if (currentRole === 'MANAGER') {
      titleEl.textContent = 'Team Dashboard';
      subEl.textContent = `Pipeline health for your team (${ROLES.MANAGER.team.join(', ')}).`;
    } else {
      titleEl.textContent = 'My Dashboard';
      subEl.textContent = 'Your assigned leads and personal performance.';
    }
  }

  // Rep Leaderboard doesn't make sense as a "leaderboard of one" —
  // Sales Executives see their own numbers via the KPI cards instead.
  const leaderboardCard = document.getElementById('leaderboardTable')?.closest('.card');
  if (leaderboardCard) leaderboardCard.style.display = currentRole === 'SALES_EXEC' ? 'none' : '';
}

function refreshCurrentView() {
  const activePane = document.querySelector('.view-pane.active');
  const view = activePane ? activePane.id.replace('view-', '') : 'dashboard';
  navigateToView(NAV_ROLE_MAP[view]?.includes(currentRole) ? view : 'dashboard');
}

function initRoleSwitcher() {
  const select = document.getElementById('roleSwitcher');
  const nameEl = document.querySelector('.user-name');
  const roleEl = document.querySelector('.user-role');
  const avatars = document.querySelectorAll('.avatar, .topbar-avatar');
  if (!select) return;

  function applyIdentity() {
    const role = ROLES[currentRole];
    select.value = currentRole;
    nameEl.textContent = role.name;
    roleEl.textContent = role.label;
    avatars.forEach(a => { a.textContent = role.name.charAt(0); });
  }

  applyIdentity();
  applyRoleGating();

  select.addEventListener('change', () => {
    currentRole = select.value;
    localStorage.setItem('pipeline_role', currentRole);
    applyIdentity();
    applyRoleGating();
    refreshCurrentView();
    showToast(`Switched to ${ROLES[currentRole].label} view.`);
  });
}
function initNotifTopbarTrigger() {
  const notifBtn = document.getElementById('notifBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      // Switch view router to notifications view
      const navItem = document.querySelector('.nav-item[data-view="notifications"]');
      if (navItem) navItem.click();
    });
  }

  const clearAllBtn = document.getElementById('clearAllNotificationsBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Clear all notifications?')) {
        allNotifications = [];
        saveNotificationsToStorage();
        renderNotifications();
        showToast('All notifications cleared.');
      }
    });
  }
}

/* -----------------------------------------------------------
   Toast Alerts
   ----------------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/* -----------------------------------------------------------
   Export Leads to Excel/CSV
   ----------------------------------------------------------- */
function downloadLeadsExcel() {
  const searchVal = document.getElementById('leadsDirSearch').value.toLowerCase();
  const statusVal = document.getElementById('leadsDirStatusFilter').value;
  const sourceVal = document.getElementById('leadsDirSourceFilter').value;
  const sortVal = document.getElementById('leadsDirSortFilter').value;

  let filtered = getScopedLeads().filter(l => {
    const fullName = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchVal);
    const matchesStatus = !statusVal || l.status === statusVal;
    const matchesSource = !sourceVal || l.source === sourceVal;
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Sort matching current table view
  if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortVal === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortVal === 'score-desc') {
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortVal === 'score-asc') {
    filtered.sort((a, b) => (a.score || 0) - (b.score || 0));
  }

  // Define headers for the spreadsheet
  const headers = ['Lead ID', 'First Name', 'Last Name', 'Score', 'Source', 'Status', 'Owner', 'Created Date', 'Notes'];
  
  // Format each row
  const rows = filtered.map(l => {
    // Format dates to a readable local string
    let createdDateStr = '';
    if (l.createdAt) {
      try {
        createdDateStr = new Date(l.createdAt).toLocaleString();
      } catch (e) {
        createdDateStr = l.createdAt;
      }
    }
    
    // Safely wrap text containing commas, quotes, or newlines
    const escapeCsv = (val) => {
      if (val === undefined || val === null) return '';
      const strVal = String(val);
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n') || strVal.includes('\r')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    };

    return [
      escapeCsv(l.id),
      escapeCsv(l.firstName),
      escapeCsv(l.lastName),
      l.score !== undefined ? l.score : '',
      escapeCsv(l.source),
      escapeCsv(l.status),
      escapeCsv(l.owner || 'Unassigned'),
      escapeCsv(createdDateStr),
      escapeCsv(l.notes)
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\r\n');

  // Excel UTF-8 Byte Order Mark (BOM) to open cleanly in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pipeline_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(`Exported ${filtered.length} leads successfully.`);
}

/* -----------------------------------------------------------
   Init Application
   ----------------------------------------------------------- */
async function init() {
  // Load local or mock lists
  await loadInitialData();

  // Run systems
  initTheme();
  initRouter();
  initSearchAutoComplete();
  initModal();
  initSettingsActions();
  initIntegrationsToggles();
  initNotifTopbarTrigger();
  initGlobalEscapeHandler();
  initCampaigns();
  initRoleSwitcher();

  // Draw Dashboard Metrics
  recalculateAllData();
  renderNotifications();

  document.getElementById('collapseBtn').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const isMobileTablet = window.innerWidth <= 1279;
    if (isMobileTablet) {
      sidebar.classList.toggle('force-open');
      if (sidebar.classList.contains('force-open')) {
        sidebar.classList.remove('collapsed');
      } else {
        sidebar.classList.add('collapsed');
      }
    } else {
      sidebar.classList.toggle('collapsed');
      if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('force-open');
      } else {
        sidebar.classList.add('force-open');
      }
    }
  });

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });

  // Drawer overlays close
  document.getElementById('closeDrawerBtn').addEventListener('click', closeLeadDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeLeadDrawer);

  // Range Slider selector (informational)
  document.getElementById('rangeSelect').addEventListener('change', (e) => {
    showToast('Range filter updated: ' + e.target.options[e.target.selectedIndex].text);
  });

  // Dashboard filtering row
  document.getElementById('leadFilter').addEventListener('input', renderRecentLeadsTable);
  document.getElementById('statusFilter').addEventListener('change', renderRecentLeadsTable);

  // Leads directory filters
  document.getElementById('leadsDirSearch').addEventListener('input', renderLeadsDirectory);
  document.getElementById('leadsDirStatusFilter').addEventListener('change', renderLeadsDirectory);
  document.getElementById('leadsDirSourceFilter').addEventListener('change', renderLeadsDirectory);
  document.getElementById('leadsDirSortFilter').addEventListener('change', renderLeadsDirectory);

  // Leads directory download
  const downloadExcelBtn = document.getElementById('downloadExcelBtn');
  if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener('click', downloadLeadsExcel);
  }

  // Keyboard shortcut: ⌘K / Ctrl+K focuses search
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('globalSearch').focus();
    }
  });
}

init();
