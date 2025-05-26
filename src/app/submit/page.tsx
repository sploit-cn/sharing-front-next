'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Space,
  Typography,
  Divider,
  App,
  Row,
  Col,
  Alert,
  Spin,
  Breadcrumb,
} from 'antd'
import {
  CloudUploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  CodeOutlined,
  TagsOutlined,
  FileImageOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import ky from 'ky'
import useUserStore from '@/store/userStore'
import {
  type ProjectCreate,
  Platform,
  type TagResponse,
  type ImageResponse,
  type DataResponse,
  type ProjectRepoDetail,
} from '@/types'
import { useHydrated } from '@/utils/useHydrated'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography
const { Option } = Select

interface SubmitFormData {
  repoUrl: string
  brief: string
  description: string
  codeExample?: string
  platform: Platform
  repoId: string
  tagIds: number[]
  imageIds: number[]
}

const ProjectSubmitPage: React.FC = () => {
  const [form] = Form.useForm<SubmitFormData>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [repoLoading, setRepoLoading] = useState(false)
  const [tags, setTags] = useState<TagResponse[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [uploadedImages, setUploadedImages] = useState<ImageResponse[]>([])
  const [repoDetail, setRepoDetail] = useState<ProjectRepoDetail | null>(null)
  const [repoError, setRepoError] = useState<string>('')

  const { message } = App.useApp()
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const isHydrated = useHydrated()
  // Redirect if not logged in
  useEffect(() => {
    if (isHydrated && !user) {
      message.warning('请先登录后再提交项目')
      router.push('/login')
    }
  }, [user, message, router, isHydrated])

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await ky
          .get('/api/tags')
          .json<DataResponse<TagResponse[]>>()
        await ky.delete('/api/images/clean')
        setTags(response.data)
      } catch {
        message.error('获取标签列表失败')
      }
    }
    fetchTags()
  }, [message])

  // Parse repository URL and fetch details
  const parseRepoUrl = (
    url: string,
  ): { platform: Platform; repoId: string } | null => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      const pathname = urlObj.pathname

      if (hostname === 'github.com') {
        const match = pathname.match(/^\/([^/]+\/[^/]+)/)
        if (match) {
          return { platform: Platform.GITHUB, repoId: match[1] }
        }
      } else if (hostname === 'gitee.com') {
        const match = pathname.match(/^\/([^/]+\/[^/]+)/)
        if (match) {
          return { platform: Platform.GITEE, repoId: match[1] }
        }
      }
      return null
    } catch {
      return null
    }
  }

  const handleRepoUrlChange = async (url: string) => {
    if (!url.trim()) {
      setRepoDetail(null)
      setRepoError('')
      return
    }

    const parsed = parseRepoUrl(url)
    if (!parsed) {
      setRepoError('请输入有效的 GitHub 或 Gitee 仓库链接')
      setRepoDetail(null)
      return
    }

    setRepoLoading(true)
    setRepoError('')

    try {
      const response = await ky
        .get('/api/projects/repo_detail', {
          searchParams: {
            platform: parsed.platform,
            repo_id: parsed.repoId,
          },
        })
        .json<DataResponse<ProjectRepoDetail>>()

      setRepoDetail(response.data)

      // Auto-fill form fields
      form.setFieldsValue({
        platform: parsed.platform,
        repoId: parsed.repoId,
        brief: response.data.name,
      })
    } catch (error: any) {
      if (error.response?.status === 404) {
        setRepoError('仓库不存在或无法访问')
      } else {
        setRepoError('获取仓库信息失败，请检查链接是否正确')
      }
      setRepoDetail(null)
    } finally {
      setRepoLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await ky
        .post('/api/images/upload', {
          body: formData,
        })
        .json<DataResponse<ImageResponse>>()

      setUploadedImages((prev) => [...prev, response.data])
      message.success('图片上传成功')
      return response.data
    } catch {
      message.error('图片上传失败')
      throw new Error('Upload failed')
    }
  }

  const handleImageRemove = async (image: ImageResponse) => {
    try {
      await ky.delete(`/api/images/${image.id}`)
      setUploadedImages((prev) => prev.filter((img) => img.id !== image.id))
      message.success('图片删除成功')
    } catch {
      message.error('图片删除失败')
    }
  }

  const handleSubmit = async (values: SubmitFormData) => {
    if (!repoDetail) {
      message.error('请先输入有效的仓库链接')
      return
    }

    setSubmitting(true)
    try {
      const projectData: ProjectCreate = {
        brief: values.brief,
        description: values.description,
        code_example: values.codeExample,
        platform: values.platform,
        repo_id: repoDetail.name, // Use the actual repo name from API
        tag_ids: selectedTags,
        image_ids: uploadedImages.map((img) => img.id),
      }

      const response = await ky
        .post('/api/projects', {
          json: projectData,
        })
        .json<DataResponse<any>>()

      message.success('项目提交成功！')
      router.push(`/projects/${response.data.id}`)
    } catch (error: any) {
      if (error.response?.status === 400) {
        message.error('项目已存在或数据无效')
      } else {
        message.error('项目提交失败，请稍后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Spin
        size="large"
        className="flex min-h-screen items-center justify-center"
      />
    )
  }

  return (
    <div className="min-h-screen py-4">
      <div className="mx-auto max-w-7xl space-y-4! px-4">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            {
              href: '/',
              title: (
                <div className="flex items-center gap-1">
                  <HomeOutlined />
                  <span>首页</span>
                </div>
              ),
            },
            {
              title: '提交项目',
            },
          ]}
        />

        {/* Header */}
        <Card className="mb-6">
          <div className="text-center">
            <Title level={2} className="mb-2">
              <CloudUploadOutlined className="mr-2" />
              提交开源项目
            </Title>
            <Paragraph className="text-lg text-gray-600">
              分享您的开源项目，让更多开发者发现和使用
            </Paragraph>
          </div>
        </Card>

        {/* Guidelines */}
        <Alert
          message="提交指南"
          description={
            <ul className="mt-2 space-y-1">
              <li>• 请确保项目是开源的，并且您有权限提交</li>
              <li>• 提供准确的项目描述和标签，便于其他用户发现</li>
              <li>• 上传项目截图可以更好地展示项目特色</li>
              <li>• 提交后需要管理员审核，审核通过后会在平台展示</li>
            </ul>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        {/* Main Form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            {/* Repository URL */}
            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <LinkOutlined />
                  仓库链接
                </span>
              }
              name="repoUrl"
              rules={[
                { required: true, message: '请输入仓库链接' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const parsed = parseRepoUrl(value)
                    if (!parsed) {
                      return Promise.reject(
                        '请输入有效的 GitHub 或 Gitee 仓库链接',
                      )
                    }
                    return Promise.resolve()
                  },
                },
              ]}
              validateStatus={repoError ? 'error' : ''}
              help={repoError || '支持 GitHub 和 Gitee 仓库链接'}
            >
              <Input
                placeholder="https://github.com/username/repository 或 https://gitee.com/username/repository"
                onChange={(e) => handleRepoUrlChange(e.target.value)}
                suffix={repoLoading ? <Spin size="small" /> : <span />}
              />
            </Form.Item>

            {/* Repository Details */}
            {repoDetail && (
              <Card className="mb-4!">
                <div className="flex items-center gap-4">
                  <img
                    src={repoDetail.avatar || '/placeholder.svg'}
                    alt={repoDetail.name}
                    className="h-16 w-16 rounded-lg"
                  />
                  <div className="flex-1">
                    <Title level={4} className="mb-1">
                      <CheckCircleOutlined className="mr-2 text-green-500" />
                      {repoDetail.name}
                    </Title>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>⭐ {repoDetail.stars}</span>
                      <span>🍴 {repoDetail.forks}</span>
                      <span>👀 {repoDetail.watchers}</span>
                      {repoDetail.programming_language && (
                        <span>💻 {repoDetail.programming_language}</span>
                      )}
                      {repoDetail.license && (
                        <span>📄 {repoDetail.license}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Row gutter={[24, 0]}>
              <Col xs={24} lg={12}>
                {/* Brief Description */}
                <Form.Item
                  label="项目简介"
                  name="brief"
                  rules={[
                    { required: true, message: '请输入项目简介' },
                    { max: 255, message: '简介不能超过255个字符' },
                  ]}
                >
                  <Input
                    placeholder="用一句话描述您的项目"
                    showCount
                    maxLength={255}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                {/* Tags */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <TagsOutlined />
                      项目标签
                    </span>
                  }
                >
                  <Select
                    mode="multiple"
                    placeholder="选择相关标签"
                    value={selectedTags}
                    onChange={setSelectedTags}
                    optionLabelProp="label"
                    maxTagCount="responsive"
                  >
                    {tags.map((tag) => (
                      <Option key={tag.id} value={tag.id} label={tag.name}>
                        <div className="flex items-center justify-between">
                          <span>{tag.name}</span>
                          <Text type="secondary" className="text-xs">
                            {tag.category}
                          </Text>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Detailed Description */}
            <Form.Item
              label="详细描述"
              name="description"
              rules={[{ required: true, message: '请输入详细描述' }]}
            >
              <TextArea
                placeholder="详细介绍您的项目功能、特色、使用场景等..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                showCount
              />
            </Form.Item>

            {/* Code Example */}
            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <CodeOutlined />
                  代码示例 (可选)
                </span>
              }
              name="codeExample"
            >
              <TextArea
                placeholder="提供一些代码示例，支持 Markdown 格式..."
                autoSize={{ minRows: 4, maxRows: 8 }}
                showCount
              />
            </Form.Item>

            {/* Image Upload */}
            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <FileImageOutlined />
                  项目截图 (可选)
                </span>
              }
            >
              <div className="space-y-4!">
                <Upload
                  listType="picture-card"
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/')
                    if (!isImage) {
                      message.error('只能上传图片文件')
                      return false
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5
                    if (!isLt5M) {
                      message.error('图片大小不能超过 5MB')
                      return false
                    }
                    handleImageUpload(file)
                    return false
                  }}
                  showUploadList={false}
                >
                  <div>
                    <PlusOutlined />
                    <div className="mt-2">上传图片</div>
                  </div>
                </Upload>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="group relative">
                        <img
                          src={`/static/images/${image.file_name}`}
                          alt={image.original_name}
                          className="border-bgactive h-24 w-full rounded-lg border object-cover"
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          className="absolute top-2 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleImageRemove(image)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>

            <Divider />

            {/* Submit Buttons */}
            <Form.Item className="mb-0">
              <Space className="w-full justify-center">
                <Button size="large" onClick={() => router.back()}>
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={submitting}
                  disabled={!repoDetail}
                  icon={<CloudUploadOutlined />}
                >
                  提交项目
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default ProjectSubmitPage
