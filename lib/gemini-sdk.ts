import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Assignment } from "@/types/assignment";

export class GeminiClient {
  private apiKey: string;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async completeAssignment(assignment: Assignment): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = this.createPromptFromAssignment(assignment);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error("Gemini API request failed:", error);
      throw error;
    }
  }

  private createPromptFromAssignment(assignment: Assignment): string {
    return `
      You are an student. You must provide a complete ready-to-submit response. The response must contain just the answer.
      Please complete the following assignment:
      
      Title: ${assignment.title}
      
      Description: ${assignment.description}
      
      Please provide a comprehensive, well-structured response that addresses all aspects of this assignment.
      Include appropriate citations, examples, and explanations where necessary.
      Format your response appropriately for an academic submission.
    `;
  }
}

export const geminiClient = new GeminiClient();
