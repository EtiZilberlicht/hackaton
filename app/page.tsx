"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MetricCard } from "@/components/metric-card"
import { Layout } from "@/components/layout"
import { supabase } from "@/lib/supabase"
import { GitPullRequest, CheckSquare, MessageSquare, AlertTriangle, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardData {
  openPRs: number
  totalOpenTasks: number
  totalMessages: number
  projectProgress: Array<{
    day: string
    completed: number
    open: number
    ratio: number
  }>
  highSeverityAlerts: Array<{
    id: string
    message: string
    user_id: string
    created_at: string
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch open PRs count
      const { count: openPRs } = await supabase
        .from("github_prs_raw")
        .select("*", { count: "exact", head: true })
        .eq("state", "open")


      // Fetch total open tasks
      const { data: taskData } = await supabase.from("user_daily_summary").select("open_tasks")

      const totalOpenTasks = taskData?.reduce((sum, row) => sum + row.open_tasks, 0) || 0

      // Fetch total messages count
      const { count: totalMessages } = await supabase
        .from("slack_messages_raw")
        .select("*", { count: "exact", head: true })

      // Fetch project progress data
      const { data: progressData } = await supabase
        .from("user_daily_summary")
        .select("day, completed_tasks, open_tasks")
        .order("day")

      const progressByDay =
        progressData?.reduce(
          (acc, row) => {
            const existing = acc.find((item) => item.day === row.day)
            if (existing) {
              existing.completed += row.completed_tasks
              existing.open += row.open_tasks
            } else {
              acc.push({
                day: row.day,
                completed: row.completed_tasks,
                open: row.open_tasks,
                ratio: 0,
              })
            }
            return acc
          },
          [] as Array<{ day: string; completed: number; open: number; ratio: number }>,
        ) || []

      // Calculate ratios
      progressByDay.forEach((item) => {
        const total = item.completed + item.open
        item.ratio = total > 0 ? (item.completed / total) * 100 : 0
      })

      // Fetch high severity alerts
      const { data: alertsData } = await supabase
        .from("alerts")
        .select("id, message, user_id, created_at")
        .eq("severity", "high")
        .order("created_at", { ascending: false }).limit(20)

      setData({
        openPRs: openPRs || 0,
        totalOpenTasks,
        totalMessages: totalMessages || 0,
        projectProgress: progressByDay,
        highSeverityAlerts: alertsData || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your team's performance and insights</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Open Pull Requests"
            value={data?.openPRs || 0}
            icon={GitPullRequest}
            description="Currently open PRs"
          />
          <MetricCard
            title="Total Open Tasks"
            value={data?.totalOpenTasks || 0}
            icon={CheckSquare}
            description="Across all team members"
          />
          <MetricCard
            title="Total Slack Messages"
            value={data?.totalMessages || 0}
            icon={MessageSquare}
            description="All time messages"
          />
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Progress Chart */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.projectProgress || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Completion Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="ratio"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* High Severity Alerts */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  High Severity Alerts
                </div>
                <Badge variant="destructive">{data?.highSeverityAlerts.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3" dir="rtl">
                  {data?.highSeverityAlerts && data.highSeverityAlerts.length > 0 ? (
                    data.highSeverityAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{alert.message}</p>
                            <div className="flex items-center mt-2 text-xs text-red-700">
                              <span className="font-medium">{alert.user_id}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No high severity alerts</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
