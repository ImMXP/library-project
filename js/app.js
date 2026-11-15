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

const bookCover = b => b.cover || (b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn.replace(/-/g, "")}-L.jpg` : "");

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1800); }

function statusPill(l) {
  if (isOverdue(l)) return `<span class="pill p-bad">Overdue</span>`;
  const cls = { Requested: "p-warn", Borrowed: "p-info", Returned: "p-ok", Rejected: "p-bad" }[l.status];
  return `<span class="pill ${cls}">${l.status}</span>`;
}

function openReader(bookId) {
  const b = book(bookId);
  if (!b) return;
  const modal = document.createElement("div");
  modal.className = "reader-modal";
  modal.innerHTML = `
    <div class="reader-box">
      <div class="reader-head">
        <h3>${esc(b.title)} — ${esc(b.author)}</h3>
        <button type="button" class="btn small ghost" id="closeReader">Close</button>
      </div>
      <div class="reader-body">
        ${b.pdfUrl
          ? `<iframe src="${esc(b.pdfUrl)}" title="${esc(b.title)}"></iframe>`
          : `<div style="color:#fff;padding:60px;text-align:center;font-size:15px">
               <h3>📖 Reading Mode: ${esc(b.title)}</h3>
               <p style="color:#aaa;margin-top:10px">No digital PDF file is attached to this prototype entry yet. You can attach a PDF link via Admin or enjoy reading the physical copy!</p>
             </div>`}
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#closeReader").onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
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
  <div class="top">
    <div class="logo"><span class="mark">U</span>UniLib</div>
    <div class="who"><span class="role">${user.role === "admin" ? "Admin" : "Borrower"}</span>${esc(user.name)}
      <button class="btn ghost small" id="logout">Sign out</button></div>
  </div>
  <div class="shell">
    <nav class="side">${links.map(([h, t]) => `<a href="#/${h}" class="${h === current ? "on" : ""}">${t}</a>`).join("")}</nav>
    <main>${body}</main>
  </div>`;
  $("#logout").onclick = () => { setSession(null); location.hash = ""; route(); };
}

// ---------- Admin (UQU portal style, scoped under .adm) ----------
const AI = {
  dash: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  book: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/></svg>`,
  swap: `<svg viewBox="0 0 24 24"><path d="M7 4v16M3 8l4-4 4 4"/><path d="M17 20V4M13 16l4 4 4-4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  alert: `<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17h.01"/></svg>`,
  out: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  chev: `<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`,
  read: `<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
};
const ADMIN_LINKS = [["admin/dashboard", "Dashboard", "dash"], ["admin/books", "Books", "book"], ["admin/borrowers", "Borrowers", "users"], ["admin/loans", "Loans", "swap"]];
const initials = n => String(n || "").split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const daysLate = l => Math.round((new Date(today()) - new Date(l.due)) / 864e5);
let loanFilter = "";

function adminShell(u, current, title, lead, body) {
  const pending = db.loans.filter(l => l.status === "Requested").length;
  $("#app").innerHTML = `
  <div class="gp adm">
    <div class="gp-strip"><div class="gp-in"><span><i class="gp-flag"></i>An official service of Umm Al-Qura University</span><span>English</span></div></div>
    <header class="gp-head"><div class="gp-in">
      <div class="gp-brand"><img class="gp-mark" src="assets/uqu-logo.png" alt="Umm Al-Qura University logo"><div><b>UniLib</b><small>Library Administration</small></div></div>
      <div class="adm-who"><span class="adm-av" aria-hidden="true">${esc(initials(u.name))}</span>
        <div class="adm-id"><b>${esc(u.name)}</b><span class="role">Admin</span></div>
        <button type="button" class="gp-link" id="logout">${AI.out}Sign out</button></div>
    </div></header>
    <nav class="adm-nav" aria-label="Administration"><div class="gp-in">
      ${ADMIN_LINKS.map(([h, t, i]) => `<a href="#/${h}" class="${h === current ? "on" : ""}"${h === current ? ' aria-current="page"' : ""}>${AI[i]}${t}${h === "admin/loans" && pending ? `<em title="Pending requests">${pending}</em>` : ""}</a>`).join("")}
    </div></nav>
    <main>
      <section class="adm-hero"><div class="adm-in">
        <div class="adm-crumb">Admin portal ${AI.chev} ${title}</div>
        <h1>${title}</h1><p>${lead}</p>
      </div></section>
      <div class="adm-in adm-body">${body}</div>
    </main>
    <footer class="gp-foot"><div class="gp-in"><span>© 2026 Umm Al-Qura University. All rights reserved.</span><b>UniLib · Library Administration</b></div></footer>
  </div>`;
  $("#logout").onclick = () => { setSession(null); location.hash = ""; route(); };
}

const searchBox = (id, ph) => `<label class="adm-search">${AI.search}<input id="${id}" type="search" placeholder="${ph}" aria-label="${ph}"></label>`;

function adminDashboard(u) {
  const borrowed = db.loans.filter(l => l.status === "Borrowed").length;
  const req = db.loans.filter(l => l.status === "Requested").length;
  const over = db.loans.filter(isOverdue).length;
  const recent = [...db.loans].reverse().slice(0, 5);
  const attention = db.loans.filter(l => l.status === "Requested" || isOverdue(l)).sort((a, b) => isOverdue(b) - isOverdue(a));
  const stat = (n, l, icon, cls, go, f) => `<button type="button" class="card stat ${cls}" data-go="${go}" data-f="${f}">
      <span class="stat-ic">${AI[icon]}</span><span><span class="n">${n}</span><span class="l">${l}</span></span><span class="stat-go">${AI.chev}</span></button>`;
  adminShell(u, "admin/dashboard", "Dashboard", "Overview of the library today.", `
    <div class="stats">
      ${stat(db.books.length, "Book titles", "book", "", "admin/books", "")}
      ${stat(borrowed, "Books on loan", "swap", "teal", "admin/loans", "Borrowed")}
      ${stat(req, "Pending requests", "clock", "warn", "admin/loans", "Requested")}
      ${stat(over, "Overdue", "alert", "bad", "admin/loans", "Overdue")}
    </div>
    <div class="adm-grid">
      <section><div class="sec"><h2>Recent activity</h2><a href="#/admin/loans">View all loans</a></div>${loanTable(recent, false)}</section>
      <aside class="card att"><div class="sec"><h2>Needs attention</h2></div>
        ${attention.length ? `<ul>${attention.slice(0, 6).map(l => {
          const o = isOverdue(l);
          return `<li><span class="att-ic ${o ? "bad" : "warn"}">${o ? AI.alert : AI.clock}</span>
            <div class="att-t"><b>${esc(book(l.bookId)?.title || "—")}</b><small>${esc(borrower(l.borrowerId)?.name || "—")} · ${o ? `${daysLate(l)} days overdue` : `requested ${l.requested}`}</small></div></li>`;
        }).join("")}</ul>` : `<p class="att-ok">${AI.check}All caught up. Nothing needs action.</p>`}
        <a class="btn ghost small att-more" href="#/admin/loans">Open loans ${AI.chev}</a>
      </aside>
    </div>`);
  document.querySelectorAll("[data-go]").forEach(x => x.onclick = () => { loanFilter = x.dataset.f; location.hash = "#/" + x.dataset.go; });
}

function adminBooks(u) {
  const cats = [...new Set(db.books.map(b => b.category))];
  adminShell(u, "admin/books", "Books", "Add, edit and remove books in the catalog.", `
    <section class="card panel"><div class="sec"><h2 id="bft">Add a book</h2></div>
    <form class="form" id="bf">
      <div><label for="bf-t">Title</label><input id="bf-t" name="title" required></div>
      <div><label for="bf-a">Author</label><input id="bf-a" name="author" required></div>
      <div><label for="bf-c">Category</label><input id="bf-c" name="category" list="cats" required><datalist id="cats">${cats.map(c => `<option value="${esc(c)}">`).join("")}</datalist></div>
      <div><label for="bf-n">Copies</label><input id="bf-n" name="copies" type="number" min="1" value="1" required></div>
      <div><label for="bf-i">ISBN (for cover)</label><input id="bf-i" name="isbn" placeholder="978-..."></div>
      <div style="grid-column:1/-1"><label for="bf-pdf">PDF / Read URL (optional)</label><input id="bf-pdf" name="pdfUrl" placeholder="https://... or local path"></div>
      <div class="form-btns" style="grid-column:1/-1"><button class="btn" id="bsave">${AI.plus}Add book</button><button type="button" class="btn ghost" id="bcancel" hidden>Cancel</button></div>
      <input type="hidden" name="id">
    </form></section>
    <div class="sec"><h2>Catalog <span class="cnt" id="bcnt"></span></h2></div>
    <div class="bar">${searchBox("q", "Search by title or author")}</div>
    <div id="bt"></div>`);
  const f = $("#bf").elements, form = $("#bf");
  const resetForm = () => { form.reset(); f.id.value = ""; $("#bsave").innerHTML = `${AI.plus}Add book`; $("#bft").textContent = "Add a book"; $("#bcancel").hidden = true; };
  const draw = () => {
    const q = $("#q").value.toLowerCase();
    const rows = db.books.filter(b => (b.title + b.author).toLowerCase().includes(q));
    $("#bcnt").textContent = `${rows.length} of ${db.books.length}`;
    $("#bt").innerHTML = rows.length ? `<div class="tbl"><table><tr><th>Book</th><th>Category</th><th>Copies</th><th>Available</th><th></th></tr>
      ${rows.map(b => {
        const av = available(b);
        const img = bookCover(b);
        return `<tr>
          <td><div class="who-cell">
            ${img ? `<img src="${esc(img)}" alt="" style="width:36px;height:48px;object-fit:cover;border-radius:4px;flex:none">` : `<span class="adm-av">${esc(b.title[0])}</span>`}
            <div><b>${esc(b.title)}</b><small>${esc(b.author)}</small></div>
          </div></td>
          <td>${esc(b.category)}</td><td>${b.copies}</td>
          <td><span class="pill ${av > 0 ? "p-ok" : "p-bad"}">${av > 0 ? av + " available" : "None left"}</span></td>
          <td class="actions">
            <button class="btn ghost small" data-read="${b.id}">${AI.read}Read</button>
            <button class="btn ghost small" data-e="${b.id}">Edit</button>
            <button class="btn danger small" data-d="${b.id}">Delete</button>
          </td></tr>`;
      }).join("")}</table></div>`
      : `<div class="card empty">No books match your search.</div>`;

    document.querySelectorAll("[data-read]").forEach(x => x.onclick = () => openReader(x.dataset.read));
    document.querySelectorAll("[data-e]").forEach(x => x.onclick = () => {
      const b = book(x.dataset.e);
      ["id", "title", "author", "category", "copies", "isbn", "pdfUrl"].forEach(k => { if (f[k]) f[k].value = b[k] ?? ""; });
      $("#bsave").textContent = "Save changes"; $("#bft").textContent = "Edit book"; $("#bcancel").hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "center" }); f.title.focus();
    });
    document.querySelectorAll("[data-d]").forEach(x => x.onclick = () => {
      if (activeLoans(x.dataset.d)) return toast("Cannot delete: book has active loans.");
      if (!confirm("Delete this book?")) return;
      db.books = db.books.filter(b => b.id !== x.dataset.d); save(); draw(); toast("Book deleted");
    });
  };
  form.onsubmit = e => {
    e.preventDefault();
    const data = {
      title: f.title.value.trim(),
      author: f.author.value.trim(),
      category: f.category.value.trim(),
      copies: +f.copies.value,
      isbn: f.isbn.value.trim(),
      pdfUrl: f.pdfUrl.value.trim()
    };
    if (f.id.value) { Object.assign(book(f.id.value), data); toast("Book updated"); }
    else { db.books.push({ id: uid("BK"), ...data }); toast("Book added"); }
    save(); resetForm(); draw();
  };
  $("#bcancel").onclick = resetForm;
  $("#q").oninput = draw; draw();
}

function adminBorrowers(u) {
  adminShell(u, "admin/borrowers", "Borrowers", "Register students who can borrow books.", `
    <section class="card panel"><div class="sec"><h2>Register a borrower</h2></div>
    <form class="form" id="rf">
      <div><label for="rf-n">Full name</label><input id="rf-n" name="name" required></div>
      <div><label for="rf-s">Student ID</label><input id="rf-s" name="studentId" required pattern="[0-9]{6,10}" title="6–10 digits" inputmode="numeric"></div>
      <div><label for="rf-e">Email</label><input id="rf-e" name="email" type="email" required></div>
      <div><label for="rf-p">Phone</label><input id="rf-p" name="phone" type="tel" required></div>
      <div class="form-btns"><button class="btn">${AI.plus}Register</button></div>
    </form></section>
    <div class="sec"><h2>Registered students <span class="cnt" id="rcnt"></span></h2></div>
    <div class="bar">${searchBox("rq", "Search by name or student ID")}</div>
    <div id="rt"></div>`);
  const draw = () => {
    const q = $("#rq").value.toLowerCase();
    const rows = db.borrowers.filter(b => (b.name + b.studentId + b.email).toLowerCase().includes(q));
    $("#rcnt").textContent = `${rows.length} of ${db.borrowers.length}`;
    $("#rt").innerHTML = rows.length ? `<div class="tbl"><table><tr><th>Student</th><th>Student ID</th><th>Phone</th><th>Active loans</th></tr>
      ${rows.map(b => { const n = db.loans.filter(l => l.borrowerId === b.id && l.status === "Borrowed").length;
        return `<tr><td><div class="who-cell"><span class="adm-av" aria-hidden="true">${esc(initials(b.name))}</span><div><b>${esc(b.name)}</b><small>${esc(b.email)}</small></div></div></td>
        <td>${esc(b.studentId)}</td><td>${esc(b.phone)}</td><td><span class="pill ${n ? "p-info" : "p-muted"}">${n}</span></td></tr>`; }).join("")}</table></div>`
      : `<div class="card empty">No students match your search.</div>`;
  };
  $("#rf").onsubmit = e => {
    e.preventDefault(); const form = e.target, f = form.elements;
    if (db.borrowers.some(b => b.studentId === f.studentId.value.trim())) return toast("This student is already registered.");
    db.borrowers.push({ id: uid("B"), name: f.name.value.trim(), studentId: f.studentId.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim() });
    save(); form.reset(); draw(); toast("Borrower registered");
  };
  $("#rq").oninput = draw; draw();
}

function loanTable(rows, withActions) {
  if (!rows.length) return `<div class="card empty">No loans to show.</div>`;
  return `<div class="tbl"><table><tr><th>Book</th><th>Borrower</th><th>Requested</th><th>Due</th><th>Status</th>${withActions ? "<th></th>" : ""}</tr>
    ${rows.map(l => { const br = borrower(l.borrowerId); return `<tr><td><b>${esc(book(l.bookId)?.title || "—")}</b></td>
    <td>${esc(br?.name || "—")}${br ? `<small>${esc(br.studentId)}</small>` : ""}</td>
    <td>${l.requested}</td><td>${l.due || "—"}${isOverdue(l) ? `<small class="late">${daysLate(l)} days late</small>` : ""}</td><td>${statusPill(l)}</td>
    ${withActions ? `<td class="actions">${l.status === "Requested" ? `<button class="btn small" data-a="${l.id}">Approve</button><button class="btn ghost small" data-r="${l.id}">Reject</button>`
      : l.status === "Borrowed" ? `<button class="btn ghost small" data-ret="${l.id}">Mark returned</button>` : ""}</td>` : ""}</tr>`; }).join("")}</table></div>`;
}

function adminLoans(u) {
  let s = loanFilter; loanFilter = "";
  adminShell(u, "admin/loans", "Loans", "Approve borrow requests and record returns.", `
    <div class="adm-tabs" id="fs" role="tablist"></div>
    <div class="bar">${searchBox("lq", "Search by book or borrower")}</div>
    <div id="lt"></div>`);
  const TABS = [["", "All"], ["Requested", "Requested"], ["Borrowed", "Borrowed"], ["Overdue", "Overdue"], ["Returned", "Returned"], ["Rejected", "Rejected"]];
  const match = (l, k) => !k || (k === "Overdue" ? isOverdue(l) : l.status === k);
  const draw = () => {
    $("#fs").innerHTML = TABS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${k === s}" class="${k === s ? "on" : ""}" data-s="${k}">${t}<i>${db.loans.filter(l => match(l, k)).length}</i></button>`).join("");
    document.querySelectorAll("[data-s]").forEach(x => x.onclick = () => { s = x.dataset.s; draw(); });
    const q = $("#lq").value.toLowerCase();
    const rows = db.loans.filter(l => match(l, s) && ((book(l.bookId)?.title || "") + (borrower(l.borrowerId)?.name || "") + (borrower(l.borrowerId)?.studentId || "")).toLowerCase().includes(q));
    $("#lt").innerHTML = loanTable(rows, true);
    const L = id => db.loans.find(l => l.id === id);
    document.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const l = L(x.dataset.a); l.status = "Borrowed"; l.due = addDays(today(), LOAN_DAYS); save(); draw(); refreshBadge(); toast("Request approved"); });
    document.querySelectorAll("[data-r]").forEach(x => x.onclick = () => { L(x.dataset.r).status = "Rejected"; save(); draw(); refreshBadge(); toast("Request rejected"); });
    document.querySelectorAll("[data-ret]").forEach(x => x.onclick = () => { L(x.dataset.ret).status = "Returned"; save(); draw(); toast("Book marked as returned"); });
  };
  const refreshBadge = () => { const n = db.loans.filter(l => l.status === "Requested").length, em = $(".adm-nav a.on em"); if (em) n ? em.textContent = n : em.remove(); };
  $("#lq").oninput = draw; draw();
}

// ---------- Borrower (UQU portal style, matching Admin) ----------
const ME_LINKS = [
  ["me/catalog", "Browse books", "book"],
  ["me/loans", "My loans", "swap"]
];
const UQU_COLORS = ["#1d4d33", "#1f6f6b", "#3a8159", "#8f6a33", "#1c8354", "#285e61", "#4a6b53", "#7c5e32"];

function borrowerShell(u, current, title, lead, body) {
  const activeCount = db.loans.filter(l => l.borrowerId === u.borrowerId && (l.status === "Requested" || l.status === "Borrowed")).length;
  $("#app").innerHTML = `
  <div class="gp adm">
    <div class="gp-strip"><div class="gp-in"><span><i class="gp-flag"></i>An official service of Umm Al-Qura University</span><span>English</span></div></div>
    <header class="gp-head"><div class="gp-in">
      <div class="gp-brand"><img class="gp-mark" src="assets/uqu-logo.png" alt="Umm Al-Qura University logo"><div><b>UniLib</b><small>Student Library Portal</small></div></div>
      <div class="adm-who"><span class="adm-av" aria-hidden="true">${esc(initials(u.name))}</span>
        <div class="adm-id"><b>${esc(u.name)}</b><span class="role">Borrower</span></div>
        <button type="button" class="gp-link" id="logout">${AI.out}Sign out</button></div>
    </div></header>
    <nav class="adm-nav" aria-label="Borrower"><div class="gp-in">
      ${ME_LINKS.map(([h, t, i]) => `<a href="#/${h}" class="${h === current ? "on" : ""}"${h === current ? ' aria-current="page"' : ""}>${AI[i]}${t}${h === "me/loans" && activeCount ? `<em title="Active requests & loans">${activeCount}</em>` : ""}</a>`).join("")}
    </div></nav>
    <main>
      <section class="adm-hero"><div class="adm-in">
        <div class="adm-crumb">Borrower portal ${AI.chev} ${title}</div>
        <h1>${title}</h1><p>${lead}</p>
      </div></section>
      <div class="adm-in adm-body">${body}</div>
    </main>
    <footer class="gp-foot"><div class="gp-in"><span>© 2026 Umm Al-Qura University. All rights reserved.</span><b>UniLib · Student Library Portal</b></div></footer>
  </div>`;
  $("#logout").onclick = () => { setSession(null); location.hash = ""; route(); };
}

function meCatalog(u) {
  const cats = [...new Set(db.books.map(b => b.category))];
  borrowerShell(u, "me/catalog", "Browse books", "Search the university catalog and request a book to borrow.", `
    <div class="sec"><h2>Library catalog <span class="cnt" id="mcnt"></span></h2></div>
    <div class="bar">
      ${searchBox("q", "Search by title or author")}
      <select id="c" aria-label="Filter by category"><option value="">All categories</option>${cats.map(c => `<option>${esc(c)}</option>`).join("")}</select>
    </div>
    <div class="books" id="bk"></div>`);

  const draw = () => {
    const q = $("#q").value.toLowerCase(), c = $("#c").value;
    const rows = db.books.filter(b => (b.title + b.author).toLowerCase().includes(q) && (!c || b.category === c));
    $("#mcnt").textContent = `${rows.length} of ${db.books.length}`;
    $("#bk").innerHTML = rows.length ? rows.map(b => {
      const av = available(b);
      const myLoan = db.loans.find(l => l.bookId === b.id && l.borrowerId === u.borrowerId && (l.status === "Requested" || l.status === "Borrowed"));
      const mine = !!myLoan;
      const color = UQU_COLORS[db.books.indexOf(b) % UQU_COLORS.length];
      const img = bookCover(b);
      return `<div class="card book">
        <div class="cover" style="background:${color}">
          ${img ? `<img src="${esc(img)}" alt="${esc(b.title)}" data-fb="${esc(`<span>${esc(b.title[0])}</span>`)}" onerror="this.outerHTML=this.dataset.fb">` : `<span>${esc(b.title[0])}</span>`}
          <small>${esc(b.category)}</small>
        </div>
        <div class="t">${esc(b.title)}</div>
        <div class="a">${esc(b.author)}</div>
        <div class="row">
          <span class="pill ${av > 0 ? "p-ok" : "p-bad"}">${av > 0 ? av + " available" : "Unavailable"}</span>
          <div style="display:flex;gap:4px">
            <button type="button" class="btn ghost small" data-read="${b.id}" title="Read book">${AI.read} Read</button>
            <button class="btn small" data-b="${b.id}" ${av < 1 || mine ? "disabled" : ""}>${mine ? myLoan.status : `${AI.plus}Borrow`}</button>
          </div>
        </div>
      </div>`;
    }).join("") : `<div class="card empty">No books match your search.</div>`;

    document.querySelectorAll("[data-read]").forEach(btn => btn.onclick = () => openReader(btn.dataset.read));
    document.querySelectorAll("[data-b]").forEach(x => x.onclick = () => {
      db.loans.push({ id: uid("L"), bookId: x.dataset.b, borrowerId: u.borrowerId, requested: today(), due: "", status: "Requested" });
      save();
      draw();
      const activeCount = db.loans.filter(l => l.borrowerId === u.borrowerId && (l.status === "Requested" || l.status === "Borrowed")).length;
      const loanTab = document.querySelector('.adm-nav a[href="#/me/loans"]');
      if (loanTab) {
        let em = loanTab.querySelector("em");
        if (!em) { em = document.createElement("em"); loanTab.appendChild(em); }
        em.textContent = activeCount;
      }
      toast("Borrow request sent to the library");
    });
  };
  $("#q").oninput = draw;
  $("#c").onchange = draw;
  draw();
}

function meLoans(u) {
  let statusTab = "";
  const allMine = () => db.loans.filter(l => l.borrowerId === u.borrowerId).reverse();
  const mine = allMine();
  const borrowed = mine.filter(l => l.status === "Borrowed").length;
  const requested = mine.filter(l => l.status === "Requested").length;
  const overdue = mine.filter(isOverdue).length;
  const returned = mine.filter(l => l.status === "Returned").length;

  const stat = (n, l, icon, cls, filterVal) => `<button type="button" class="card stat ${cls}" data-lf="${filterVal}">
    <span class="stat-ic">${AI[icon]}</span><span><span class="n">${n}</span><span class="l">${l}</span></span><span class="stat-go">${AI.chev}</span></button>`;

  borrowerShell(u, "me/loans", "My loans", "Track your requests, borrowed books, and read online.", `
    <div class="stats">
      ${stat(borrowed, "Currently borrowed", "swap", "teal", "Borrowed")}
      ${stat(requested, "Pending requests", "clock", "warn", "Requested")}
      ${stat(overdue, "Overdue books", "alert", "bad", "Overdue")}
      ${stat(returned, "Returned", "check", "", "Returned")}
    </div>
    <div class="adm-tabs" id="mfs" role="tablist"></div>
    <div id="mlt"></div>`);

  const TABS = [["", "All"], ["Requested", "Requested"], ["Borrowed", "Borrowed"], ["Overdue", "Overdue"], ["Returned", "Returned"], ["Rejected", "Rejected"]];
  const match = (l, k) => !k || (k === "Overdue" ? isOverdue(l) : l.status === k);

  const draw = () => {
    const list = allMine();
    $("#mfs").innerHTML = TABS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${k === statusTab}" class="${k === statusTab ? "on" : ""}" data-ms="${k}">${t}<i>${list.filter(l => match(l, k)).length}</i></button>`).join("");
    document.querySelectorAll("[data-ms]").forEach(x => x.onclick = () => { statusTab = x.dataset.ms; draw(); });

    const rows = list.filter(l => match(l, statusTab));
    $("#mlt").innerHTML = rows.length ? `<div class="tbl"><table>
      <tr><th>Book</th><th>Category</th><th>Requested</th><th>Due date</th><th>Status</th><th>Action</th></tr>
      ${rows.map(l => {
        const b = book(l.bookId);
        return `<tr>
          <td><b>${esc(b?.title || "—")}</b>${b ? `<small>${esc(b.author)}</small>` : ""}</td>
          <td>${esc(b?.category || "—")}</td>
          <td>${l.requested}</td>
          <td>${l.due || "—"}${isOverdue(l) ? `<small class="late">${daysLate(l)} days late</small>` : ""}</td>
          <td>${statusPill(l)}</td>
          <td>
            ${b ? `<button type="button" class="btn ghost small" data-read="${b.id}">${AI.read} Read</button>` : "—"}
          </td>
        </tr>`;
      }).join("")}
    </table></div>` : `<div class="card empty">No loans to show in this category.</div>`;

    document.querySelectorAll("[data-read]").forEach(btn => btn.onclick = () => openReader(btn.dataset.read));
  };

  document.querySelectorAll("[data-lf]").forEach(x => x.onclick = () => { statusTab = x.dataset.lf; draw(); });
  draw();
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
