"use client"

<<<<<<< HEAD
import { useState, useRef, useEffect } from "react"
import { Send, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
=======
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da

interface Message {
  role: "user" | "assistant"
  content: string
}

export function Chatbot() {
<<<<<<< HEAD
  console.log("💬 Chatbot component loaded")

=======
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
<<<<<<< HEAD
      content: "Hi! I'm your InsightBot assistant. How can I help you today?",
=======
      content: "Hi! I'm your InsightBot assistant. How can I help you with your team insights today?",
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
<<<<<<< HEAD
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    console.log("📨 sendMessage started")

=======
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const sendMessage = async () => {
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
<<<<<<< HEAD
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
=======
      // אם אין עדיין sessionToken – ניצור אחד חדש
      let token = sessionToken
      if (!token) {
        const sessionRes = await fetch("https://www.askyourdatabase.com/api/chatbot/v2/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 88f91a2ff8b732b09497655dfbc80731c0fa065e6ad418aeb3d9982a240081f5",
          },
          body: JSON.stringify({
            chatbotid: "705f6441b90021d65031fbf144a2d4da",
            name: "Web User",
            email: "user@example.com",
          }),
        })

        const sessionData = await sessionRes.json()
        token = sessionData.session_token
        setSessionToken(token)
      }

      // שליחת הודעה
      const response = await fetch("https://www.askyourdatabase.com/api/chatbot/v2/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
      ])
    } finally {
      setIsLoading(false)
    }
  }

<<<<<<< HEAD
  const handleKeyDown = (e: React.KeyboardEvent) => {
=======
  const handleKeyPress = (e: React.KeyboardEvent) => {
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
<<<<<<< HEAD
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
=======
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-xl z-40 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
              InsightBot Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">Thinking...</div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your team insights..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
>>>>>>> 1da07f3376da777355d95c835ce04bad6bdfe3da
    </>
  )
}
