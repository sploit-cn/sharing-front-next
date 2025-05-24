'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { App, Button, Card, Flex, Form, Input } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import Password from 'antd/es/input/Password'
import ky from 'ky'
import useUserStore from '@/store/userStore'
import { DataResponse, LoginResponse, UserCreate } from '@/types'

type OAuthRegisterForm = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function OAuthRegisterPage() {
  const [form] = Form.useForm<OAuthRegisterForm>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message } = App.useApp()
  const login = useUserStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [allowEmail, setAllowEmail] = useState(true)

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!token) {
      message.error('缺少OAuth认证信息')
      router.push('/login')
      return
    }

    if (email) {
      form.setFieldsValue({ email })
      setAllowEmail(false)
    }
  }, [searchParams, router, message, form])

  async function handleRegister(values: OAuthRegisterForm) {
    const token = searchParams.get('token')
    if (!token) {
      message.error('缺少OAuth认证信息')
      return
    }

    setLoading(true)
    try {
      const registerData: UserCreate = {
        username: values.username,
        email: values.email,
        password: values.password,
      }

      const res = await ky
        .post<DataResponse<LoginResponse>>('/api/auth/oauth-register', {
          json: registerData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json()

      if (res.code === 200) {
        message.success('注册成功！')
        login(res.data)
        router.push('/')
      } else {
        message.error(res.message)
      }
    } catch {
      message.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-96" hoverable>
        <Flex vertical justify="center" align="center">
          <p className="mb-2 text-center text-2xl">Opensource Sharing</p>
          <p className="m-4 text-center text-xl">完成OAuth注册</p>
        </Flex>

        <Form
          layout="horizontal"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          form={form}
          onFinish={handleRegister}
          onFinishFailed={() => {
            message.error('无效字段，请检查输入内容')
          }}
          autoComplete="off"
        >
          <Form.Item<OAuthRegisterForm>
            name="username"
            rules={[
              {
                required: true,
                message: '请输入合法的用户名',
                min: 3,
                max: 20,
                pattern: /^[a-zA-Z0-9\-_]+$/,
                type: 'string',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="mr-1" />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item<OAuthRegisterForm>
            name="email"
            rules={[
              {
                required: true,
                message: '请输入合法的邮箱',
                type: 'email',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined className="mr-1" />}
              placeholder="邮箱"
              disabled={allowEmail}
            />
          </Form.Item>

          <Form.Item<OAuthRegisterForm>
            name="password"
            rules={[
              {
                required: true,
                message: '请输入密码，至少6位',
                min: 6,
              },
            ]}
          >
            <Password
              prefix={<LockOutlined className="mr-1" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item<OAuthRegisterForm>
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: '请确认密码',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Password
              prefix={<LockOutlined className="mr-1" />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Flex justify="center" align="center" gap="middle">
            <Button
              color="blue"
              variant="solid"
              className="w-32"
              htmlType="submit"
              loading={loading}
            >
              完成注册
            </Button>
            <Button className="w-32" onClick={() => router.push('/login')}>
              返回登录
            </Button>
          </Flex>
        </Form>
      </Card>
    </div>
  )
}
