import { TagResponse } from '@/types'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
interface TagStore {
  tags: TagResponse[] | null
  setTags: (tags: TagResponse[]) => void
}

const useTagStore = create<TagStore>()(
  persist(
    (set) => ({
      tags: null,
      setTags: (tags: TagResponse[]) => {
        set(() => ({ tags }))
      },
    }),
    { name: 'tags', storage: createJSONStorage(() => sessionStorage) },
  ),
)

export default useTagStore
