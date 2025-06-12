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
  }
}
