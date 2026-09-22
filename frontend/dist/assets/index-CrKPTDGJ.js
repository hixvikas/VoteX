(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))v(d);new MutationObserver(d=>{for(const u of d)if(u.type==="childList")for(const w of u.addedNodes)w.tagName==="LINK"&&w.rel==="modulepreload"&&v(w)}).observe(document,{childList:!0,subtree:!0});function a(d){const u={};return d.integrity&&(u.integrity=d.integrity),d.referrerPolicy&&(u.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?u.credentials="include":d.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function v(d){if(d.ep)return;d.ep=!0;const u=a(d);fetch(d.href,u)}})();(function(){const M=window.VOTEX_API_BASE_URL||(window.location.port==="5173"?"/api":"http://localhost:3000"),e={token:localStorage.getItem("votex_token")||null,user:null,view:"dashboard",candidates:[],voteRecord:[],pendingVoteCandidate:null,pollTimer:null},a=t=>document.querySelector(t);async function v(t,n={}){const i={...n.body?{"Content-Type":"application/json"}:{},...n.headers||{}};e.token&&(i.Authorization=`Bearer ${e.token}`);const s=await fetch(`${M}${t}`,{...n,headers:i});let o={};try{o=await s.json()}catch{}if(!s.ok){const r=o.message||o.error||`HTTP Error ${s.status}`;throw new Error(r)}return o}function d(t,n="info",i=6){const s=a("#notice");s&&(s.textContent=t,s.className=`notice is-${n}`,s.hidden=!1,i>0&&setTimeout(()=>{s.textContent===t&&u()},i*1e3))}function u(){const t=a("#notice");t&&(t.hidden=!0)}function w({title:t,message:n,confirmText:i="Confirm",onConfirm:s}){const o=a("#app-modal"),r=a("#modal-title"),l=a("#modal-message"),f=a("#modal-confirm-btn"),b=a("#modal-cancel-btn");r.textContent=t,l.textContent=n,f.textContent=i,o.hidden=!1;function g(){o.hidden=!0,f.removeEventListener("click",y),b.removeEventListener("click",h),o.removeEventListener("click",p)}function y(){g(),typeof s=="function"&&s()}function h(){g()}function p($){$.target===o&&g()}f.addEventListener("click",y),b.addEventListener("click",h),o.addEventListener("click",p)}function c(t){return t==null?"":String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function L(t){return t.id||t._id}function x(){e.pollTimer&&(clearInterval(e.pollTimer),e.pollTimer=null)}function R(){x(),e.pollTimer=setInterval(async()=>{if(e.view==="dashboard"||e.view==="results")try{await A(),e.view==="dashboard"?(U(),T()):e.view==="results"&&B()}catch{}},15e3)}async function C(){try{const t=await v("/candidate");return e.candidates=Array.isArray(t)?t:[],e.candidates}catch(t){return console.error("Failed to load candidates:",t),d("Unable to load candidates from database.","error"),[]}}async function A(){try{const t=await v("/candidate/vote/count");return e.voteRecord=t.voteRecord||[],e.voteRecord}catch(t){return console.error("Failed to load vote counts:",t),[]}}function k(){e.user=null,e.token=null,e.pendingVoteCandidate=null;const t=a("#user-badge"),n=a("#user-role-label"),i=a("#user-name-label");t&&(t.hidden=!0,t.style.display="none"),n&&(n.textContent="",n.className="badge-role"),i&&(i.textContent="");const s=a("#profile-avatar"),o=a("#profile-name"),r=a("#profile-role"),l=a("#profile-voted-pill"),f=a("#profile-aadhar"),b=a("#profile-age"),g=a("#profile-email"),y=a("#profile-mobile"),h=a("#profile-address"),p=a("#profile-voting-status");s&&(s.textContent="U"),o&&(o.textContent=""),r&&(r.textContent=""),l&&(l.textContent=""),f&&(f.textContent=""),b&&(b.textContent=""),g&&(g.textContent=""),y&&(y.textContent=""),h&&(h.textContent=""),p&&(p.textContent="");const $=a("#voter-status-banner"),z=a("#ballot-candidate-list"),j=a("#ballot-count-badge");$&&($.innerHTML=""),z&&(z.innerHTML='<div class="state-empty">Please sign in to access the active ballot.</div>'),j&&(j.textContent="Candidates");const J=a("#admin-candidate-tbody"),W=a("#form-candidate"),X=a("#admin-candidate-count");if(J&&(J.innerHTML='<tr><td colspan="4" class="state-empty">Sign in as Administrator to manage candidates.</td></tr>'),X&&(X.textContent="0 total"),W){W.reset();const et=a("#admin-candidate-id");et&&(et.value="")}const G=a("#form-login"),K=a("#form-signup");G&&G.reset(),K&&K.reset();const Q=a("#metric-user-status");Q&&(Q.textContent="Guest");const Z=a("#login-pending-banner"),tt=a("#signup-pending-banner");Z&&(Z.hidden=!0),tt&&(tt.hidden=!0)}async function N(){if(!e.token)return k(),null;try{const t=await v("/user/profile");return e.user=t.user||null,e.user}catch(t){return console.warn("Session expired or invalid token:",t),localStorage.removeItem("votex_token"),k(),null}}function nt(){const t=a("#app-nav"),n=a("#user-badge"),i=a("#user-role-label"),s=a("#user-name-label");if(t)if(!e.user)n&&(n.hidden=!0,n.style.display="none"),i&&(i.textContent="",i.className="badge-role"),s&&(s.textContent=""),t.innerHTML=`
        <button class="nav-link ${e.view==="dashboard"?"is-active":""}" data-nav="dashboard" type="button">Dashboard</button>
        <button class="nav-link ${e.view==="results"?"is-active":""}" data-nav="results" type="button">Live Results</button>
        <button class="nav-link ${e.view==="about"?"is-active":""}" data-nav="about" type="button">About Us</button>
        <button class="nav-link ${e.view==="login"?"is-active":""}" data-nav="login" type="button">Sign In</button>
        <button class="nav-link btn-nav-accent ${e.view==="signup"?"is-active":""}" data-nav="signup" type="button">Create Account</button>
      `;else{if(n){n.hidden=!1,n.style.display="inline-flex";const o=e.user.role==="admin";i.textContent=o?"Admin":"Voter",i.className=`badge-role ${o?"admin-tag":""}`,s.textContent=e.user.name||"User"}e.user.role==="admin"?t.innerHTML=`
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
        `}}function m(t,n=!1){n||u(),t==="admin"&&(!e.user||e.user.role!=="admin")&&(t="dashboard",d("Admin authorization required to access candidate management.","error")),t==="ballot"&&(!e.user||e.user.role!=="voter")&&(e.user?(t="dashboard",d("Administrators cannot access the voter ballot.","info")):(t="login",d("Please sign in with your Aadhaar credentials to access your voter ballot.","info"))),e.view=t,["dashboard","results","about","login","signup","ballot","admin","profile"].forEach(s=>{const o=a(`#view-${s}`);o&&(o.hidden=s!==t)}),nt(),window.scrollTo({top:0,behavior:"smooth"}),t==="dashboard"?(H(),R()):t==="ballot"?(x(),V()):t==="admin"?(x(),it()):t==="results"?(st(),R()):t==="profile"?(x(),rt()):t==="login"||t==="signup"?(x(),at()):t==="about"&&x()}function at(){const t=a("#login-pending-banner"),n=a("#login-pending-text"),i=a("#signup-pending-banner"),s=a("#signup-pending-text");if(e.pendingVoteCandidate){const o=e.pendingVoteCandidate.name;t&&(t.hidden=!1),n&&(n.textContent=`Sign in with your 12-digit Aadhaar to cast your vote for ${o}.`),i&&(i.hidden=!1),s&&(s.textContent=`Register your Aadhaar account to cast your vote for ${o}.`)}else t&&(t.hidden=!0),i&&(i.hidden=!0)}async function H(){T(),await Promise.all([C(),A()]),O(),U(),T()}function T(){const t=a("#metric-candidate-count"),n=a("#metric-vote-count"),i=a("#metric-user-status");if(t&&(t.textContent=e.candidates?e.candidates.length:"--"),n){const s=(e.voteRecord||[]).reduce((o,r)=>o+Number(r.count||0),0);n.textContent=s}i&&(e.user?e.user.role==="admin"?i.textContent="Admin":i.textContent=e.user.isVoted?"Voted":"Eligible":i.textContent="Guest")}function O(){const t=a("#dashboard-candidate-list");if(t){if(!e.candidates.length){t.innerHTML='<div class="state-empty">No candidates registered for this election yet.</div>';return}t.innerHTML=e.candidates.map(n=>{const i=L(n),s=(n.name||"C").charAt(0).toUpperCase();let o="";return e.user?e.user.role==="admin"?o=`
          <button class="btn btn-outline candidate-action" disabled type="button">
            Admin Restricted
          </button>
        `:e.user.isVoted?o=`
            <button class="btn btn-outline candidate-action" disabled type="button">
              ✓ Vote Cast
            </button>
          `:o=`
            <button class="btn btn-primary candidate-action" data-action="cast-vote" data-id="${c(i)}" data-name="${c(n.name)}" type="button">
              Vote for Candidate
            </button>
          `:o=`
          <button class="btn btn-primary candidate-action" data-action="vote-as-guest" data-id="${c(i)}" data-name="${c(n.name)}" data-party="${c(n.party)}" type="button">
            Vote for Candidate
          </button>
        `,`
        <article class="candidate-card">
          <div class="candidate-top">
            <div class="candidate-avatar" aria-hidden="true">${c(s)}</div>
            <div class="candidate-info">
              <h3 class="candidate-name">${c(n.name)}</h3>
              <p class="candidate-party">${c(n.party)}</p>
              <p class="candidate-meta">${c(n.age)} years old</p>
            </div>
          </div>
          ${o}
        </article>
      `}).join("")}}function U(){const t=a("#dashboard-results-container");if(!t)return;const n=e.voteRecord||[];if(!n.length){t.innerHTML='<div class="state-empty">No votes recorded yet. Be the first to participate!</div>';return}const i=n.reduce((o,r)=>o+Number(r.count||0),0),s=Math.max(1,...n.map(o=>Number(o.count||0)));t.innerHTML=`
      <div class="results-summary-strip">
        <span><strong>${i}</strong> Total Verified Ballots</span>
        <span>${n.length} Parties Participating</span>
      </div>
      <div class="results-tally-list">
        ${n.map(o=>{const r=Number(o.count||0),l=i>0?Math.round(r/i*100):0,f=Math.max(r>0?5:0,Math.round(r/s*100));return`
            <div class="tally-row">
              <div class="tally-meta">
                <span class="tally-party">${c(o.party)}</span>
                <span class="tally-count">${r} votes (${l}%)</span>
              </div>
              <div class="tally-bar-track">
                <div class="tally-bar-fill" style="width: ${f}%;"></div>
              </div>
            </div>
          `}).join("")}
      </div>
    `}async function V(){const t=a("#voter-status-banner"),n=a("#ballot-candidate-list"),i=a("#ballot-count-badge");if(!e.user){m("auth");return}if(await C(),i&&(i.textContent=`${e.candidates.length} Candidates`),t&&(e.user.isVoted?(t.className="status-banner is-voted",t.innerHTML=`
          <div>
            <strong>✓ Your Ballot Has Been Recorded</strong>
            <p style="font-size:0.85rem; margin-top:0.2rem;">You have fulfilled your civic participation in this election. Single-vote integrity is active.</p>
          </div>
        `):(t.className="status-banner is-ready",t.innerHTML=`
          <div>
            <strong>Your Ballot is Ready</strong>
            <p style="font-size:0.85rem; margin-top:0.2rem;">Select one candidate below to cast your ballot. Your choice is confidential and permanent once submitted.</p>
          </div>
        `)),!e.candidates.length){n&&(n.innerHTML='<div class="state-empty">There are currently no candidates on the active ballot.</div>');return}n&&(n.innerHTML=e.candidates.map(s=>{const o=L(s),r=(s.name||"C").charAt(0).toUpperCase(),l=e.user.isVoted;return`
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
        `}).join(""))}async function it(){if(!e.user||e.user.role!=="admin"){m("dashboard");return}await C(),E(),P()}function E(){const t=a("#admin-candidate-tbody"),n=a("#admin-candidate-count");if(n&&(n.textContent=`${e.candidates.length} total`),!!t){if(!e.candidates.length){t.innerHTML='<tr><td colspan="4" class="state-empty">No registered candidates. Add a candidate using the form.</td></tr>';return}t.innerHTML=e.candidates.map(i=>{const s=L(i);return`
        <tr>
          <td><strong>${c(i.name)}</strong></td>
          <td>${c(i.party)}</td>
          <td>${c(i.age)}</td>
          <td class="text-right">
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" data-action="admin-edit-candidate" data-id="${c(s)}" type="button">Edit</button>
              <button class="btn btn-danger btn-sm" data-action="admin-delete-candidate" data-id="${c(s)}" data-name="${c(i.name)}" type="button">Delete</button>
            </div>
          </td>
        </tr>
      `}).join("")}}function P(){const t=a("#form-candidate");t&&(t.reset(),a("#admin-candidate-id").value="",a("#admin-form-title").textContent="Add New Candidate",a("#btn-save-candidate").textContent="Add Candidate",a("#btn-cancel-candidate-edit").hidden=!0)}function ot(t){t&&(a("#admin-candidate-id").value=L(t),a("#admin-candidate-name").value=t.name||"",a("#admin-candidate-party").value=t.party||"",a("#admin-candidate-age").value=t.age||"",a("#admin-form-title").textContent="Edit Candidate",a("#btn-save-candidate").textContent="Save Changes",a("#btn-cancel-candidate-edit").hidden=!1,a("#admin-candidate-name").focus())}async function st(){await A(),B()}function B(){const t=a("#full-results-container");if(!t)return;const n=e.voteRecord||[];if(!n.length){t.innerHTML='<div class="state-empty">No votes recorded yet in the election database.</div>';return}const i=n.reduce((o,r)=>o+Number(r.count||0),0),s=Math.max(1,...n.map(o=>Number(o.count||0)));t.innerHTML=`
      <div class="results-summary-strip" style="margin-bottom: 1.5rem;">
        <div>
          <span style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${i} Total Votes Cast</span>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.2rem;">Live data stream from election database</p>
        </div>
        <span class="live-pill"><span class="pulse-dot"></span> Live Sync Active</span>
      </div>
      <div class="results-tally-list" style="gap: 1.25rem;">
        ${n.map((o,r)=>{const l=Number(o.count||0),f=i>0?(l/i*100).toFixed(1):"0.0",b=Math.max(l>0?5:0,Math.round(l/s*100));return`
            <div class="tally-row">
              <div class="tally-meta" style="font-size:0.95rem;">
                <span>
                  <strong style="color:var(--text-primary);">${r+1}. ${c(o.party)}</strong>
                  ${r===0&&l>0?'<span class="badge-role" style="background:#059669; font-size:0.68rem; margin-left:0.4rem;">Leading</span>':""}
                </span>
                <span class="tally-count" style="font-size:1rem;"><strong>${l}</strong> votes (${f}%)</span>
              </div>
              <div class="tally-bar-track" style="height:10px;">
                <div class="tally-bar-fill" style="width: ${b}%;"></div>
              </div>
            </div>
          `}).join("")}
      </div>
    `}function rt(){if(!e.user){m("auth");return}const t=e.user,n=(t.name||"U").charAt(0).toUpperCase();a("#profile-avatar").textContent=n,a("#profile-name").textContent=t.name||"Registered User";const i=t.role==="admin",s=a("#profile-role");s.textContent=i?"Admin":"Voter",s.className=`badge-role ${i?"admin-tag":""}`;const o=a("#profile-voted-pill");i?(o.textContent="Admin Restrained",o.className="badge-status not-voted"):(o.textContent=t.isVoted?"✓ Vote Cast":"Ballot Pending",o.className=`badge-status ${t.isVoted?"voted":"not-voted"}`),a("#profile-aadhar").textContent=t.aadharCardNumber?`•••• •••• ${String(t.aadharCardNumber).slice(-4)}`:"N/A",a("#profile-age").textContent=t.age?`${t.age} years`:"N/A",a("#profile-email").textContent=t.email||"Not provided",a("#profile-mobile").textContent=t.mobile||"Not provided",a("#profile-address").textContent=t.address||"N/A";const r=a("#profile-voting-status");i?r.textContent="Administrator accounts do not participate in ballot casting to preserve neutrality.":t.isVoted?r.innerHTML='<span style="color:var(--success); font-weight:600;">✓ Ballot Submitted and Verified</span> (One-vote integrity locked)':r.innerHTML='<span style="color:var(--accent); font-weight:600;">Eligible to vote</span>. You can cast your ballot at any time.'}function S(t,n){if(!e.user){e.pendingVoteCandidate={id:t,name:n},m("login"),d(`Please sign in with your 12-digit Aadhaar to cast your vote for ${n}.`,"info",8);return}if(e.user.role==="admin"){d("Administrator accounts are not permitted to cast votes in elections.","error");return}if(e.user.isVoted){d("You have already submitted your ballot for this election.","info");return}w({title:"Confirm Ballot Submission",message:`Are you sure you want to cast your permanent vote for ${n}? Once confirmed, your ballot cannot be altered or retracted.`,confirmText:"Submit Ballot",onConfirm:async()=>{await dt(t,n)}})}async function dt(t,n){try{const i=await v(`/candidate/vote/${t}`,{method:"POST"});e.user.isVoted=!0,e.pendingVoteCandidate=null,d(`✓ Your vote for ${n} was recorded successfully!`,"success",8),await Promise.all([C(),A()]),e.view==="ballot"?V():e.view==="dashboard"&&H()}catch(i){console.error("Failed to submit vote:",i),/already voted/i.test(i.message)?(e.user.isVoted=!0,d("Your ballot has already been submitted for this election.","info")):d(i.message||"Unable to submit vote. Please try again.","error"),e.view==="ballot"&&V()}}async function lt(t){t.preventDefault(),u();const n=t.target,i=n.querySelector('[type="submit"]'),s=n.aadharCardNumber.value.trim(),o=n.password.value;if(!/^\d{12}$/.test(s)){d("Aadhaar number must contain exactly 12 numeric digits.","error");return}if(!o){d("Password is required.","error");return}i.disabled=!0,i.textContent="Signing in…";try{const r=await v("/user/login",{method:"POST",body:JSON.stringify({aadharCardNumber:s,password:o})});if(!r.token)throw new Error("Authentication token not received.");if(e.token=r.token,localStorage.setItem("votex_token",r.token),await N(),d(`Welcome back, ${e.user.name}!`,"success",5),e.pendingVoteCandidate&&e.user.role==="voter"&&!e.user.isVoted){const l=e.pendingVoteCandidate;m("ballot"),S(l.id,l.name)}else m("dashboard")}catch(r){console.error("Login failed:",r),d(r.message||"Invalid Aadhaar number or password. Please try again.","error")}finally{i.disabled=!1,i.textContent="Sign In to VoteX"}}async function ct(t){t.preventDefault(),u();const n=t.target,i=n.querySelector('[type="submit"]'),s=n.name.value.trim(),o=Number(n.age.value),r=n.aadharCardNumber.value.trim(),l=n.role.value,f=n.address.value.trim(),b=n.email.value.trim(),g=n.mobile.value.trim(),y=n.password.value;if(!s)return d("Full name is required.","error");if(!o||o<18)return d("Eligible voting age must be 18 years or older.","error");if(!/^\d{12}$/.test(r))return d("Aadhaar number must contain exactly 12 numeric digits.","error");if(!f)return d("Residential address is required.","error");if(!y||y.length<4)return d("Password must be at least 4 characters long.","error");const h={name:s,age:o,aadharCardNumber:r,role:l,address:f,password:y};b&&(h.email=b),g&&(h.mobile=g),i.disabled=!0,i.textContent="Creating account…";try{const p=await v("/user/signup",{method:"POST",body:JSON.stringify(h)});if(p.token&&(e.token=p.token,localStorage.setItem("votex_token",p.token)),await N(),d("Your VoteX account has been registered successfully!","success",6),e.pendingVoteCandidate&&e.user&&e.user.role==="voter"&&!e.user.isVoted){const $=e.pendingVoteCandidate;m("ballot"),S($.id,$.name)}else m("dashboard")}catch(p){console.error("Signup failed:",p),d(p.message||"Unable to register account. Please verify your details.","error")}finally{i.disabled=!1,i.textContent="Create Account"}}async function ut(t){t.preventDefault(),u();const n=t.target,i=n.querySelector('[type="submit"]'),s=a("#admin-candidate-id").value,o=n.name.value.trim(),r=n.party.value.trim(),l=Number(n.age.value);if(!o)return d("Candidate name is required.","error");if(!r)return d("Party affiliation is required.","error");if(!l||l<25)return d("Candidate must meet minimum age criteria (25+).","error");const f={name:o,party:r,age:l};i.disabled=!0;try{s?(await v(`/candidate/${s}`,{method:"PUT",body:JSON.stringify(f)}),d(`Candidate "${o}" has been updated successfully.`,"success")):(await v("/candidate",{method:"POST",body:JSON.stringify(f)}),d(`Candidate "${o}" has been added to the ballot.`,"success")),P(),await C(),E()}catch(b){console.error("Candidate save failed:",b),d(b.message||"Failed to save candidate. Verify admin permissions.","error")}finally{i.disabled=!1}}document.addEventListener("click",async t=>{const n=t.target.closest("[data-nav]");if(n){const o=n.dataset.nav;m(o);return}const i=t.target.closest("[data-action]");if(!i)return;const s=i.dataset.action;if(s==="nav-dashboard")m("dashboard");else if(s==="open-login")m("login");else if(s==="open-signup")m("signup");else if(s==="logout")localStorage.removeItem("votex_token"),k(),d("You have been signed out. All user details have been cleared.","info",5),m("dashboard",!0);else if(s==="vote-as-guest"){const o=i.dataset.id,r=i.dataset.name;S(o,r)}else if(s==="cast-vote"){const o=i.dataset.id,r=i.dataset.name;S(o,r)}else if(s==="admin-edit-candidate"){const o=i.dataset.id,r=e.candidates.find(l=>L(l)===o);r&&ot(r)}else if(s==="admin-delete-candidate"){const o=i.dataset.id,r=i.dataset.name;w({title:"Delete Candidate",message:`Are you sure you want to remove candidate "${r}" from the active election ballot? This action cannot be undone.`,confirmText:"Delete Candidate",onConfirm:async()=>{try{await v(`/candidate/${o}`,{method:"DELETE"}),d(`Candidate "${r}" was successfully deleted.`,"success"),await C(),E()}catch(l){d(l.message||"Unable to delete candidate.","error")}}})}});const D=a("#btn-refresh-candidates");D&&D.addEventListener("click",async()=>{await C(),O(),T(),d("Candidates list updated.","info",3)});const I=a("#btn-refresh-full-results");I&&I.addEventListener("click",async()=>{await A(),B(),d("Vote results refreshed.","info",3)});const F=a("#btn-cancel-candidate-edit");F&&F.addEventListener("click",()=>{P()});const q=a("#form-login");q&&q.addEventListener("submit",lt);const _=a("#form-signup");_&&_.addEventListener("submit",ct);const Y=a("#form-candidate");Y&&Y.addEventListener("submit",ut);async function ft(){e.token?await N():k(),m("dashboard")}ft()})();
