"use server";

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const instructions = process.env.NEXUS_PROMPT;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { messages } = body; 

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid or missing messages array" },
        { status: 400 }
      );
    }

    const conversation = [
        { role: "system", content: instructions },
        ...messages,
    ]

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversation,
        max_tokens: 500,
      });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
