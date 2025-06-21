"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Layout } from "@/components/layout"
import { UserModal } from "@/components/user-modal"
import { supabase } from "@/lib/supabase"
import { Users, GitCommit, AlertTriangle } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface WorkersData {
  commitsByUser: Array<{ user_id: string; commits: number }>
  alertsByUser: Array<{ user_id: string; alert_count: number }>
  summaryByUser: Array<{ user_id: string; commits: number }>
  allUsers: Array<{ user_id: string; commits: number }>
}

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
]

export default function Workers() {
  const [data, setData] = useState<WorkersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchWorkersData()
  }, [])

  const fetchWorkersData = async () => {
    try {
      const { data: summaryData } = await supabase
        .from("user_daily_summary")
        .select("user_id, commits")

      const summaryByUser =
        summaryData?.map((entry) => ({
          user_id: entry.user_id,
          commits: entry.commits,
        })) || []

      // Fetch commits by user
      const { data: commitsData } = await supabase
        .from("github_commits_raw")
        .select("author")

      const commitsByUser =
        commitsData?.reduce(
          (acc, commit) => {
            const existing = acc.find((item) => item.user_id === commit.author)
            if (existing) {
              existing.commits += 1
            } else {
              acc.push({ user_id: commit.author, commits: 1 })
            }
            return acc
          },
          [] as Array<{ user_id: string; commits: number }>
        ) || []

      // Fetch alerts by user
      const { data: alertsData } = await supabase.from("alerts").select("user_id")

      const alertsByUser =
        alertsData?.reduce(
          (acc, alert) => {
            const existing = acc.find((item) => item.user_id === alert.user_id)
            if (existing) {
              existing.alert_count += 1
            } else {
              acc.push({ user_id: alert.user_id, alert_count: 1 })
            }
            return acc
          },
          [] as Array<{ user_id: string; alert_count: number }>
        ) || []

      const allUsers = summaryByUser

      setData({
        commitsByUser,
        alertsByUser,
        allUsers,
        summaryByUser,
      })
    } catch (error) {
      console.error("Error fetching workers data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId)
    setModalOpen(true)
  }

  const getUserInitials = (userId: string) => {
    return userId
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
          <h1 className="text-3xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-600 mt-2">Team member insights and performance metrics</p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commits Pie Chart */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitCommit className="h-5 w-5 mr-2 text-indigo-600" />
                Commits by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.commitsByUser || []}
                        dataKey="commits"
                        nameKey="user_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        labelLine={false}
                      >
                        {data?.commitsByUser.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const total =
                            data?.commitsByUser.reduce((sum, e) => sum + e.commits, 0) || 1
                          const percent = ((props.payload.commits / total) * 100).toFixed(1)
                          return [`${percent}%`]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="ml-6 flex flex-col justify-center text-sm">
                  {data?.commitsByUser.map((entry, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <div
                        className="w-3 h-3 rounded-sm mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700">{entry.user_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Bar Chart */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Alerts by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.alertsByUser || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user_id" tick={false} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="alert_count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Cards Grid */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(() => {
                const seenUserIds = new Set<string>()

                return data?.allUsers
                  .slice() // עותק של המערך המקורי
                  .sort((a, b) => {
                    const firstNameA = a.user_id.split(" ")[0].toLowerCase()
                    const firstNameB = b.user_id.split(" ")[0].toLowerCase()
                    return firstNameA.localeCompare(firstNameB)
                  })
                  .filter((user) => {
                    if (seenUserIds.has(user.user_id)) {
                      return false
                    } else {
                      seenUserIds.add(user.user_id)
                      return true
                    }
                  })
                  .map((user) => (
                    <Card
                      key={user.user_id}
                      className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200"
                      onClick={() => handleUserClick(user.user_id)}
                    >
                      <CardContent className="p-4 text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-3">
                          <img
                            src="/user.png"
                            alt="Anonymous user"
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        </Avatar>
                        <h3 className="font-semibold text-gray-900 truncate">{user.user_id}</h3>
                        <p className="text-sm text-gray-600 mt-1">Worker</p>
                        <div className="mt-3 flex justify-center space-x-4 text-xs text-gray-500">
                          <span>
                            {data?.commitsByUser.find((u) => u.user_id === user.user_id)?.commits || 0} commits
                          </span>
                          <span>
                            {data?.alertsByUser.find((u) => u.user_id === user.user_id)?.alert_count || 0} alerts
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              })()}
            </div>
          </CardContent>
        </Card>

        {/* User Modal */}
        <UserModal
          userId={selectedUser}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedUser(null)
          }}
        />
      </div>
    </Layout>
  )
}
