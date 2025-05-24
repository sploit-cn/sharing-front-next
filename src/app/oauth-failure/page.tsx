'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { App, Button, Card, Flex } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'

export default function OAuthFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message } = App.useApp()
  const [errorMessage, setErrorMessage] = useState('OAuth 登录失败')

  useEffect(() => {
    const msgParam = searchParams.get('message')
    if (msgParam) {
      setErrorMessage(decodeURIComponent(msgParam))
      message.error(errorMessage)
    }
  }, [searchParams, message, errorMessage])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-96">
        <Flex vertical align="center" gap="large">
          <CloseCircleOutlined className="text-6xl text-red-500" />
          <h2 className="text-xl font-semibold">OAuth 登录失败</h2>
          <p className="text-center text-gray-600">{errorMessage}</p>
          <Flex gap="middle">
            <Button type="primary" onClick={() => router.push('/login')}>
              返回登录
            </Button>
            <Button onClick={() => window.history.back()}>重试</Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}
