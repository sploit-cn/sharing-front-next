export type Order = 'asc' | 'desc'

export type ResponseBase = {
  code: number
  message: string
}

export type MessageResponse = ResponseBase

export type ErrorResponse = {
  code: number
  message: string
}

export type ValidationErrorResponse = ErrorResponse & {
  fields: Record<string, string | string[]>
}

export type DataResponse<T> = ResponseBase & {
  data: T
}

export type PaginationParams = {
  page: number
  page_size: number
}

export type PaginatedData<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export type PaginatedResponse<T> = ResponseBase & {
  data: PaginatedData<T>
}
