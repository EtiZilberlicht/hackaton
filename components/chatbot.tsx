"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your InsightBot assistant. How can I help you with your team insights today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
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
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
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
    </>
  )
}
