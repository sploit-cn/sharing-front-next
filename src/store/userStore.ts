import { create } from 'zustand'
import { UserResponse } from '@/types'
interface UserStore {
  isLoggedIn: boolean
  user: UserResponse | null
  login: (user: UserResponse) => void
  logout: () => void
  updateUser: (user: UserResponse) => void
}

const useUserStore = create<UserStore>()((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user: UserResponse) => {
    set(() => ({ isLoggedIn: true, user }))
  },
  logout: () => {
    set(() => ({ isLoggedIn: false, user: null }))
  },
  updateUser: (user: UserResponse) => {
    set(() => ({ user }))
  },
}))

export default useUserStore
