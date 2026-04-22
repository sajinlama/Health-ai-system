import { GoogleGenAI } from "@google/genai"
import { buildPrompt } from "@/service/prompt/prompt"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

interface AIInput {
  healthInfo: any
  goalInfo: any
  diseaseInfo: any[]
  userInfo: any
}

export async function generateHealthPlan(data: AIInput) {
  const prompt = buildPrompt(data)

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  })

  const raw =
    response.text ??
    response.candidates?.[0]?.content?.parts?.[0]?.text

  if (!raw) throw new Error("Empty AI response")

  // Strip markdown fences if present
  const cleaned = raw.replace(/```json|```/g, "").trim()

  return JSON.parse(cleaned)
}


