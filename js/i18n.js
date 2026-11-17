// UniLib – Arabic / English language switch.
// Self-contained add-on: app.js is NOT changed. This file watches the page and translates
// the rendered English text into Arabic (and back), and turns the "English" label in the
// top strip into a language toggle. Choice is remembered in localStorage ("unilib-lang").
// ?lang=ar or ?lang=en in the URL forces a language (handy for screenshots).
(function () {
  const LANG_KEY = "unilib-lang";

  const AR = {
    // page title + shared header/footer
    "UniLib – University Library Borrowing": "UniLib – نظام استعارة كتب المكتبة الجامعية",
    "An official service of Umm Al-Qura University": "خدمة رسمية تابعة لجامعة أم القرى",
    "Umm Al-Qura University Library": "مكتبة جامعة أم القرى",
    "Umm Al-Qura University logo": "شعار جامعة أم القرى",
    "Library website": "موقع المكتبة",
    "© 2026 Umm Al-Qura University. All rights reserved.": "© 2026 جامعة أم القرى. جميع الحقوق محفوظة.",
    "UniLib · University Library Borrowing": "UniLib · استعارة كتب المكتبة الجامعية",
    "UniLib · Library Administration": "UniLib · إدارة المكتبة",
    "UniLib · Student Library Portal": "UniLib · بوابة الطالب للمكتبة",
    "Library Administration": "إدارة المكتبة",
    "Student Library Portal": "بوابة الطالب للمكتبة",
    "Sign out": "تسجيل الخروج",
    "Admin": "مشرف",
    "Borrower": "مستعير",
    "Library Admin": "مشرف المكتبة",
    "Administration": "الإدارة",

    // login
    "Sign in to UniLib": "تسجيل الدخول إلى UniLib",
    "University Library Borrowing System": "نظام استعارة كتب المكتبة الجامعية",
    "Username": "اسم المستخدم",
    "Password": "كلمة المرور",
    "s441001 or admin": "s441001 أو admin",
    "Show password": "إظهار كلمة المرور",
    "Sign in": "تسجيل الدخول",
    "Prototype demo accounts": "حسابات تجريبية للنموذج الأولي",
    "Invalid username or password.": "اسم المستخدم أو كلمة المرور غير صحيحة.",

    // navigation + page headers
    "Dashboard": "لوحة التحكم",
    "Books": "الكتب",
    "Borrowers": "المستعيرون",
    "Loans": "الاستعارات",
    "Admin portal": "بوابة المشرف",
    "Borrower portal": "بوابة المستعير",
    "Browse books": "تصفّح الكتب",
    "My loans": "استعاراتي",
    "Pending requests": "طلبات قيد الانتظار",
    "Active requests & loans": "الطلبات والاستعارات النشطة",
    "Overview of the library today.": "نظرة عامة على المكتبة اليوم.",
    "Add, edit and remove books in the catalog.": "إضافة الكتب وتعديلها وحذفها من الفهرس.",
    "Register students who can borrow books.": "تسجيل الطلاب المسموح لهم باستعارة الكتب.",
    "Approve borrow requests and record returns.": "الموافقة على طلبات الاستعارة وتسجيل الإرجاع.",
    "Search the university catalog and request a book to borrow.": "ابحث في فهرس الجامعة واطلب استعارة كتاب.",
    "Track your requests, borrowed books, and read online.": "تابع طلباتك وكتبك المستعارة واقرأ أونلاين.",

    // dashboard
    "Book titles": "عناوين الكتب",
    "Books on loan": "كتب مُعارة",
    "Overdue": "متأخرة",
    "Recent activity": "آخر النشاطات",
    "View all loans": "عرض كل الاستعارات",
    "Needs attention": "يحتاج متابعة",
    "All caught up. Nothing needs action.": "كل شيء تمام، لا يوجد ما يحتاج إجراء.",
    "Open loans": "فتح الاستعارات",

    // tables
    "Book": "الكتاب",
    "Category": "التصنيف",
    "Copies": "النسخ",
    "Available": "المتاح",
    "Student": "الطالب",
    "Student ID": "الرقم الجامعي",
    "Phone": "الجوال",
    "Active loans": "الاستعارات النشطة",
    "Requested": "تم الطلب",
    "Due": "تاريخ الإرجاع",
    "Due date": "تاريخ الإرجاع",
    "Status": "الحالة",
    "Action": "إجراء",

    // books page
    "Add a book": "إضافة كتاب",
    "Edit book": "تعديل الكتاب",
    "Title": "العنوان",
    "Author": "المؤلف",
    "ISBN (for cover)": "ISBN (لصورة الغلاف)",
    "PDF / Read URL (optional)": "رابط PDF / القراءة (اختياري)",
    "https://... or local path": "https://... أو مسار محلي",
    "Add book": "إضافة الكتاب",
    "Save changes": "حفظ التعديلات",
    "Cancel": "إلغاء",
    "Catalog": "الفهرس",
    "Search by title or author": "ابحث بالعنوان أو المؤلف",
    "Read": "قراءة",
    "Read book": "قراءة الكتاب",
    "Edit": "تعديل",
    "Delete": "حذف",
    "None left": "لا يوجد",
    "Unavailable": "غير متاح",
    "No books match your search.": "لا توجد كتب مطابقة لبحثك.",
    "Cannot delete: book has active loans.": "لا يمكن الحذف: الكتاب عليه استعارات نشطة.",
    "Delete this book?": "هل تريد حذف هذا الكتاب؟",
    "Book deleted": "تم حذف الكتاب",
    "Book updated": "تم تحديث الكتاب",
    "Book added": "تمت إضافة الكتاب",

    // borrowers page
    "Register a borrower": "تسجيل مستعير",
    "Full name": "الاسم الكامل",
    "Email": "البريد الإلكتروني",
    "Register": "تسجيل",
    "Registered students": "الطلاب المسجّلون",
    "Search by name or student ID": "ابحث بالاسم أو الرقم الجامعي",
    "No students match your search.": "لا يوجد طلاب مطابقون لبحثك.",
    "This student is already registered.": "هذا الطالب مسجّل مسبقاً.",
    "Borrower registered": "تم تسجيل المستعير",
    "6–10 digits": "من 6 إلى 10 أرقام",

    // loans page
    "All": "الكل",
    "Borrowed": "مُعار",
    "Returned": "مُرجع",
    "Rejected": "مرفوض",
    "Search by book or borrower": "ابحث بالكتاب أو المستعير",
    "No loans to show.": "لا توجد استعارات لعرضها.",
    "No loans to show in this category.": "لا توجد استعارات في هذا التصنيف.",
    "Approve": "موافقة",
    "Reject": "رفض",
    "Mark returned": "تسجيل الإرجاع",
    "Request approved": "تمت الموافقة على الطلب",
    "Request rejected": "تم رفض الطلب",
    "Book marked as returned": "تم تسجيل إرجاع الكتاب",

    // borrower pages
    "Library catalog": "فهرس المكتبة",
    "Filter by category": "تصفية حسب التصنيف",
    "All categories": "كل التصنيفات",
    "Borrow": "استعارة",
    "Borrow request sent to the library": "تم إرسال طلب الاستعارة للمكتبة",
    "Currently borrowed": "مُعارة حالياً",
    "Overdue books": "كتب متأخرة",

    // reader
    "Close": "إغلاق",
    "No digital PDF file is attached to this prototype entry yet. You can attach a PDF link via Admin or enjoy reading the physical copy!":
      "لا يوجد ملف PDF مرفق لهذا الكتاب في النموذج الأولي حتى الآن. يمكن للمشرف إرفاق رابط PDF، أو استمتع بقراءة النسخة الورقية!",

    // seed categories
    "Computer Science": "علوم الحاسب",
    "Mathematics": "الرياضيات",
    "Physics": "الفيزياء",
    "Chemistry": "الكيمياء",
    "Business": "إدارة الأعمال"
  };

  // Same English word, different Arabic inside table headers
  const AR_TH = { "Requested": "تاريخ الطلب", "Due": "تاريخ الإرجاع" };

  // Text that contains numbers, dates or names.
  const PATTERNS = [
    [/^(\d+) of (\d+)$/, "$1 من $2"],
    [/^(\d+) available$/, "$1 متاح"],
    [/^(\d+) days late$/, "متأخر $1 يوم"],
    [/^(.*) · (\d+) days overdue$/, "$1 · متأخر $2 يوم"],
    [/^(.*) · requested (.+)$/, "$1 · طُلب في ⁦$2⁩"],
    [/^📖 Reading Mode: (.*)$/, "📖 وضع القراءة: $1"],
    [/^Borrower: (.*)$/, "المستعير: $1"],
    [/^Admin: (.*)$/, "المشرف: $1"]
  ];

  const ATTRS = ["placeholder", "title", "aria-label", "alt"];
  const SKIP = "script,style,textarea,[data-i18n-skip]";

  function tr(text, parent) {
    const core = text.replace(/\s+/g, " ").trim();
    if (!core) return null;
    let out = parent && parent.nodeName === "TH" && AR_TH[core] !== undefined ? AR_TH[core] : AR[core];
    if (out === undefined) {
      for (const [re, rep] of PATTERNS) if (re.test(core)) { out = core.replace(re, rep); break; }
    }
    if (out === undefined) return null;
    // keep the surrounding spaces so icons/labels stay apart
    return (/^\s/.test(text) ? " " : "") + out + (/\s$/.test(text) ? " " : "");
  }

  let lang = "en";
  try { lang = localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en"; } catch (e) { }
  const forced = new URLSearchParams(location.search).get("lang");
  if (forced === "ar" || forced === "en") lang = forced;

  // remember originals so switching back to English needs no re-render (form input is kept)
  const origText = new WeakMap();   // Text -> { en, ar }
  const origAttr = new WeakMap();   // Element -> { attr: { en, ar } }
  const touched = new Set();
  const origTitle = document.title;

  function translateTree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n = root;
    while (n) {
      if (n.nodeType === 1) {
        if (n.matches(SKIP)) { n = skipNode(walker, n); continue; }
        for (const a of ATTRS) {
          const v = n.getAttribute(a);
          if (!v) continue;
          const t = tr(v);
          if (t === null) continue;
          const m = origAttr.get(n) || {};
          m[a] = { en: v, ar: t };
          origAttr.set(n, m); touched.add(n);
          n.setAttribute(a, t);
        }
      } else if (n.nodeType === 3) {
        const t = tr(n.data, n.parentNode);
        if (t !== null) {
          const p = n.parentNode;
          // <option>Text</option> uses its text as value – keep the English value for the app's filters
          if (p && p.nodeName === "OPTION" && !p.hasAttribute("value")) p.setAttribute("value", n.data.trim());
          origText.set(n, { en: n.data, ar: t }); touched.add(n);
          n.data = t;
        }
      }
      n = walker.nextNode();
    }
  }
  function skipNode(walker, el) {
    walker.currentNode = el;
    let next = walker.nextSibling();
    let up = el;
    while (!next && up.parentNode && up !== document.body) { walker.currentNode = up = up.parentNode; next = walker.nextSibling(); }
    return next;
  }

  function restoreEnglish() {
    for (const n of touched) {
      if (!n.isConnected) { touched.delete(n); continue; }
      if (n.nodeType === 3) {
        const o = origText.get(n);
        if (o && n.data === o.ar) n.data = o.en;
      } else {
        const m = origAttr.get(n) || {};
        for (const a in m) if (n.getAttribute(a) === m[a].ar) n.setAttribute(a, m[a].en);
      }
    }
    touched.clear();
  }

  // The "English" label in the top strip becomes the switch.
  const GLOBE = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`;
  function decorateToggles() {
    document.querySelectorAll(".gp-strip .gp-in > span:last-child").forEach(span => {
      let btn = span.querySelector(".lang-btn");
      if (!btn) {
        span.innerHTML = "";
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lang-btn";
        btn.setAttribute("data-i18n-skip", "");
        btn.onclick = () => setLang(lang === "ar" ? "en" : "ar");
        span.appendChild(btn);
      }
      const label = lang === "ar" ? "English" : "العربية";
      btn.innerHTML = `${GLOBE}<span lang="${lang === "ar" ? "en" : "ar"}">${label}</span>`;
      btn.title = lang === "ar" ? "Switch to English" : "التحويل إلى العربية";
    });
  }

  let obs;
  function apply() {
    if (obs) obs.disconnect();
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    if (lang === "ar") { translateTree(document.body); document.title = tr(origTitle) || origTitle; }
    else { restoreEnglish(); document.title = origTitle; }
    decorateToggles();
    if (obs) obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { }
    apply();
  }

  // messages shown with confirm() come from app.js in English
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = msg => nativeConfirm(lang === "ar" ? (tr(String(msg)) || msg) : msg);

  obs = new MutationObserver(apply);
  apply();
  window.UniLibLang = { get: () => lang, set: setLang };
})();
