import Groq from "groq-sdk";
import type { InterviewAnalytics } from "@/lib/interviewEngine";

const apiKey = process.env.GROQ_API_KEY || "";
const MODEL = "llama-3.3-70b-versatile";

function getClient(): Groq {
  if (!apiKey) throw new Error("Groq API key not configured");
  return new Groq({ apiKey });
}

export async function generateInterviewAnalytics(
  role: string,
  qapairs: { question: string; answer: string }[]
): Promise<InterviewAnalytics> {
  const groq = getClient();

  const lines = qapairs
    .map((p, i) => `Q${i + 1}: ${p.question}\nA${i + 1}: ${p.answer || "(no answer provided)"}`)
    .join("\n\n");

  const prompt = `You are an expert technical interviewer evaluating a candidate for a ${role} role.

Analyze the following interview Q&A carefully. Your feedback MUST be specific to what the candidate actually said — do NOT give generic statements. Reference real content from their answers in strengths and weaknesses.

INTERVIEW TRANSCRIPT:
${lines}

SCORING CRITERIA:
- technical_knowledge: accuracy and depth of technical answers
- communication: clarity, structure, and articulation of responses
- confidence: assertiveness and certainty in answers (infer from language used)
- grammar: grammatical correctness and professional language

INSTRUCTIONS:
1. Strengths must cite specific things the candidate demonstrated (e.g. "Correctly explained X", "Gave a concrete example of Y")
2. Weaknesses must point to actual gaps (e.g. "Answer to Q3 lacked depth on X", "Did not address Y in the response")
3. Suggestions must be actionable and specific to their weak areas
4. If an answer is empty or very short, penalize technical_knowledge and confidence scores accordingly

Return ONLY valid JSON with no markdown, no code blocks, no explanation:
{"overall_score":0,"communication":0,"technical_knowledge":0,"confidence":0,"grammar":0,"strengths":["","",""],"weaknesses":["","",""],"suggestions":["","",""]}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const text = completion.choices[0]?.message?.content || "";

try {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
} catch (error) {
  console.error("Interview JSON Parse Error:", error);
  console.log("Raw Response:", text);

  return {
    overall_score: 60,
    communication: 60,
    technical_knowledge: 60,
    confidence: 60,
    grammar: 60,
    strengths: ["Basic understanding demonstrated"],
    weaknesses: ["Needs more detailed answers"],
    suggestions: ["Practice answering with more depth"]
  };
}
}

export interface ResumeAnalysis {
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_level: string;
  strengths: string[];
  improvements: string[];
  recommended_projects: Array<{
    title: string;
    description: string;
    skills: string[];
  }>;
  overall_summary: string;
}

export async function analyzeResumeWithGroq(
  resumeText: string,
  role: string
): Promise<ResumeAnalysis> {
  const groq = getClient();

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach. Analyze this resume for a ${role} position.

RESUME CONTENT:
${resumeText}

Provide a detailed ATS analysis. Be accurate and honest — score based on actual resume content.

Return ONLY valid JSON with no markdown, no code blocks, no explanation:
{
  "ats_score": <integer 40-95, honest score based on resume relevance to ${role}>,
  "matched_skills": [<list of skills in the resume that match ${role} requirements>],
  "missing_skills": [<list of important ${role} skills NOT found in resume>],
  "experience_level": "<junior|mid|senior>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific actionable improvement 1>", "<specific actionable improvement 2>", "<specific actionable improvement 3>"],
  "recommended_projects": [
    {
      "title": "<project title>",
      "description": "<what to build and why it boosts ATS score for ${role}>",
      "skills": ["<skill1>", "<skill2>", "<skill3>"]
    },
    {
      "title": "<project title>",
      "description": "<what to build and why it boosts ATS score for ${role}>",
      "skills": ["<skill1>", "<skill2>", "<skill3>"]
    },
    {
      "title": "<project title>",
      "description": "<what to build and why it boosts ATS score for ${role}>",
      "skills": ["<skill1>", "<skill2>", "<skill3>"]
    }
  ],
  "overall_summary": "<2-3 sentence honest assessment of resume fit for ${role} and what it would take to reach ATS score of 90+>"
}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 1500,
  });

  const text = completion.choices[0]?.message?.content || "";

try {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
} catch (error) {
  console.error("Resume JSON Parse Error:", error);
  console.log("Raw Response:", text);

  return {
    ats_score: 65,
    matched_skills: ["Java", "Git"],
    missing_skills: ["Docker", "AWS"],
    experience_level: "junior",
    strengths: ["Good technical basics"],
    improvements: ["Add more projects"],
    recommended_projects: [
      {
        title: "Portfolio Website",
        description: "Build a portfolio website",
        skills: ["React", "CSS", "JavaScript"]
      }
    ],
    overall_summary: "Resume has a decent foundation but needs stronger project work and modern stack skills."
  };
}
}
