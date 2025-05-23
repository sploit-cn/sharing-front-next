import AntdProvider from '@/components/AntdProvider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'
import './globals.css'
import { AutoComplete, Button, Layout } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
// import { Button } from 'antd'
import { Flex } from 'antd'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import Title from 'antd/es/typography/Title'
import Search from 'antd/es/input/Search'
import { CloudUploadOutlined, LoginOutlined } from '@ant-design/icons'
import Link from 'next/link'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '开源项目分享平台',
  description: 'Opensource Project Sharing',
}

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="zh-CN">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <AntdProvider>
        <Layout>
          <Header className="border-b-bgactive! sticky top-0 z-10 flex items-center justify-between border-b-2 backdrop-blur-sm">
            <Flex gap="small">
              <Link href="/">
                <Title className="m-0!" level={2}>
                  Opensource Sharing
                </Title>
              </Link>
            </Flex>
            <Flex gap="small" className="leading-none">
              <AutoComplete
                className="w-64"
                options={[{ value: '123' }, { value: '456' }]}
                placeholder="搜索"
              >
                <Search />
              </AutoComplete>
              <ThemeSwitcher />
              <Button autoInsertSpace={false} icon={<CloudUploadOutlined />}>
                提交项目
              </Button>
              <Link className="flex items-center" href="/login">
                <Button autoInsertSpace={false} icon={<LoginOutlined />}>
                  登录/注册
                </Button>
              </Link>
            </Flex>
          </Header>
          {/* make content full screen */}
          <Content className="flex items-center justify-center">
            {children}
          </Content>
          <Footer className="flex items-center justify-center">
            {/* OpenSource Sharing ©2025 Created by Sploit-cn */}
          </Footer>
        </Layout>
      </AntdProvider>
    </body>
  </html>
)

export default RootLayout
