export interface RatingBase {
  score: number
  is_used: boolean
}

export type RatingCreate = RatingBase

export type RatingUpdate = Partial<RatingCreate>

export type RatingResponse = RatingBase & {
  id: number
  project_id: number
  user_id: number
}
