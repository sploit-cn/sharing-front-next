import { ProjectBaseResponse } from './projects'
import { UserRelatedResponse } from './users'

export type FavoriteResponse = {
  id: number
  project_id: number
  user_id: number
}

export type FavoriteUserResponse = {
  id: number
  project_id: number
  user: UserRelatedResponse
  created_at: string
}

export type FavoriteProjectResponse = {
  id: number
  project: ProjectBaseResponse
  user_id: number
}
