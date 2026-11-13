// Mock data for the Sprint 1 prototype (no real backend yet).
const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", role: "admin", name: "Library Admin" },
  { username: "s441001", password: "1234", role: "borrower", name: "Ahmed Ali", borrowerId: "B1" },
  { username: "s441002", password: "1234", role: "borrower", name: "Sara Hassan", borrowerId: "B2" }
];

const SEED = {
  books: [
    { id: "BK1", title: "Software Engineering", author: "Ian Sommerville", category: "Computer Science", isbn: "978-0133943030", copies: 3 },
    { id: "BK2", title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", isbn: "978-0132350884", copies: 2 },
    { id: "BK3", title: "Database System Concepts", author: "Silberschatz et al.", category: "Computer Science", isbn: "978-0078022159", copies: 2 },
    { id: "BK4", title: "Calculus: Early Transcendentals", author: "James Stewart", category: "Mathematics", isbn: "978-1285741550", copies: 4 },
    { id: "BK5", title: "Principles of Physics", author: "Halliday & Resnick", category: "Physics", isbn: "978-1118230749", copies: 1 },
    { id: "BK6", title: "Introduction to Algorithms", author: "Cormen et al.", category: "Computer Science", isbn: "978-0262033848", copies: 2 },
    { id: "BK7", title: "Organic Chemistry", author: "Paula Bruice", category: "Chemistry", isbn: "978-0134042282", copies: 2 },
    { id: "BK8", title: "Principles of Marketing", author: "Philip Kotler", category: "Business", isbn: "978-0134492513", copies: 3 }
  ],
  borrowers: [
    { id: "B1", name: "Ahmed Ali", studentId: "441001", email: "s441001@uni.edu.sa", phone: "0500000001" },
    { id: "B2", name: "Sara Hassan", studentId: "441002", email: "s441002@uni.edu.sa", phone: "0500000002" },
    { id: "B3", name: "Khalid Omar", studentId: "441003", email: "s441003@uni.edu.sa", phone: "0500000003" }
  ],
  loans: [
    { id: "L1", bookId: "BK1", borrowerId: "B1", requested: "2026-10-20", due: "2026-11-03", status: "Borrowed" },
    { id: "L2", bookId: "BK4", borrowerId: "B1", requested: "2026-10-28", due: "2026-11-11", status: "Borrowed" },
    { id: "L3", bookId: "BK2", borrowerId: "B2", requested: "2026-11-03", due: "", status: "Requested" },
    { id: "L4", bookId: "BK5", borrowerId: "B3", requested: "2026-10-01", due: "2026-10-15", status: "Returned" }
  ]
};
