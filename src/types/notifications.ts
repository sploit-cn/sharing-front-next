import { CommentRelatedResponse } from './comments'
import { ProjectRelatedResponse } from './projects'

export type NotificationResponse = {
  id: number
  user_id: number
  content: string
  is_read: boolean
  created_at: string
  related_project?: ProjectRelatedResponse
  related_comment?: CommentRelatedResponse
}

export type NotificationBroadcastCreate = {
  content: string
}

export type NotificationUserCreate = {
  user_id: number
  content: string
}
