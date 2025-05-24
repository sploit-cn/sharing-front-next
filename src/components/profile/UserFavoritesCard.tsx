'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, List, Avatar, Typography, Spin, Empty, App, Button } from 'antd'
import {
  HeartOutlined,
  ProjectOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type {
  ProjectBaseResponse,
  MessageResponse,
  DataResponse,
} from '@/types'
import ky from 'ky'
import { useRouter } from 'next/navigation'

const { Text } = Typography

interface UserFavoritesCardProps {
  userId: number
}

interface FavoriteProject {
  id: number
  created_at: string
  project: ProjectBaseResponse
}

const UserFavoritesCard: React.FC<UserFavoritesCardProps> = ({ userId }) => {
  const [favorites, setFavorites] = useState<FavoriteProject[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const { message } = App.useApp()
  const router = useRouter()

  useEffect(() => {
    const fetchUserFavorites = async () => {
      try {
        const response = await ky
          .get('/api/favorites')
          .json<DataResponse<FavoriteProject[]>>()
        if (response.code === 200) {
          setFavorites(response.data)
        } else {
          message.error(response.message)
        }
      } catch {
        message.error('获取收藏列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUserFavorites()
  }, [userId, message])

  const handleRemoveFavorite = async (
    projectId: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()
    setRemovingId(projectId)
    try {
      const res = await ky
        .delete(`/api/projects/${projectId}/favorite`)
        .json<MessageResponse>()
      if (res.code === 200) {
        setFavorites(favorites.filter((fav) => fav.project.id !== projectId))
        message.success('已取消收藏')
      } else {
        message.error(res.message)
      }
    } catch {
      message.error('取消收藏失败')
    } finally {
      setRemovingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <HeartOutlined />
          <span>我的收藏 ({favorites.length})</span>
        </div>
      }
      className="h-fit"
    >
      <Spin spinning={loading}>
        {favorites.length === 0 ? (
          <Empty
            description="暂无收藏的项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={favorites}
            renderItem={(favorite) => (
              <List.Item
                className="hover:bg-bghover cursor-pointer transition-colors"
                onClick={() => router.push(`/projects/${favorite.project.id}`)}
                actions={[
                  <Button
                    key="remove"
                    color="pink"
                    variant="outlined"
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={removingId === favorite.project.id}
                    onClick={(e) =>
                      handleRemoveFavorite(favorite.project.id, e)
                    }
                  ></Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={favorite.project.avatar}
                      icon={<ProjectOutlined />}
                      size={48}
                    />
                  }
                  title={
                    <Text strong className="text-base">
                      {favorite.project.name}
                    </Text>
                  }
                  description={
                    <div className="space-y-2">
                      <Text
                        ellipsis={{ rows: 1 }}
                        className="text-sm text-gray-600"
                      >
                        {favorite.project.brief}
                      </Text>
                      <div className="flex items-center justify-between">
                        <Text type="secondary" className="text-xs!">
                          收藏于 {formatDate(favorite.created_at)}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )
}

export default UserFavoritesCard
