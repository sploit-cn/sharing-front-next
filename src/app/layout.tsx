import AntdProvider from '@/components/AntdProvider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'
import './globals.css'
import { Layout } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
import { Flex } from 'antd'
import Title from 'antd/es/typography/Title'
import Link from 'next/link'
import HeaderButtons from '@/components/HeaderButtons'
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
        <Layout className="min-h-screen!">
          <Header className="border-b-bgactive! sticky top-0 z-10 flex items-center justify-between border-b-2 backdrop-blur-sm">
            <Flex gap="small">
              <Link href="/">
                <Title className="mt-1" level={2}>
                  Opensource Sharing
                </Title>
              </Link>
            </Flex>
            <HeaderButtons />
          </Header>
          {/* make content full screen */}
          <Content className="flex items-center justify-center">
            {children}
          </Content>
          <Footer className="border-t-bgactive! flex items-center justify-center border-t-1">
            OpenSource Sharing ©2025 Created by Sploit-cn
          </Footer>
        </Layout>
      </AntdProvider>
    </body>
  </html>
)

export default RootLayout
