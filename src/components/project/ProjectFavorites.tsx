'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  List,
  Avatar,
  Button,
  Typography,
  message,
  Spin,
  Tooltip,
} from 'antd'
import { HeartOutlined, HeartFilled, UserOutlined } from '@ant-design/icons'
import { FavoriteUserResponse } from '@/types'
import ky from 'ky'
import useUserStore from '@/store/userStore'

const { Text } = Typography

interface ProjectFavoritesProps {
  projectId: number
  initialFavorites?: FavoriteUserResponse[]
}

const ProjectFavorites: React.FC<ProjectFavoritesProps> = ({
  projectId,
  initialFavorites = [],
}) => {
  const [favorites, setFavorites] =
    useState<FavoriteUserResponse[]>(initialFavorites)
  const [loading, setLoading] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const user = useUserStore((state) => state.user)
  let currentUserId: number | null = null
  if (user) {
    currentUserId = user.id
  }

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ky
        .get(`/api/projects/${projectId}/favorites`)
        .json<{
          data: FavoriteUserResponse[]
        }>()
      setFavorites(response.data)
    } catch {
      message.error('获取收藏列表失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 计算当前用户是否已收藏（基于 favorites 数组）
  useEffect(() => {
    if (currentUserId && favorites.length > 0) {
      const userFavorited = favorites.some(
        (fav) => fav.user.id === currentUserId,
      )
      setIsFavorited(userFavorited)
    } else {
      setIsFavorited(false)
    }
  }, [favorites, currentUserId])

  // 组件初始化时获取数据
  useEffect(() => {
    if (initialFavorites.length === 0) {
      fetchFavorites()
    }
  }, [projectId, fetchFavorites, initialFavorites.length]) // 只依赖 projectId，避免 fetchFavorites 依赖循环

  const handleToggleFavorite = async () => {
    if (!currentUserId) {
      message.warning('请先登录')
      return
    }

    setFavoriting(true)
    try {
      if (isFavorited) {
        // 取消收藏
        await ky.delete(`/api/projects/${projectId}/favorite`)
        setFavorites((prev) =>
          prev.filter((fav) => fav.user.id !== currentUserId),
        )
        message.success('已取消收藏')
      } else {
        // 添加收藏
        await ky.post(`/api/projects/${projectId}/favorite`)
        // 重新获取收藏列表以获取最新数据
        await fetchFavorites()
        message.success('收藏成功')
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 400
      ) {
        message.warning('请勿重复收藏')
      } else {
        message.error(isFavorited ? '取消收藏失败' : '收藏失败')
      }
    } finally {
      setFavoriting(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartOutlined />
            <span>收藏 ({favorites.length})</span>
          </div>
          {currentUserId && (
            <Button
              type={isFavorited ? 'default' : 'primary'}
              icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
              loading={favoriting}
              onClick={handleToggleFavorite}
            >
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
          )}
        </div>
      }
      className="border-0 shadow-lg"
    >
      <Spin spinning={loading}>
        {favorites.length === 0 ? (
          <div className="py-8 text-center">
            <Text type="secondary">暂无收藏，快来成为第一个收藏者吧！</Text>
          </div>
        ) : (
          <List
            dataSource={favorites}
            renderItem={(favorite) => (
              <List.Item className="border-0 px-0">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={favorite.user.avatar}
                      icon={<UserOutlined />}
                      size={40}
                    />
                    <div>
                      <div className="font-medium">
                        {favorite.user.username}
                      </div>
                      {favorite.user.bio && (
                        <Text type="secondary" className="text-sm">
                          {favorite.user.bio}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Tooltip title={`收藏于 ${formatTime(favorite.created_at)}`}>
                    <Text type="secondary" className="text-xs">
                      {formatTime(favorite.created_at)}
                    </Text>
                  </Tooltip>
                </div>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )
}

export default ProjectFavorites
