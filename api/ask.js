import { GoogleGenAI } from "@google/genai";

const ALLOWED_ORIGINS = [
  "https://nishantsingh6767.github.io",
  "https://studymate.site",
  "https://www.studymate.site",
];

const MAX_QUESTION_LENGTH = 4000;

export default async function handler(request, response) {
  const origin = request.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Vary", "Origin");

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return response.status(403).json({
      error: "This website is not allowed to use this service.",
    });
  }

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Use POST for questions.",
    });
  }

  const question =
    typeof request.body?.question === "string"
      ? request.body.question.trim()
      : "";

  if (!question) {
    return response.status(400).json({
      error: "Please enter a question.",
    });
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return response.status(413).json({
      error: `Please keep your question under ${MAX_QUESTION_LENGTH} characters.`,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error: "The AI service is not configured yet.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: question,
      config: {
        systemInstruction:
          "You are StudyMate AI, a friendly study assistant. Explain clearly and accurately at a student's level. Show steps for educational problems and say when you are unsure.",
        maxOutputTokens: 1024,
      },
    });

    const answer = result.text?.trim();

    if (!answer) {
      return response.status(502).json({
        error: "The AI returned an empty answer. Please try again.",
      });
    }

    return response.status(200).json({ answer });
  } catch (error) {
    console.error("Gemini request failed:", error?.message || "Unknown error");

    return response.status(502).json({
      error: "StudyMate could not get an answer right now. Please try again.",
    });
  }
}
