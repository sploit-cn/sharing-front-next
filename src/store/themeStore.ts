import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
interface ThemeStore {
  isDark: boolean
  toggleDark: () => void
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: true,
      toggleDark: () => {
        set((state) => ({ isDark: !state.isDark }))
      },
    }),
    { name: 'dark-mode', storage: createJSONStorage(() => localStorage) },
  ),
)

export default useThemeStore
