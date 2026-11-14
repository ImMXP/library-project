// UniLib – Sprint 1 clickable prototype. Data lives in localStorage (mock only).
const KEY = "unilib-data-v1";
const LOAN_DAYS = 14;

function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return d; } catch (e) {}
  return JSON.parse(JSON.stringify(SEED));
}
let db = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

function getSession() { try { return JSON.parse(sessionStorage.getItem("unilib-session")); } catch (e) { return null; } }
function setSession(s) { try { s ? sessionStorage.setItem("unilib-session", JSON.stringify(s)) : sessionStorage.removeItem("unilib-session"); } catch (e) {} }

// ?demo=admin or ?demo=borrower logs in directly (used for report screenshots)
const demo = new URLSearchParams(location.search).get("demo");
if (demo) setSession(DEMO_ACCOUNTS.find(a => a.role === demo));

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const book = id => db.books.find(b => b.id === id);
const borrower = id => db.borrowers.find(b => b.id === id);
const activeLoans = bookId => db.loans.filter(l => l.bookId === bookId && (l.status === "Borrowed" || l.status === "Requested")).length;
const available = b => b.copies - activeLoans(b.id);
const isOverdue = l => l.status === "Borrowed" && l.due && l.due < today();
const COLORS = ["#1e5a8a", "#0f766e", "#7c3aed", "#b45309", "#be123c", "#4d7c0f", "#0369a1", "#a16207"];

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1800); }

function statusPill(l) {
  if (isOverdue(l)) return `<span class="pill p-bad">Overdue</span>`;
  const cls = { Requested: "p-warn", Borrowed: "p-info", Returned: "p-ok", Rejected: "p-bad" }[l.status];
  return `<span class="pill ${cls}">${l.status}</span>`;
}

// ---------- Login ----------
let loginRole = "borrower";
const LI = {
  user: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  shield: `<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  lock: `<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  eye: `<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  ext: `<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`,
  info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`
};
function renderLogin() {
  const adm = loginRole === "admin";
  $("#app").innerHTML = `
  <div class="gp">
    <div class="gp-strip"><div class="gp-in"><span><i class="gp-flag"></i>An official service of Umm Al-Qura University</span><span>English</span></div></div>
    <header class="gp-head"><div class="gp-in">
      <div class="gp-brand"><img class="gp-mark" src="assets/uqu-logo.png" alt="Umm Al-Qura University logo"><div><b>UniLib</b><small>Umm Al-Qura University Library</small></div></div>
      <a class="gp-link" href="https://uqu.edu.sa" target="_blank" rel="noopener">Library website ${LI.ext}</a>
    </div></header>
    <div class="gp-main"><div class="gp-card">
      <img class="gp-icon" src="assets/uqu-logo.png" alt="">
      <h1>Sign in to UniLib</h1>
      <p class="gp-sub">University Library Borrowing System</p>
      <div class="gp-tabs" role="tablist">
        <button type="button" data-r="borrower" class="${adm ? "" : "on"}">${LI.user}Borrower</button>
        <button type="button" data-r="admin" class="${adm ? "on" : ""}">${LI.shield}Administrator</button>
      </div>
      <form id="lf">
        <label for="u">${adm ? "Admin username" : "Student ID"}</label>
        <div class="gp-field">${LI.user}<input id="u" autocomplete="username" placeholder="${adm ? "admin" : "s441001"}"></div>
        <label for="p">Password</label>
        <div class="gp-field">${LI.lock}<input id="p" type="password" autocomplete="current-password" placeholder="••••••••">
          <button type="button" class="gp-eye" aria-label="Show password">${LI.eye}</button></div>
        <div class="err" id="err"></div>
        <button class="gp-btn">Sign in ${LI.arrow}</button>
      </form>
      <div class="gp-note">${LI.info}<div><b>Prototype demo accounts</b>
        ${adm ? "admin / admin123" : "s441001 / 1234 &nbsp;·&nbsp; s441002 / 1234"}</div></div>
    </div></div>
    <footer class="gp-foot"><div class="gp-in"><span>© 2026 Umm Al-Qura University. All rights reserved.</span><b>UniLib · University Library Borrowing</b></div></footer>
  </div>`;
  document.querySelectorAll(".gp-tabs button").forEach(b => b.onclick = () => { loginRole = b.dataset.r; renderLogin(); });
  $(".gp-eye").onclick = () => { const p = $("#p"); p.type = p.type === "password" ? "text" : "password"; };
  $("#lf").onsubmit = e => {
    e.preventDefault();
    const acc = DEMO_ACCOUNTS.find(a => a.username === $("#u").value.trim() && a.password === $("#p").value && a.role === loginRole);
    if (!acc) { $("#err").textContent = "Invalid username or password for this portal."; return; }
    setSession(acc);
    location.hash = acc.role === "admin" ? "#/admin/dashboard" : "#/me/catalog";
    route();
  };
}

// ---------- Shell ----------
function shell(user, links, current, body) {
  $("#app").innerHTML = `
  <div style="display:flex;flex-direction:column;min-height:100vh;">
    <div class="top">
      <div class="logo">
        <img src="assets/uqu-logo.png" alt="UQU Logo">
        <div class="logo-text">
          <span class="title">UniLib</span>
          <span class="sub">Umm Al-Qura University Library</span>
        </div>
      </div>
      <div class="who"><span class="role">${user.role === "admin" ? "Admin" : "Borrower"}</span>${esc(user.name)}
        <button class="btn ghost small" id="logout">Sign out</button></div>
    </div>
    <div class="shell" style="flex:1;">
      <nav class="side">${links.map(([h, t]) => `<a href="#/${h}" class="${h === current ? "on" : ""}">${t}</a>`).join("")}</nav>
      <main>${body}</main>
    </div>
    <footer class="gp-foot"><div class="gp-in"><span>© 2026 Umm Al-Qura University. All rights reserved.</span><b>UniLib · University Library Borrowing</b></div></footer>
  </div>`;
  $("#logout").onclick = () => { setSession(null); location.hash = ""; route(); };
}

// ---------- Admin ----------
const ADMIN_LINKS = [["admin/dashboard", "Dashboard"], ["admin/books", "Books"], ["admin/borrowers", "Borrowers"], ["admin/loans", "Loans"]];

function adminDashboard(u) {
  const borrowed = db.loans.filter(l => l.status === "Borrowed").length;
  const req = db.loans.filter(l => l.status === "Requested").length;
  const over = db.loans.filter(isOverdue).length;
  const recent = [...db.loans].reverse().slice(0, 5);
  shell(u, ADMIN_LINKS, "admin/dashboard", `
    <h1>Dashboard</h1><p class="lead">Overview of the library today.</p>
    <div class="stats">
      <div class="card stat"><div class="n">${db.books.length}</div><div class="l">Book titles</div></div>
      <div class="card stat"><div class="n">${borrowed}</div><div class="l">Books on loan</div></div>
      <div class="card stat"><div class="n">${req}</div><div class="l">Pending requests</div></div>
      <div class="card stat"><div class="n" style="color:var(--bad)">${over}</div><div class="l">Overdue</div></div>
    </div>
    <h3>Recent activity</h3>
    ${loanTable(recent, false)}`);
}

function adminBooks(u) {
  shell(u, ADMIN_LINKS, "admin/books", `
    <h1>Books</h1><p class="lead">Add, edit and remove books in the catalog.</p>
    <form class="form card" id="bf">
      <div><label>Title</label><input name="title" required></div>
      <div><label>Author</label><input name="author" required></div>
      <div><label>Category</label><input name="category" required></div>
      <div><label>Copies</label><input name="copies" type="number" min="1" value="1" required></div>
      <button class="btn" id="bsave">Add book</button>
      <input type="hidden" name="id">
    </form>
    <div class="bar"><input id="q" placeholder="Search by title or author"></div>
    <div id="bt"></div>`);
  const f = $("#bf").elements, form = $("#bf");
  const draw = () => {
    const q = $("#q").value.toLowerCase();
    const rows = db.books.filter(b => (b.title + b.author).toLowerCase().includes(q));
    $("#bt").innerHTML = rows.length ? `<table><tr><th>Title</th><th>Author</th><th>Category</th><th>Copies</th><th>Available</th><th></th></tr>
      ${rows.map(b => `<tr><td>${esc(b.title)}</td><td>${esc(b.author)}</td><td>${esc(b.category)}</td><td>${b.copies}</td><td>${available(b)}</td>
      <td class="actions"><button class="btn ghost small" data-e="${b.id}">Edit</button><button class="btn danger small" data-d="${b.id}">Delete</button></td></tr>`).join("")}</table>`
      : `<div class="card empty">No books match your search.</div>`;
    document.querySelectorAll("[data-e]").forEach(x => x.onclick = () => {
      const b = book(x.dataset.e);
      ["id", "title", "author", "category", "copies"].forEach(k => f[k].value = b[k]);
      $("#bsave").textContent = "Save changes"; f.title.focus();
    });
    document.querySelectorAll("[data-d]").forEach(x => x.onclick = () => {
      if (activeLoans(x.dataset.d)) return toast("Cannot delete: book has active loans.");
      if (!confirm("Delete this book?")) return;
      db.books = db.books.filter(b => b.id !== x.dataset.d); save(); draw(); toast("Book deleted");
    });
  };
  form.onsubmit = e => {
    e.preventDefault();
    const data = { title: f.title.value.trim(), author: f.author.value.trim(), category: f.category.value.trim(), copies: +f.copies.value };
    if (f.id.value) { Object.assign(book(f.id.value), data); toast("Book updated"); }
    else { db.books.push({ id: uid("BK"), isbn: "", ...data }); toast("Book added"); }
    save(); form.reset(); f.id.value = ""; $("#bsave").textContent = "Add book"; draw();
  };
  $("#q").oninput = draw; draw();
}

function adminBorrowers(u) {
  shell(u, ADMIN_LINKS, "admin/borrowers", `
    <h1>Borrowers</h1><p class="lead">Register students who can borrow books.</p>
    <form class="form card" id="rf">
      <div><label>Full name</label><input name="name" required></div>
      <div><label>Student ID</label><input name="studentId" required pattern="[0-9]{6,10}" title="6–10 digits"></div>
      <div><label>Email</label><input name="email" type="email" required></div>
      <div><label>Phone</label><input name="phone" required></div>
      <button class="btn">Register</button>
    </form>
    <div id="rt"></div>`);
  const draw = () => {
    $("#rt").innerHTML = `<table><tr><th>Name</th><th>Student ID</th><th>Email</th><th>Phone</th><th>Active loans</th></tr>
      ${db.borrowers.map(b => `<tr><td>${esc(b.name)}</td><td>${esc(b.studentId)}</td><td>${esc(b.email)}</td><td>${esc(b.phone)}</td>
      <td>${db.loans.filter(l => l.borrowerId === b.id && l.status === "Borrowed").length}</td></tr>`).join("")}</table>`;
  };
  $("#rf").onsubmit = e => {
    e.preventDefault(); const form = e.target, f = form.elements;
    if (db.borrowers.some(b => b.studentId === f.studentId.value.trim())) return toast("This student is already registered.");
    db.borrowers.push({ id: uid("B"), name: f.name.value.trim(), studentId: f.studentId.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim() });
    save(); form.reset(); draw(); toast("Borrower registered");
  };
  draw();
}

function loanTable(rows, withActions) {
  if (!rows.length) return `<div class="card empty">No loans to show.</div>`;
  return `<table><tr><th>Book</th><th>Borrower</th><th>Requested</th><th>Due</th><th>Status</th>${withActions ? "<th></th>" : ""}</tr>
    ${rows.map(l => `<tr><td>${esc(book(l.bookId)?.title || "—")}</td><td>${esc(borrower(l.borrowerId)?.name || "—")}</td>
    <td>${l.requested}</td><td>${l.due || "—"}</td><td>${statusPill(l)}</td>
    ${withActions ? `<td class="actions">${l.status === "Requested" ? `<button class="btn small" data-a="${l.id}">Approve</button><button class="btn ghost small" data-r="${l.id}">Reject</button>`
      : l.status === "Borrowed" ? `<button class="btn ghost small" data-ret="${l.id}">Mark returned</button>` : ""}</td>` : ""}</tr>`).join("")}</table>`;
}

function adminLoans(u) {
  shell(u, ADMIN_LINKS, "admin/loans", `
    <h1>Loans</h1><p class="lead">Approve borrow requests and record returns.</p>
    <div class="bar"><select id="fs"><option value="">All statuses</option><option>Requested</option><option>Borrowed</option><option value="Overdue">Overdue</option><option>Returned</option></select></div>
    <div id="lt"></div>`);
  const draw = () => {
    const s = $("#fs").value;
    const rows = db.loans.filter(l => !s || (s === "Overdue" ? isOverdue(l) : l.status === s));
    $("#lt").innerHTML = loanTable(rows, true);
    const L = id => db.loans.find(l => l.id === id);
    document.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const l = L(x.dataset.a); l.status = "Borrowed"; l.due = addDays(today(), LOAN_DAYS); save(); draw(); toast("Request approved"); });
    document.querySelectorAll("[data-r]").forEach(x => x.onclick = () => { L(x.dataset.r).status = "Rejected"; save(); draw(); toast("Request rejected"); });
    document.querySelectorAll("[data-ret]").forEach(x => x.onclick = () => { L(x.dataset.ret).status = "Returned"; save(); draw(); toast("Book marked as returned"); });
  };
  $("#fs").onchange = draw; draw();
}

// ---------- Borrower ----------
const ME_LINKS = [["me/catalog", "Browse books"], ["me/loans", "My loans"]];

function meCatalog(u) {
  const cats = [...new Set(db.books.map(b => b.category))];
  shell(u, ME_LINKS, "me/catalog", `
    <h1>Browse books</h1><p class="lead">Search the catalog and request a book to borrow.</p>
    <div class="bar"><input id="q" placeholder="Search by title or author">
      <select id="c"><option value="">All categories</option>${cats.map(c => `<option>${esc(c)}</option>`).join("")}</select></div>
    <div class="books" id="bk"></div>`);
  const draw = () => {
    const q = $("#q").value.toLowerCase(), c = $("#c").value;
    const rows = db.books.filter(b => (b.title + b.author).toLowerCase().includes(q) && (!c || b.category === c));
    $("#bk").innerHTML = rows.length ? rows.map((b, i) => {
      const av = available(b);
      const mine = db.loans.some(l => l.bookId === b.id && l.borrowerId === u.borrowerId && (l.status === "Requested" || l.status === "Borrowed"));
      return `<div class="card book"><div class="cover" style="background:${COLORS[db.books.indexOf(b) % COLORS.length]}">${esc(b.title[0])}</div>
        <div class="t">${esc(b.title)}</div><div class="a">${esc(b.author)} · ${esc(b.category)}</div>
        <div class="row"><span class="pill ${av > 0 ? "p-ok" : "p-bad"}">${av > 0 ? av + " available" : "Unavailable"}</span>
        <button class="btn small" data-b="${b.id}" ${av < 1 || mine ? "disabled" : ""}>${mine ? "Requested" : "Borrow"}</button></div></div>`;
    }).join("") : `<div class="card empty">No books match your search.</div>`;
    document.querySelectorAll("[data-b]").forEach(x => x.onclick = () => {
      db.loans.push({ id: uid("L"), bookId: x.dataset.b, borrowerId: u.borrowerId, requested: today(), due: "", status: "Requested" });
      save(); draw(); toast("Borrow request sent to the library");
    });
  };
  $("#q").oninput = draw; $("#c").onchange = draw; draw();
}

function meLoans(u) {
  const mine = db.loans.filter(l => l.borrowerId === u.borrowerId).reverse();
  shell(u, ME_LINKS, "me/loans", `
    <h1>My loans</h1><p class="lead">Your requests, borrowed books and due dates.</p>
    ${mine.length ? `<table><tr><th>Book</th><th>Requested</th><th>Due date</th><th>Status</th></tr>
      ${mine.map(l => `<tr><td>${esc(book(l.bookId)?.title)}</td><td>${l.requested}</td><td>${l.due || "—"}</td><td>${statusPill(l)}</td></tr>`).join("")}</table>`
      : `<div class="card empty">You have no loans yet.</div>`}`);
}

// ---------- Router ----------
const ROUTES = {
  admin: { "admin/dashboard": adminDashboard, "admin/books": adminBooks, "admin/borrowers": adminBorrowers, "admin/loans": adminLoans },
  borrower: { "me/catalog": meCatalog, "me/loans": meLoans }
};
function route() {
  const u = getSession();
  if (!u) return renderLogin();
  const h = location.hash.replace(/^#\//, "");
  const r = ROUTES[u.role];
  (r[h] || Object.values(r)[0])(u);
}
window.addEventListener("hashchange", route);
route();
