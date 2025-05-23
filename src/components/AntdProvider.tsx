'use client'
import { ConfigProvider, App } from 'antd' // App 组件用于消费静态方法上下文
import { AntdRegistry } from '@ant-design/nextjs-registry'
import '@ant-design/v5-patch-for-react-19' // 引入补丁
import React from 'react'
import lightTheme from '@/themes/light'
import darkTheme from '@/themes/dark'
import useThemeStore from '@/store/themeStore'
export default function AntdProvider({ children }: React.PropsWithChildren) {
  const isDark = useThemeStore((state) => state.isDark)
  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <App>
        <AntdRegistry>{children}</AntdRegistry>
      </App>
    </ConfigProvider>
  )
}
