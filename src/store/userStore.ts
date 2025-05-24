import { create } from 'zustand'
import { UserResponse, LoginResponse } from '@/types'
import { persist, createJSONStorage } from 'zustand/middleware'
interface UserStore {
  user: UserResponse | null
  userToken: string | null
  oauthToken: string | null
  login: (response: LoginResponse) => void
  logout: () => void
  updateUser: (user: UserResponse) => void
  oauthRegister: (oauthToken: string) => void
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      userToken: null,
      oauthToken: null,
      oauthRegister: (oauthToken: string) => {
        set(() => ({ oauthToken }))
      },
      login: (response: LoginResponse) => {
        set(() => ({
          user: response.user,
          userToken: response.access_token,
        }))
      },
      logout: () => {
        set(() => ({
          user: null,
          userToken: null,
          oauthToken: null,
        }))
      },
      updateUser: (user: UserResponse) => {
        set(() => ({ user }))
      },
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useUserStore
