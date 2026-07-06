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

  const filtered = allLeads.filter(l => {
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

  let filtered = allLeads.filter(l => {
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
        <button class="btn btn-secondary delete-lead-inline-btn" data-id="${l.id}" style="padding: 4px 8px; font-size: 11px;">Delete</button>
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
  renderKPIs(allLeads);
  renderFunnel(allLeads);
  renderDonut(allLeads);
  renderLeaderboard(allLeads);
  renderRecentLeadsTable();
  renderLeadsDirectory();
}

/* -----------------------------------------------------------
   Interactive Drawer (Lead Details View)
   ----------------------------------------------------------- */
function openLeadDrawer(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  const drawerContent = document.getElementById('drawerContent');
  const overlay = document.getElementById('drawerOverlay');
  const drawer = document.getElementById('leadDrawer');

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
        <select id="drawerOwnerField" class="filter-select w-100">
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
      <button class="btn btn-danger" id="drawerDeleteBtn" title="Delete Lead">🗑️</button>
    </div>
  `;

  // Bind edit events inside drawer
  document.getElementById('drawerSaveBtn').addEventListener('click', () => {
    const status = document.getElementById('drawerStatusField').value;
    const owner = document.getElementById('drawerOwnerField').value;
    const notes = document.getElementById('drawerNotesField').value;

    updateLead(lead.id, { status, owner, notes });
    closeLeadDrawer();
  });

  document.getElementById('drawerDeleteBtn').addEventListener('click', () => {
    if (confirm(`Are you sure you want to permanently delete lead ${lead.firstName} ${lead.lastName}?`)) {
      deleteLead(lead.id);
      closeLeadDrawer();
    }
  });

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

    const matches = allLeads.filter(l => {
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
function initRouter() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const view = item.dataset.view;

      // Close mobile navigation drawer if open
      document.getElementById('sidebar').classList.remove('mobile-open');

      // Hide all panes
      document.querySelectorAll('.view-pane').forEach(pane => {
        pane.classList.remove('active');
      });

      // Show selected pane
      const targetPane = document.getElementById(`view-${view}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // Special rendering hooks per view
      if (view === 'dashboard') {
        recalculateAllData();
      } else if (view === 'leads') {
        renderLeadsDirectory();
      } else if (view === 'notifications') {
        renderNotifications();
      }
    });
  });
}

/* -----------------------------------------------------------
   Notifications Panel triggers
   ----------------------------------------------------------- */
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

  // Draw Dashboard Metrics
  recalculateAllData();
  renderNotifications();

  // Sidebar controls
  document.getElementById('collapseBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
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

  // Keyboard shortcut: ⌘K / Ctrl+K focuses search
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('globalSearch').focus();
    }
  });
}

init();
