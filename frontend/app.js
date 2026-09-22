import './styles.css';

(function () {
  'use strict';

  // 1. Configuration & Global State
  const API_BASE_URL = window.VOTEX_API_BASE_URL || (window.location.port === '5173' ? '/api' : '');

  const state = {
    token: localStorage.getItem('votex_token') || null,
    user: null, // Populated via /user/profile
    view: 'dashboard', // 'dashboard' | 'about' | 'login' | 'signup' | 'ballot' | 'admin' | 'results' | 'profile'
    candidates: [],
    voteRecord: [],
    pendingVoteCandidate: null, // { id, name, party }
    pollTimer: null
  };

  // Helper selectors
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // 2. Safe API Fetcher
  async function api(path, options = {}) {
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };

    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // response might be empty or non-json
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  }

  // 3. UI Notification & Modal Helpers
  function showNotice(text, type = 'info', autoClearSeconds = 6) {
    const notice = $('#notice');
    if (!notice) return;
    notice.textContent = text;
    notice.className = `notice is-${type}`;
    notice.hidden = false;

    if (autoClearSeconds > 0) {
      setTimeout(() => {
        if (notice.textContent === text) {
          clearNotice();
        }
      }, autoClearSeconds * 1000);
    }
  }

  function clearNotice() {
    const notice = $('#notice');
    if (notice) notice.hidden = true;
  }

  function showModal({ title, message, confirmText = 'Confirm', onConfirm }) {
    const modalBackdrop = $('#app-modal');
    const modalTitle = $('#modal-title');
    const modalMessage = $('#modal-message');
    const confirmBtn = $('#modal-confirm-btn');
    const cancelBtn = $('#modal-cancel-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmBtn.textContent = confirmText;
    modalBackdrop.hidden = false;

    function cleanup() {
      modalBackdrop.hidden = true;
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      modalBackdrop.removeEventListener('click', handleBackdrop);
    }

    function handleConfirm() {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    }

    function handleCancel() {
      cleanup();
    }

    function handleBackdrop(e) {
      if (e.target === modalBackdrop) cleanup();
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    modalBackdrop.addEventListener('click', handleBackdrop);
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCandidateId(candidate) {
    return candidate.id || candidate._id;
  }

  // 4. Polling Lifecycle for Live Results
  function stopPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  function startPolling() {
    stopPolling();
    state.pollTimer = setInterval(async () => {
      if (state.view === 'dashboard' || state.view === 'results') {
        try {
          await loadVoteCounts();
          if (state.view === 'dashboard') {
            renderDashboardResults();
            updateMetrics();
          } else if (state.view === 'results') {
            renderFullResults();
          }
        } catch (e) {
          // Silent catch on background polling
        }
      }
    }, 15000); // 15 seconds live refresh
  }

  // 5. Data Fetchers
  async function loadCandidates() {
    try {
      const candidates = await api('/candidate');
      state.candidates = Array.isArray(candidates) ? candidates : [];
      return state.candidates;
    } catch (err) {
      console.error('Failed to load candidates:', err);
      showNotice('Unable to load candidates from database.', 'error');
      return [];
    }
  }

  async function loadVoteCounts() {
    try {
      const data = await api('/candidate/vote/count');
      state.voteRecord = data.voteRecord || [];
      return state.voteRecord;
    } catch (err) {
      console.error('Failed to load vote counts:', err);
      return [];
    }
  }

  // 5b. Complete User Session Clearance (DOM and State)
  function clearAllUserDetails() {
    state.user = null;
    state.token = null;
    state.pendingVoteCandidate = null;

    // 1. Clear Top Navigation Badge
    const userBadge = $('#user-badge');
    const roleLabel = $('#user-role-label');
    const nameLabel = $('#user-name-label');
    if (userBadge) {
      userBadge.hidden = true;
      userBadge.style.display = 'none';
    }
    if (roleLabel) {
      roleLabel.textContent = '';
      roleLabel.className = 'badge-role';
    }
    if (nameLabel) nameLabel.textContent = '';

    // 2. Clear Profile View Details
    const profileAvatar = $('#profile-avatar');
    const profileName = $('#profile-name');
    const profileRole = $('#profile-role');
    const profileVotedPill = $('#profile-voted-pill');
    const profileAadhar = $('#profile-aadhar');
    const profileAge = $('#profile-age');
    const profileEmail = $('#profile-email');
    const profileMobile = $('#profile-mobile');
    const profileAddress = $('#profile-address');
    const profileVotingStatus = $('#profile-voting-status');

    if (profileAvatar) profileAvatar.textContent = 'U';
    if (profileName) profileName.textContent = '';
    if (profileRole) profileRole.textContent = '';
    if (profileVotedPill) profileVotedPill.textContent = '';
    if (profileAadhar) profileAadhar.textContent = '';
    if (profileAge) profileAge.textContent = '';
    if (profileEmail) profileEmail.textContent = '';
    if (profileMobile) profileMobile.textContent = '';
    if (profileAddress) profileAddress.textContent = '';
    if (profileVotingStatus) profileVotingStatus.textContent = '';

    // 3. Clear Voter Ballot View
    const voterStatusBanner = $('#voter-status-banner');
    const ballotList = $('#ballot-candidate-list');
    const ballotCountBadge = $('#ballot-count-badge');
    if (voterStatusBanner) voterStatusBanner.innerHTML = '';
    if (ballotList) ballotList.innerHTML = '<div class="state-empty">Please sign in to access the active ballot.</div>';
    if (ballotCountBadge) ballotCountBadge.textContent = 'Candidates';

    // 4. Clear Admin Panel View
    const adminTbody = $('#admin-candidate-tbody');
    const formCandidate = $('#form-candidate');
    const adminCount = $('#admin-candidate-count');
    if (adminTbody) adminTbody.innerHTML = '<tr><td colspan="4" class="state-empty">Sign in as Administrator to manage candidates.</td></tr>';
    if (adminCount) adminCount.textContent = '0 total';
    if (formCandidate) {
      formCandidate.reset();
      const adminCandId = $('#admin-candidate-id');
      if (adminCandId) adminCandId.value = '';
    }

    // 5. Reset Authentication Forms
    const formLogin = $('#form-login');
    const formSignup = $('#form-signup');
    if (formLogin) formLogin.reset();
    if (formSignup) formSignup.reset();

    // 6. Reset Metrics
    const userStatusEl = $('#metric-user-status');
    if (userStatusEl) userStatusEl.textContent = 'Guest';

    // 7. Clear Pending Vote Banners
    const loginBanner = $('#login-pending-banner');
    const signupBanner = $('#signup-pending-banner');
    if (loginBanner) loginBanner.hidden = true;
    if (signupBanner) signupBanner.hidden = true;
  }

  async function loadUserProfile() {
    if (!state.token) {
      clearAllUserDetails();
      return null;
    }
    try {
      const data = await api('/user/profile');
      state.user = data.user || null;
      return state.user;
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('votex_token');
      clearAllUserDetails();
      return null;
    }
  }

  // 6. Navigation Bar & Role-Based Layout
  function renderNav() {
    const nav = $('#app-nav');
    const userBadge = $('#user-badge');
    const roleLabel = $('#user-role-label');
    const nameLabel = $('#user-name-label');

    if (!nav) return;

    if (!state.user) {
      // Unauthenticated Visitor / Guest
      if (userBadge) {
        userBadge.hidden = true;
        userBadge.style.display = 'none';
      }
      if (roleLabel) {
        roleLabel.textContent = '';
        roleLabel.className = 'badge-role';
      }
      if (nameLabel) nameLabel.textContent = '';

      nav.innerHTML = `
        <button class="nav-link ${state.view === 'dashboard' ? 'is-active' : ''}" data-nav="dashboard" type="button">Dashboard</button>
        <button class="nav-link ${state.view === 'results' ? 'is-active' : ''}" data-nav="results" type="button">Live Results</button>
        <button class="nav-link ${state.view === 'about' ? 'is-active' : ''}" data-nav="about" type="button">About Us</button>
        <button class="nav-link ${state.view === 'login' ? 'is-active' : ''}" data-nav="login" type="button">Sign In</button>
        <button class="nav-link btn-nav-accent ${state.view === 'signup' ? 'is-active' : ''}" data-nav="signup" type="button">Create Account</button>
      `;
    } else {
      // Logged in user
      if (userBadge) {
        userBadge.hidden = false;
        userBadge.style.display = 'inline-flex';
        const isAdmin = state.user.role === 'admin';
        roleLabel.textContent = isAdmin ? 'Admin' : 'Voter';
        roleLabel.className = `badge-role ${isAdmin ? 'admin-tag' : ''}`;
        nameLabel.textContent = state.user.name || 'User';
      }

      if (state.user.role === 'admin') {
        // Admin Navigation Layout
        nav.innerHTML = `
          <button class="nav-link ${state.view === 'dashboard' ? 'is-active' : ''}" data-nav="dashboard" type="button">Dashboard</button>
          <button class="nav-link ${state.view === 'admin' ? 'is-active' : ''}" data-nav="admin" type="button">Manage Candidates</button>
          <button class="nav-link ${state.view === 'results' ? 'is-active' : ''}" data-nav="results" type="button">Live Results</button>
          <button class="nav-link ${state.view === 'about' ? 'is-active' : ''}" data-nav="about" type="button">About Us</button>
          <button class="nav-link ${state.view === 'profile' ? 'is-active' : ''}" data-nav="profile" type="button">Profile</button>
          <button class="nav-link btn-nav-logout" data-action="logout" type="button">Sign Out</button>
        `;
      } else {
        // Normal Voter Navigation Layout
        nav.innerHTML = `
          <button class="nav-link ${state.view === 'dashboard' ? 'is-active' : ''}" data-nav="dashboard" type="button">Dashboard</button>
          <button class="nav-link ${state.view === 'ballot' ? 'is-active' : ''}" data-nav="ballot" type="button">Cast Ballot</button>
          <button class="nav-link ${state.view === 'results' ? 'is-active' : ''}" data-nav="results" type="button">Live Results</button>
          <button class="nav-link ${state.view === 'about' ? 'is-active' : ''}" data-nav="about" type="button">About Us</button>
          <button class="nav-link ${state.view === 'profile' ? 'is-active' : ''}" data-nav="profile" type="button">Profile</button>
          <button class="nav-link btn-nav-logout" data-action="logout" type="button">Sign Out</button>
        `;
      }
    }
  }

  // 7. View Switcher
  function switchView(targetView, preserveNotice = false) {
    if (!preserveNotice) clearNotice();

    // Guard role-protected routes
    if (targetView === 'admin' && (!state.user || state.user.role !== 'admin')) {
      targetView = 'dashboard';
      showNotice('Admin authorization required to access candidate management.', 'error');
    }
    if (targetView === 'ballot' && (!state.user || state.user.role !== 'voter')) {
      if (!state.user) {
        targetView = 'login';
        showNotice('Please sign in with your Aadhaar credentials to access your voter ballot.', 'info');
      } else {
        targetView = 'dashboard';
        showNotice('Administrators cannot access the voter ballot.', 'info');
      }
    }

    state.view = targetView;

    // Toggle panels
    const views = ['dashboard', 'results', 'about', 'login', 'signup', 'ballot', 'admin', 'profile'];
    views.forEach((v) => {
      const el = $(`#view-${v}`);
      if (el) el.hidden = (v !== targetView);
    });

    renderNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger View Lifecycle Logic
    if (targetView === 'dashboard') {
      renderDashboardView();
      startPolling();
    } else if (targetView === 'ballot') {
      stopPolling();
      renderBallotView();
    } else if (targetView === 'admin') {
      stopPolling();
      renderAdminView();
    } else if (targetView === 'results') {
      renderFullResultsView();
      startPolling();
    } else if (targetView === 'profile') {
      stopPolling();
      renderProfileView();
    } else if (targetView === 'login' || targetView === 'signup') {
      stopPolling();
      updatePendingVoteBanners();
    } else if (targetView === 'about') {
      stopPolling();
    }
  }

  function updatePendingVoteBanners() {
    const loginBanner = $('#login-pending-banner');
    const loginText = $('#login-pending-text');
    const signupBanner = $('#signup-pending-banner');
    const signupText = $('#signup-pending-text');

    if (state.pendingVoteCandidate) {
      const candName = state.pendingVoteCandidate.name;
      if (loginBanner) loginBanner.hidden = false;
      if (loginText) loginText.textContent = `Sign in with your 12-digit Aadhaar to cast your vote for ${candName}.`;
      if (signupBanner) signupBanner.hidden = false;
      if (signupText) signupText.textContent = `Register your Aadhaar account to cast your vote for ${candName}.`;
    } else {
      if (loginBanner) loginBanner.hidden = true;
      if (signupBanner) signupBanner.hidden = true;
    }
  }

  // 8. Render: Dashboard View
  async function renderDashboardView() {
    updateMetrics();

    // Parallel fetch candidates & live results
    await Promise.all([loadCandidates(), loadVoteCounts()]);

    renderDashboardCandidates();
    renderDashboardResults();
    updateMetrics();
  }

  function updateMetrics() {
    const candidateCountEl = $('#metric-candidate-count');
    const voteCountEl = $('#metric-vote-count');
    const userStatusEl = $('#metric-user-status');

    if (candidateCountEl) {
      candidateCountEl.textContent = state.candidates ? state.candidates.length : '--';
    }

    if (voteCountEl) {
      const totalVotes = (state.voteRecord || []).reduce((sum, item) => sum + Number(item.count || 0), 0);
      voteCountEl.textContent = totalVotes;
    }

    if (userStatusEl) {
      if (!state.user) {
        userStatusEl.textContent = 'Guest';
      } else if (state.user.role === 'admin') {
        userStatusEl.textContent = 'Admin';
      } else {
        userStatusEl.textContent = state.user.isVoted ? 'Voted' : 'Eligible';
      }
    }
  }

  function renderDashboardCandidates() {
    const container = $('#dashboard-candidate-list');
    if (!container) return;

    if (!state.candidates.length) {
      container.innerHTML = '<div class="state-empty">No candidates registered for this election yet.</div>';
      return;
    }

    container.innerHTML = state.candidates.map((c) => {
      const id = getCandidateId(c);
      const initials = (c.name || 'C').charAt(0).toUpperCase();

      let actionButtonHtml = '';
      if (!state.user) {
        // Guest user: Vote button redirects to Sign In
        actionButtonHtml = `
          <button class="btn btn-primary candidate-action" data-action="vote-as-guest" data-id="${escapeHTML(id)}" data-name="${escapeHTML(c.name)}" data-party="${escapeHTML(c.party)}" type="button">
            Vote for Candidate
          </button>
        `;
      } else if (state.user.role === 'admin') {
        // Admin: Observe only
        actionButtonHtml = `
          <button class="btn btn-outline candidate-action" disabled type="button">
            Admin Restricted
          </button>
        `;
      } else {
        // Normal Voter
        if (state.user.isVoted) {
          actionButtonHtml = `
            <button class="btn btn-outline candidate-action" disabled type="button">
              ✓ Vote Cast
            </button>
          `;
        } else {
          actionButtonHtml = `
            <button class="btn btn-primary candidate-action" data-action="cast-vote" data-id="${escapeHTML(id)}" data-name="${escapeHTML(c.name)}" type="button">
              Vote for Candidate
            </button>
          `;
        }
      }

      return `
        <article class="candidate-card">
          <div class="candidate-top">
            <div class="candidate-avatar" aria-hidden="true">${escapeHTML(initials)}</div>
            <div class="candidate-info">
              <h3 class="candidate-name">${escapeHTML(c.name)}</h3>
              <p class="candidate-party">${escapeHTML(c.party)}</p>
              <p class="candidate-meta">${escapeHTML(c.age)} years old</p>
            </div>
          </div>
          ${actionButtonHtml}
        </article>
      `;
    }).join('');
  }

  function renderDashboardResults() {
    const container = $('#dashboard-results-container');
    if (!container) return;

    const records = state.voteRecord || [];
    if (!records.length) {
      container.innerHTML = '<div class="state-empty">No votes recorded yet. Be the first to participate!</div>';
      return;
    }

    const total = records.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const max = Math.max(1, ...records.map((item) => Number(item.count || 0)));

    container.innerHTML = `
      <div class="results-summary-strip">
        <span><strong>${total}</strong> Total Verified Ballots</span>
        <span>${records.length} Parties Participating</span>
      </div>
      <div class="results-tally-list">
        ${records.map((item) => {
          const count = Number(item.count || 0);
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = Math.max(count > 0 ? 5 : 0, Math.round((count / max) * 100));

          return `
            <div class="tally-row">
              <div class="tally-meta">
                <span class="tally-party">${escapeHTML(item.party)}</span>
                <span class="tally-count">${count} votes (${percent}%)</span>
              </div>
              <div class="tally-bar-track">
                <div class="tally-bar-fill" style="width: ${barWidth}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 9. Render: Voter Ballot View
  async function renderBallotView() {
    const banner = $('#voter-status-banner');
    const container = $('#ballot-candidate-list');
    const badge = $('#ballot-count-badge');

    if (!state.user) {
      switchView('auth');
      return;
    }

    await loadCandidates();
    if (badge) badge.textContent = `${state.candidates.length} Candidates`;

    // Render Voter Status Banner
    if (banner) {
      if (state.user.isVoted) {
        banner.className = 'status-banner is-voted';
        banner.innerHTML = `
          <div>
            <strong>✓ Your Ballot Has Been Recorded</strong>
            <p style="font-size:0.85rem; margin-top:0.2rem;">You have fulfilled your civic participation in this election. Single-vote integrity is active.</p>
          </div>
        `;
      } else {
        banner.className = 'status-banner is-ready';
        banner.innerHTML = `
          <div>
            <strong>Your Ballot is Ready</strong>
            <p style="font-size:0.85rem; margin-top:0.2rem;">Select one candidate below to cast your ballot. Your choice is confidential and permanent once submitted.</p>
          </div>
        `;
      }
    }

    if (!state.candidates.length) {
      if (container) container.innerHTML = '<div class="state-empty">There are currently no candidates on the active ballot.</div>';
      return;
    }

    if (container) {
      container.innerHTML = state.candidates.map((c) => {
        const id = getCandidateId(c);
        const initials = (c.name || 'C').charAt(0).toUpperCase();
        const hasVoted = state.user.isVoted;

        return `
          <article class="candidate-card">
            <div class="candidate-top">
              <div class="candidate-avatar" aria-hidden="true">${escapeHTML(initials)}</div>
              <div class="candidate-info">
                <h3 class="candidate-name">${escapeHTML(c.name)}</h3>
                <p class="candidate-party">${escapeHTML(c.party)}</p>
                <p class="candidate-meta">${escapeHTML(c.age)} years old</p>
              </div>
            </div>
            <button 
              class="btn ${hasVoted ? 'btn-outline' : 'btn-primary'} candidate-action" 
              ${hasVoted ? 'disabled' : ''} 
              data-action="cast-vote" 
              data-id="${escapeHTML(id)}" 
              data-name="${escapeHTML(c.name)}" 
              type="button"
            >
              ${hasVoted ? 'Ballot Cast' : 'Vote for this Candidate'}
            </button>
          </article>
        `;
      }).join('');
    }
  }

  // 10. Render: Admin Management View
  async function renderAdminView() {
    if (!state.user || state.user.role !== 'admin') {
      switchView('dashboard');
      return;
    }

    await loadCandidates();
    renderAdminCandidateTable();
    resetAdminCandidateForm();
  }

  function renderAdminCandidateTable() {
    const tbody = $('#admin-candidate-tbody');
    const countBadge = $('#admin-candidate-count');

    if (countBadge) countBadge.textContent = `${state.candidates.length} total`;
    if (!tbody) return;

    if (!state.candidates.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="state-empty">No registered candidates. Add a candidate using the form.</td></tr>';
      return;
    }

    tbody.innerHTML = state.candidates.map((c) => {
      const id = getCandidateId(c);
      return `
        <tr>
          <td><strong>${escapeHTML(c.name)}</strong></td>
          <td>${escapeHTML(c.party)}</td>
          <td>${escapeHTML(c.age)}</td>
          <td class="text-right">
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" data-action="admin-edit-candidate" data-id="${escapeHTML(id)}" type="button">Edit</button>
              <button class="btn btn-danger btn-sm" data-action="admin-delete-candidate" data-id="${escapeHTML(id)}" data-name="${escapeHTML(c.name)}" type="button">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function resetAdminCandidateForm() {
    const form = $('#form-candidate');
    if (!form) return;
    form.reset();
    $('#admin-candidate-id').value = '';
    $('#admin-form-title').textContent = 'Add New Candidate';
    $('#btn-save-candidate').textContent = 'Add Candidate';
    $('#btn-cancel-candidate-edit').hidden = true;
  }

  function populateAdminEditForm(candidate) {
    if (!candidate) return;
    $('#admin-candidate-id').value = getCandidateId(candidate);
    $('#admin-candidate-name').value = candidate.name || '';
    $('#admin-candidate-party').value = candidate.party || '';
    $('#admin-candidate-age').value = candidate.age || '';

    $('#admin-form-title').textContent = 'Edit Candidate';
    $('#btn-save-candidate').textContent = 'Save Changes';
    $('#btn-cancel-candidate-edit').hidden = false;
    $('#admin-candidate-name').focus();
  }

  // 11. Render: Full Results View
  async function renderFullResultsView() {
    await loadVoteCounts();
    renderFullResults();
  }

  function renderFullResults() {
    const container = $('#full-results-container');
    if (!container) return;

    const records = state.voteRecord || [];
    if (!records.length) {
      container.innerHTML = '<div class="state-empty">No votes recorded yet in the election database.</div>';
      return;
    }

    const total = records.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const max = Math.max(1, ...records.map((item) => Number(item.count || 0)));

    container.innerHTML = `
      <div class="results-summary-strip" style="margin-bottom: 1.5rem;">
        <div>
          <span style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${total} Total Votes Cast</span>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.2rem;">Live data stream from election database</p>
        </div>
        <span class="live-pill"><span class="pulse-dot"></span> Live Sync Active</span>
      </div>
      <div class="results-tally-list" style="gap: 1.25rem;">
        ${records.map((item, idx) => {
          const count = Number(item.count || 0);
          const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          const barWidth = Math.max(count > 0 ? 5 : 0, Math.round((count / max) * 100));

          return `
            <div class="tally-row">
              <div class="tally-meta" style="font-size:0.95rem;">
                <span>
                  <strong style="color:var(--text-primary);">${idx + 1}. ${escapeHTML(item.party)}</strong>
                  ${idx === 0 && count > 0 ? '<span class="badge-role" style="background:#059669; font-size:0.68rem; margin-left:0.4rem;">Leading</span>' : ''}
                </span>
                <span class="tally-count" style="font-size:1rem;"><strong>${count}</strong> votes (${percent}%)</span>
              </div>
              <div class="tally-bar-track" style="height:10px;">
                <div class="tally-bar-fill" style="width: ${barWidth}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 12. Render: Profile View
  function renderProfileView() {
    if (!state.user) {
      switchView('auth');
      return;
    }

    const u = state.user;
    const initials = (u.name || 'U').charAt(0).toUpperCase();

    $('#profile-avatar').textContent = initials;
    $('#profile-name').textContent = u.name || 'Registered User';

    const isAdmin = u.role === 'admin';
    const rolePill = $('#profile-role');
    rolePill.textContent = isAdmin ? 'Admin' : 'Voter';
    rolePill.className = `badge-role ${isAdmin ? 'admin-tag' : ''}`;

    const votedPill = $('#profile-voted-pill');
    if (isAdmin) {
      votedPill.textContent = 'Admin Restrained';
      votedPill.className = 'badge-status not-voted';
    } else {
      votedPill.textContent = u.isVoted ? '✓ Vote Cast' : 'Ballot Pending';
      votedPill.className = `badge-status ${u.isVoted ? 'voted' : 'not-voted'}`;
    }

    $('#profile-aadhar').textContent = u.aadharCardNumber ? `•••• •••• ${String(u.aadharCardNumber).slice(-4)}` : 'N/A';
    $('#profile-age').textContent = u.age ? `${u.age} years` : 'N/A';
    $('#profile-email').textContent = u.email || 'Not provided';
    $('#profile-mobile').textContent = u.mobile || 'Not provided';
    $('#profile-address').textContent = u.address || 'N/A';

    const votingStatus = $('#profile-voting-status');
    if (isAdmin) {
      votingStatus.textContent = 'Administrator accounts do not participate in ballot casting to preserve neutrality.';
    } else if (u.isVoted) {
      votingStatus.innerHTML = '<span style="color:var(--success); font-weight:600;">✓ Ballot Submitted and Verified</span> (One-vote integrity locked)';
    } else {
      votingStatus.innerHTML = '<span style="color:var(--accent); font-weight:600;">Eligible to vote</span>. You can cast your ballot at any time.';
    }
  }

  // 14. Action Handlers: Voting Workflow
  function initiateVote(candidateId, candidateName) {
    if (!state.user) {
      // User is not authenticated -> redirect to Sign In
      state.pendingVoteCandidate = { id: candidateId, name: candidateName };
      switchView('login');
      showNotice(`Please sign in with your 12-digit Aadhaar to cast your vote for ${candidateName}.`, 'info', 8);
      return;
    }

    // User is authenticated
    if (state.user.role === 'admin') {
      showNotice('Administrator accounts are not permitted to cast votes in elections.', 'error');
      return;
    }

    if (state.user.isVoted) {
      showNotice('You have already submitted your ballot for this election.', 'info');
      return;
    }

    // Prompt Confirmation
    showModal({
      title: 'Confirm Ballot Submission',
      message: `Are you sure you want to cast your permanent vote for ${candidateName}? Once confirmed, your ballot cannot be altered or retracted.`,
      confirmText: 'Submit Ballot',
      onConfirm: async () => {
        await executeVote(candidateId, candidateName);
      }
    });
  }

  async function executeVote(candidateId, candidateName) {
    try {
      const result = await api(`/candidate/vote/${candidateId}`, { method: 'POST' });
      state.user.isVoted = true;
      state.pendingVoteCandidate = null;

      showNotice(`✓ Your vote for ${candidateName} was recorded successfully!`, 'success', 8);

      // Refresh data and render
      await Promise.all([loadCandidates(), loadVoteCounts()]);
      if (state.view === 'ballot') {
        renderBallotView();
      } else if (state.view === 'dashboard') {
        renderDashboardView();
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
      if (/already voted/i.test(err.message)) {
        state.user.isVoted = true;
        showNotice('Your ballot has already been submitted for this election.', 'info');
      } else {
        showNotice(err.message || 'Unable to submit vote. Please try again.', 'error');
      }
      if (state.view === 'ballot') renderBallotView();
    }
  }

  // 15. Form Submissions
  async function handleLoginSubmit(e) {
    e.preventDefault();
    clearNotice();

    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');
    const aadhar = form.aadharCardNumber.value.trim();
    const password = form.password.value;

    if (!/^\d{12}$/.test(aadhar)) {
      showNotice('Aadhaar number must contain exactly 12 numeric digits.', 'error');
      return;
    }

    if (!password) {
      showNotice('Password is required.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    try {
      const data = await api('/user/login', {
        method: 'POST',
        body: JSON.stringify({ aadharCardNumber: aadhar, password })
      });

      if (!data.token) throw new Error('Authentication token not received.');

      state.token = data.token;
      localStorage.setItem('votex_token', data.token);

      await loadUserProfile();
      showNotice(`Welcome back, ${state.user.name}!`, 'success', 5);

      // Check if user has pending vote
      if (state.pendingVoteCandidate && state.user.role === 'voter' && !state.user.isVoted) {
        const targetCandidate = state.pendingVoteCandidate;
        switchView('ballot');
        initiateVote(targetCandidate.id, targetCandidate.name);
      } else {
        switchView('dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      showNotice(err.message || 'Invalid Aadhaar number or password. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to VoteX';
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    clearNotice();

    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');

    const name = form.name.value.trim();
    const age = Number(form.age.value);
    const aadhar = form.aadharCardNumber.value.trim();
    const role = form.role.value;
    const address = form.address.value.trim();
    const email = form.email.value.trim();
    const mobile = form.mobile.value.trim();
    const password = form.password.value;

    if (!name) return showNotice('Full name is required.', 'error');
    if (!age || age < 18) return showNotice('Eligible voting age must be 18 years or older.', 'error');
    if (!/^\d{12}$/.test(aadhar)) return showNotice('Aadhaar number must contain exactly 12 numeric digits.', 'error');
    if (!address) return showNotice('Residential address is required.', 'error');
    if (!password || password.length < 4) return showNotice('Password must be at least 4 characters long.', 'error');

    const payload = {
      name,
      age,
      aadharCardNumber: aadhar,
      role,
      address,
      password
    };
    if (email) payload.email = email;
    if (mobile) payload.mobile = mobile;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    try {
      const data = await api('/user/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.token) {
        state.token = data.token;
        localStorage.setItem('votex_token', data.token);
      }

      await loadUserProfile();
      showNotice('Your VoteX account has been registered successfully!', 'success', 6);

      if (state.pendingVoteCandidate && state.user && state.user.role === 'voter' && !state.user.isVoted) {
        const targetCandidate = state.pendingVoteCandidate;
        switchView('ballot');
        initiateVote(targetCandidate.id, targetCandidate.name);
      } else {
        switchView('dashboard');
      }
    } catch (err) {
      console.error('Signup failed:', err);
      showNotice(err.message || 'Unable to register account. Please verify your details.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }

  async function handleCandidateFormSubmit(e) {
    e.preventDefault();
    clearNotice();

    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');
    const id = $('#admin-candidate-id').value;
    const name = form.name.value.trim();
    const party = form.party.value.trim();
    const age = Number(form.age.value);

    if (!name) return showNotice('Candidate name is required.', 'error');
    if (!party) return showNotice('Party affiliation is required.', 'error');
    if (!age || age < 25) return showNotice('Candidate must meet minimum age criteria (25+).', 'error');

    const payload = { name, party, age };
    submitBtn.disabled = true;

    try {
      if (id) {
        // Update Candidate
        await api(`/candidate/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showNotice(`Candidate "${name}" has been updated successfully.`, 'success');
      } else {
        // Add Candidate
        await api('/candidate', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showNotice(`Candidate "${name}" has been added to the ballot.`, 'success');
      }

      resetAdminCandidateForm();
      await loadCandidates();
      renderAdminCandidateTable();
    } catch (err) {
      console.error('Candidate save failed:', err);
      showNotice(err.message || 'Failed to save candidate. Verify admin permissions.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  }

  // 16. Event Delegation
  document.addEventListener('click', async (e) => {
    // 1. Navigation switching
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      const view = navBtn.dataset.nav;
      switchView(view);
      return;
    }

    // 2. Action buttons
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;

    if (action === 'nav-dashboard') {
      switchView('dashboard');
    } else if (action === 'open-login') {
      switchView('login');
    } else if (action === 'open-signup') {
      switchView('signup');
    } else if (action === 'logout') {
      localStorage.removeItem('votex_token');
      clearAllUserDetails();
      showNotice('You have been signed out. All user details have been cleared.', 'info', 5);
      switchView('dashboard', true);
    } else if (action === 'vote-as-guest') {
      const id = actionBtn.dataset.id;
      const name = actionBtn.dataset.name;
      initiateVote(id, name);
    } else if (action === 'cast-vote') {
      const id = actionBtn.dataset.id;
      const name = actionBtn.dataset.name;
      initiateVote(id, name);
    } else if (action === 'admin-edit-candidate') {
      const id = actionBtn.dataset.id;
      const candidate = state.candidates.find((c) => getCandidateId(c) === id);
      if (candidate) {
        populateAdminEditForm(candidate);
      }
    } else if (action === 'admin-delete-candidate') {
      const id = actionBtn.dataset.id;
      const name = actionBtn.dataset.name;
      showModal({
        title: 'Delete Candidate',
        message: `Are you sure you want to remove candidate "${name}" from the active election ballot? This action cannot be undone.`,
        confirmText: 'Delete Candidate',
        onConfirm: async () => {
          try {
            await api(`/candidate/${id}`, { method: 'DELETE' });
            showNotice(`Candidate "${name}" was successfully deleted.`, 'success');
            await loadCandidates();
            renderAdminCandidateTable();
          } catch (err) {
            showNotice(err.message || 'Unable to delete candidate.', 'error');
          }
        }
      });
    }
  });

  // Refresh Buttons
  const btnRefreshCandidates = $('#btn-refresh-candidates');
  if (btnRefreshCandidates) {
    btnRefreshCandidates.addEventListener('click', async () => {
      await loadCandidates();
      renderDashboardCandidates();
      updateMetrics();
      showNotice('Candidates list updated.', 'info', 3);
    });
  }

  const btnRefreshFullResults = $('#btn-refresh-full-results');
  if (btnRefreshFullResults) {
    btnRefreshFullResults.addEventListener('click', async () => {
      await loadVoteCounts();
      renderFullResults();
      showNotice('Vote results refreshed.', 'info', 3);
    });
  }

  const btnCancelCandidateEdit = $('#btn-cancel-candidate-edit');
  if (btnCancelCandidateEdit) {
    btnCancelCandidateEdit.addEventListener('click', () => {
      resetAdminCandidateForm();
    });
  }

  // Attach Form Submit Listeners
  const formLogin = $('#form-login');
  if (formLogin) formLogin.addEventListener('submit', handleLoginSubmit);

  const formSignup = $('#form-signup');
  if (formSignup) formSignup.addEventListener('submit', handleSignupSubmit);

  const formCandidate = $('#form-candidate');
  if (formCandidate) formCandidate.addEventListener('submit', handleCandidateFormSubmit);

  // 17. Application Initialization
  async function init() {
    // Attempt session restore
    if (state.token) {
      await loadUserProfile();
    } else {
      clearAllUserDetails();
    }
    // Start at default view
    switchView('dashboard');
  }

  init();
})();
