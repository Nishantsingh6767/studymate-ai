import { GoogleGenAI } from "@google/genai";

const ALLOWED_ORIGINS = [
  "https://nishantsingh6767.github.io",
  "https://studymate.site",
  "https://www.studymate.site",
];

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

  // Keep the rest of your existing handler below this point.
