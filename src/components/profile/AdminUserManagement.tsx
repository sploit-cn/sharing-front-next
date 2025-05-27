'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  App,
  Tag,
  Avatar,
  Space,
  Popconfirm,
  Flex,
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  StopOutlined,
  CheckOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import {
  type UserResponse,
  type UserUpdateByAdmin,
  type AdminUpdatePassword,
  type DataResponse,
  type MessageResponse,
  type NotificationUserCreate,
} from '@/types'
import ky from 'ky'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

type AdminUserManagementProps = object

const AdminUserManagement: React.FC<AdminUserManagementProps> = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [notifyModalVisible, setNotifyModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { message } = App.useApp()

  const [editForm] = Form.useForm<UserUpdateByAdmin>()
  const [passwordForm] = Form.useForm<AdminUpdatePassword>()
  const [notifyForm] = Form.useForm<{ content: string }>()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await ky
        .get('/api/users')
        .json<DataResponse<{ items: UserResponse[] }>>()
      if (response.code === 200) {
        setUsers(response.data.items)
      } else {
        message.error(response.message)
      }
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: UserResponse) => {
    setSelectedUser(user)
    editForm.setFieldsValue({
      email: user.email,
      bio: user.bio,
      role: user.role,
      in_use: user.in_use,
    })
    setEditModalVisible(true)
  }

  const handleSaveUser = async (values: UserUpdateByAdmin) => {
    if (!selectedUser) return

    setActionLoading(selectedUser.id)
    try {
      const response = await ky
        .put(`/api/users/${selectedUser.id}`, { json: values })
        .json<DataResponse<UserResponse>>()
      if (response.code === 200) {
        setUsers(
          users.map((u) => (u.id === selectedUser.id ? response.data : u)),
        )
        setEditModalVisible(false)
        message.success('用户信息更新成功')
      } else {
        message.error(response.message)
      }
    } catch {
      message.error('更新用户信息失败')
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangePassword = (user: UserResponse) => {
    setSelectedUser(user)
    passwordForm.resetFields()
    setPasswordModalVisible(true)
  }

  const handleSavePassword = async (values: AdminUpdatePassword) => {
    if (!selectedUser) return

    setActionLoading(selectedUser.id)
    try {
      const res = await ky
        .put(`/api/users/${selectedUser.id}/password`, {
          json: values,
        })
        .json<MessageResponse>()
      if (res.code === 200) {
        setPasswordModalVisible(false)
        message.success('密码修改成功')
      } else {
        message.error(res.message)
      }
    } catch {
      message.error('密码修改失败')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleUserStatus = async (user: UserResponse) => {
    setActionLoading(user.id)
    try {
      const response = await ky
        .put(`/api/users/${user.id}`, {
          json: { in_use: !user.in_use },
        })
        .json<DataResponse<UserResponse>>()
      if (response.code === 200) {
        setUsers(users.map((u) => (u.id === user.id ? response.data : u)))
        message.success(`用户已${!user.in_use ? '启用' : '禁用'}`)
      } else {
        message.error(response.message)
      }
    } catch {
      message.error('操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenNotifyModal = (user: UserResponse) => {
    setSelectedUser(user)
    notifyForm.resetFields()
    setNotifyModalVisible(true)
  }

  const handleSendNotification = async (values: { content: string }) => {
    if (!selectedUser) return
    setActionLoading(selectedUser.id)
    try {
      const requestBody: NotificationUserCreate = {
        user_id: selectedUser.id,
        content: values.content,
      }
      const response = await ky
        .post('/api/notifications/user', { json: requestBody })
        .json<MessageResponse>()

      if (response.code === 200) {
        message.success(`已向 ${selectedUser.username} 发送通知`)
        setNotifyModalVisible(false)
      } else {
        message.error(response.message || '发送通知失败')
      }
    } catch {
      message.error('发送通知失败')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const columns: ColumnsType<UserResponse> = [
    {
      title: '用户',
      key: 'user',
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={user.avatar}
            icon={<UserOutlined />}
            size={40}
            className="cursor-pointer"
            onClick={() => handleOpenNotifyModal(user)}
          />
          <div>
            <Flex gap={8}>
              <div className="font-medium">{user.username}</div>
              <Tag color={user.in_use ? 'green' : 'red'}>
                {user.in_use ? '正常' : '已禁用'}
              </Tag>
            </Flex>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, user) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(user)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            icon={<LockOutlined />}
            onClick={() => handleChangePassword(user)}
          >
            改密
          </Button>
          <Button
            type="text"
            size="small"
            icon={<NotificationOutlined />}
            onClick={() => handleOpenNotifyModal(user)}
          >
            通知
          </Button>
          <Popconfirm
            title={`确认${user.in_use ? '禁用' : '启用'}该用户？`}
            onConfirm={() => handleToggleUserStatus(user)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              loading={
                actionLoading === user.id &&
                !notifyModalVisible &&
                !editModalVisible &&
                !passwordModalVisible
              }
              icon={user.in_use ? <StopOutlined /> : <CheckOutlined />}
              className={user.in_use ? 'text-red-500' : 'text-green-500'}
            >
              {user.in_use ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="用户管理" className="h-full">
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="编辑用户信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveUser}>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="in_use" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading === selectedUser?.id && editModalVisible}
            >
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改用户密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleSavePassword}
        >
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            hasFeedback
            rules={[
              { required: true, message: '请再次输入新密码' },
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
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                actionLoading === selectedUser?.id && passwordModalVisible
              }
            >
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`向 ${selectedUser?.username || '用户'} 发送通知`}
        open={notifyModalVisible}
        onCancel={() => setNotifyModalVisible(false)}
        onOk={() => notifyForm.submit()}
        confirmLoading={
          actionLoading === selectedUser?.id && notifyModalVisible
        }
      >
        <Form
          form={notifyForm}
          layout="vertical"
          onFinish={handleSendNotification}
        >
          <Form.Item
            name="content"
            label="通知内容"
            rules={[{ required: true, message: '请输入通知内容' }]}
          >
            <TextArea
              rows={4}
              placeholder={`输入要发送给 ${selectedUser?.username || '该用户'} 的通知内容`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default AdminUserManagement
