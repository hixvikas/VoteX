(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))p(d);new MutationObserver(d=>{for(const u of d)if(u.type==="childList")for(const $ of u.addedNodes)$.tagName==="LINK"&&$.rel==="modulepreload"&&p($)}).observe(document,{childList:!0,subtree:!0});function i(d){const u={};return d.integrity&&(u.integrity=d.integrity),d.referrerPolicy&&(u.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?u.credentials="include":d.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function p(d){if(d.ep)return;d.ep=!0;const u=i(d);fetch(d.href,u)}})();(function(){const R=window.VOTEX_API_BASE_URL||(window.location.port==="5173"?"/api":""),e={token:localStorage.getItem("votex_token")||null,user:null,view:"dashboard",candidates:[],voteRecord:[],pendingVoteCandidate:null,pollTimer:null},i=t=>document.querySelector(t);async function p(t,a={}){const n={...a.body?{"Content-Type":"application/json"}:{},...a.headers||{}};e.token&&(n.Authorization=`Bearer ${e.token}`);const s=await fetch(`${R}${t}`,{...a,headers:n});let o={};try{o=await s.json()}catch{}if(!s.ok){const r=o.message||o.error||`HTTP Error ${s.status}`;throw new Error(r)}return o}function d(t,a="info",n=6){const s=i("#notice");s&&(s.textContent=t,s.className=`notice is-${a}`,s.hidden=!1,n>0&&setTimeout(()=>{s.textContent===t&&u()},n*1e3))}function u(){const t=i("#notice");t&&(t.hidden=!0)}function $({title:t,message:a,confirmText:n="Confirm",onConfirm:s}){const o=i("#app-modal"),r=i("#modal-title"),l=i("#modal-message"),m=i("#modal-confirm-btn"),b=i("#modal-cancel-btn");r.textContent=t,l.textContent=a,m.textContent=n,o.hidden=!1;function g(){o.hidden=!0,m.removeEventListener("click",h),b.removeEventListener("click",y),o.removeEventListener("click",v)}function h(){g(),typeof s=="function"&&s()}function y(){g()}function v(w){w.target===o&&g()}m.addEventListener("click",h),b.addEventListener("click",y),o.addEventListener("click",v)}function c(t){return t==null?"":String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function L(t){return t.id||t._id}function x(){e.pollTimer&&(clearInterval(e.pollTimer),e.pollTimer=null)}function H(){x(),e.pollTimer=setInterval(async()=>{if(e.view==="dashboard"||e.view==="results")try{await A(),e.view==="dashboard"?(D(),T()):e.view==="results"&&M()}catch{}},15e3)}async function C(){try{const t=await p("/candidate");return e.candidates=Array.isArray(t)?t:[],e.candidates}catch(t){return console.error("Failed to load candidates:",t),d("Unable to load candidates from database.","error"),[]}}async function A(){try{const t=await p("/candidate/vote/count");return e.voteRecord=t.voteRecord||[],e.voteRecord}catch(t){return console.error("Failed to load vote counts:",t),[]}}function S(){e.user=null,e.token=null,e.pendingVoteCandidate=null;const t=i("#user-badge"),a=i("#user-role-label"),n=i("#user-name-label");t&&(t.hidden=!0,t.style.display="none"),a&&(a.textContent="",a.className="badge-role"),n&&(n.textContent="");const s=i("#profile-avatar"),o=i("#profile-name"),r=i("#profile-role"),l=i("#profile-voted-pill"),m=i("#profile-aadhar"),b=i("#profile-age"),g=i("#profile-email"),h=i("#profile-mobile"),y=i("#profile-address"),v=i("#profile-voting-status");s&&(s.textContent="U"),o&&(o.textContent=""),r&&(r.textContent=""),l&&(l.textContent=""),m&&(m.textContent=""),b&&(b.textContent=""),g&&(g.textContent=""),h&&(h.textContent=""),y&&(y.textContent=""),v&&(v.textContent="");const w=i("#voter-status-banner"),W=i("#ballot-candidate-list"),J=i("#ballot-count-badge");w&&(w.innerHTML=""),W&&(W.innerHTML='<div class="state-empty">Please sign in to access the active ballot.</div>'),J&&(J.textContent="Candidates");const G=i("#admin-candidate-tbody"),K=i("#form-candidate"),Q=i("#admin-candidate-count");if(G&&(G.innerHTML='<tr><td colspan="4" class="state-empty">Sign in as Administrator to manage candidates.</td></tr>'),Q&&(Q.textContent="0 total"),K){K.reset();const it=i("#admin-candidate-id");it&&(it.value="")}const Z=i("#form-login"),tt=i("#form-signup");Z&&Z.reset(),tt&&tt.reset();const et=i("#metric-user-status");et&&(et.textContent="Guest");const at=i("#login-pending-banner"),nt=i("#signup-pending-banner");at&&(at.hidden=!0),nt&&(nt.hidden=!0)}async function V(){if(!e.token)return S(),null;try{const t=await p("/user/profile");return e.user=t.user||null,e.user}catch(t){return console.warn("Session expired or invalid token:",t),localStorage.removeItem("votex_token"),S(),null}}function ot(){const t=i("#app-nav"),a=i("#user-badge"),n=i("#user-role-label"),s=i("#user-name-label");if(t)if(!e.user)a&&(a.hidden=!0,a.style.display="none"),n&&(n.textContent="",n.className="badge-role"),s&&(s.textContent=""),t.innerHTML=`
        <button class="nav-link ${e.view==="dashboard"?"is-active":""}" data-nav="dashboard" type="button">Dashboard</button>
        <button class="nav-link ${e.view==="results"?"is-active":""}" data-nav="results" type="button">Live Results</button>
        <button class="nav-link ${e.view==="about"?"is-active":""}" data-nav="about" type="button">About Us</button>
        <button class="nav-link ${e.view==="login"?"is-active":""}" data-nav="login" type="button">Sign In</button>
        <button class="nav-link btn-nav-accent ${e.view==="signup"?"is-active":""}" data-nav="signup" type="button">Create Account</button>
      `;else{if(a){a.hidden=!1,a.style.display="inline-flex";const o=e.user.role==="admin";n.textContent=o?"Admin":"Voter",n.className=`badge-role ${o?"admin-tag":""}`,s.textContent=e.user.name||"User"}e.user.role==="admin"?t.innerHTML=`
          <button class="nav-link ${e.view==="dashboard"?"is-active":""}" data-nav="dashboard" type="button">Dashboard</button>
          <button class="nav-link ${e.view==="admin"?"is-active":""}" data-nav="admin" type="button">Manage Candidates</button>
          <button class="nav-link ${e.view==="results"?"is-active":""}" data-nav="results" type="button">Live Results</button>
          <button class="nav-link ${e.view==="about"?"is-active":""}" data-nav="about" type="button">About Us</button>
          <button class="nav-link ${e.view==="profile"?"is-active":""}" data-nav="profile" type="button">Profile</button>
          <button class="nav-link btn-nav-logout" data-action="logout" type="button">Sign Out</button>
        `:t.innerHTML=`
          <button class="nav-link ${e.view==="dashboard"?"is-active":""}" data-nav="dashboard" type="button">Dashboard</button>
          <button class="nav-link ${e.view==="ballot"?"is-active":""}" data-nav="ballot" type="button">Cast Ballot</button>
          <button class="nav-link ${e.view==="results"?"is-active":""}" data-nav="results" type="button">Live Results</button>
          <button class="nav-link ${e.view==="about"?"is-active":""}" data-nav="about" type="button">About Us</button>
          <button class="nav-link ${e.view==="profile"?"is-active":""}" data-nav="profile" type="button">Profile</button>
          <button class="nav-link btn-nav-logout" data-action="logout" type="button">Sign Out</button>
        `}}const O={dashboard:"/dashboard",about:"/about",profile:"/profile",login:"/signin",signup:"/signup",ballot:"/ballot",admin:"/admin",results:"/results"},U={dashboard:"VoteX — Official Civic Voting System",about:"VoteX — About Our Authentic Election Node",profile:"VoteX — Voter Profile",login:"VoteX — Sign In",signup:"VoteX — Create Account",ballot:"VoteX — Cast Ballot",admin:"VoteX — Manage Candidates",results:"VoteX — Live Election Results"};function E(t,a=""){const n=(t||"").replace(/^\/+|\/+$/g,"").toLowerCase(),s=(a||"").replace(/^#\/?/,"").toLowerCase();switch(n||s){case"about":case"about-us":return"about";case"profile":case"user-profile":return"profile";case"signin":case"login":return"login";case"signup":case"register":return"signup";case"ballot":case"vote":return"ballot";case"admin":case"candidates":return"admin";case"results":case"live-results":return"results";default:return"dashboard"}}function f(t,a=!1,n=!0){if(a||u(),t==="admin"&&(!e.user||e.user.role!=="admin")&&(t="dashboard",d("Admin authorization required to access candidate management.","error")),t==="ballot"&&(!e.user||e.user.role!=="voter")&&(e.user?(t="dashboard",d("Administrators cannot access the voter ballot.","info")):(t="login",d("Please sign in with your Aadhaar credentials to access your voter ballot.","info"))),t==="profile"&&!e.user&&(t="login",d("Please sign in to access your voter profile.","info")),e.view=t,["dashboard","results","about","login","signup","ballot","admin","profile"].forEach(o=>{const r=i(`#view-${o}`);r&&(r.hidden=o!==t)}),ot(),window.scrollTo({top:0,behavior:"smooth"}),U[t]&&(document.title=U[t]),n){const o=O[t]||"/dashboard";if(window.location.pathname!==o)try{window.history.pushState({view:t},"",o)}catch{window.location.hash=o}}t==="dashboard"?(I(),H()):t==="ballot"?(x(),N()):t==="admin"?(x(),rt()):t==="results"?(lt(),H()):t==="profile"?(x(),ct()):t==="login"||t==="signup"?(x(),st()):t==="about"&&x()}function st(){const t=i("#login-pending-banner"),a=i("#login-pending-text"),n=i("#signup-pending-banner"),s=i("#signup-pending-text");if(e.pendingVoteCandidate){const o=e.pendingVoteCandidate.name;t&&(t.hidden=!1),a&&(a.textContent=`Sign in with your 12-digit Aadhaar to cast your vote for ${o}.`),n&&(n.hidden=!1),s&&(s.textContent=`Register your Aadhaar account to cast your vote for ${o}.`)}else t&&(t.hidden=!0),n&&(n.hidden=!0)}async function I(){T(),await Promise.all([C(),A()]),F(),D(),T()}function T(){const t=i("#metric-candidate-count"),a=i("#metric-vote-count"),n=i("#metric-user-status");if(t&&(t.textContent=e.candidates?e.candidates.length:"--"),a){const s=(e.voteRecord||[]).reduce((o,r)=>o+Number(r.count||0),0);a.textContent=s}n&&(e.user?e.user.role==="admin"?n.textContent="Admin":n.textContent=e.user.isVoted?"Voted":"Eligible":n.textContent="Guest")}function F(){const t=i("#dashboard-candidate-list");if(t){if(!e.candidates.length){t.innerHTML='<div class="state-empty">No candidates registered for this election yet.</div>';return}t.innerHTML=e.candidates.map(a=>{const n=L(a),s=(a.name||"C").charAt(0).toUpperCase();let o="";return e.user?e.user.role==="admin"?o=`
          <button class="btn btn-outline candidate-action" disabled type="button">
            Admin Restricted
          </button>
        `:e.user.isVoted?o=`
            <button class="btn btn-outline candidate-action" disabled type="button">
              ✓ Vote Cast
            </button>
          `:o=`
            <button class="btn btn-primary candidate-action" data-action="cast-vote" data-id="${c(n)}" data-name="${c(a.name)}" type="button">
              Vote for Candidate
            </button>
          `:o=`
          <button class="btn btn-primary candidate-action" data-action="vote-as-guest" data-id="${c(n)}" data-name="${c(a.name)}" data-party="${c(a.party)}" type="button">
            Vote for Candidate
          </button>
        `,`
        <article class="candidate-card">
          <div class="candidate-top">
            <div class="candidate-avatar" aria-hidden="true">${c(s)}</div>
            <div class="candidate-info">
              <h3 class="candidate-name">${c(a.name)}</h3>
              <p class="candidate-party">${c(a.party)}</p>
              <p class="candidate-meta">${c(a.age)} years old</p>
            </div>
          </div>
          ${o}
        </article>
      `}).join("")}}function D(){const t=i("#dashboard-results-container");if(!t)return;const a=e.voteRecord||[];if(!a.length){t.innerHTML='<div class="state-empty">No votes recorded yet. Be the first to participate!</div>';return}const n=a.reduce((o,r)=>o+Number(r.count||0),0),s=Math.max(1,...a.map(o=>Number(o.count||0)));t.innerHTML=`
      <div class="results-summary-strip">
        <span><strong>${n}</strong> Total Verified Ballots</span>
        <span>${a.length} Parties Participating</span>
      </div>
      <div class="results-tally-list">
        ${a.map(o=>{const r=Number(o.count||0),l=n>0?Math.round(r/n*100):0,m=Math.max(r>0?5:0,Math.round(r/s*100));return`
            <div class="tally-row">
              <div class="tally-meta">
                <span class="tally-party">${c(o.party)}</span>
                <span class="tally-count">${r} votes (${l}%)</span>
              </div>
              <div class="tally-bar-track">
                <div class="tally-bar-fill" style="width: ${m}%;"></div>
              </div>
            </div>
          `}).join("")}
      </div>
    `}async function N(){const t=i("#voter-status-banner"),a=i("#ballot-candidate-list"),n=i("#ballot-count-badge");if(!e.user){f("login");return}if(await C(),n&&(n.textContent=`${e.candidates.length} Candidates`),t&&(e.user.isVoted?(t.className="status-banner is-voted",t.innerHTML=`
          <div>
            <strong>✓ Your Ballot Has Been Recorded</strong>
            <p style="font-size:0.85rem; margin-top:0.2rem;">You have fulfilled your civic participation in this election. Single-vote integrity is active.</p>
          </div>
        `):(t.className="status-banner is-ready",t.innerHTML=`
          <div>
            <strong>Your Ballot is Ready</strong>
            <p style="font-size:0.85rem; margin-top:0.2rem;">Select one candidate below to cast your ballot. Your choice is confidential and permanent once submitted.</p>
          </div>
        `)),!e.candidates.length){a&&(a.innerHTML='<div class="state-empty">There are currently no candidates on the active ballot.</div>');return}a&&(a.innerHTML=e.candidates.map(s=>{const o=L(s),r=(s.name||"C").charAt(0).toUpperCase(),l=e.user.isVoted;return`
          <article class="candidate-card">
            <div class="candidate-top">
              <div class="candidate-avatar" aria-hidden="true">${c(r)}</div>
              <div class="candidate-info">
                <h3 class="candidate-name">${c(s.name)}</h3>
                <p class="candidate-party">${c(s.party)}</p>
                <p class="candidate-meta">${c(s.age)} years old</p>
              </div>
            </div>
            <button 
              class="btn ${l?"btn-outline":"btn-primary"} candidate-action" 
              ${l?"disabled":""} 
              data-action="cast-vote" 
              data-id="${c(o)}" 
              data-name="${c(s.name)}" 
              type="button"
            >
              ${l?"Ballot Cast":"Vote for this Candidate"}
            </button>
          </article>
        `}).join(""))}async function rt(){if(!e.user||e.user.role!=="admin"){f("dashboard");return}await C(),P(),B()}function P(){const t=i("#admin-candidate-tbody"),a=i("#admin-candidate-count");if(a&&(a.textContent=`${e.candidates.length} total`),!!t){if(!e.candidates.length){t.innerHTML='<tr><td colspan="4" class="state-empty">No registered candidates. Add a candidate using the form.</td></tr>';return}t.innerHTML=e.candidates.map(n=>{const s=L(n);return`
        <tr>
          <td><strong>${c(n.name)}</strong></td>
          <td>${c(n.party)}</td>
          <td>${c(n.age)}</td>
          <td class="text-right">
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" data-action="admin-edit-candidate" data-id="${c(s)}" type="button">Edit</button>
              <button class="btn btn-danger btn-sm" data-action="admin-delete-candidate" data-id="${c(s)}" data-name="${c(n.name)}" type="button">Delete</button>
            </div>
          </td>
        </tr>
      `}).join("")}}function B(){const t=i("#form-candidate");t&&(t.reset(),i("#admin-candidate-id").value="",i("#admin-form-title").textContent="Add New Candidate",i("#btn-save-candidate").textContent="Add Candidate",i("#btn-cancel-candidate-edit").hidden=!0)}function dt(t){t&&(i("#admin-candidate-id").value=L(t),i("#admin-candidate-name").value=t.name||"",i("#admin-candidate-party").value=t.party||"",i("#admin-candidate-age").value=t.age||"",i("#admin-form-title").textContent="Edit Candidate",i("#btn-save-candidate").textContent="Save Changes",i("#btn-cancel-candidate-edit").hidden=!1,i("#admin-candidate-name").focus())}async function lt(){await A(),M()}function M(){const t=i("#full-results-container");if(!t)return;const a=e.voteRecord||[];if(!a.length){t.innerHTML='<div class="state-empty">No votes recorded yet in the election database.</div>';return}const n=a.reduce((o,r)=>o+Number(r.count||0),0),s=Math.max(1,...a.map(o=>Number(o.count||0)));t.innerHTML=`
      <div class="results-summary-strip" style="margin-bottom: 1.5rem;">
        <div>
          <span style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${n} Total Votes Cast</span>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.2rem;">Live data stream from election database</p>
        </div>
        <span class="live-pill"><span class="pulse-dot"></span> Live Sync Active</span>
      </div>
      <div class="results-tally-list" style="gap: 1.25rem;">
        ${a.map((o,r)=>{const l=Number(o.count||0),m=n>0?(l/n*100).toFixed(1):"0.0",b=Math.max(l>0?5:0,Math.round(l/s*100));return`
            <div class="tally-row">
              <div class="tally-meta" style="font-size:0.95rem;">
                <span>
                  <strong style="color:var(--text-primary);">${r+1}. ${c(o.party)}</strong>
                  ${r===0&&l>0?'<span class="badge-role" style="background:#059669; font-size:0.68rem; margin-left:0.4rem;">Leading</span>':""}
                </span>
                <span class="tally-count" style="font-size:1rem;"><strong>${l}</strong> votes (${m}%)</span>
              </div>
              <div class="tally-bar-track" style="height:10px;">
                <div class="tally-bar-fill" style="width: ${b}%;"></div>
              </div>
            </div>
          `}).join("")}
      </div>
    `}function ct(){if(!e.user){f("login");return}const t=e.user,a=(t.name||"U").charAt(0).toUpperCase();i("#profile-avatar").textContent=a,i("#profile-name").textContent=t.name||"Registered User";const n=t.role==="admin",s=i("#profile-role");s.textContent=n?"Admin":"Voter",s.className=`badge-role ${n?"admin-tag":""}`;const o=i("#profile-voted-pill");n?(o.textContent="Admin Restrained",o.className="badge-status not-voted"):(o.textContent=t.isVoted?"✓ Vote Cast":"Ballot Pending",o.className=`badge-status ${t.isVoted?"voted":"not-voted"}`),i("#profile-aadhar").textContent=t.aadharCardNumber?`•••• •••• ${String(t.aadharCardNumber).slice(-4)}`:"N/A",i("#profile-age").textContent=t.age?`${t.age} years`:"N/A",i("#profile-email").textContent=t.email||"Not provided",i("#profile-mobile").textContent=t.mobile||"Not provided",i("#profile-address").textContent=t.address||"N/A";const r=i("#profile-voting-status");n?r.textContent="Administrator accounts do not participate in ballot casting to preserve neutrality.":t.isVoted?r.innerHTML='<span style="color:var(--success); font-weight:600;">✓ Ballot Submitted and Verified</span> (One-vote integrity locked)':r.innerHTML='<span style="color:var(--accent); font-weight:600;">Eligible to vote</span>. You can cast your ballot at any time.'}function k(t,a){if(!e.user){e.pendingVoteCandidate={id:t,name:a},f("login"),d(`Please sign in with your 12-digit Aadhaar to cast your vote for ${a}.`,"info",8);return}if(e.user.role==="admin"){d("Administrator accounts are not permitted to cast votes in elections.","error");return}if(e.user.isVoted){d("You have already submitted your ballot for this election.","info");return}$({title:"Confirm Ballot Submission",message:`Are you sure you want to cast your permanent vote for ${a}? Once confirmed, your ballot cannot be altered or retracted.`,confirmText:"Submit Ballot",onConfirm:async()=>{await ut(t,a)}})}async function ut(t,a){try{const n=await p(`/candidate/vote/${t}`,{method:"POST"});e.user.isVoted=!0,e.pendingVoteCandidate=null,d(`✓ Your vote for ${a} was recorded successfully!`,"success",8),await Promise.all([C(),A()]),e.view==="ballot"?N():e.view==="dashboard"&&I()}catch(n){console.error("Failed to submit vote:",n),/already voted/i.test(n.message)?(e.user.isVoted=!0,d("Your ballot has already been submitted for this election.","info")):d(n.message||"Unable to submit vote. Please try again.","error"),e.view==="ballot"&&N()}}async function ft(t){t.preventDefault(),u();const a=t.target,n=a.querySelector('[type="submit"]'),s=a.aadharCardNumber.value.trim(),o=a.password.value;if(!/^\d{12}$/.test(s)){d("Aadhaar number must contain exactly 12 numeric digits.","error");return}if(!o){d("Password is required.","error");return}n.disabled=!0,n.textContent="Signing in…";try{const r=await p("/user/login",{method:"POST",body:JSON.stringify({aadharCardNumber:s,password:o})});if(!r.token)throw new Error("Authentication token not received.");if(e.token=r.token,localStorage.setItem("votex_token",r.token),await V(),d(`Welcome back, ${e.user.name}!`,"success",5),e.pendingVoteCandidate&&e.user.role==="voter"&&!e.user.isVoted){const l=e.pendingVoteCandidate;f("ballot"),k(l.id,l.name)}else f("dashboard")}catch(r){console.error("Login failed:",r),d(r.message||"Invalid Aadhaar number or password. Please try again.","error")}finally{n.disabled=!1,n.textContent="Sign In to VoteX"}}async function mt(t){t.preventDefault(),u();const a=t.target,n=a.querySelector('[type="submit"]'),s=a.name.value.trim(),o=Number(a.age.value),r=a.aadharCardNumber.value.trim(),l=a.role.value,m=a.address.value.trim(),b=a.email.value.trim(),g=a.mobile.value.trim(),h=a.password.value;if(!s)return d("Full name is required.","error");if(!o||o<18)return d("Eligible voting age must be 18 years or older.","error");if(!/^\d{12}$/.test(r))return d("Aadhaar number must contain exactly 12 numeric digits.","error");if(!m)return d("Residential address is required.","error");if(!h||h.length<4)return d("Password must be at least 4 characters long.","error");const y={name:s,age:o,aadharCardNumber:r,role:l,address:m,password:h};b&&(y.email=b),g&&(y.mobile=g),n.disabled=!0,n.textContent="Creating account…";try{const v=await p("/user/signup",{method:"POST",body:JSON.stringify(y)});if(v.token&&(e.token=v.token,localStorage.setItem("votex_token",v.token)),await V(),d("Your VoteX account has been registered successfully!","success",6),e.pendingVoteCandidate&&e.user&&e.user.role==="voter"&&!e.user.isVoted){const w=e.pendingVoteCandidate;f("ballot"),k(w.id,w.name)}else f("dashboard")}catch(v){console.error("Signup failed:",v),d(v.message||"Unable to register account. Please verify your details.","error")}finally{n.disabled=!1,n.textContent="Create Account"}}async function bt(t){t.preventDefault(),u();const a=t.target,n=a.querySelector('[type="submit"]'),s=i("#admin-candidate-id").value,o=a.name.value.trim(),r=a.party.value.trim(),l=Number(a.age.value);if(!o)return d("Candidate name is required.","error");if(!r)return d("Party affiliation is required.","error");if(!l||l<25)return d("Candidate must meet minimum age criteria (25+).","error");const m={name:o,party:r,age:l};n.disabled=!0;try{s?(await p(`/candidate/${s}`,{method:"PUT",body:JSON.stringify(m)}),d(`Candidate "${o}" has been updated successfully.`,"success")):(await p("/candidate",{method:"POST",body:JSON.stringify(m)}),d(`Candidate "${o}" has been added to the ballot.`,"success")),B(),await C(),P()}catch(b){console.error("Candidate save failed:",b),d(b.message||"Failed to save candidate. Verify admin permissions.","error")}finally{n.disabled=!1}}document.addEventListener("click",async t=>{const a=t.target.closest("[data-nav]");if(a){const o=a.dataset.nav;f(o);return}const n=t.target.closest("[data-action]");if(!n)return;const s=n.dataset.action;if(s==="nav-dashboard")f("dashboard");else if(s==="open-login")f("login");else if(s==="open-signup")f("signup");else if(s==="logout")localStorage.removeItem("votex_token"),S(),d("You have been signed out. All user details have been cleared.","info",5),f("dashboard",!0);else if(s==="vote-as-guest"){const o=n.dataset.id,r=n.dataset.name;k(o,r)}else if(s==="cast-vote"){const o=n.dataset.id,r=n.dataset.name;k(o,r)}else if(s==="admin-edit-candidate"){const o=n.dataset.id,r=e.candidates.find(l=>L(l)===o);r&&dt(r)}else if(s==="admin-delete-candidate"){const o=n.dataset.id,r=n.dataset.name;$({title:"Delete Candidate",message:`Are you sure you want to remove candidate "${r}" from the active election ballot? This action cannot be undone.`,confirmText:"Delete Candidate",onConfirm:async()=>{try{await p(`/candidate/${o}`,{method:"DELETE"}),d(`Candidate "${r}" was successfully deleted.`,"success"),await C(),P()}catch(l){d(l.message||"Unable to delete candidate.","error")}}})}});const _=i("#btn-refresh-candidates");_&&_.addEventListener("click",async()=>{await C(),F(),T(),d("Candidates list updated.","info",3)});const q=i("#btn-refresh-full-results");q&&q.addEventListener("click",async()=>{await A(),M(),d("Vote results refreshed.","info",3)});const X=i("#btn-cancel-candidate-edit");X&&X.addEventListener("click",()=>{B()});const Y=i("#form-login");Y&&Y.addEventListener("submit",ft);const z=i("#form-signup");z&&z.addEventListener("submit",mt);const j=i("#form-candidate");j&&j.addEventListener("submit",bt);async function pt(){e.token?await V():S();const t=E(window.location.pathname,window.location.hash);f(t,!1,!1);const a=O[e.view]||"/dashboard";if(window.location.pathname!==a&&window.location.pathname!=="/")try{window.history.replaceState({view:e.view},"",a)}catch{}}window.addEventListener("popstate",t=>{const n=t.state&&t.state.view||E(window.location.pathname,window.location.hash);f(n,!1,!1)}),window.addEventListener("hashchange",()=>{const t=E(window.location.pathname,window.location.hash);t!==e.view&&f(t,!1,!1)}),pt()})();
