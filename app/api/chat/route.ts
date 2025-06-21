<<<<<<< HEAD
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
      // במקום להחזיר 500, נחזיר את התגובה עם שגיאה ו-aiResponse
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
=======
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer EmiNcV0fy1oSro1XroWyPNFX1hNCieABuu3f8txr5Ugn7yAAl4TeJQQJ99BFACfhMk5XJ3w3AAAAACOGTkur`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are InsightBot, a helpful assistant for team insights and analytics. You help users understand their Slack and GitHub data, team productivity, and project progress. Keep responses concise and helpful.",
          },
          ...messages,
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API request failed")
    }

    const data = await response.json()
    const message = data.choices[0]?.message?.content || "Sorry, I could not process your request."

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
  }
}
