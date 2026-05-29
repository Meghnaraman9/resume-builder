const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

// Render exposes the service URL via RENDER_EXTERNAL_URL
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "*";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

// ─── Resume HTML Template ────────────────────────────────────────────────────
function buildResumeHTML(data) {
  const {
    name = "",
    email = "",
    phone = "",
    location = "",
    linkedin = "",
    github = "",
    website = "",
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    template = "classic",
  } = data;

  const skillBadges = skills
    .map((s) => `<span class="skill-badge">${s}</span>`)
    .join("");

  const expHTML = experience
    .map(
      (exp) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${exp.title || ""}</div>
          <div class="entry-sub">${exp.company || ""}${
        exp.location ? ` &mdash; ${exp.location}` : ""
      }</div>
        </div>
        <div class="entry-date">${exp.startDate || ""}${
        exp.endDate ? ` &ndash; ${exp.endDate}` : ""
      }${exp.current ? " &ndash; Present" : ""}</div>
      </div>
      ${exp.description ? `<div class="entry-desc">${exp.description.replace(/\n/g, "<br>")}</div>` : ""}
    </div>`
    )
    .join("");

  const eduHTML = education
    .map(
      (edu) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${edu.degree || ""}</div>
          <div class="entry-sub">${edu.institution || ""}${
        edu.location ? ` &mdash; ${edu.location}` : ""
      }</div>
        </div>
        <div class="entry-date">${edu.startDate || ""}${
        edu.endDate ? ` &ndash; ${edu.endDate}` : ""
      }${edu.current ? " &ndash; Present" : ""}${
        edu.gpa ? `<br><span class="gpa">GPA: ${edu.gpa}</span>` : ""
      }</div>
      </div>
      ${edu.description ? `<div class="entry-desc">${edu.description.replace(/\n/g, "<br>")}</div>` : ""}
    </div>`
    )
    .join("");

  const projHTML = projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${p.name || ""}${
        p.url ? ` <a href="${p.url}" class="proj-link">${p.url}</a>` : ""
      }</div>
          ${p.tech ? `<div class="entry-sub">${p.tech}</div>` : ""}
        </div>
        <div class="entry-date">${p.date || ""}</div>
      </div>
      ${p.description ? `<div class="entry-desc">${p.description.replace(/\n/g, "<br>")}</div>` : ""}
    </div>`
    )
    .join("");

  const certHTML = certifications
    .map(
      (c) => `
    <div class="cert-item">
      <span class="cert-name">${c.name || ""}</span>
      ${c.issuer ? `<span class="cert-issuer">&nbsp;&mdash; ${c.issuer}</span>` : ""}
      ${c.date ? `<span class="cert-date">, ${c.date}</span>` : ""}
    </div>`
    )
    .join("");

  const contactParts = [
    email ? `<a href="mailto:${email}">${email}</a>` : null,
    phone ? `<a href="tel:${phone}">${phone}</a>` : null,
    location || null,
    linkedin ? `<a href="${linkedin}">LinkedIn</a>` : null,
    github ? `<a href="${github}">GitHub</a>` : null,
    website ? `<a href="${website}">${website}</a>` : null,
  ]
    .filter(Boolean)
    .join('<span class="sep">•</span>');

  // Template styles
  const themes = {
    classic: {
      primary: "#1a237e",
      accent: "#283593",
      text: "#212121",
      subtext: "#555",
      bg: "#ffffff",
      headerBg: "#ffffff",
      sectionBorder: "#1a237e",
      fontFamily: "'Georgia', serif",
    },
    modern: {
      primary: "#00695c",
      accent: "#004d40",
      text: "#1a1a1a",
      subtext: "#555",
      bg: "#ffffff",
      headerBg: "#ffffff",
      sectionBorder: "#00695c",
      fontFamily: "'Arial', sans-serif",
    },
    minimal: {
      primary: "#111111",
      accent: "#333",
      text: "#111",
      subtext: "#666",
      bg: "#ffffff",
      headerBg: "#ffffff",
      sectionBorder: "#111",
      fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    },
    bold: {
      primary: "#b71c1c",
      accent: "#7f0000",
      text: "#1a1a1a",
      subtext: "#555",
      bg: "#ffffff",
      headerBg: "#b71c1c",
      sectionBorder: "#b71c1c",
      fontFamily: "'Arial Black', Arial, sans-serif",
    },
  };

  const t = themes[template] || themes.classic;
  const boldHeaderText = template === "bold";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: ${t.fontFamily};
    font-size: 10.5pt;
    color: ${t.text};
    background: ${t.bg};
    line-height: 1.5;
  }
  a { color: inherit; text-decoration: none; }
  .page { padding: 28px 36px 28px 36px; max-width: 800px; margin: 0 auto; }

  /* HEADER */
  .header {
    background: ${t.headerBg};
    padding: ${boldHeaderText ? "20px 36px" : "0 0 14px 0"};
    margin-bottom: 16px;
    ${boldHeaderText ? `border-radius:4px;` : `border-bottom: 2.5px solid ${t.primary};`}
  }
  .header-name {
    font-size: ${boldHeaderText ? "28pt" : "24pt"};
    font-weight: 700;
    color: ${boldHeaderText ? "#fff" : t.primary};
    letter-spacing: ${boldHeaderText ? "1px" : "0.5px"};
    margin-bottom: 4px;
  }
  .contact-line {
    font-size: 8.5pt;
    color: ${boldHeaderText ? "rgba(255,255,255,0.88)" : t.subtext};
    display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
  }
  .sep { opacity: 0.5; margin: 0 2px; }

  /* SECTION */
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 9.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${t.primary};
    border-bottom: 1.5px solid ${t.sectionBorder};
    padding-bottom: 3px;
    margin-bottom: 8px;
  }

  /* ENTRIES */
  .entry { margin-bottom: 10px; }
  .entry-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 8px;
  }
  .entry-title { font-weight: 700; font-size: 10.5pt; color: ${t.text}; }
  .entry-sub { font-size: 9.5pt; color: ${t.subtext}; margin-top: 1px; }
  .entry-date { font-size: 9pt; color: ${t.subtext}; text-align: right; white-space: nowrap; }
  .entry-desc { font-size: 9.5pt; color: ${t.text}; margin-top: 5px; line-height: 1.55; }
  .gpa { font-size: 8.5pt; color: ${t.subtext}; }

  /* SUMMARY */
  .summary-text { font-size: 10pt; color: ${t.text}; line-height: 1.6; }

  /* SKILLS */
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
  .skill-badge {
    background: ${t.primary}18;
    color: ${t.accent};
    border: 1px solid ${t.primary}44;
    border-radius: 3px;
    padding: 2px 9px;
    font-size: 8.5pt;
    font-weight: 500;
  }

  /* CERTS */
  .cert-item { font-size: 9.5pt; margin-bottom: 4px; }
  .cert-name { font-weight: 600; color: ${t.text}; }
  .cert-issuer { color: ${t.subtext}; }
  .cert-date { color: ${t.subtext}; }

  /* PROJECT LINK */
  .proj-link { font-size: 8pt; color: ${t.subtext}; margin-left: 6px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-name">${name}</div>
    <div class="contact-line">${contactParts}</div>
  </div>

  ${
    summary
      ? `<div class="section">
    <div class="section-title">Summary</div>
    <div class="summary-text">${summary.replace(/\n/g, "<br>")}</div>
  </div>`
      : ""
  }

  ${
    experience.length
      ? `<div class="section">
    <div class="section-title">Work Experience</div>
    ${expHTML}
  </div>`
      : ""
  }

  ${
    education.length
      ? `<div class="section">
    <div class="section-title">Education</div>
    ${eduHTML}
  </div>`
      : ""
  }

  ${
    skills.length
      ? `<div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-wrap">${skillBadges}</div>
  </div>`
      : ""
  }

  ${
    projects.length
      ? `<div class="section">
    <div class="section-title">Projects</div>
    ${projHTML}
  </div>`
      : ""
  }

  ${
    certifications.length
      ? `<div class="section">
    <div class="section-title">Certifications</div>
    ${certHTML}
  </div>`
      : ""
  }
</div>
</body>
</html>`;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Resume Builder API is running", version: "1.0.0" });
});

// Preview HTML (for live preview in browser)
app.post("/preview", (req, res) => {
  try {
    const html = buildResumeHTML(req.body);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF
app.post("/generate-pdf", async (req, res) => {
  let browser;
  try {
    const html = buildResumeHTML(req.body);
    const candidateName = (req.body.name || "resume")
      .toLowerCase()
      .replace(/\s+/g, "_");

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${candidateName}_resume.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Resume Builder API running at http://localhost:${PORT}`);
  console.log(`   POST /preview       → returns resume HTML`);
  console.log(`   POST /generate-pdf  → returns PDF file\n`);
});
