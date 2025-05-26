'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  App,
  Tag as AntTag,
  Space,
  Spin,
  Empty,
  Popconfirm,
} from 'antd'
import {
  TagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import ky from 'ky'
import type {
  TagResponse,
  TagCreate,
  TagUpdate,
  DataResponse,
  MessageResponse,
} from '@/types'

const TagManagementCard: React.FC = () => {
  const [tags, setTags] = useState<TagResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const fetchTags = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ky
        .get('/api/tags')
        .json<DataResponse<TagResponse[]>>()
      if (response.code === 200) {
        setTags(response.data)
      } else {
        message.error(response.message || '获取标签列表失败')
      }
    } catch {
      message.error('获取标签列表失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleAddTag = () => {
    setEditingTag(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditTag = (tag: TagResponse) => {
    setEditingTag(tag)
    form.setFieldsValue(tag)
    setIsModalVisible(true)
  }

  const handleDeleteTag = async (tagId: number) => {
    try {
      const response = await ky
        .delete(`/api/tags/${tagId}`)
        .json<MessageResponse>()
      if (response.code === 200) {
        message.success('标签删除成功')
        fetchTags()
      } else {
        message.error(response.message || '删除标签失败')
      }
    } catch {
      message.error('删除标签失败')
    }
  }

  const handleModalOk = async () => {
    try {
      setIsSubmitting(true)
      const values = await form.validateFields()
      const requestBody: TagCreate | TagUpdate = values

      let response
      if (editingTag) {
        response = await ky
          .put(`/api/tags/${editingTag.id}`, { json: requestBody })
          .json<DataResponse<TagResponse>>()
      } else {
        response = await ky
          .post('/api/tags', { json: requestBody })
          .json<DataResponse<TagResponse>>()
      }

      if (response.code === 200) {
        message.success(editingTag ? '标签更新成功' : '标签创建成功')
        setIsModalVisible(false)
        fetchTags()
      } else {
        message.error(
          response.message || (editingTag ? '更新标签失败' : '创建标签失败'),
        )
      }
    } catch (errorInfo) {
      console.error('Validation Failed:', errorInfo)
      message.error('表单校验失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TagOutlined />
          <span>标签管理</span>
        </div>
      }
      extra={
        <Button icon={<PlusOutlined />} type="primary" onClick={handleAddTag}>
          添加标签
        </Button>
      }
      className="h-fit"
    >
      <Spin spinning={loading}>
        {tags.length === 0 && !loading ? (
          <Empty description="暂无标签" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={tags}
            renderItem={(tag) => (
              <List.Item
                key={tag.id}
                actions={[
                  <Button
                    key={`edit-${tag.id}`}
                    icon={<EditOutlined />}
                    onClick={() => handleEditTag(tag)}
                    type="text"
                    size="small"
                  />,
                  <Popconfirm
                    key={`delete-${tag.id}`}
                    title={`确定删除标签 "${tag.name}" 吗？`}
                    onConfirm={() => handleDeleteTag(tag.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      type="text"
                      danger
                      size="small"
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={<AntTag color="blue">{tag.name}</AntTag>}
                  description={
                    <Space direction="vertical" size="small">
                      <div>
                        <strong>分类:</strong> {tag.category}
                      </div>
                      {tag.description && (
                        <div>
                          <strong>描述:</strong> {tag.description}
                        </div>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>

      <Modal
        title={editingTag ? '编辑标签' : '添加标签'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" name="tagForm">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" initialValue="默认分类">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default TagManagementCard
