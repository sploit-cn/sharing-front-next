export type ImageBase = {
  project_id?: number
}

export type ImageCreate = ImageBase

export type ImageResponse = ImageBase & {
  id: number
  file_name: string
  user_id: number
  original_name: string
  mime_type: string
}
