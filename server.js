const express = require("express");
const session = require("express-session");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { chapters } = require("./data/content");

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "uploads");
const videosPath = path.join(dataDir, "videos.json");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "oetadmin123";

function ensureDataFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
  }
}

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

function requireAdmin(req, res, next) {
  if (req.session.role !== "admin") {
    return res.status(401).json({ error: "Admin access required." });
  }
  return next();
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
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/app.js", (_req, res) => {
  res.sendFile(path.join(__dirname, "app.js"));
});
app.get("/styles.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "styles.css"));
});
app.use("/uploads", express.static(uploadsDir));

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

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

app.get("/api/admin/me", (req, res) => {
  if (req.session.role !== "admin") {
    return res.json({ authenticated: false });
  }
  return res.json({ authenticated: true, username: req.session.username });
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

app.get("/api/chapters", (_req, res) => {
  const response = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    estimatedMinutes: chapter.estimatedMinutes
  }));

  return res.json(response);
});

app.get("/api/chapters/:id", (req, res) => {
  const chapterId = Number(req.params.id);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: "Chapter not found." });
  }

  return res.json({ chapter: sanitizeChapterForClient(chapter) });
});

app.post("/api/quiz/:chapterId/check", (req, res) => {
  const chapterId = Number(req.params.chapterId);
  const { questionId, answerIndex } = req.body || {};

  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: "Chapter not found." });
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

app.get("/api/certificate/download", (req, res) => {
  const rawName = typeof req.query.name === "string" ? req.query.name.trim() : "";
  const recipientName = rawName.slice(0, 80) || "OET Candidate";
  // Strip characters that could break the Content-Disposition header or PDF rendering.
  const safeFileNamePart = recipientName.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "candidate";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="oet-certificate-${safeFileNamePart}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  doc.rect(35, 35, 525, 772).lineWidth(3).stroke("#0f766e");
  doc.fontSize(30).fillColor("#0f2230").text("Certificate of Completion", 0, 120, { align: "center" });
  doc.fontSize(15).fillColor("#5f6f78").text("This certifies that", 0, 185, { align: "center" });
  doc.fontSize(28).fillColor("#b45309").text(recipientName, 0, 225, { align: "center" });
  doc.fontSize(14).fillColor("#0f2230").text("has completed the OET Self-Study Training Program", 0, 280, { align: "center" });
  doc.fontSize(18).fillColor("#0f766e").text("OET Self-Study Training Program", 0, 310, { align: "center" });
  doc.fontSize(12).fillColor("#5f6f78").text(`Date: ${new Date().toLocaleDateString()}`, 80, 620);
  doc.fontSize(12).fillColor("#5f6f78").text("CEO: Dr Awo Dompreh", 80, 645);
  doc.fontSize(11).fillColor("#5f6f78").text("Issued by OET Smart Prep Platform", 0, 710, { align: "center" });

  doc.end();
});

app.listen(PORT, () => {
  console.log(`OET training platform running at http://localhost:${PORT}`);
});
