'use client'

import type React from 'react'
import { useState, useEffect, useCallback } from 'react'
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
  EditOutlined, // Changed icon
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  CodeOutlined,
  TagsOutlined,
  FileImageOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LeftOutlined,
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation' // Added useParams
import ky from 'ky'
import useUserStore from '@/store/userStore'
import {
  type ProjectOwnerUpdate, // Changed from ProjectCreate
  Platform,
  type TagResponse,
  type ImageResponse,
  type DataResponse,
  type ProjectRepoDetail,
  type ProjectFullResponse,
} from '@/types'
import { useHydrated } from '@/utils/useHydrated'
import { formatNumber } from '@/utils/numbers'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography
const { Option } = Select

interface UpdateFormData {
  // repoUrl: string // repoUrl is not updatable by user
  brief: string
  description: string
  codeExample?: string
  // platform: Platform // platform is not updatable
  // repoId: string // repoId is not updatable
  tagIds: number[]
  imageIds: number[]
}

// Define an interface for errors that might have a response property
interface KyError extends Error {
  response?: {
    json: () => Promise<{ message?: string; [key: string]: unknown }> // Explicitly defined
    status?: number
    // include other properties of response if needed
  }
}

const ProjectUpdatePage: React.FC = () => {
  const [form] = Form.useForm<UpdateFormData>()
  const [submitting, setSubmitting] = useState(false)
  // const [repoLoading, setRepoLoading] = useState(false) // Not needed for update
  const [tags, setTags] = useState<TagResponse[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [uploadedImages, setUploadedImages] = useState<ImageResponse[]>([])
  const [projectDetail, setProjectDetail] =
    useState<ProjectFullResponse | null>(null)
  const [repoDetail, setRepoDetail] = useState<ProjectRepoDetail | null>(null)
  // const [repoError, setRepoError] = useState<string>('') // Not needed for update
  const [loadingProject, setLoadingProject] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  const { message } = App.useApp()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const user = useUserStore((state) => state.user)
  const isHydrated = useHydrated()

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return
    setLoadingProject(true)
    try {
      const response = await ky
        .get(`/api/projects/${projectId}`)
        .json<DataResponse<ProjectFullResponse>>()
      if (response.code === 200) {
        const projectData = response.data
        setProjectDetail(projectData)
        setRepoDetail({
          repo_url: projectData.repo_url,
          avatar: projectData.avatar || '',
          name: projectData.name,
          website_url: projectData.website_url,
          stars: projectData.stars,
          forks: projectData.forks,
          watchers: projectData.watchers,
          contributors: projectData.contributors,
          issues: projectData.issues,
          license: projectData.license,
          programming_language: projectData.programming_language,
          last_commit_at: projectData.last_commit_at,
          repo_created_at: projectData.repo_created_at,
          owner_platform_id: projectData.owner_platform_id || 0, // Ensure owner_platform_id is number
          last_sync_at: projectData.last_sync_at,
        })
        // form.setFieldsValue({
        //   brief: projectData.brief,
        //   description: projectData.description,
        //   codeExample: projectData.code_example,
        // })
        setSelectedTags(projectData.tags.map((tag) => tag.id))
        setUploadedImages(projectData.images)
      } else {
        message.error('获取项目信息失败: ' + response.message)
        router.push('/')
      }
    } catch (error) {
      message.error('获取项目信息失败')
      console.error('Failed to fetch project details:', error)
      router.push('/')
    } finally {
      setLoadingProject(false)
    }
  }, [projectId, message, router])

  useEffect(() => {
    if (isHydrated) {
      if (!user) {
        message.warning('请先登录后再修改项目')
        router.push('/login')
        return
      }
      if (projectDetail) {
        let canEdit = false
        if (user.role === 'admin') {
          canEdit = true
        } else {
          const isOwner =
            (projectDetail.platform === Platform.GITHUB &&
              user.github_id === projectDetail.owner_platform_id) ||
            (projectDetail.platform === Platform.GITEE &&
              user.gitee_id === projectDetail.owner_platform_id)

          if (isOwner) {
            canEdit = true
          } else if (
            user.id === projectDetail.submitter_id &&
            (projectDetail.is_approved === false ||
              projectDetail.is_approved === null)
          ) {
            canEdit = true
          }
        }
        if (!canEdit) {
          message.error('您没有权限修改此项目')
          router.push(`/projects/${projectId}`)
        }
        setHasPermission(canEdit)
      }
    }
  }, [user, message, router, isHydrated, projectDetail, projectId])

  useEffect(() => {
    fetchProjectDetails()
  }, [fetchProjectDetails])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await ky
          .get('/api/tags')
          .json<DataResponse<TagResponse[]>>()
        setTags(response.data)
        // It's good practice to clean up unused images if the user navigates away
        // or if they don't belong to this project and were uploaded in a previous session.
        // However, a general cleanup like in submit page might be too aggressive here.
        // We will only delete images explicitly removed by the user.
      } catch {
        message.error('获取标签列表失败')
      }
    }
    fetchTags()
  }, [message])

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    // For updates, images are associated with the project_id right away
    formData.append('project_id', projectId)

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

  const handleSubmit = async (values: UpdateFormData) => {
    if (!projectDetail) {
      message.error('项目信息加载中，请稍候')
      return
    }

    setSubmitting(true)
    try {
      const projectUpdateData: ProjectOwnerUpdate = {
        brief: values.brief,
        description: values.description,
        code_example: values.codeExample,
        tag_ids: selectedTags,
        // image_ids are implicitly updated by uploading/deleting.
        // The backend for project update might not need image_ids if images are directly linked to project_id on upload.
        // Based on ProjectOwnerUpdate, only tag_ids is optional for arrays.
        // We assume the backend handles images associated with the project_id correctly.
      }

      let response: DataResponse<ProjectFullResponse>
      if (user?.role === 'admin') {
        response = await ky
          .put(`/api/projects/${projectId}`, {
            json: projectUpdateData,
          })
          .json<DataResponse<ProjectFullResponse>>()
      } else {
        response = await ky
          .put(`/api/projects/my/${projectId}`, {
            json: projectUpdateData,
          })
          .json<DataResponse<ProjectFullResponse>>()
      }

      if (response.code === 200) {
        message.success('项目信息更新成功！')
        router.push(`/projects/${response.data.id}`)
      } else {
        message.error(response.message || '项目更新失败，请稍后重试')
      }
    } catch (e) {
      const error = e as KyError // Type assertion
      let errorMessage = '项目更新失败，请稍后重试'
      if (error.response) {
        try {
          const responseData = await error.response.json()
          if (responseData && responseData.message) {
            errorMessage = responseData.message
          } else if (error.message) {
            errorMessage = error.message
          }
        } catch (parseError) {
          if (error.message) {
            errorMessage = error.message
          }
          console.error('Failed to parse error response:', parseError)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      message.error(errorMessage)
      console.error('Failed to update project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isHydrated || loadingProject || !projectDetail || !hasPermission) {
    return (
      <Spin
        size="large"
        className="flex min-h-screen items-center justify-center"
      />
    )
  }

  return (
    <div className="min-h-screen w-4/5 py-4">
      <div className="mx-auto max-w-7xl space-y-4! px-4">
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
              href: `/projects/${projectId}`,
              title: projectDetail.name,
            },
            {
              title: '修改项目信息',
            },
          ]}
        />

        <Card className="mb-6">
          <div className="text-center">
            <Title level={2} className="mb-2">
              <EditOutlined className="mr-2" />
              修改项目信息
            </Title>
            <Paragraph className="text-lg text-gray-600">
              更新您的开源项目详情，保持信息最新
            </Paragraph>
          </div>
        </Card>

        <Alert
          message="修改指南"
          description={
            <ul className="mt-2 space-y-1">
              <li>• 请确保您有权限修改此项目</li>
              <li>• 更新准确的项目描述和标签</li>
              <li>• 项目的仓库链接不可更改</li>
              <li>• 修改后可能需要管理员重新审核（如果之前未审核通过）</li>
            </ul>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            initialValues={{
              brief: projectDetail?.brief || '',
              description: projectDetail?.description || '',
              codeExample: projectDetail?.code_example || '',
              tagIds: projectDetail?.tags.map((tag) => tag.id) || [],
            }}
            // initialValues={{
            //   brief: projectDetail.brief,
            //   description: projectDetail.description,
            //   codeExample: projectDetail.code_example,
            // }}
          >
            {/* Repository URL - Display Only */}
            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <LinkOutlined />
                  仓库链接 (不可修改)
                </span>
              }
            >
              <Input value={projectDetail.repo_url} disabled />
            </Form.Item>

            {/* Repository Details Display */}
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
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span>⭐ {formatNumber(repoDetail.stars)}</span>
                      <span>🍴 {formatNumber(repoDetail.forks)}</span>
                      <span>👀 {formatNumber(repoDetail.watchers)}</span>
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
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <TagsOutlined />
                      项目标签
                    </span>
                  }
                  name="tagIds" // Name matches form data
                >
                  <Select
                    mode="multiple"
                    placeholder="选择相关标签"
                    value={selectedTags} // Controlled component
                    onChange={setSelectedTags} // Update state
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

            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <FileImageOutlined />
                  项目截图 (可选)
                </span>
              }
              // name="imageIds" // Not directly part of form data, managed by uploadedImages state
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
                          className="absolute top-0 right-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleImageRemove(image)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>

            <Divider />

            <Form.Item className="mb-0">
              <Space className="w-full justify-center">
                <Button
                  size="large"
                  icon={<LeftOutlined />}
                  onClick={() => router.push(`/projects/${projectId}`)}
                >
                  取消返回
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={submitting}
                  icon={<EditOutlined />} // Changed icon
                >
                  确认修改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default ProjectUpdatePage
