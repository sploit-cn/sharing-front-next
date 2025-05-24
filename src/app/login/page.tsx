'use client'
import useUserStore from '@/store/userStore'
import { DataResponse, LoginResponse } from '@/types'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Flex, Form, Input } from 'antd'
import Password from 'antd/es/input/Password'
import ky from 'ky'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
type LoginForm = {
  username: string
  password: string
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
          rules={[{ required: true, message: '请输入密码，至少6位', min: 6 }]}
        >
          <Password
            prefix={<LockOutlined className="mr-1" />}
            placeholder="密码"
          />
        </Form.Item>
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
      </Form>
    </Card>
  )
}
