import { Order, PaginationParams } from './common'

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export type UserBase = {
  username: string
  email: string
}

export type UserCreate = UserBase & {
  password: string
}

export type UserUpdate = Partial<UserBase>

export type UserUpdatePassword = {
  old_password: string
  new_password: string
}

export type AdminUpdatePassword = {
  new_password: string
}

export type UserUpdateByAdmin = UserUpdate & {
  role?: Role
  in_use?: boolean
}

export type UserResponse = {
  id: number
  username: string
  email: string
  avatar?: string
  bio: string
  role: Role
  created_at: string
  updated_at: string
  last_login: string
  github_id?: number
  gitee_id?: number
  github_name?: string
  gitee_name?: string
  in_use: boolean
}

export type UserRelatedResponse = {
  id: number
  username: string
  avatar?: string
  bio: string
  in_use: boolean
}

export type UserFields =
  | 'id'
  | 'avatar'
  | 'bio'
  | 'role'
  | 'created_at'
  | 'updated_at'
  | 'last_login'
  | 'github_id'
  | 'gitee_id'
  | 'github_name'
  | 'gitee_name'
  | 'in_use'

export type UserPaginationParams = PaginationParams & {
  order_by: UserFields
  order: Order
}

export type OAuthLogin = {
  platform: string
  code: string
  redirect_uri: string
}

export type LoginResponse = {
  access_token: string
  token_type: string
  user: UserResponse
}
