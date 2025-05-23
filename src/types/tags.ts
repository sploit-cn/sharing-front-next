export type TagBase = {
  name: string
  category: string
  description: string
}

export type TagCreate = TagBase

export type TagUpdate = Partial<TagBase>

export type TagResponse = TagBase & {
  id: number
}
