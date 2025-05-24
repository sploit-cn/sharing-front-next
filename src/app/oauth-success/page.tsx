'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { App, Spin, Card, Flex } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import useUserStore from '@/store/userStore'
import { LoginResponse, DataResponse, UserResponse } from '@/types'
import ky from 'ky'

export default function OAuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message } = App.useApp()
  const login = useUserStore((state) => state.login)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      // 使用token获取用户信息并更新登录状态
      const handleOAuthSuccess = async () => {
        try {
          // 由于后端已经设置了cookie，我们可以直接验证用户身份
          // 这里我们构造LoginResponse对象来更新store
          const urlParams = new URLSearchParams(window.location.search)
          const token = urlParams.get('token')
          if (!token) throw new Error('Token not found')
          const request = await ky('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).json<DataResponse<UserResponse>>()
          if (request.code !== 200) throw new Error(request.message)
          const loginResponse: LoginResponse = {
            access_token: token,
            token_type: 'bearer',
            user: request.data,
          }
          login(loginResponse)
          message.success('OAuth 登录成功！')

          // 延迟跳转到首页，让用户看到成功信息
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } catch {
          message.error('登录状态验证失败')
          router.push('/login')
        } finally {
          setLoading(false)
        }
      }

      handleOAuthSuccess()
    } else {
      message.error('登录失败，缺少认证信息')
      router.push('/login')
    }
  }, [searchParams, router, message, login])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-96">
        <Flex vertical align="center" gap="large">
          <CheckCircleOutlined className="text-6xl text-green-500" />
          <h2 className="text-xl font-semibold">OAuth 登录成功</h2>
          <p className="text-center text-gray-600">正在为您跳转到首页...</p>
          {loading && <Spin size="large" />}
        </Flex>
      </Card>
    </div>
  )
}
