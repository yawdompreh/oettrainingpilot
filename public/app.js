const authCard = document.getElementById("authCard");
const learningArea = document.getElementById("learningArea");
const chapterList = document.getElementById("chapterList");
const chapterDetail = document.getElementById("chapterDetail");
const authMsg = document.getElementById("authMsg");
const welcomeText = document.getElementById("welcomeText");
const userActions = document.getElementById("userActions");
const logoutBtn = document.getElementById("logoutBtn");
const adminArea = document.getElementById("adminArea");
const adminMsg = document.getElementById("adminMsg");
const adminLoginForm = document.getElementById("adminLoginForm");
const studentTableWrap = document.getElementById("studentTableWrap");
const videoUploadForm = document.getElementById("videoUploadForm");
const videoMap = document.getElementById("videoMap");
const certificatePanel = document.getElementById("certificatePanel");
const certificateStatus = document.getElementById("certificateStatus");
const downloadCertificateBtn = document.getElementById("downloadCertificateBtn");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

let chapters = [];
let activeChapter = null;
let answerState = {};
let currentRole = "student";

function setMessage(message, isError = false) {
  authMsg.textContent = message;
  authMsg.style.color = isError ? "#b91c1c" : "#15803d";
}

async function api(path, options = {}) {
  const hasFormData = options.body instanceof FormData;
  const headers = hasFormData
    ? { ...(options.headers || {}) }
    : { "Content-Type": "application/json", ...(options.headers || {}) };

  const response = await fetch(path, {
    headers,
    ...options
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function showAuthenticatedUI(username, role) {
  currentRole = role;
  authCard.classList.add("hidden");
  userActions.classList.remove("hidden");
  welcomeText.textContent = `Welcome, ${username} (${role})`;

  if (role === "admin") {
    learningArea.classList.add("hidden");
    adminArea.classList.remove("hidden");
  } else {
    adminArea.classList.add("hidden");
    learningArea.classList.remove("hidden");
    certificatePanel.classList.remove("hidden");
  }
}

function showLoggedOutUI() {
  authCard.classList.remove("hidden");
  learningArea.classList.add("hidden");
  userActions.classList.add("hidden");
  adminArea.classList.add("hidden");
  chapterDetail.classList.add("hidden");
  chapterDetail.innerHTML = "";
  chapterList.innerHTML = "";
  studentTableWrap.innerHTML = "";
  videoMap.innerHTML = "";
}

function renderChapters() {
  chapterList.innerHTML = "";

  chapters.forEach((chapter) => {
    const item = document.createElement("div");
    item.className = `chapter-item ${chapter.unlocked ? "" : "locked"}`;

    const state = chapter.completed
      ? '<span class="badge done">Completed</span>'
      : chapter.unlocked
        ? '<span class="badge open">Unlocked</span>'
        : '<span class="badge locked">Locked</span>';

    item.innerHTML = `
      <h3>Chapter ${chapter.id}: ${chapter.title}</h3>
      <p>${chapter.estimatedMinutes} min study block</p>
      <div>${state}</div>
      <button class="btn" ${chapter.unlocked ? "" : "disabled"}>Open Chapter</button>
    `;

    item.querySelector("button").addEventListener("click", () => openChapter(chapter.id));
    chapterList.appendChild(item);
  });
}

function renderChapterDetail(chapterData, completed) {
  activeChapter = chapterData;
  answerState = {};

  const studyMaterialsNode = chapterData.studyMaterials
    ? `
      <section class="study-materials">
        <h3>Handbook Study Materials</h3>
        <p class="materials-focus"><strong>Focus:</strong> ${chapterData.studyMaterials.handbookFocus}</p>
        <ul class="materials-list">
          ${chapterData.studyMaterials.tasks.map((task) => `<li>${task}</li>`).join("")}
        </ul>
        <p class="materials-check"><strong>Self-check:</strong> ${chapterData.studyMaterials.selfCheck}</p>
      </section>
    `
    : "";

  const videoNode = chapterData.customVideoUrl
    ? `<video controls preload="metadata" src="${chapterData.customVideoUrl}"></video>`
    : `<iframe src="${chapterData.videoEmbedUrl}" title="${chapterData.videoTitle}" allowfullscreen></iframe>`;

  chapterDetail.classList.remove("hidden");
  chapterDetail.innerHTML = `
    <div class="detail-head">
      <h2>Chapter ${chapterData.id}: ${chapterData.title}</h2>
      ${completed ? '<span class="badge done">Completed</span>' : ""}
    </div>
    <p><strong>Estimated time:</strong> ${chapterData.estimatedMinutes} minutes</p>

    <h3>Learning Objectives</h3>
    <ul class="objectives">
      ${chapterData.objectives.map((o) => `<li>${o}</li>`).join("")}
    </ul>

    <h3>Key Concepts</h3>
    <ul class="points">
      ${chapterData.lessonPoints.map((p) => `<li>${p}</li>`).join("")}
    </ul>

    ${studyMaterialsNode}

    <div class="video-wrap">
      ${videoNode}
    </div>

    <section class="quiz-block">
      <h3>Practical Questions (Auto-check)</h3>
      <p>Select an answer and click Check. Correct answers show a green check, wrong answers show red feedback.</p>
      <div id="quizContainer"></div>
      <button id="completeChapterBtn" class="btn" disabled>Complete Chapter</button>
      <p id="completeMessage" class="message"></p>
    </section>
  `;

  const quizContainer = document.getElementById("quizContainer");

  chapterData.quiz.forEach((q, index) => {
    const block = document.createElement("div");
    block.className = "quiz-q";
    block.innerHTML = `
      <p><strong>Q${index + 1}.</strong> ${q.question}</p>
      <select id="select-${q.id}">
        <option value="">Choose an answer</option>
        ${q.options.map((opt, i) => `<option value="${i}">${opt}</option>`).join("")}
      </select>
      <button class="btn" id="check-${q.id}">Check</button>
      <div id="result-${q.id}" class="result"></div>
    `;

    quizContainer.appendChild(block);

    document.getElementById(`check-${q.id}`).addEventListener("click", async () => {
      const selected = document.getElementById(`select-${q.id}`).value;
      if (selected === "") {
        return;
      }

      try {
        const result = await api(`/api/quiz/${chapterData.id}/check`, {
          method: "POST",
          body: JSON.stringify({ questionId: q.id, answerIndex: Number(selected) })
        });

        answerState[q.id] = Number(selected);

        const resultNode = document.getElementById(`result-${q.id}`);
        if (result.correct) {
          resultNode.className = "result good";
          resultNode.textContent = `✔ Correct. ${result.explanation}`;
        } else {
          resultNode.className = "result bad";
          resultNode.textContent = `✘ Incorrect. ${result.explanation}`;
        }

        validateChapterCompletionButton();
      } catch (error) {
        alert(error.message);
      }
    });
  });

  document.getElementById("completeChapterBtn").addEventListener("click", completeChapter);
}

async function completeChapter() {
  if (!activeChapter) {
    return;
  }

  const completeMessage = document.getElementById("completeMessage");

  try {
    await api(`/api/chapters/${activeChapter.id}/complete`, {
      method: "POST",
      body: JSON.stringify({ answers: answerState })
    });

    completeMessage.style.color = "#15803d";
    completeMessage.textContent = "Chapter completed. Next chapter unlocked.";
    await loadChapters();
    await loadCertificateStatus();
  } catch (error) {
    completeMessage.style.color = "#b91c1c";
    completeMessage.textContent = error.message;
  }
}

function validateChapterCompletionButton() {
  if (!activeChapter) {
    return;
  }

  const answerKeys = Object.keys(answerState);
  const allAnswered = answerKeys.length === activeChapter.quiz.length;
  const completeBtn = document.getElementById("completeChapterBtn");

  completeBtn.disabled = !allAnswered;
}

async function openChapter(chapterId) {
  try {
    const data = await api(`/api/chapters/${chapterId}`);
    renderChapterDetail(data.chapter, data.completed);
  } catch (error) {
    alert(error.message);
  }
}

async function loadChapters() {
  chapters = await api("/api/chapters");
  renderChapters();
}

async function loadCertificateStatus() {
  if (currentRole !== "student") {
    return;
  }

  try {
    const cert = await api("/api/certificate");
    if (cert.eligible) {
      certificateStatus.textContent = "Congratulations. Your completion certificate is ready to download.";
      certificateStatus.style.color = "#15803d";
      downloadCertificateBtn.disabled = false;
    } else {
      certificateStatus.textContent = "Complete all 7 chapters to unlock your certificate.";
      certificateStatus.style.color = "#5f6f78";
      downloadCertificateBtn.disabled = true;
    }
  } catch (_error) {
    certificateStatus.textContent = "Certificate status is unavailable right now.";
    certificateStatus.style.color = "#b91c1c";
    downloadCertificateBtn.disabled = true;
  }
}

function renderStudents(students) {
  if (!students.length) {
    studentTableWrap.innerHTML = "<p>No students registered yet.</p>";
    return;
  }

  const rows = students
    .map(
      (student) => `
      <tr>
        <td>${student.username}</td>
        <td>${student.completedCount}/7</td>
        <td>${student.progressPercent}%</td>
        <td>${student.completedChapters.join(", ") || "-"}</td>
        <td>${student.certificateEligible ? "Yes" : "No"}</td>
      </tr>
    `
    )
    .join("");

  studentTableWrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Completed</th>
          <th>Progress</th>
          <th>Chapters</th>
          <th>Certificate</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderVideoMap(videos) {
  const keys = Object.keys(videos || {});
  if (!keys.length) {
    videoMap.innerHTML = "<p>No custom videos uploaded yet. Students will see default lesson embeds.</p>";
    return;
  }

  videoMap.innerHTML = keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => `<p>Chapter ${key}: ${videos[key].originalName}</p>`)
    .join("");
}

async function loadAdminDashboard() {
  const [studentsResponse, videosResponse] = await Promise.all([
    api("/api/admin/students"),
    api("/api/admin/videos")
  ]);

  renderStudents(studentsResponse.students);
  renderVideoMap(videosResponse.videos);
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);

  try {
    const data = await api("/api/register", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password")
      })
    });

    setMessage(data.message);
    showAuthenticatedUI(data.username, "student");
    await loadChapters();
    await loadCertificateStatus();
    registerForm.reset();
  } catch (error) {
    setMessage(error.message, true);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password")
      })
    });

    setMessage(data.message);
    showAuthenticatedUI(data.username, "student");
    await loadChapters();
    await loadCertificateStatus();
    loginForm.reset();
  } catch (error) {
    setMessage(error.message, true);
  }
});

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(adminLoginForm);

  try {
    const data = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password")
      })
    });

    setMessage(data.message);
    showAuthenticatedUI(data.username, "admin");
    await loadAdminDashboard();
    adminLoginForm.reset();
  } catch (error) {
    setMessage(error.message, true);
  }
});

videoUploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(videoUploadForm);

  const chapterId = formData.get("chapterId");
  const videoFile = formData.get("video");

  if (!(videoFile instanceof File) || !videoFile.name) {
    adminMsg.textContent = "Please choose a video file before upload.";
    adminMsg.style.color = "#b91c1c";
    return;
  }

  try {
    const uploadData = new FormData();
    uploadData.append("video", videoFile);
    await api(`/api/admin/chapters/${chapterId}/video`, {
      method: "POST",
      body: uploadData
    });

    adminMsg.textContent = "Video uploaded successfully.";
    adminMsg.style.color = "#15803d";
    await loadAdminDashboard();
    videoUploadForm.reset();
  } catch (error) {
    adminMsg.textContent = error.message;
    adminMsg.style.color = "#b91c1c";
  }
});

downloadCertificateBtn.addEventListener("click", () => {
  window.location.href = "/api/certificate/download";
});

logoutBtn.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  showLoggedOutUI();
  setMessage("Logged out.");
});

async function init() {
  try {
    const me = await api("/api/me");
    if (me.authenticated) {
      showAuthenticatedUI(me.username, me.role || "student");
      if ((me.role || "student") === "admin") {
        await loadAdminDashboard();
      } else {
        await loadChapters();
        await loadCertificateStatus();
      }
    } else {
      showLoggedOutUI();
    }
  } catch {
    showLoggedOutUI();
  }
}

init();
