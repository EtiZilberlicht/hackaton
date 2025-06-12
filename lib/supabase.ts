import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          id: string
          user_id: string
          type: string
          message: string
          severity: string
          created_at: string
        }
      }
      github_commits_raw: {
        Row: {
          sha: string
          author: string
          message: string
          timestamp: string
          repository: string
          url: string
        }
      }
      github_prs_raw: {
        Row: {
          id: string
          user_id: string
          title: string
          state: string
          created_at: string
          closed_at: string | null
          merged_at: string | null
          repository: string
          url: string
          event_action: string
        }
      }
      github_reviews_raw: {
        Row: {
          id: string
          pull_request_id: string
          user_id: string
          state: string
          body: string
          created_at: string
          url: string
        }
      }
      slack_messages_raw: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          text: string
          ts: number
          thread_ts: string | null
          raw: any
          event_type: string
          parent_id: string | null
          is_list: boolean | null
          list_items: any
          num_list_items: number | null
        }
      }
      user_daily_summary: {
        Row: {
          user_id: string
          day: string
          total_messages: number
          help_requests: number
          stuck_passive: number
          stuck_active: number
          resolved: number
          completed_tasks: number
          open_tasks: number
          commits: number
          reviews: number
        }
      }
    }
  }
}
