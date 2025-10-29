import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export async function POST(req: NextRequest) {
  try {
    const { kind, input } = await req.json();
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.4,
    });

    const system =
      kind === "summary"
        ? "You generate concise resume summaries. Output 2-4 sentences."
        : kind === "bullets"
        ? "You generate strong resume bullets. Return 4-8 bullet lines separated by newlines."
        : kind === "skills"
        ? "You generate a comma-separated list of skills tailored to the role."
        : kind === "grammar"
        ? "You are a grammar and spelling checker. Fix any grammar, spelling, or punctuation errors in the given text. Return ONLY the corrected text, maintaining the original tone and style. Do not add explanations or change the meaning."
        : kind === "ats"
        ? [
            "You are an ATS optimization assistant.",
            "Return content in a STRICT, parseable format with these sections in order:",
            "SUMMARY:",
            "<2-4 sentences; no emojis or markdown>",
            "SKILLS:",
            "<comma separated list of skills/keywords only>",
            "BULLETS:",
            "<4-8 bullet lines; no leading symbols; each starts with a strong verb; quantify impact>",
          ].join("\n")
        : "Assist with resume text.";

    const res = await model.invoke([
      ["system", system],
      ["user", typeof input === "string" ? input : JSON.stringify(input ?? "Provide content.")]
    ]);

    return NextResponse.json({ text: res.content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}


