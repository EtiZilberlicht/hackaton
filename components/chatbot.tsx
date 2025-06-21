"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function Chatbot() {
  console.log("💬 Chatbot component loaded")

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your InsightBot assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    console.log("📨 sendMessage started")

    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      })

      const data = await response.json()
      console.log("📦 full response", data)

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.aiResponse || "Sorry, no response." },
        ])
      } else {
        // אם יש נתונים, מציגים אותם בצורה טבעית
        if (data.data && data.data.length > 0) {
          const row = data.data[0]
          let friendlyText = ""

          if ("author" in row && "commit_count" in row) {
            friendlyText = `The employee who made the most commits is ${row.author} with ${row.commit_count} commits.`
          } else {
            // fallback: הצגת שדות נוספים
            friendlyText = Object.entries(row)
              .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
              .join(", ")
          }

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: friendlyText },
          ])
        } else {
          // אם אין נתונים, מציגים את התגובה האנושית
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.aiResponse || "Query executed successfully." },
          ])
        }
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button onClick={() => setIsOpen(true)} className="rounded-full p-3">
            <MessageCircle className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-[320px] h-[480px] bg-white shadow-xl rounded-xl flex flex-col overflow-hidden border">
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
              <span>InsightBot</span>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 whitespace-pre-wrap">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-blue-100 self-end ml-auto"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                console.log("📨 onSubmit called")
                sendMessage()
              }}
              className="flex items-center gap-2 border-t p-2"
            >
              <input
                className="flex-1 border border-gray-300 rounded px-2 py-1"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 text-white rounded"
                disabled={isLoading}
                onClick={() => console.log("🖱️ Clicked Send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
