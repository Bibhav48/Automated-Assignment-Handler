import { NextResponse } from "next/server";
import { geminiClient } from "@/lib/gemini-sdk";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { assignment, userPrompt } = await req.json();

    // Read the prompt template
    const promptTemplate = await fs.readFile(
      path.join(process.cwd(), "prompts", "assignment-editor.txt"),
      "utf-8"
    );

    const formattedPrompt = promptTemplate
      .replace("{title}", assignment.title)
      .replace("{description}", assignment.description)
      .replace("{userPrompt}", userPrompt);

    // Generate response using Gemini
    const response = await geminiClient.completeAssignment({
      ...assignment,
      description: formattedPrompt,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
} 