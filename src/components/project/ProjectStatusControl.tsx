'use client'

import React, { useState } from 'react'
import { Button, Space, App, Tag, Switch, Typography } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  StarOutlined,
} from '@ant-design/icons'
import useUserStore from '@/store/userStore'
import ky from 'ky'
import type { ProjectFullResponse, DataResponse } from '@/types'

const { Text } = Typography

interface ProjectStatusControlProps {
  project: ProjectFullResponse
}

const ProjectStatusControl: React.FC<ProjectStatusControlProps> = ({
  project: initialProject,
}) => {
  const user = useUserStore((state) => state.user)
  const { message, modal } = App.useApp()
  const [project, setProject] = useState<ProjectFullResponse>(initialProject)
  const [loadingApprove, setLoadingApprove] = useState(false)
  const [loadingReject, setLoadingReject] = useState(false)
  const [loadingFeature, setLoadingFeature] = useState(false)

  const handleProjectUpdate = (updatedProject: ProjectFullResponse) => {
    setProject(updatedProject)
  }

  if (!user || user.role !== 'admin') {
    return (
      <Space direction="vertical" size="middle">
        <Tag
          icon={
            project.is_approved ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={project.is_approved ? 'green' : 'orange'}
          style={{ fontSize: '14px', padding: '4px 8px' }}
        >
          {project.is_approved ? '已审核' : '未审核'}
        </Tag>
        <Tag
          icon={<RocketOutlined />}
          color={project.is_featured ? 'gold' : 'default'}
          style={{ fontSize: '14px', padding: '4px 8px' }}
        >
          {project.is_featured ? '已精选' : '未精选'}
        </Tag>
      </Space>
    )
  }

  const handleApprove = async () => {
    setLoadingApprove(true)
    try {
      const response = await ky
        .put(`/api/projects/${project.id}/approve`)
        .json<DataResponse<ProjectFullResponse>>()
      if (response.code === 200) {
        message.success('项目已通过审核')
        handleProjectUpdate(response.data)
      } else {
        message.error(response.message || '审核操作失败')
      }
    } catch {
      message.error('审核操作失败')
    } finally {
      setLoadingApprove(false)
    }
  }

  const handleReject = async () => {
    modal.confirm({
      title: '确定要拒绝此项目吗？',
      content: '拒绝后项目将不会公开显示。',
      okText: '确认拒绝',
      cancelText: '取消',
      onOk: async () => {
        setLoadingReject(true)
        try {
          const response = await ky
            .put(`/api/projects/${project.id}/reject`)
            .json<DataResponse<ProjectFullResponse>>()
          if (response.code === 200) {
            message.success('项目已拒绝审核')
            handleProjectUpdate(response.data)
          } else {
            message.error(response.message || '操作失败')
          }
        } catch {
          message.error('操作失败')
        } finally {
          setLoadingReject(false)
        }
      },
    })
  }

  const handleToggleFeature = async (featured: boolean) => {
    setLoadingFeature(true)
    const action = featured ? 'feature' : 'unfeature'
    try {
      const response = await ky
        .put(`/api/projects/${project.id}/${action}`)
        .json<DataResponse<ProjectFullResponse>>()
      if (response.code === 200) {
        message.success(featured ? '项目已设为精选' : '项目已取消精选')
        handleProjectUpdate(response.data)
      } else {
        message.error(response.message || '操作失败')
      }
    } catch {
      message.error('操作失败')
    } finally {
      setLoadingFeature(false)
    }
  }

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Space align="center">
        <Text strong>审核状态:</Text>
        <Tag
          icon={
            project.is_approved ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={
            project.is_approved === null
              ? 'orange'
              : project.is_approved
                ? 'green'
                : 'red'
          }
          style={{ fontSize: '14px', padding: '4px 8px' }}
        >
          {project.is_approved === null
            ? '待审核'
            : project.is_approved
              ? '已审核'
              : '已拒绝'}
        </Tag>
        {project.is_approved === null && (
          <Button
            color="green"
            variant="outlined"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            loading={loadingApprove}
            size="small"
          >
            通过
          </Button>
        )}
        {project.is_approved === null && (
          <Button
            color="red"
            variant="outlined"
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            loading={loadingReject}
            size="small"
          >
            拒绝
          </Button>
        )}
        {project.is_approved === false && (
          <Button
            color="green"
            variant="outlined"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            loading={loadingApprove}
            size="small"
          >
            重新审核
          </Button>
        )}
      </Space>

      <Space align="center" className="w-full">
        <Text strong>精选状态:</Text>
        <Switch
          checkedChildren={
            <>
              <StarOutlined /> 精选
            </>
          }
          unCheckedChildren={
            <>
              <StarOutlined /> 未精选
            </>
          }
          checked={project.is_featured}
          onChange={handleToggleFeature}
          loading={loadingFeature}
        />
      </Space>
    </Space>
  )
}

export default ProjectStatusControl
