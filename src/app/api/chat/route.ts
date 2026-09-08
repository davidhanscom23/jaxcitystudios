import { NextRequest, NextResponse } from "next/server";
import { answerPricingQuestion } from "@/lib/chat";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }
  return NextResponse.json({ reply: answerPricingQuestion(message) });
}
