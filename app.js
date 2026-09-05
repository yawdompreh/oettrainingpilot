const learningArea = document.getElementById("learningArea");
const chapterList = document.getElementById("chapterList");
const chapterDetail = document.getElementById("chapterDetail");
const authMsg = document.getElementById("authMsg");
const welcomeText = document.getElementById("welcomeText");
const userActions = document.getElementById("userActions");
const logoutBtn = document.getElementById("logoutBtn");
const adminArea = document.getElementById("adminArea");
const adminMsg = document.getElementById("adminMsg");
const adminToggleBtn = document.getElementById("adminToggleBtn");
const adminLoginCard = document.getElementById("adminLoginCard");
const adminLoginForm = document.getElementById("adminLoginForm");
const videoUploadForm = document.getElementById("videoUploadForm");
const videoMap = document.getElementById("videoMap");
const certificateForm = document.getElementById("certificateForm");
const certificateStatus = document.getElementById("certificateStatus");

let chapters = [];
let activeChapter = null;
let answerState = {};

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

function showAdminUI(username) {
  adminLoginCard.classList.add("hidden");
  learningArea.classList.add("hidden");
  adminArea.classList.remove("hidden");
  userActions.classList.remove("hidden");
  welcomeText.textContent = `Welcome, ${username} (admin)`;
  adminToggleBtn.classList.add("hidden");
}

function showLearnerUI() {
  adminLoginCard.classList.add("hidden");
  adminArea.classList.add("hidden");
  learningArea.classList.remove("hidden");
  userActions.classList.add("hidden");
  adminToggleBtn.classList.remove("hidden");
}

function renderChapters() {
  chapterList.innerHTML = "";

  chapters.forEach((chapter) => {
    const item = document.createElement("div");
    item.className = "chapter-item";

    item.innerHTML = `
      <h3>Chapter ${chapter.id}: ${chapter.title}</h3>
      <p>${chapter.estimatedMinutes} min study block</p>
      <button class="btn">Open Chapter</button>
    `;

    item.querySelector("button").addEventListener("click", () => openChapter(chapter.id));
    chapterList.appendChild(item);
  });
}

function renderChapterDetail(chapterData) {
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
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function openChapter(chapterId) {
  try {
    const data = await api(`/api/chapters/${chapterId}`);
    renderChapterDetail(data.chapter);
  } catch (error) {
    alert(error.message);
  }
}

async function loadChapters() {
  chapters = await api("/api/chapters");
  renderChapters();
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
  const videosResponse = await api("/api/admin/videos");
  renderVideoMap(videosResponse.videos);
}

adminToggleBtn.addEventListener("click", () => {
  adminLoginCard.classList.toggle("hidden");
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
    showAdminUI(data.username);
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

certificateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(certificateForm);
  const name = formData.get("name");

  if (!name || !String(name).trim()) {
    certificateStatus.textContent = "Please enter your name first.";
    certificateStatus.style.color = "#b91c1c";
    return;
  }

  certificateStatus.textContent = "Your certificate download is starting...";
  certificateStatus.style.color = "#15803d";
  window.location.href = `/api/certificate/download?name=${encodeURIComponent(name)}`;
});

logoutBtn.addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" });
  showLearnerUI();
  setMessage("Logged out.");
});

async function init() {
  try {
    const me = await api("/api/admin/me");
    if (me.authenticated) {
      showAdminUI(me.username);
      await loadAdminDashboard();
      return;
    }
  } catch {
    // Ignore admin session check failures and fall back to the learner view.
  }

  showLearnerUI();
  await loadChapters();
}

init();

