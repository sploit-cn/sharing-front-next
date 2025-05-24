'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Card,
  List,
  Typography,
  Button,
  Spin,
  Empty,
  App,
  Modal,
  Tag,
  Badge,
} from 'antd'
import {
  BellOutlined,
  EyeOutlined,
  DeleteOutlined,
  LinkOutlined,
  MessageOutlined,
  ProjectOutlined,
} from '@ant-design/icons'
import type {
  DataResponse,
  MessageResponse,
  NotificationResponse,
} from '@/types'
import ky from 'ky'
import { useRouter } from 'next/navigation'

const { Text, Paragraph } = Typography

interface UserNotificationsCardProps {
  userId: number
}

const UserNotificationsCard: React.FC<UserNotificationsCardProps> = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { message } = App.useApp()
  const router = useRouter()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await ky
          .get('/api/notifications')
          .json<DataResponse<NotificationResponse[]>>()
        if (response.code === 200) {
          setNotifications(response.data)
        } else {
          message.error(response.message)
        }
      } catch {
        message.error('获取通知失败')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [message])

  const handleViewDetails = async (notification: NotificationResponse) => {
    setSelectedNotification(notification)
    setDetailModalVisible(true)

    // Mark as read if not already read
    if (!notification.is_read) {
      try {
        const res = await ky
          .put(`/api/notifications/${notification.id}`)
          .json<MessageResponse>()
        if (res.code === 200) {
          setNotifications(
            notifications.map((n) =>
              n.id === notification.id ? { ...n, is_read: true } : n,
            ),
          )
        } else {
          message.error(res.message)
        }
      } catch {
        // Silently handle read status update errors
      }
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    setActionLoading(notificationId)
    try {
      const res = await ky
        .delete(`/api/notifications/${notificationId}`)
        .json<MessageResponse>()
      if (res.code === 200) {
        setNotifications(notifications.filter((n) => n.id !== notificationId))
        message.success('通知已删除')
      } else {
        message.error(res.message)
      }
    } catch {
      message.error('删除通知失败')
    } finally {
      setActionLoading(null)
    }
  }

  const handleNavigateToProject = (projectId: number) => {
    setDetailModalVisible(false)
    router.push(`/projects/${projectId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <>
      <Card
        title={
          <div className="flex items-center gap-2">
            <BellOutlined />
            <span>通知</span>
            {unreadCount > 0 && <Badge count={unreadCount} />}
          </div>
        }
        className="h-fit"
      >
        <Spin spinning={loading}>
          {notifications.length === 0 ? (
            <Empty
              description="暂无通知"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={notifications}
              renderItem={(notification) => (
                <List.Item
                  // className={`transition-colors ${!notification.is_read ? 'bg-bgactive' : ''}`}
                  actions={[
                    <div key="unread">
                      {notification.is_read ? (
                        <Tag color="green">已读</Tag>
                      ) : (
                        <Tag color="red">未读</Tag>
                      )}
                    </div>,
                    <Button
                      key="view"
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(notification)}
                    >
                      查看详情
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={actionLoading === notification.id}
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <Text strong={!notification.is_read}>
                          {notification.content}
                        </Text>
                        {/* {!notification.is_read && <Tag color="red">未读</Tag>} */}
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <Text type="secondary" className="text-xs">
                          {formatDate(notification.created_at)}
                        </Text>
                        {(notification.related_project ||
                          notification.related_comment) && (
                          <div className="flex items-center gap-2 text-xs">
                            {notification.related_project && (
                              <Tag icon={<ProjectOutlined />} color="blue">
                                相关项目
                              </Tag>
                            )}
                            {notification.related_comment && (
                              <Tag icon={<MessageOutlined />} color="orange">
                                相关评论
                              </Tag>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>

      {/* Notification Detail Modal */}
      <Modal
        title={<p className="mb-4 text-xl!">通知详情</p>}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedNotification && (
          <div className="space-y-2">
            <div>
              <Paragraph className="text-base!">
                {selectedNotification.content}
              </Paragraph>
            </div>

            <div className="mb-4">
              <Text strong>时间：</Text>
              <Text className="ml-2">
                {new Date(selectedNotification.created_at).toLocaleString(
                  'zh-CN',
                )}
              </Text>
            </div>

            {selectedNotification.related_project && (
              <Card size="small">
                <div className="mb-2 flex items-center gap-2">
                  <ProjectOutlined className="" />
                  <Text strong className="text-lg!">
                    相关项目
                  </Text>
                </div>
                <div className="space-y-2">
                  <div>
                    <Text strong>项目名称：</Text>
                    <Text>{selectedNotification.related_project.name}</Text>
                  </div>
                  <div>
                    <Text strong>仓库ID：</Text>
                    <Text code>
                      {selectedNotification.related_project.repo_id}
                    </Text>
                  </div>
                  <div>
                    <Text strong>审核状态：</Text>
                    <Tag
                      color={
                        selectedNotification.related_project.is_approved
                          ? 'green'
                          : 'orange'
                      }
                    >
                      {selectedNotification.related_project.is_approved
                        ? '已审核'
                        : '待审核'}
                    </Tag>
                  </div>
                  <Button
                    icon={<LinkOutlined />}
                    onClick={() =>
                      handleNavigateToProject(
                        selectedNotification.related_project!.id,
                      )
                    }
                  >
                    查看项目
                  </Button>
                </div>
              </Card>
            )}

            {selectedNotification.related_comment && (
              <Card size="small" className="mt-4!">
                <div className="mb-2 flex items-center gap-2">
                  <MessageOutlined className="" />
                  <Text strong className="text-lg!">
                    相关评论
                  </Text>
                </div>
                <div className="space-y-2">
                  <div>
                    <Text strong>评论ID：</Text>
                    <Text code>{selectedNotification.related_comment.id}</Text>
                  </div>
                  <div>
                    <Text strong>评论内容：</Text>
                    <Paragraph className="mt-1 whitespace-pre-wrap">
                      {selectedNotification.related_comment.content}
                    </Paragraph>
                  </div>
                  <div>
                    <Text strong>评论时间：</Text>
                    <Text>
                      {new Date(
                        selectedNotification.related_comment.created_at,
                      ).toLocaleString('zh-CN')}
                    </Text>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default UserNotificationsCard
