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
} from '@ant-design/icons'
import {
  type UserResponse,
  type UserUpdateByAdmin,
  type AdminUpdatePassword,
  type DataResponse,
  MessageResponse,
} from '@/types'
import ky from 'ky'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

type AdminUserManagementProps = object

const AdminUserManagement: React.FC<AdminUserManagementProps> = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { message } = App.useApp()

  const [editForm] = Form.useForm<UserUpdateByAdmin>()
  const [passwordForm] = Form.useForm<AdminUpdatePassword>()

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const columns: ColumnsType<UserResponse> = [
    {
      title: '用户',
      key: 'user',
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} icon={<UserOutlined />} size={40} />
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
    // {
    //   title: '状态',
    //   dataIndex: 'in_use',
    //   key: 'in_use',
    //   render: (inUse: boolean) => (
    //     <Tag color={inUse ? 'green' : 'red'}>{inUse ? '正常' : '已禁用'}</Tag>
    //   ),
    // },
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
          <Popconfirm
            title={`确认${user.in_use ? '禁用' : '启用'}该用户？`}
            onConfirm={() => handleToggleUserStatus(user)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              loading={actionLoading === user.id}
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
    <>
      <Card
        title={
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>用户管理</span>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          className="pr-8"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个用户`,
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={<p className="text-xl!">编辑用户信息</p>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveUser}
          className="mt-8!"
        >
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
            <Input.TextArea
              rows={3}
              placeholder="请输入个人简介"
              showCount
              maxLength={200}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item name="in_use" label="账号状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditModalVisible(false)}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading === selectedUser?.id}
            >
              保存
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={`修改用户密码 - ${selectedUser?.username}`}
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleSavePassword}
          className="mt-4"
        >
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
            <Button onClick={() => setPasswordModalVisible(false)}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading === selectedUser?.id}
            >
              确认修改
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default AdminUserManagement
