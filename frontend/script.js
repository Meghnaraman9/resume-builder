// ─── Config ──────────────────────────────────────────────────────────────────
// API_BASE is set in config.js (window.RESUME_API_BASE)
// Falls back to localhost for local development
const API_BASE = window.RESUME_API_BASE || "http://localhost:3001";

// ─── State ───────────────────────────────────────────────────────────────────
let skills = [];
let expCount = 0, eduCount = 0, projCount = 0, certCount = 0;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  addExperience();
  addEducation();
  loadFromStorage();
  document.getElementById("resumeForm").addEventListener("input", () => {
    debounce(saveToStorage, 800)();
    if (document.getElementById("previewPanel").classList.contains("open")) {
      debounce(refreshPreview, 1200)();
    }
  });
});

// ─── Debounce ─────────────────────────────────────────────────────────────────
let debounceTimers = {};
function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimers[fn.name]);
    debounceTimers[fn.name] = setTimeout(() => fn(...args), delay);
  };
}

// ─── Data Collection ──────────────────────────────────────────────────────────
function collectFormData() {
  const template = document.querySelector('input[name="template"]:checked')?.value || "classic";

  // Experience
  const experience = [];
  document.querySelectorAll(".exp-block").forEach((block) => {
    const id = block.dataset.id;
    const current = document.getElementById(`exp-current-${id}`)?.checked;
    experience.push({
      title:       val(`exp-title-${id}`),
      company:     val(`exp-company-${id}`),
      location:    val(`exp-location-${id}`),
      startDate:   val(`exp-start-${id}`),
      endDate:     current ? "" : val(`exp-end-${id}`),
      current,
      description: val(`exp-desc-${id}`),
    });
  });

  // Education
  const education = [];
  document.querySelectorAll(".edu-block").forEach((block) => {
    const id = block.dataset.id;
    const current = document.getElementById(`edu-current-${id}`)?.checked;
    education.push({
      degree:      val(`edu-degree-${id}`),
      institution: val(`edu-inst-${id}`),
      location:    val(`edu-location-${id}`),
      startDate:   val(`edu-start-${id}`),
      endDate:     current ? "" : val(`edu-end-${id}`),
      current,
      gpa:         val(`edu-gpa-${id}`),
      description: val(`edu-desc-${id}`),
    });
  });

  // Projects
  const projects = [];
  document.querySelectorAll(".proj-block").forEach((block) => {
    const id = block.dataset.id;
    projects.push({
      name:        val(`proj-name-${id}`),
      tech:        val(`proj-tech-${id}`),
      url:         val(`proj-url-${id}`),
      date:        val(`proj-date-${id}`),
      description: val(`proj-desc-${id}`),
    });
  });

  // Certifications
  const certifications = [];
  document.querySelectorAll(".cert-block").forEach((block) => {
    const id = block.dataset.id;
    certifications.push({
      name:   val(`cert-name-${id}`),
      issuer: val(`cert-issuer-${id}`),
      date:   val(`cert-date-${id}`),
    });
  });

  return {
    template,
    name:     val("name"),
    email:    val("email"),
    phone:    val("phone"),
    location: val("location"),
    linkedin: val("linkedin"),
    github:   val("github"),
    website:  val("website"),
    summary:  val("summary"),
    skills: [...skills],
    experience,
    education,
    projects,
    certifications,
  };
}

function val(id) {
  return (document.getElementById(id)?.value || "").trim();
}

// ─── Experience ───────────────────────────────────────────────────────────────
function addExperience() {
  const id = ++expCount;
  const list = document.getElementById("expList");
  const block = document.createElement("div");
  block.className = "entry-block exp-block";
  block.dataset.id = id;
  block.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-title">Experience #${id}</span>
      <button type="button" class="btn-remove" onclick="removeBlock(this, 'exp-block')" title="Remove">×</button>
    </div>
    <div class="form-grid two-col">
      <div class="field required">
        <label>Job Title *</label>
        <input type="text" id="exp-title-${id}" placeholder="Senior Software Engineer"/>
      </div>
      <div class="field required">
        <label>Company *</label>
        <input type="text" id="exp-company-${id}" placeholder="Google"/>
      </div>
      <div class="field">
        <label>Location</label>
        <input type="text" id="exp-location-${id}" placeholder="Hyderabad, India"/>
      </div>
      <div class="field" style="grid-column:1/-1;">
        <div class="date-row">
          <div class="field">
            <label>Start Date</label>
            <input type="month" id="exp-start-${id}"/>
          </div>
          <div class="field" id="exp-end-wrap-${id}">
            <label>End Date</label>
            <input type="month" id="exp-end-${id}"/>
          </div>
          <div class="current-check">
            <input type="checkbox" id="exp-current-${id}" onchange="toggleCurrent('exp', ${id})"/>
            <label for="exp-current-${id}">Present</label>
          </div>
        </div>
      </div>
      <div class="field full-col">
        <label>Description / Achievements</label>
        <textarea id="exp-desc-${id}" rows="3" placeholder="• Led a team of 6 engineers to build a microservices platform...&#10;• Reduced API latency by 40% through caching strategy..."></textarea>
      </div>
    </div>`;
  list.appendChild(block);
  block.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ─── Education ────────────────────────────────────────────────────────────────
function addEducation() {
  const id = ++eduCount;
  const list = document.getElementById("eduList");
  const block = document.createElement("div");
  block.className = "entry-block edu-block";
  block.dataset.id = id;
  block.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-title">Education #${id}</span>
      <button type="button" class="btn-remove" onclick="removeBlock(this, 'edu-block')" title="Remove">×</button>
    </div>
    <div class="form-grid two-col">
      <div class="field required">
        <label>Degree / Qualification *</label>
        <input type="text" id="edu-degree-${id}" placeholder="B.Tech Computer Science"/>
      </div>
      <div class="field required">
        <label>Institution *</label>
        <input type="text" id="edu-inst-${id}" placeholder="IIT Hyderabad"/>
      </div>
      <div class="field">
        <label>Location</label>
        <input type="text" id="edu-location-${id}" placeholder="Hyderabad, India"/>
      </div>
      <div class="field">
        <label>GPA / Percentage</label>
        <input type="text" id="edu-gpa-${id}" placeholder="8.9 / 10"/>
      </div>
      <div class="field full-col">
        <div class="date-row">
          <div class="field">
            <label>Start Date</label>
            <input type="month" id="edu-start-${id}"/>
          </div>
          <div class="field" id="edu-end-wrap-${id}">
            <label>End Date</label>
            <input type="month" id="edu-end-${id}"/>
          </div>
          <div class="current-check">
            <input type="checkbox" id="edu-current-${id}" onchange="toggleCurrent('edu', ${id})"/>
            <label for="edu-current-${id}">Present</label>
          </div>
        </div>
      </div>
      <div class="field full-col">
        <label>Notes (optional)</label>
        <textarea id="edu-desc-${id}" rows="2" placeholder="Dean's List, relevant coursework, honours..."></textarea>
      </div>
    </div>`;
  list.appendChild(block);
  block.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ─── Projects ─────────────────────────────────────────────────────────────────
function addProject() {
  const id = ++projCount;
  const list = document.getElementById("projList");
  const block = document.createElement("div");
  block.className = "entry-block proj-block";
  block.dataset.id = id;
  block.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-title">Project #${id}</span>
      <button type="button" class="btn-remove" onclick="removeBlock(this, 'proj-block')" title="Remove">×</button>
    </div>
    <div class="form-grid two-col">
      <div class="field required">
        <label>Project Name *</label>
        <input type="text" id="proj-name-${id}" placeholder="AI Resume Builder"/>
      </div>
      <div class="field">
        <label>Technologies Used</label>
        <input type="text" id="proj-tech-${id}" placeholder="React, Node.js, Puppeteer"/>
      </div>
      <div class="field">
        <label>URL / Link</label>
        <input type="url" id="proj-url-${id}" placeholder="https://github.com/you/project"/>
      </div>
      <div class="field">
        <label>Date</label>
        <input type="month" id="proj-date-${id}"/>
      </div>
      <div class="field full-col">
        <label>Description</label>
        <textarea id="proj-desc-${id}" rows="3" placeholder="Built a full-stack resume builder with real-time preview and PDF export..."></textarea>
      </div>
    </div>`;
  list.appendChild(block);
  block.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ─── Certifications ───────────────────────────────────────────────────────────
function addCertification() {
  const id = ++certCount;
  const list = document.getElementById("certList");
  const block = document.createElement("div");
  block.className = "entry-block cert-block";
  block.dataset.id = id;
  block.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-title">Certification #${id}</span>
      <button type="button" class="btn-remove" onclick="removeBlock(this, 'cert-block')" title="Remove">×</button>
    </div>
    <div class="form-grid two-col">
      <div class="field required">
        <label>Certification Name *</label>
        <input type="text" id="cert-name-${id}" placeholder="AWS Certified Solutions Architect"/>
      </div>
      <div class="field">
        <label>Issuing Organization</label>
        <input type="text" id="cert-issuer-${id}" placeholder="Amazon Web Services"/>
      </div>
      <div class="field">
        <label>Date</label>
        <input type="month" id="cert-date-${id}"/>
      </div>
    </div>`;
  list.appendChild(block);
  block.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ─── Remove Block ─────────────────────────────────────────────────────────────
function removeBlock(btn, cls) {
  const block = btn.closest("." + cls);
  block.style.opacity = "0";
  block.style.transform = "scale(0.95)";
  block.style.transition = "all 0.2s";
  setTimeout(() => block.remove(), 200);
}

// ─── Toggle Current (Present) ─────────────────────────────────────────────────
function toggleCurrent(type, id) {
  const checked = document.getElementById(`${type}-current-${id}`)?.checked;
  const endWrap = document.getElementById(`${type}-end-wrap-${id}`);
  if (endWrap) {
    endWrap.style.opacity = checked ? "0.35" : "1";
    const endInput = document.getElementById(`${type}-end-${id}`);
    if (endInput) endInput.disabled = !!checked;
  }
}

// ─── Skills ───────────────────────────────────────────────────────────────────
function handleSkillKey(e) {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addSkill();
  }
}

function addSkill() {
  const input = document.getElementById("skillInput");
  const raw = input.value.replace(/,/g, "").trim();
  if (!raw) return;
  const parts = raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  parts.forEach((skill) => {
    if (skill && !skills.includes(skill)) {
      skills.push(skill);
      renderSkillTag(skill);
    }
  });
  input.value = "";
}

function renderSkillTag(skill) {
  const container = document.getElementById("skillTags");
  const tag = document.createElement("span");
  tag.className = "skill-tag";
  tag.innerHTML = `${skill}<button type="button" class="tag-remove" onclick="removeSkill(this, '${skill.replace(/'/g, "\\'")}')">×</button>`;
  container.appendChild(tag);
}

function removeSkill(btn, skill) {
  skills = skills.filter((s) => s !== skill);
  btn.parentElement.remove();
}

// ─── Preview ──────────────────────────────────────────────────────────────────
async function previewResume() {
  const data = collectFormData();
  if (!data.name) { showToast("Please enter your name first", "error"); return; }

  const panel = document.getElementById("previewPanel");
  panel.classList.add("open");

  try {
    const res = await fetch(`${API_BASE}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const html = await res.text();
    const frame = document.getElementById("previewFrame");
    frame.srcdoc = html;
  } catch (err) {
    showToast("Preview failed: " + err.message, "error");
  }
}

async function refreshPreview() {
  const panel = document.getElementById("previewPanel");
  if (!panel.classList.contains("open")) return;
  const data = collectFormData();
  if (!data.name) return;
  try {
    const res = await fetch(`${API_BASE}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const html = await res.text();
      document.getElementById("previewFrame").srcdoc = html;
    }
  } catch (_) {}
}

function closePreview() {
  document.getElementById("previewPanel").classList.remove("open");
}

// ─── Download PDF ─────────────────────────────────────────────────────────────
async function downloadPDF() {
  const data = collectFormData();
  if (!data.name || !data.email || !data.phone) {
    showToast("Please fill in name, email, and phone", "error");
    return;
  }

  showLoading(true);
  try {
    const res = await fetch(`${API_BASE}/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name.replace(/\s+/g, "_")}_resume.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    showToast("✓ PDF downloaded successfully!", "success");
  } catch (err) {
    showToast("Download failed: " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

// ─── Clear Form ───────────────────────────────────────────────────────────────
function clearForm() {
  if (!confirm("Clear all form data? This cannot be undone.")) return;
  document.getElementById("resumeForm").reset();
  document.getElementById("expList").innerHTML = "";
  document.getElementById("eduList").innerHTML = "";
  document.getElementById("projList").innerHTML = "";
  document.getElementById("certList").innerHTML = "";
  document.getElementById("skillTags").innerHTML = "";
  skills = [];
  expCount = 0; eduCount = 0; projCount = 0; certCount = 0;
  addExperience(); addEducation();
  localStorage.removeItem("resumeFormData");
  showToast("Form cleared");
}

// ─── Persistence ──────────────────────────────────────────────────────────────
function saveToStorage() {
  try {
    const data = collectFormData();
    localStorage.setItem("resumeFormData", JSON.stringify(data));
  } catch (_) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem("resumeFormData");
    if (!raw) return;
    const data = JSON.parse(raw);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };

    set("name", data.name);
    set("email", data.email);
    set("phone", data.phone);
    set("location", data.location);
    set("linkedin", data.linkedin);
    set("github", data.github);
    set("website", data.website);
    set("summary", data.summary);

    if (data.template) {
      const radio = document.querySelector(`input[name="template"][value="${data.template}"]`);
      if (radio) radio.checked = true;
    }

    // Skills
    if (data.skills?.length) {
      document.getElementById("expList").innerHTML = "";
      document.getElementById("eduList").innerHTML = "";
      expCount = 0; eduCount = 0;
      skills = [];
      document.getElementById("skillTags").innerHTML = "";
      data.skills.forEach((s) => { skills.push(s); renderSkillTag(s); });
    }

    // Experience
    if (data.experience?.length) {
      document.getElementById("expList").innerHTML = "";
      expCount = 0;
      data.experience.forEach((exp) => {
        addExperience();
        const id = expCount;
        set(`exp-title-${id}`, exp.title);
        set(`exp-company-${id}`, exp.company);
        set(`exp-location-${id}`, exp.location);
        set(`exp-start-${id}`, exp.startDate);
        set(`exp-end-${id}`, exp.endDate);
        set(`exp-desc-${id}`, exp.description);
        if (exp.current) {
          const cb = document.getElementById(`exp-current-${id}`);
          if (cb) { cb.checked = true; toggleCurrent("exp", id); }
        }
      });
    }

    // Education
    if (data.education?.length) {
      document.getElementById("eduList").innerHTML = "";
      eduCount = 0;
      data.education.forEach((edu) => {
        addEducation();
        const id = eduCount;
        set(`edu-degree-${id}`, edu.degree);
        set(`edu-inst-${id}`, edu.institution);
        set(`edu-location-${id}`, edu.location);
        set(`edu-start-${id}`, edu.startDate);
        set(`edu-end-${id}`, edu.endDate);
        set(`edu-gpa-${id}`, edu.gpa);
        set(`edu-desc-${id}`, edu.description);
        if (edu.current) {
          const cb = document.getElementById(`edu-current-${id}`);
          if (cb) { cb.checked = true; toggleCurrent("edu", id); }
        }
      });
    }

    // Projects
    if (data.projects?.length) {
      data.projects.forEach((p) => {
        addProject();
        const id = projCount;
        set(`proj-name-${id}`, p.name);
        set(`proj-tech-${id}`, p.tech);
        set(`proj-url-${id}`, p.url);
        set(`proj-date-${id}`, p.date);
        set(`proj-desc-${id}`, p.description);
      });
    }

    // Certifications
    if (data.certifications?.length) {
      data.certifications.forEach((c) => {
        addCertification();
        const id = certCount;
        set(`cert-name-${id}`, c.name);
        set(`cert-issuer-${id}`, c.issuer);
        set(`cert-date-${id}`, c.date);
      });
    }
  } catch (_) {}
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(html) {
  const overlay = document.getElementById("modalOverlay");
  document.getElementById("modalFrame").srcdoc = html;
  overlay.classList.add("open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

// ─── Loading ──────────────────────────────────────────────────────────────────
let loadingEl = null;
function showLoading(show) {
  if (!loadingEl) {
    loadingEl = document.createElement("div");
    loadingEl.className = "loading-overlay";
    loadingEl.innerHTML = `<div class="spinner"></div><div class="loading-text">Generating your PDF…</div>`;
    document.body.appendChild(loadingEl);
  }
  loadingEl.classList.toggle("show", show);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast" + (type ? ` ${type}` : "") + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// Make skill input wrap clickable
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".skill-input-wrap")?.addEventListener("click", () => {
    document.getElementById("skillInput")?.focus();
  });
});
