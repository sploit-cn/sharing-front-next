'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Rate,
  Button,
  Typography,
  Spin,
  Progress,
  Avatar,
  List,
  App,
  Collapse,
  Flex,
} from 'antd'
import { StarOutlined, StarFilled, UserOutlined } from '@ant-design/icons'
import ky from 'ky'
import useUserStore from '@/store/userStore'
import staticMethods from 'antd/es/message'

const { Title, Text } = Typography

interface ProjectRatingProps {
  projectId: number
  averageRating: number
  ratingCount: number
  currentUserId?: number
}

interface UserRating {
  id: number
  score: number
  user: {
    id: number
    username: string
    avatar?: string
  }
  updated_at: string
  is_used: boolean
}

interface RatingDistribution {
  [key: number]: number
}

const ProjectRating: React.FC<ProjectRatingProps> = ({
  projectId,
  averageRating: initialAverageRating,
  ratingCount: initialRatingCount,
}) => {
  const [userRating, setUserRating] = useState<number>(0)
  const [hasRated, setHasRated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [averageRating, setAverageRating] = useState(initialAverageRating)
  const [ratingCount, setRatingCount] = useState(initialRatingCount)
  const [recentRatings, setRecentRatings] = useState<UserRating[]>([])
  const [distribution, setDistribution] = useState<RatingDistribution>({})
  const user = useUserStore((state) => state.user)
  const currentUserId = user?.id
  const { message } = App.useApp()

  const checkUserRating = useCallback(async () => {
    try {
      const response = await ky
        .get(`/api/projects/${projectId}/my-rating`)
        .json<{
          data: { score: number } | null
        }>()

      if (response.data) {
        setUserRating(response.data.score)
        setHasRated(true)
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status !== 404
      ) {
        console.error('获取用户评分失败:', error)
      }
    }
  }, [projectId])

  const fetchRecentRatings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ky.get(`/api/projects/${projectId}/ratings`).json<{
        data: {
          ratings: UserRating[]
          distribution: RatingDistribution
        }
      }>()

      setRecentRatings(response.data.ratings)
      setDistribution(response.data.distribution)
    } catch {
      console.error('获取评分列表失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (currentUserId) {
      checkUserRating()
    }
    fetchRecentRatings()
  }, [projectId, currentUserId, checkUserRating, fetchRecentRatings])

  const handleRatingSubmit = async () => {
    if (!currentUserId) {
      message.warning('请先登录')
      return
    }

    if (userRating === 0) {
      message.warning('请选择评分')
      return
    }

    setSubmitting(true)
    try {
      const response = await ky
        .post(`/api/projects/${projectId}/rating`, {
          json: { score: userRating },
        })
        .json<{
          data: {
            average_rating: number
            rating_count: number
          }
        }>()

      setHasRated(true)
      setAverageRating(response.data.average_rating)
      setRatingCount(response.data.rating_count)
      message.success('评分成功')

      // 重新获取评分列表
      fetchRecentRatings()
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
        message.warning('您已经评分过了')
        setHasRated(true)
      } else {
        message.error('评分失败')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingUpdate = async () => {
    if (userRating === 0) {
      message.warning('请选择评分')
      return
    }

    setSubmitting(true)
    try {
      const response = await ky
        .put(`/api/projects/${projectId}/rating`, {
          json: { score: userRating },
        })
        .json<{
          data: {
            average_rating: number
            rating_count: number
          }
        }>()

      setAverageRating(response.data.average_rating)
      setRatingCount(response.data.rating_count)
      message.success('评分更新成功')
      fetchRecentRatings()
    } catch {
      message.error('更新评分失败')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  const getRatingText = (score: number) => {
    if (score >= 9) return '优秀'
    if (score >= 7) return '良好'
    if (score >= 5) return '一般'
    if (score >= 3) return '较差'
    return '很差'
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <StarOutlined />
          <span>项目评分</span>
        </div>
      }
      className="border-0 shadow-lg"
    >
      {/* 总体评分展示 */}
      <div className="mb-6 text-center">
        <div className="mb-4">
          <Title level={2} className="!mb-2">
            {averageRating.toFixed(1)}
          </Title>
          <Rate
            disabled
            value={averageRating / 2}
            allowHalf
            className="text-2xl"
          />
          <div className="mt-2">
            <Text type="secondary">
              基于 {ratingCount} 个评分 · {getRatingText(averageRating)}
            </Text>
          </div>
        </div>
      </div>

      {/* 评分分布 */}
      {Object.keys(distribution).length > 0 && (
        <div className="">
          <Collapse
            items={[
              {
                label: '评分分布',
                children: (
                  <div className="space-y-2">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => {
                      const count = distribution[score] || 0
                      const percentage =
                        ratingCount > 0 ? (count / ratingCount) * 100 : 0

                      return (
                        <div key={score} className="flex items-center gap-2">
                          <Text className="w-6 text-right">{score}</Text>
                          <StarFilled className="text-yellow-400" />
                          <Progress
                            percent={percentage}
                            showInfo={false}
                            strokeColor="#faad14"
                            className="flex-1"
                          />
                          <Text type="secondary" className="w-8 text-right">
                            {count}
                          </Text>
                        </div>
                      )
                    })}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* 用户评分区域 */}
      {currentUserId && (
        <div className="mb-6 pt-4">
          <Title level={5} className="mb-3">
            {hasRated ? '您的评分' : '为此项目评分'}
          </Title>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex gap-4">
              <Rate
                value={userRating / 2}
                onChange={(value) => setUserRating(value * 2)}
                allowHalf
                disabled={submitting}
              />
              <Text>
                {userRating > 0 ? `${userRating.toFixed(1)} 分` : '请评分'}
              </Text>
            </div>
            <Button
              loading={submitting}
              onClick={hasRated ? handleRatingUpdate : handleRatingSubmit}
              disabled={userRating === 0}
              autoInsertSpace={false}
            >
              {hasRated ? '更新' : '评分'}
            </Button>
          </div>
        </div>
      )}

      {/* 最近评分 */}
      <Spin spinning={loading}>
        {recentRatings.length > 0 && (
          <div>
            <Title level={5} className="mb-3">
              最近评分
            </Title>
            <List
              dataSource={recentRatings.slice(0, 5)}
              renderItem={(rating) => (
                <List.Item className="border-0 px-0">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={rating.user.avatar}
                        icon={<UserOutlined />}
                        size={32}
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {rating.user.username}
                        </div>
                        <Rate
                          disabled
                          value={rating.score / 2}
                          allowHalf
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {rating.score.toFixed(1)}
                      </div>
                      <Text type="secondary" className="text-xs">
                        {formatTime(rating.updated_at)}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Spin>
    </Card>
  )
}

export default ProjectRating
