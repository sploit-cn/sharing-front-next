'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, List, Avatar, Typography, Tag, Spin, Empty, App } from 'antd'
import {
  ProjectOutlined,
  StarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import type { DataResponse, ProjectBaseResponse } from '@/types'
import ky from 'ky'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/utils/numbers'
import { GiteeIcon, LawIcon } from '../icons'
import IconText from '../IconText'
const { Text } = Typography

interface UserProjectsCardProps {
  userId: number
}

const UserProjectsCard: React.FC<UserProjectsCardProps> = ({ userId }) => {
  const [projects, setProjects] = useState<ProjectBaseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const { message } = App.useApp()
  const router = useRouter()

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const response = await ky
          .get('/api/projects/my')
          .json<DataResponse<ProjectBaseResponse[]>>()
        if (response.code === 200) {
          setProjects(response.data)
        } else {
          message.error(response.message)
        }
      } catch {
        message.error('获取项目列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProjects()
  }, [userId, message])

  const getStatusIcon = (isApproved: boolean) => {
    if (isApproved) {
      return <CheckCircleOutlined className="text-green-500" />
    }
    return <ClockCircleOutlined className="text-orange-500" />
  }

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? '已审核' : '待审核'
  }

  const getStatusColor = (isApproved: boolean) => {
    return isApproved ? 'green' : 'orange'
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ProjectOutlined />
          <span>我的项目 ({projects.length})</span>
        </div>
      }
      className="h-fit"
    >
      <Spin spinning={loading}>
        {projects.length === 0 ? (
          <Empty
            description="暂无提交的项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={projects}
            renderItem={(project) => (
              <List.Item
                className="hover:bg-bghover cursor-pointer transition-colors"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={project.avatar}
                      icon={<ProjectOutlined />}
                      size={48}
                    />
                  }
                  title={
                    <div className="flex items-center justify-between">
                      <Text strong className="text-base">
                        {project.name}
                      </Text>
                      <Tag
                        color={getStatusColor(project.is_approved)}
                        icon={getStatusIcon(project.is_approved)}
                      >
                        {getStatusText(project.is_approved)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <Text ellipsis className="text-sm text-gray-600">
                        {project.brief}
                      </Text>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {/* <div className="flex items-center gap-1">
                          <StarOutlined />
                          <span>{formatNumber(project.stars)}</span>
                        </div> */}
                        {/* <div className="flex items-center gap-1">
                          <Rate
                            disabled
                            value={project.average_rating / 2}
                            allowHalf
                            className="text-xs"
                          />
                          <span>({project.rating_count})</span>
                        </div> */}
                        {/* <div className="flex items-center gap-1">
                          <StarOutlined />
                          <span>{formatNumber(project.view_count)}</span>
                        </div> */}
                        {/* <div className="flex items-center gap-1">
                          <EyeOutlined />
                          <span>{project.view_count}</span>
                        </div> */}
                        <IconText
                          icon={
                            project.platform == 'GitHub'
                              ? GithubOutlined
                              : GiteeIcon
                          }
                          key="list-vertical-gitee"
                          text=""
                          size={4}
                        />
                        <IconText
                          icon={StarOutlined}
                          text={formatNumber(project.stars)}
                          key="list-vertical-stars"
                          size={4}
                        />
                        <IconText
                          icon={EyeOutlined}
                          text={formatNumber(project.view_count)}
                          key="list-vertical-views"
                          size={4}
                        />
                        <IconText
                          icon={LawIcon}
                          text={project.license || 'Unknown'}
                          key="list-vertical-license"
                          size={4}
                        />
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

export default UserProjectsCard
