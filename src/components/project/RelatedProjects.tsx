'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, List, Avatar, Button, Typography, Spin, Empty } from 'antd'
import {
  StarOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { ProjectRelatedResponse } from '@/types'
import ky from 'ky'
import Link from 'next/link'
import { App } from 'antd'

const { Text } = Typography

interface RelatedProjectsProps {
  projectId: number
  tags?: Array<{ id: number; name: string }>
  programmingLanguage?: string
  limit?: number
}

const RelatedProjects: React.FC<RelatedProjectsProps> = ({
  projectId,
  tags = [],
  programmingLanguage,
  limit = 6,
}) => {
  const [relatedProjects, setRelatedProjects] = useState<
    ProjectRelatedResponse[]
  >([])
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()

  const fetchRelatedProjects = useCallback(async () => {
    setLoading(true)
    try {
      // 获取项目详情
      const searchParams = new URLSearchParams({
        project_id: projectId.toString(),
      })
      const projectsResponse = await ky
        .get(`/api/projects/related?${searchParams.toString()}`)
        .json<{
          data: ProjectRelatedResponse[]
        }>()
      setRelatedProjects(projectsResponse.data)
    } catch (error) {
      console.error('获取相关项目失败:', error)
      // 如果搜索失败，获取热门项目作为推荐
      try {
        const fallbackResponse = await ky
          .get(
            `/api/projects?${new URLSearchParams({
              page: '1',
              page_size: limit.toString(),
              order_by: 'stars',
              order: 'desc',
            }).toString()}`,
          )
          .json<{
            data: {
              items: ProjectRelatedResponse[]
            }
          }>()

        const fallbackProjects = fallbackResponse.data.items.filter(
          (p) => p.id !== projectId,
        )
        setRelatedProjects(fallbackProjects.slice(0, limit))
      } catch {
        message.error('获取推荐项目失败')
      }
    } finally {
      setLoading(false)
    }
  }, [projectId, tags, programmingLanguage, limit])

  useEffect(() => {
    fetchRelatedProjects()
  }, [projectId, fetchRelatedProjects])

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <StarOutlined />
          <span>相关推荐</span>
        </div>
      }
      className="border-0 shadow-lg"
      // extra={
      //   relatedProjects.length > 0 && (
      //     <Link href="/projects">
      //       <Button type="text" icon={<ArrowRightOutlined />}>
      //         查看更多
      //       </Button>
      //     </Link>
      //   )
      // }
    >
      <Spin spinning={loading}>
        {relatedProjects.length === 0 && !loading ? (
          <Empty
            description="暂无相关项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={relatedProjects}
            renderItem={(project) => (
              <List.Item className="hover:bg-bghover active:bg-bgactive rounded-lg border-0 px-0 transition-colors">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex w-full items-center gap-4 p-3 text-inherit no-underline"
                >
                  <Avatar
                    src={project.avatar}
                    size={48}
                    className="border-2 border-gray-200"
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Text strong className="truncate text-lg">
                        {project.name}
                      </Text>
                      {project.is_approved && (
                        <SafetyCertificateOutlined className="flex-shrink-0 text-green-500!" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>ID: {project.repo_id}</span>
                    </div>
                  </div>

                  <ArrowRightOutlined className="flex-shrink-0 text-gray-400" />
                </Link>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )
}

export default RelatedProjects
