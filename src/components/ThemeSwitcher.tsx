'use client'
import useThemeStore from '@/store/themeStore'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect } from 'react'
const ThemeSwitcher = () => {
  const isDark = useThemeStore((state) => state.isDark)
  const toggleDark = useThemeStore((state) => state.toggleDark)
  useEffect(() => {
    const style = document.documentElement.style
    style.setProperty(
      '--color-bghover',
      isDark ? 'var(--color-gray-700)' : 'var(--color-gray-200)',
    )
    style.setProperty(
      '--color-bgactive',
      isDark ? 'var(--color-gray-600)' : 'var(--color-gray-300)',
    )
  }, [isDark])
  return (
    <>
      <Button
        type="default"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleDark}
      />
    </>
  )
}

export default ThemeSwitcher
