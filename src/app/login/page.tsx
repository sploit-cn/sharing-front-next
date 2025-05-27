'use client'
import useUserStore from '@/store/userStore'
import { DataResponse, LoginResponse } from '@/types'
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { App, Button, Card, Flex, Form, Input, Divider } from 'antd'
import Password from 'antd/es/input/Password'
import ky from 'ky'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GiteeIcon } from '@/components/icons'
type LoginForm = {
  username: string
  password: string
  confirmPassword?: string
  email: string | null
}
export default function LoginPage() {
  const [form] = Form.useForm<LoginForm>()
  const [isRegister, setIsRegister] = useState(false)
  const { message } = App.useApp()
  const login = useUserStore((state) => state.login)
  const router = useRouter()

  async function userLogin(value: LoginForm) {
    const res = await ky
      .post<DataResponse<LoginResponse>>('/api/auth/login', {
        json: value,
      })
      .json()
    if (res.code === 200) {
      message.success('登录成功')
      login(res.data)
      router.push('/')
    } else {
      message.error(res.message)
    }
  }
  async function userRegister(value: LoginForm) {
    const res = await ky
      .post<DataResponse<LoginResponse>>('/api/auth/register', {
        json: value,
      })
      .json()
    if (res.code === 200) {
      message.success('注册成功')
      login(res.data)
      router.push('/')
    } else {
      message.error(res.message)
    }
  }

  async function handleOAuthLogin(platform: 'github' | 'gitee') {
    try {
      const res = await ky
        .get<DataResponse<string>>(`/api/auth/${platform}`)
        .json()
      if (res.code === 200) {
        window.location.href = res.data
      } else {
        message.error(res.message)
      }
    } catch {
      message.error(`${platform === 'github' ? 'GitHub' : 'Gitee'} 登录失败`)
    }
  }
  return (
    <Card hoverable>
      <Flex vertical justify="center" align="center">
        <p className="text-center text-2xl">Opensource Sharing</p>
        <p className="m-4 text-center text-xl">
          {isRegister ? '注册' : '登录'}
        </p>
      </Flex>
      <Form
        layout="horizontal"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        form={form}
        onFinish={(value) =>
          isRegister ? userRegister(value) : userLogin(value)
        }
        onFinishFailed={() => {
          message.error('无效字段，请检查输入内容')
        }}
        autoComplete="off"
      >
        <Form.Item<LoginForm>
          name="username"
          label="用户名"
          rules={
            isRegister
              ? [
                  {
                    required: true,
                    message: '请输入合法的用户名',
                    min: 3,
                    max: 20,
                    pattern: /^[a-zA-Z0-9\-_]+$/,
                    type: 'string',
                  },
                ]
              : []
          }
        >
          <Input
            prefix={<UserOutlined className="mr-1" />}
            placeholder="用户名"
          />
        </Form.Item>
        {isRegister && (
          <Form.Item<LoginForm>
            name="email"
            label="邮箱"
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
            />
          </Form.Item>
        )}
        <Form.Item<LoginForm>
          name="password"
          label="密　码"
          rules={
            isRegister
              ? [{ required: true, message: '请输入密码，至少6位', min: 6 }]
              : []
          }
        >
          <Password
            prefix={<LockOutlined className="mr-1" />}
            placeholder="密码"
          />
        </Form.Item>
        {isRegister && (
          <Form.Item<LoginForm>
            name="confirmPassword"
            label="确认密码"
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
        )}
        <Flex justify="center" align="center" gap="middle">
          <Button
            color="blue"
            variant="solid"
            className="w-28"
            onClick={() => {
              if (isRegister) {
                setIsRegister(false)
              } else {
                form.submit()
              }
            }}
          >
            登录
          </Button>
          <Button
            color="cyan"
            variant="solid"
            className="w-28"
            onClick={() => {
              if (!isRegister) {
                setIsRegister(true)
              } else {
                form.submit()
              }
            }}
          >
            注册
          </Button>
        </Flex>

        <Divider>或</Divider>

        <Flex justify="center" align="center" gap="middle">
          <Button
            icon={<GithubOutlined />}
            className="w-40"
            onClick={() => handleOAuthLogin('github')}
          >
            GitHub 登录
          </Button>
          <Button
            icon={<GiteeIcon />}
            className="w-40"
            onClick={() => handleOAuthLogin('gitee')}
          >
            Gitee 登录
          </Button>
        </Flex>
      </Form>
    </Card>
  )
}
