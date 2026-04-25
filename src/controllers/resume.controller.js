import puppeteer from 'puppeteer';
import { generateResumeContent } from "../services/ai.service.js";
import User from "../models/user.model.js";
import Resume from "../models/resume.model.js";

/* ===========================
   HELPER: Generate PDF matching your LaTeX template style
=========================== */
const generatePdfBuffer = async (resume) => {
  let browser;
  try {
    console.log('[PDF] Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ],
      timeout: 60000,
    });

    const page = await browser.newPage();
    // Use a reasonable viewport for A4
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 0.4in 0.5in 0.4in 0.5in; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0; padding: 0; color: #000;
            line-height: 1.3; font-size: 10pt;
            -webkit-font-smoothing: antialiased;
          }
          .container { padding: 0; }
          .header { text-align: center; margin-bottom: 8pt; }
          .name { font-size: 18pt; font-weight: bold; margin-bottom: 2pt; text-transform: uppercase; }
          .role-title { font-size: 10pt; margin-bottom: 4pt; }
          .contact-line { font-size: 9pt; color: #333; display: flex; justify-content: center; flex-wrap: wrap; gap: 8pt; }
          .contact-line a { text-decoration: none; color: inherit; }
          
          h2 {
            font-size: 11pt; font-weight: bold; color: rgb(46, 116, 181);
            border-bottom: 1.5pt solid rgb(46, 116, 181);
            padding-bottom: 1pt; margin: 12pt 0 4pt; text-transform: uppercase;
          }
          
          .dated-entry { margin-bottom: 6pt; page-break-inside: avoid; }
          .entry-row { display: flex; justify-content: space-between; font-size: 10pt; }
          .entry-row.header-row { font-weight: bold; }
          .entry-row.sub-row { font-style: italic; color: #444; margin-bottom: 1pt; }
          
          ul { margin: 2pt 0 4pt 0; padding-left: 14pt; list-style-type: disc; }
          li { margin-bottom: 1pt; }
          
          .project-item { margin-bottom: 6pt; list-style: none; }
          .project-main { font-weight: bold; }
          .project-tech { font-weight: normal; }
          .project-desc { margin-top: 2pt; }
          
          .skills-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
          .skills-table td { vertical-align: top; padding: 2pt 0; }
          .skills-key { font-weight: bold; width: 100pt; }
          
          p { margin: 0 0 6pt; text-align: justify; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="name">${escapeHtml(resume?.name || 'Candidate Name')}</div>
            <div class="role-title">${escapeHtml(resume?.experience?.[0]?.role || 'Full Stack Developer')}</div>
            <div class="contact-line">
              <span>${escapeHtml(resume?.experience?.[0]?.location || 'Location')}</span>
              ${resume?.contactNumber ? `<span>${escapeHtml(resume.contactNumber)}</span>` : ''}
              ${resume?.email ? `<a href="mailto:${escapeHtml(resume.email)}">${escapeHtml(resume.email)}</a>` : ''}
              ${(resume?.socialLinks || [])?.map(sl => {
                if (!sl?.link) return '';
                const display = sl.link.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
                return `<a href="${escapeHtml(sl.link)}">${escapeHtml(display)}</a>`;
              }).join(' ')}
            </div>
          </div>

          <h2>PROFESSIONAL SUMMARY</h2>
          <p>${escapeHtml(resume?.summary || 'Summary not provided.')}</p>

          <h2>PROFESSIONAL EXPERIENCE</h2>
          ${(resume?.experience || [])?.map(exp => `
            <div class="dated-entry">
              <div class="entry-row header-row">
                <span>${escapeHtml(exp?.company || 'Company')}</span>
                <span>${escapeHtml(exp?.startDate || '')} -- ${escapeHtml(exp?.endDate || 'Present')}</span>
              </div>
              <div class="entry-row sub-row">
                <span>${escapeHtml(exp?.role || 'Role')}</span>
                <span>${escapeHtml(exp?.location || '')}</span>
              </div>
              <ul>
                ${(exp?.description || "")
                  .split(/[\.\n]+/)
                  .filter(Boolean)
                  .map(d => `<li>${escapeHtml(d.trim())}.</li>`)
                  .join('')}
              </ul>
            </div>
          `).join('') || '<p>No experience listed.</p>'}

          <h2>EDUCATION</h2>
          ${(resume?.education || [])?.map(edu => `
            <div class="dated-entry">
              <div class="entry-row header-row">
                <span>${escapeHtml(edu?.institution || 'Institution')}</span>
                <span>${escapeHtml(edu?.startYear || '')} -- ${escapeHtml(edu?.endYear || '')}</span>
              </div>
              <div class="entry-row sub-row">
                <span>${escapeHtml(edu?.degree || 'Degree')}</span>
                <span>${escapeHtml(edu?.location || '')}</span>
              </div>
            </div>
          `).join('') || '<p>No education listed.</p>'}

          ${(resume?.projects || []).length > 0 ? `
            <h2>PROJECTS</h2>
            <ul style="padding-left: 0;">
              ${resume.projects.map(p => `
                <li class="project-item">
                  <div class="project-main">
                    • ${escapeHtml(p?.title || 'Project')} 
                    ${(p?.technologies || []).length > 0 ? `<span class="project-tech"> — ${escapeHtml(p.technologies.join(', '))}</span>` : ''}
                  </div>
                  <ul class="project-desc">
                    ${(p?.description || "")
                      .split(/[\.\n]+/)
                      .filter(Boolean)
                      .map(d => `<li>${escapeHtml(d.trim())}.</li>`)
                      .join('')}
                  </ul>
                </li>
              `).join('')}
            </ul>
          ` : ''}

          <h2>TECHNICAL SKILLS</h2>
          <table class="skills-table">
            <tr>
              <td class="skills-key">Technical Stack</td>
              <td>${escapeHtml((resume?.skills || [])?.join(', ') || 'None listed')}</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    console.log('[PDF] Generating buffer...');
    // waitUntil 'networkidle2' is often better for production environments
    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.4in', right: '0.5in', bottom: '0.4in', left: '0.5in' },
      preferCSSPageSize: true
    });

    await browser.close();
    return pdfBuffer;
  } catch (err) {
    console.error('[PDF ERROR]', err);
    if (browser) await browser.close();
    throw new Error(`PDF generation failed: ${err.message}`);
  }
};

// Helper to prevent HTML injection / broken rendering
function escapeHtml(unsafe) {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ===========================
   GENERATE RESUME (ONLY 1)
=========================== */
export const generateResume = async (req, res) => {
  try {
    const {
      name,
      email,
      contactNumber,
      socialLinks,
      jobDescription,
      experience,
      education,
    } = req.body;

    if (
      !name ||
      !jobDescription
    ) {
      return res.status(400).json({
        error: "Name and job description are required"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingResume = await Resume.findOne({ userId: user._id });
    if (existingResume) {
      return res.status(403).json({
        error: "Free plan allows only one resume. Use update for edits."
      });
    }

    const aiResult = await generateResumeContent({
      jobDescription,
      experience,
      education,
    });

    const newResume = await Resume.create({
      userId: user._id,
      name,
      email,
      contactNumber,
      socialLinks: socialLinks || [],
      jobDescription,
      experience: aiResult.experience,
      education: aiResult.education,
      summary: aiResult.summary,
      skills: aiResult.skills,
      projects: aiResult.projects,
      atsScore: aiResult.atsScore || 0,
      fabricationLevel: aiResult.fabricationLevel || "None",
      riskLevel: aiResult.riskLevel || "Low",
    });

    res.json({
      success: true,
      data: newResume,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resume generation failed" });
  }
};

/* ===========================
   UPDATE / REGENERATE RESUME (max 3 times, 3-hour cooldown after 3rd)
=========================== */
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      regenerateAI,
      name,
      email,
      contactNumber,
      socialLinks,
      jobDescription,
      experience,
      education,
      summary,
      skills,
      projects,
    } = req.body;

    const resume = await Resume.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found or unauthorized" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle AI regeneration (limited to 3 per 3-hour window)
    if (regenerateAI) {
      const now = new Date();

      // Step 1: Reset counter if previous cooldown has expired
      if (user.editResetTime && now > user.editResetTime) {
        user.editCount = 0;
        user.editResetTime = null;
      }

      // Step 2: Check if at limit BEFORE running AI
      if (user.editCount >= 3) {
        const timeLeftMs = user.editResetTime - now;
        const timeLeftHours = Math.ceil(timeLeftMs / (60 * 60 * 1000));

        return res.status(403).json({
          error: `AI regeneration limit reached. Try again in ${timeLeftHours} hour${timeLeftHours > 1 ? 's' : ''}.`,
        });
      }

      // Step 3: Run AI regeneration (safe now)
      const aiResult = await generateResumeContent({
        jobDescription: jobDescription || resume.jobDescription,
        experience: experience || resume.experience,
        education: education || resume.education,
      });

      // Update AI-generated fields
      resume.summary = aiResult.summary;
      resume.skills = aiResult.skills;
      resume.projects = aiResult.projects;
      resume.experience = aiResult.experience;
      resume.education = aiResult.education;
      resume.atsScore = aiResult.atsScore || 0;
      resume.fabricationLevel = aiResult.fabricationLevel || "None";
      resume.riskLevel = aiResult.riskLevel || "Low";

      // Update personal details if provided
      if (name) resume.name = name;
      if (email) resume.email = email;
      if (contactNumber) resume.contactNumber = contactNumber;
      if (socialLinks) resume.socialLinks = socialLinks;

      // Step 4: Increment count AFTER successful AI call
      user.editCount += 1;

      // Step 5: After the 3rd successful regeneration, lock for 3 hours FROM NOW
      if (user.editCount >= 3) {
        user.editResetTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      }

      await user.save();
    }

    // Manual edits (unlimited — allowed even during cooldown)
    if (name) resume.name = name;
    if (email) resume.email = email;
    if (contactNumber) resume.contactNumber = contactNumber;
    if (socialLinks) resume.socialLinks = socialLinks;
    if (summary !== undefined) resume.summary = summary;
    if (skills !== undefined && Array.isArray(skills)) resume.skills = skills;
    if (projects !== undefined && Array.isArray(projects)) resume.projects = projects;
    if (experience !== undefined && Array.isArray(experience)) resume.experience = experience;
    if (education !== undefined && Array.isArray(education)) resume.education = education;

    await resume.save();

    res.json({
      success: true,
      message: "Resume updated successfully",
      data: resume,
    });

  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({ error: "Failed to update resume" });
  }
};
/* ===========================
   DOWNLOAD RESUME AS PDF
=========================== */
export const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[Download] Requested resume ID:', id);

    const resume = await Resume.findOne({
      _id: id,
      userId: req.userId,
    }).lean();

    if (!resume) {
      console.log('[Download] Resume not found for ID:', id);
      return res.status(404).json({
        error: "Resume not found or unauthorized",
      });
    }

    console.log('[Download] Resume found. Name:', resume.name);

    const pdfBuffer = await generatePdfBuffer(resume);

    console.log('[Download] PDF buffer ready. Size:', pdfBuffer.length, 'bytes');

    if (pdfBuffer.length < 5000) {
      throw new Error('Generated PDF is too small - likely corrupted');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resume-${resume.name?.replace(/\s+/g, '_') || 'candidate'}-${id}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('[Download ERROR] Full details:', error.stack || error.message);
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: error.message 
    });
  }
};
/* ===========================
   GET MY RESUME
=========================== */
export const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });

    if (!resume) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
};

/* ===========================
   GET SINGLE RESUME
=========================== */
export const getSingleResume = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found or unauthorized" });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
};

/* ===========================
   GET USER USAGE STATUS
=========================== */
export const getUsageStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const resume = await Resume.findOne({ userId: req.userId });

    const now = new Date();
    let remainingEdits = 3 - (user.editCount || 0);

    if (user.editResetTime && now > user.editResetTime) {
      remainingEdits = 3;
    }

    res.json({
      success: true,
      data: {
        hasResume: !!resume,
        remainingAIEdits: remainingEdits > 0 ? remainingEdits : 0,
        resetTime: user.editResetTime || null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch usage status" });
  }
};