import { Order, PaginationParams } from './common'
import { ImageResponse } from './images'
import { TagResponse } from './tags'
import { UserResponse } from './users'

export enum Platform {
  GITHUB = 'GitHub',
  GITEE = 'Gitee',
}

export type ProjectBase = {
  brief: string
  description: string
  code_example?: string
  platform: Platform
  repo_id: string
}

export type ProjectCreate = ProjectBase & {
  tag_ids: number[]
  image_ids: number[]
}

export type ProjectOwnerUpdate = Partial<ProjectBase> & {
  tag_ids?: number[]
}

export type ProjectAdminUpdate = ProjectOwnerUpdate

export type ProjectBaseResponse = {
  id: number
  name: string
  brief: string
  description: string
  license?: string
  programming_language?: string
  stars: number
  issues: number
  average_rating: number
  rating_count: number
  view_count: number
  is_approved: boolean
  is_featured: boolean
  submitter_id: number
  avatar?: string
  platform: Platform
  repo_id: string
  created_at: string
  last_commit_at?: string
  tags: TagResponse[]
}

export type ProjectFullResponse = ProjectBaseResponse & {
  repo_url: string
  website_url?: string
  download_url?: string
  code_example?: string
  forks: number
  watchers: number
  contributors: number
  updated_at: string
  repo_created_at?: string
  last_sync_at?: string
  owner_platform_id?: number
  submitter: UserResponse
  images: ImageResponse[]
}

export type ProjectRelatedResponse = {
  id: number
  name: string
  repo_id: string
  avatar?: string
  is_approved: boolean
}

export type ProjectOrderFields =
  | 'id'
  | 'stars'
  | 'forks'
  | 'watchers'
  | 'contributors'
  | 'issues'
  | 'average_rating'
  | 'rating_count'
  | 'created_at'
  | 'updated_at'
  | 'repo_created_at'
  | 'last_commit_at'
  | 'last_sync_at'
  | 'is_approved'
  | 'is_featured'
  | 'view_count'
  | 'submitter'
  | 'name'
  | 'brief'
  | 'description'
  | 'website_url'
  | 'download_url'
  | 'license'
  | 'programming_language'
  | 'code_example'
  | 'platform'
  | 'repo_id'

export type ProjectPaginationParams = PaginationParams & {
  order_by?: ProjectOrderFields
  order: Order
  ids?: number[]
}

export type ProjectSearchParams = {
  keyword?: string
  programming_language?: string | null
  license?: string
  platform?: Platform
  is_featured?: boolean
  tags: number[]
}

export type ProjectRepoDetail = {
  repo_url: string
  avatar: string
  name: string
  website_url?: string
  stars: number
  forks: number
  watchers: number
  contributors: number
  issues: number
  license?: string
  programming_language?: string
  last_commit_at?: string
  repo_created_at?: string
  owner_platform_id: number
  last_sync_at?: string
}

export type ProjectCreateModel = ProjectCreate &
  ProjectRepoDetail & {
    submitter_id: number
  }
