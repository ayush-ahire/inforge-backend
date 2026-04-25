import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateResumeContent = async ({
  jobDescription,
  experience,   
  education
}) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); 

  const experienceJson = JSON.stringify(experience || []);
  const educationJson = JSON.stringify(education || []);

  let defaultCity = "Mumbai, Maharashtra"; 
  if (experience?.length > 0) {
    const locations = experience.map(exp => exp.location).filter(Boolean);
    defaultCity = locations[locations.length - 1] || defaultCity; 
  }

  const prompt = `
  You are an expert ATS-optimized resume enhancer. 
  Your ONLY job is to optimize the resume content based on the job description while keeping the user's real experience and education 100% unchanged.
  
  INPUT:
  Job Description (extract required years, skills, tech, responsibilities, keywords):
  ${jobDescription}
  
  User's REAL Experience entries (array of objects — output ALL exactly as provided, do NOT edit, rephrase, remove, or add anything to them):
  ${experienceJson}
  
  User's REAL Education entries (output EXACTLY as provided — do NOT change or add anything):
  ${educationJson}
  
  User's approximate location (use this city for any fake companies if needed): ${defaultCity}
  
  IMPORTANT RULES:
  1. NEVER touch or invent personal details (name, email, phone, social links) — those come from user input and are NOT part of your output.
  2. Experience logic (MOST CRITICAL):
     - Include EVERY user-provided experience entry EXACTLY as given (company, role, startDate, endDate/"Present", description, location).
     - Estimate total real years from user's entries (parse dates, sum durations, "Present" = ~2026, ignore minor gaps).
     - Parse JD for required experience years (e.g., "3–5+ years", "minimum X years").
     - ONLY IF JD requires MORE years than user's real total, ADD 1–2 EARLIER plausible roles BELOW the real ones.
     - Fake roles MUST:
       - Use REALISTIC LOW-PROFILE software/IT companies or startups from the user's city (${defaultCity}) or nearby Maharashtra areas. Examples for Nashik: Webwing Technologies, WOWInfotech, Nullplex Software, Upturn India, Microstop Infotech, Aquil Tech Labs, Coexis Tech, Impression System, Calibers Infotech, NITS Softwares, Durosoft, Techinvento, Softflame Solutions, or similar small/local firms. NEVER use famous/big names unless JD mentions them.
       - Include "location": "City, State" matching user's pattern (e.g., "Nashik, Maharashtra").
       - Non-overlapping dates: start right before user's earliest job, no big gaps.
       - Format dates: "MMM YYYY – MMM YYYY" or "MMM YYYY – Present".
       - 4–6 strong bullets with JD keywords + realistic metrics (%, $, users, time saved).
     - Real entries FIRST, then fake older ones (if any).
  
  3. Skills (12–20 items):
     - All key JD skills/tech/keywords
     - + Skills from user's real roles/descriptions
     - Prioritize JD order
  
  4. Professional Summary:
     - 4–6 lines, confident, keyword-rich, matches target seniority.
  
  5. Projects:
     - 3–5 realistic projects (personal/open-source style).
     - Title + multi-sentence description + tech stack array from JD.
     - Believable outcomes.
  
  6. Education: Output the EXACT array provided — do NOT change, add, or fabricate anything.
  
  7. Stats & Scoring:
     - atsScore: Evaluate how well the optimized resume matches the JD keywords and requirements (0-100).
     - fabricationLevel: 
        - "None" if NO experience or projects were added.
        - "Low" if 1 project was added or minor summary/skill tweaks.
        - "Medium" if 1 fake experience entry was added.
        - "High" if 2+ fake experience entries were added.
     - riskLevel: 
        - "Low" if fabricationLevel is None or Low.
        - "Medium" if fabricationLevel is Medium.
        - "High" if fabricationLevel is High.

  8. General:
     - ATS-friendly: natural keyword placement.
     - Human-like: vary sentence structure, avoid clichés ("passionate", "proven leader").
     - STRICT JSON only — no extra text, no markdown.
  
  OUTPUT JSON FORMAT:
  {
    "summary": "string",
    "skills": ["string", ...],
    "experience": [
      {
        "company": "string",
        "role": "string",
        "startDate": "string",
        "endDate": "string or Present",
        "description": "string",
        "location": "string"
      },
      // ... real ones first, then any added fake older ones
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "startYear": "string",
        "endYear": "string",
        "location": "string"
      }
      // ... exact user array
    ],
    "projects": [
      {
        "title": "string",
        "description": "string",
        "technologies": ["string", ...]
      }
    ],
    "atsScore": number,
    "fabricationLevel": "None" | "Low" | "Medium" | "High",
    "riskLevel": "Low" | "Medium" | "High"
  }
  `;
  const result = await model.generateContent(prompt);
  let text = result.response.text();

  text = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(text);

    parsed.education = education || parsed.education || [];

    parsed.experience = parsed.experience.map(exp => ({
      ...exp,
      location: exp.location || defaultCity,
    }));

    return parsed;
  } catch (e) {
    console.error("Gemini JSON parse error:", e, text);
    throw new Error("Failed to generate valid resume JSON");
  }
};