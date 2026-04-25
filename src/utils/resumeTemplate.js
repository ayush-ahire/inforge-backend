import {
    Document,
    Paragraph,
    TextRun,
    AlignmentType,
    BorderStyle,
    TabStopType,
    TabStopPosition,
  } from "docx";
  
  const ACCENT_COLOR = "2E74B5";
  

  const sectionTitle = (text) => new Paragraph({
    spacing: { before: 360, after: 160 }, // good separation
    children: [
      new TextRun({
        text,
        bold: true,
        color: ACCENT_COLOR,
        size: 36, // slightly larger for visibility (~18pt)
      }),
    ],
    border: {
      bottom: {
        color: ACCENT_COLOR,
        style: BorderStyle.SINGLE,
        size: 24,     // thicker line (≈3pt) — more like LaTeX \titlerule
        space: 8,     // space between text and line
      },
    },
  });
  
  // ── Tab-based dated entry (no table) ──
  const datedEntryParagraphs = (leftTop, rightTop, leftBottom, rightBottom = "") => [
    // Company / Dates
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 40 },
      children: [
        new TextRun({ text: leftTop, bold: true, size: 24 }),
        new TextRun({ text: `\t${rightTop}`, size: 22 }),
      ],
    }),
    // Role / Location
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 100 },
      children: [
        new TextRun({ text: leftBottom, italics: true, size: 22 }),
        new TextRun({ text: `\t${rightBottom || ""}`, italics: true, size: 22 }),
      ],
    }),
  ];
  
  // ── Bullet point ──
  const bullet = (text) => new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });
  
  // ── Split description into bullets ──
  const addDescriptionBullets = (description, children) => {
    let bullets = [];
    if (Array.isArray(description)) {
      bullets = description;
    } else if (typeof description === "string") {
      bullets = description
        .split(/(?<!\w\.\w.)(?<=[.!?])\s+|\n/)
        .map(s => s.trim())
        .filter(Boolean);
    }
  
    bullets.forEach(point => {
      if (point) children.push(bullet(point));
    });
  };
  
  // ── Main function ──
  export const buildResumeDocument = (resume) => {
    const children = [];
  
    // ── HEADER ───────────────────────────────────────────────────────────────
    // Name – large and centered
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: resume.fullName || "Your Name",
            bold: true,
            size: 56,
          }),
        ],
      })
    );
  
    // Job Title – centered
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: resume.title || "Client Engineer",
            size: 32,
            bold: true,
          }),
        ],
      })
    );
  
    // Contact details – centered
    const contactParts = [
      resume.location || "Nashik, Maharashtra",
      resume.phone || "+91 9653432655",
      resume.email || "ayushahire6@gmail.com",
    ].filter(Boolean);
  
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: contactParts.join("      "),
            size: 22,
            color: "444444",
          }),
        ],
      })
    );
  
    // Social links – centered (user edits later)
    if (resume.links?.length > 0) {
      const linkDisplay = resume.links
        .map(link => link.replace(/^(https?:\/\/)?(www\.)?/, ''))
        .join("      ");
  
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [
            new TextRun({
              text: linkDisplay,
              size: 20,
              color: "666666",
              italics: true,
            }),
          ],
        })
      );
    }
  
    // ── PROFESSIONAL SUMMARY ─────────────────────────────────────────────────
    children.push(sectionTitle("PROFESSIONAL SUMMARY"));
    children.push(
      new Paragraph({
        spacing: { after: 280 },
        children: [new TextRun({ text: resume.summary || "", size: 22 })],
      })
    );
  
    // ── PROFESSIONAL EXPERIENCE ──────────────────────────────────────────────
    children.push(sectionTitle("PROFESSIONAL EXPERIENCE"));
  
    resume.experience?.forEach(exp => {
      children.push(
        ...datedEntryParagraphs(
          exp.company,
          `${exp.startDate} -- ${exp.endDate || "Present"}`,
          exp.role,
          exp.location || ""
        )
      );
  
      addDescriptionBullets(exp.description, children);
      children.push(new Paragraph({ spacing: { after: 240 } }));
    });
  
    // ── EDUCATION ────────────────────────────────────────────────────────────
    children.push(sectionTitle("EDUCATION"));
  
    resume.education?.forEach(edu => {
      children.push(
        ...datedEntryParagraphs(
          edu.institution,
          `${edu.startYear} -- ${edu.endYear}`,
          edu.degree,
          edu.location || ""
        )
      );
      children.push(new Paragraph({ spacing: { after: 240 } }));
    });
  
    // ── PROJECTS ─────────────────────────────────────────────────────────────
    if (resume.projects?.length) {
      children.push(sectionTitle("PROJECTS"));
  
      resume.projects.forEach(proj => {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: proj.title || "", bold: true, size: 26 }),
            ],
          })
        );
  
        addDescriptionBullets(proj.description, children);
        children.push(new Paragraph({ spacing: { after: 240 } }));
      });
    }
  
    // ── TECHNICAL SKILLS ─────────────────────────────────────────────────────
    children.push(sectionTitle("TECHNICAL SKILLS"));
  
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: (resume.skills || []).join(" • "),
            size: 22,
          }),
        ],
      })
    );
  
    return children;
  };