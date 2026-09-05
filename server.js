const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { chapters } = require("./data/content");

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "uploads");
const usersPath = path.join(dataDir, "users.json");
const progressPath = path.join(dataDir, "progress.json");
const videosPath = path.join(dataDir, "videos.json");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "oetadmin123";

function ensureDataFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
  }
}

ensureDataFile(usersPath, []);
ensureDataFile(progressPath, {});
ensureDataFile(videosPath, {});
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".mp4";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function chapterIsUnlocked(chapterId, completedChapterIds) {
  if (chapterId === 1) {
    return true;
  }
  return completedChapterIds.includes(chapterId - 1);
}

function sanitizeChapterForClient(chapter) {
  const videos = readJson(videosPath);
  const customVideo = videos[String(chapter.id)];

  return {
    id: chapter.id,
    title: chapter.title,
    estimatedMinutes: chapter.estimatedMinutes,
    objectives: chapter.objectives,
    lessonPoints: chapter.lessonPoints,
    studyMaterials: chapter.studyMaterials || null,
    videoTitle: chapter.videoTitle,
    videoEmbedUrl: chapter.videoEmbedUrl,
    customVideoUrl: customVideo ? `/uploads/${customVideo.filename}` : null,
    quiz: chapter.quiz.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options
    }))
  };
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (req.session.role !== "admin") {
    return res.status(401).json({ error: "Admin access required." });
  }
  return next();
}

function studentHasCertificate(userId) {
  const progress = readJson(progressPath);
  const userProgress = progress[userId] || { completed: [] };
  return userProgress.completed.includes(7);
}

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "oet-training-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: "Username must be at least 3 chars and password at least 6 chars." });
  }

  const users = readJson(usersPath);
  const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Username already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJson(usersPath, users);

  const progress = readJson(progressPath);
  progress[newUser.id] = { completed: [] };
  writeJson(progressPath, progress);

  req.session.userId = newUser.id;
  req.session.username = newUser.username;
  req.session.role = "student";

  return res.status(201).json({ message: "Registration successful.", username: newUser.username });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const users = readJson(usersPath);
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = "student";

  return res.json({ message: "Login successful.", username: user.username });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin credentials." });
  }

  req.session.userId = "admin";
  req.session.username = ADMIN_USERNAME;
  req.session.role = "admin";

  return res.json({ message: "Admin login successful.", username: ADMIN_USERNAME, role: "admin" });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    userId: req.session.userId,
    username: req.session.username,
    role: req.session.role || "student"
  });
});

app.get("/api/admin/students", requireAdmin, (_req, res) => {
  const users = readJson(usersPath);
  const progress = readJson(progressPath);

  const rows = users.map((user) => {
    const completed = (progress[user.id] && progress[user.id].completed) || [];
    const percent = Math.round((completed.length / chapters.length) * 100);
    return {
      userId: user.id,
      username: user.username,
      completedCount: completed.length,
      completedChapters: completed,
      progressPercent: percent,
      certificateEligible: completed.includes(7),
      createdAt: user.createdAt
    };
  });

  return res.json({ students: rows, totalStudents: rows.length });
});

app.get("/api/admin/videos", requireAdmin, (_req, res) => {
  const videos = readJson(videosPath);
  return res.json({ videos });
});

app.post("/api/admin/chapters/:id/video", requireAdmin, upload.single("video"), (req, res) => {
  const chapterId = Number(req.params.id);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(404).json({ error: "Chapter not found." });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Video file is required." });
  }

  const videoExtensions = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi"]);
  const fileExt = path.extname(req.file.originalname || "").toLowerCase();
  const isVideoMime = String(req.file.mimetype || "").startsWith("video/");
  if (!isVideoMime && !videoExtensions.has(fileExt)) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: "Only video files are allowed." });
  }

  const videos = readJson(videosPath);
  const key = String(chapterId);

  if (videos[key] && videos[key].filename) {
    const oldFilePath = path.join(uploadsDir, videos[key].filename);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  videos[key] = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    uploadedAt: new Date().toISOString()
  };

  writeJson(videosPath, videos);

  return res.json({
    message: "Chapter video uploaded successfully.",
    chapterId,
    videoUrl: `/uploads/${req.file.filename}`
  });
});

app.get("/api/chapters", requireAuth, (req, res) => {
  const progress = readJson(progressPath);
  const userProgress = progress[req.session.userId] || { completed: [] };

  const response = chapters.map((chapter) => {
    const unlocked = chapterIsUnlocked(chapter.id, userProgress.completed);
    const completed = userProgress.completed.includes(chapter.id);
    return {
      id: chapter.id,
      title: chapter.title,
      estimatedMinutes: chapter.estimatedMinutes,
      unlocked,
      completed
    };
  });

  return res.json(response);
});

app.get("/api/chapters/:id", requireAuth, (req, res) => {
  const chapterId = Number(req.params.id);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: "Chapter not found." });
  }

  const progress = readJson(progressPath);
  const userProgress = progress[req.session.userId] || { completed: [] };

  if (!chapterIsUnlocked(chapterId, userProgress.completed)) {
    return res.status(403).json({ error: "You must complete previous chapter first." });
  }

  const completed = userProgress.completed.includes(chapterId);

  return res.json({
    chapter: sanitizeChapterForClient(chapter),
    completed
  });
});

app.post("/api/quiz/:chapterId/check", requireAuth, (req, res) => {
  const chapterId = Number(req.params.chapterId);
  const { questionId, answerIndex } = req.body || {};

  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: "Chapter not found." });
  }

  const progress = readJson(progressPath);
  const userProgress = progress[req.session.userId] || { completed: [] };
  if (!chapterIsUnlocked(chapterId, userProgress.completed)) {
    return res.status(403).json({ error: "Chapter is locked." });
  }

  const question = chapter.quiz.find((q) => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: "Question not found." });
  }

  const correct = Number(answerIndex) === question.correctIndex;
  return res.json({
    correct,
    correctIndex: question.correctIndex,
    explanation: question.explanation
  });
});

app.post("/api/chapters/:id/complete", requireAuth, (req, res) => {
  const chapterId = Number(req.params.id);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: "Chapter not found." });
  }

  const submittedAnswers = req.body && req.body.answers;
  if (!submittedAnswers || typeof submittedAnswers !== "object") {
    return res.status(400).json({ error: "Answers object is required." });
  }

  const progress = readJson(progressPath);
  const userProgress = progress[req.session.userId] || { completed: [] };

  if (!chapterIsUnlocked(chapterId, userProgress.completed)) {
    return res.status(403).json({ error: "Chapter is locked." });
  }

  const allCorrect = chapter.quiz.every((q) => Number(submittedAnswers[q.id]) === q.correctIndex);
  if (!allCorrect) {
    return res.status(400).json({ error: "All quiz answers must be correct before completing this chapter." });
  }

  if (!userProgress.completed.includes(chapterId)) {
    userProgress.completed.push(chapterId);
    userProgress.completed.sort((a, b) => a - b);
  }

  progress[req.session.userId] = userProgress;
  writeJson(progressPath, progress);

  return res.json({ message: "Chapter completed.", completed: userProgress.completed });
});

app.get("/api/certificate", requireAuth, (req, res) => {
  if (req.session.role === "admin") {
    return res.status(400).json({ error: "Certificate is only for students." });
  }

  const eligible = studentHasCertificate(req.session.userId);
  return res.json({
    eligible,
    username: req.session.username,
    issuedTo: req.session.username,
    ceoName: "Dr Awo Dompreh"
  });
});

app.get("/api/certificate/download", requireAuth, (req, res) => {
  if (req.session.role === "admin") {
    return res.status(400).json({ error: "Certificate is only for students." });
  }

  if (!studentHasCertificate(req.session.userId)) {
    return res.status(403).json({ error: "Complete Chapter 7 to unlock your certificate." });
  }

  const fileName = `oet-certificate-${req.session.username}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  doc.rect(35, 35, 525, 772).lineWidth(3).stroke("#0f766e");
  doc.fontSize(30).fillColor("#0f2230").text("Certificate of Completion", 0, 120, { align: "center" });
  doc.fontSize(15).fillColor("#5f6f78").text("This certifies that", 0, 185, { align: "center" });
  doc.fontSize(28).fillColor("#b45309").text(req.session.username, 0, 225, { align: "center" });
  doc.fontSize(14).fillColor("#0f2230").text("has successfully completed all chapters of", 0, 280, { align: "center" });
  doc.fontSize(18).fillColor("#0f766e").text("OET Self-Study Training Program", 0, 310, { align: "center" });
  doc.fontSize(12).fillColor("#5f6f78").text(`Date: ${new Date().toLocaleDateString()}`, 80, 620);
  doc.fontSize(12).fillColor("#5f6f78").text("CEO: Dr Awo Dompreh", 80, 645);
  doc.fontSize(11).fillColor("#5f6f78").text("Issued by OET Smart Prep Platform", 0, 710, { align: "center" });

  doc.end();
});

app.listen(PORT, () => {
  console.log(`OET training platform running at http://localhost:${PORT}`);
});
