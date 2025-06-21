import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userQuestion = body.question;

    const API_KEY = process.env.ASKYOURDB_API_KEY;
    const CHATBOT_ID = "756b526c4331bce012116ce4bb1acc9d";

    if (!API_KEY) {
      throw new Error("ASKYOURDB_API_KEY environment variable is not set");
    }

    const response = await fetch("https://www.askyourdatabase.com/api/ask/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        question: userQuestion,
        chatbotid: CHATBOT_ID,
        returnAll: false,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("AskYourDB API error:", result);
      return NextResponse.json(
        { error: result.error || "AskYourDB API error", aiResponse: result.aiResponse || "" },
        { status: 200 }
      );
    }

    console.log("🧪 AskYourDB returned:", result);
    return NextResponse.json({ message: result.aiResponse, data: result.data });
  } catch (error) {
    console.error("Backend error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
