"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { User, MessageSquare, HelpCircle, CheckCircle, AlertTriangle, Calendar } from "lucide-react"

interface UserModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

interface UserStats {
  totalMessages: number
  totalHelpRequests: number
  totalCompletedTasks: number
  alerts: Array<{
    id: string
    message: string
    severity: string
    created_at: string
  }>
  dailyTasks: Array<{
    day: string
    open_tasks: number
  }>
}

export function UserModal({ userId, isOpen, onClose }: UserModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserStats()
    }
  }, [userId, isOpen])

  const fetchUserStats = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Fetch total messages
      const { count: totalMessages } = await supabase
        .from("slack_messages_raw")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      // Fetch total help requests and completed tasks
      const { data: summaryData } = await supabase
        .from("user_daily_summary")
        .select("help_requests, completed_tasks")
        .eq("user_id", userId)

      const totalHelpRequests = summaryData?.reduce((sum, day) => sum + day.help_requests, 0) || 0
      const totalCompletedTasks = summaryData?.reduce((sum, day) => sum + day.completed_tasks, 0) || 0

      // Fetch alerts
      const { data: alerts } = await supabase
        .from("alerts")
        .select("id, message, severity, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      // Fetch daily tasks
      const { data: dailyTasks } = await supabase
        .from("user_daily_summary")
        .select("day, open_tasks")
        .eq("user_id", userId)
        .order("day", { ascending: false })

      setUserStats({
        totalMessages: totalMessages || 0,
        totalHelpRequests,
        totalCompletedTasks,
        alerts: alerts || [],
        dailyTasks: dailyTasks || [],
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {userId} - Worker Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : userStats ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalMessages}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
                  <HelpCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalHelpRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalCompletedTasks}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3" dir="rtl">
                      {userStats.alerts.length > 0 ? (
                        userStats.alerts.slice(0, 20).map((alert) => (
                          <div key={alert.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 text-right">
                                <p className="text-sm text-gray-900">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(alert.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No alerts found</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Daily Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Open Tasks by Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2" dir="rtl">
                      {userStats.dailyTasks.length > 0 ? (
                        userStats.dailyTasks.map((day) => (
                          <div key={day.day} className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm font-medium">{new Date(day.day).toLocaleDateString()}</span>
                            <Badge variant="outline">{day.open_tasks} tasks</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No task data found</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
