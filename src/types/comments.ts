import { UserRelatedResponse } from './users'

export type CommentRelatedResponse = {
  id: number
  content: string
  user_id: number
  project_id: number
}

export type CommentCreate = {
  content: string
  parent_id?: number
}

export type CommentUpdate = Partial<CommentCreate>

export type CommentResponse = {
  id: number
  content: string
  user: UserRelatedResponse
  project_id: number
  parent_id?: number
  created_at: string
  updated_at: string
}
