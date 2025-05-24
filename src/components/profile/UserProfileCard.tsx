'use client'

import type React from 'react'
import { useState } from 'react'
import {
  Card,
  Avatar,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  App,
  Modal,
  Tag,
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined,
  GithubOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import type {
  DataResponse,
  MessageResponse,
  UserResponse,
  UserUpdate,
  UserUpdatePassword,
} from '@/types'
import ky from 'ky'
import useUserStore from '@/store/userStore'
import { GiteeIcon } from '@/components/icons'

const { Text } = Typography
const { TextArea } = Input

interface UserProfileCardProps {
  user: UserResponse
}

interface PasswordForm {
  old_password: string
  new_password: string
  confirm_password: string
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const { message } = App.useApp()
  const updateUser = useUserStore((state) => state.updateUser)

  const [form] = Form.useForm<UserUpdate>()
  const [passwordForm] = Form.useForm<PasswordForm>()

  const handleSaveProfile = async (values: UserUpdate) => {
    setLoading(true)
    try {
      const response = await ky
        .put('/api/users/me', { json: values })
        .json<DataResponse<UserResponse>>()
      if (response.code === 200) {
        updateUser(response.data)
        setEditing(false)
        message.success('个人信息更新成功')
      } else {
        message.error(response.message)
      }
    } catch {
      message.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (values: PasswordForm) => {
    if (values.new_password !== values.confirm_password) {
      message.error('新密码与确认密码不一致')
      return
    }

    setPasswordLoading(true)
    try {
      const passwordData: UserUpdatePassword = {
        old_password: values.old_password,
        new_password: values.new_password,
      }

      const response = await ky
        .put('/api/users/me/password', { json: passwordData })
        .json<MessageResponse>()
      if (response.code === 200) {
        setPasswordModalVisible(false)
        passwordForm.resetFields()
        message.success('密码修改成功')
      } else {
        message.error(response.message)
      }
    } catch {
      message.error('密码修改失败，请检查原密码是否正确')
    } finally {
      setPasswordLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'red' : 'blue'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <>
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserOutlined />
              <span>个人信息</span>
            </div>
            {!editing && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(true)
                  form.setFieldsValue({
                    avatar: user.avatar,
                    email: user.email,
                    bio: user.bio,
                  })
                }}
              >
                编辑
              </Button>
            )}
          </div>
        }
        className="h-fit"
      >
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar
              size={100}
              src={user.avatar}
              icon={<UserOutlined />}
              className="border-2 border-gray-200"
            />
          </div>

          {editing ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveProfile}
              className="space-y-4"
            >
              <div>
                <Text strong>用户名：</Text>
                <Text>{user.username}</Text>
              </div>

              <Form.Item
                name="avatar"
                label="头像地址"
                rules={[
                  { required: true, message: '请输入头像地址', type: 'url' },
                ]}
              >
                <Input placeholder="请输入头像地址" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item
                name="bio"
                label="个人简介"
                rules={[{ max: 200, message: '个人简介不能超过200个字符' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入个人简介"
                  showCount
                  maxLength={200}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                />
              </Form.Item>

              <Space className="mt-4 w-full justify-end">
                <Button
                  onClick={() => {
                    setEditing(false)
                    form.resetFields()
                  }}
                  icon={<CloseOutlined />}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  保存
                </Button>
              </Space>
            </Form>
          ) : (
            <div className="space-y-3">
              <div>
                <Text strong>用户名：</Text>
                <Text>{user.username}</Text>
              </div>

              <div>
                <Text strong>邮箱：</Text>
                <Text>{user.email}</Text>
              </div>

              <div>
                <Text strong>权限：</Text>
                <Tag color={getRoleColor(user.role)}>
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </Tag>
              </div>

              <div>
                <Text strong>个人简介：</Text>
                <div className="mt-1">
                  <Text className="whitespace-pre-wrap">
                    {user.bio || '暂无个人简介'}
                  </Text>
                </div>
              </div>

              {/* GitHub/Gitee IDs */}
              {(user.github_id || user.gitee_id) && (
                <>
                  <Divider />
                  <div className="space-y-2">
                    <Text strong>关联账号：</Text>
                    {user.github_id && (
                      <div className="flex items-center gap-2">
                        <GithubOutlined />
                        <Text>
                          GitHub: {user.github_name || user.github_id}
                        </Text>
                      </div>
                    )}
                    {user.gitee_id && (
                      <div className="flex items-center gap-2">
                        <GiteeIcon />
                        <Text>Gitee: {user.gitee_name || user.gitee_id}</Text>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Divider />

              {/* Account Info */}
              <div className="space-y-2 text-sm">
                <div>
                  <Text type="secondary">
                    注册时间：{formatDate(user.created_at)}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">
                    最后登录：{formatDate(user.last_login)}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">
                    账号状态：
                    <Tag color={user.in_use ? 'green' : 'red'}>
                      {user.in_use ? '正常' : '已禁用'}
                    </Tag>
                  </Text>
                </div>
              </div>

              <Divider />

              <Button
                block
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
              >
                修改密码
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Password Change Modal */}
      <Modal
        title={<p className="text-xl!">修改密码</p>}
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="mt-6!"
        >
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="确认新密码"
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setPasswordModalVisible(false)
                passwordForm.resetFields()
              }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              确认修改
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default UserProfileCard
