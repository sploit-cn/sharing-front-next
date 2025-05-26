import { DataResponse, ProjectFullResponse } from '@/types'
import { getBaseUrl } from '@/utils/urls'
import ky from 'ky'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import {
  Card,
  Tag,
  Button,
  Avatar,
  Statistic,
  Descriptions,
  Image,
  Space,
  Row,
  Col,
  Rate,
  Badge,
  Breadcrumb,
} from 'antd'
import {
  StarOutlined,
  ForkOutlined,
  EyeOutlined,
  BugOutlined,
  UserOutlined,
  LinkOutlined,
  DownloadOutlined,
  GlobalOutlined,
  CalendarOutlined,
  CodeOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import ProjectComments from '@/components/project/ProjectComments'
import ProjectFavorites from '@/components/project/ProjectFavorites'
import ProjectRating from '@/components/project/ProjectRating'
import RelatedProjects from '@/components/project/RelatedProjects'

import Title from 'antd/es/typography/Title'
import Text from 'antd/es/typography/Text'
import Paragraph from 'antd/es/typography/Paragraph'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import CodeBlock from '@/components/CodeBlock'
import ProjectStatusControl from '@/components/project/ProjectStatusControl'
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: number }>
}): Promise<Metadata> {
  const { id } = await params
  const baseUrl = getBaseUrl()

  try {
    const res = await ky<DataResponse<ProjectFullResponse>>(
      `${baseUrl}/api/projects/${id}`,
    ).json()

    if (res.code === 200) {
      const project = res.data
      return {
        title: `${project.name} - 项目详情`,
        description:
          project.brief ||
          project.description ||
          `查看 ${project.name} 项目的详细信息、源码、评分和评论`,
        keywords: [
          project.name,
          project.programming_language,
          ...project.tags.map((tag) => tag.name),
          project.platform,
        ]
          .filter(Boolean)
          .join(', '),
        openGraph: {
          title: project.name,
          description: project.brief || project.description,
          images: project.avatar ? [project.avatar] : [],
          type: 'website',
        },
      }
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
  }

  return {
    title: '项目详情',
    description: '查看项目的详细信息、源码、评分和评论',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params
  const baseUrl = getBaseUrl()
  const res = await ky<DataResponse<ProjectFullResponse>>(
    `${baseUrl}/api/projects/${id}`,
  ).json()

  if (res.code !== 200) {
    redirect('/404')
  }

  const project = res.data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const getPlatformColor = (platform: string) => {
    return platform === 'GitHub' ? '#000000' : '#C71D23'
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl space-y-6! px-4">
        {/* 面包屑导航 */}
        <Breadcrumb
          className="project-breadcrumb mb-4"
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
              title: project.name,
            },
          ]}
        />

        {/* 项目头部信息 */}
        <Card className="project-card">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
            <Avatar
              size={{ xs: 60, sm: 70, md: 80, lg: 90, xl: 100, xxl: 120 }}
              src={project.avatar}
              icon={<CodeOutlined />}
              className="project-avatar mx-auto border-2 border-gray-200 sm:mx-0"
            />
            <div className="w-full flex-1">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Title level={2} className="project-title !mb-0">
                  {project.name}
                </Title>
                {project.is_featured && (
                  <Badge.Ribbon text="精选" color="gold">
                    <div></div>
                  </Badge.Ribbon>
                )}
                {project.is_approved && (
                  <SafetyCertificateOutlined className="text-xl text-green-500!" />
                )}
              </div>

              <Text className="project-brief mb-4 block text-lg text-gray-600">
                {project.brief}
              </Text>

              <div className="mb-4 flex flex-wrap">
                <Tag color={getPlatformColor(project.platform)}>
                  {project.platform}
                </Tag>
                {project.programming_language && (
                  <Tag color="blue">{project.programming_language}</Tag>
                )}
                {project.license && <Tag color="green">{project.license}</Tag>}
                {project.tags.map((tag) => (
                  <Tag key={tag.id} color="purple">
                    {tag.name}
                  </Tag>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  href={project.repo_url}
                  target="_blank"
                  size={'large'}
                  className="project-button min-w-0 flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">查看源码</span>
                  <span className="sm:hidden">源码</span>
                </Button>
                {project.website_url && (
                  <Button
                    icon={<GlobalOutlined />}
                    href={project.website_url}
                    target="_blank"
                    size={'large'}
                    className="project-button min-w-0 flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">官方网站</span>
                    <span className="sm:hidden">官网</span>
                  </Button>
                )}
                {project.download_url && (
                  <Button
                    icon={<DownloadOutlined />}
                    href={project.download_url}
                    target="_blank"
                    size={'large'}
                    className="project-button min-w-0 flex-1 sm:flex-none"
                  >
                    下载
                  </Button>
                )}
                <Button
                  icon={<HeartOutlined />}
                  size={'large'}
                  href={'#favorites'}
                  className="project-button min-w-0 flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">查看收藏</span>
                  <span className="sm:hidden">收藏</span>
                </Button>
              </div>
            </div>
            <div className="flex">
              <div className="m-4 mr-8 text-center">
                <div className="mb-1 text-sm text-gray-500">平均评分</div>
                <div className="flex items-center justify-center gap-2">
                  <Rate disabled value={project.average_rating / 2} allowHalf />
                  <Text className="text-lg font-semibold">
                    {project.average_rating.toFixed(1)}
                  </Text>
                </div>
                <Text className="text-xs text-gray-400">
                  ({project.rating_count} 人评分)
                </Text>
              </div>
              <div className="m-0! flex items-center justify-center gap-3 text-center">
                <Card size="small">
                  <Avatar
                    size={{ xs: 40, sm: 48 }}
                    src={project.submitter.avatar}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <div className="font-medium">
                      {project.submitter.username}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        <Row gutter={[16, 24]}>
          {/* 统计数据 */}

          {/* 项目详情 */}
          <Col xs={24} lg={16} className="order-1 lg:order-1">
            <Space direction="vertical" size="large" className="w-full">
              <Card title="项目统计" className="project-card">
                <Row gutter={[32, 16]}>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Star 数"
                      value={project.stars}
                      prefix={<StarOutlined />}
                      valueStyle={{ color: 'var(--color-yellow-500)' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Fork 数"
                      value={project.forks}
                      prefix={<ForkOutlined />}
                      valueStyle={{ color: 'var(--color-blue-500)' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="关注者"
                      value={project.watchers}
                      prefix={<EyeOutlined />}
                      valueStyle={{ color: 'var(--color-green-500)' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="贡献者"
                      value={project.contributors}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: 'var(--color-purple-500)' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Issues"
                      value={project.issues}
                      prefix={<BugOutlined />}
                      valueStyle={{ color: 'var(--color-red-500)' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="浏览量"
                      value={project.view_count}
                      prefix={<EyeOutlined />}
                      valueStyle={{ color: 'var(--color-gray-500)' }}
                    />
                  </Col>
                </Row>
              </Card>
              {/* 项目描述 */}
              <Card title="项目介绍" className="project-card">
                <Paragraph className="text-base! leading-relaxed whitespace-pre-wrap">
                  {project.description || '暂无详细介绍'}
                </Paragraph>
              </Card>

              {/* 代码示例 */}
              {project.code_example && (
                <Card title="代码示例" className="project-card">
                  <Paragraph className="text-base! leading-relaxed whitespace-pre-wrap">
                    <CodeBlock>
                      <Markdown rehypePlugins={[rehypeHighlight]}>
                        {project.code_example}
                      </Markdown>
                    </CodeBlock>
                  </Paragraph>
                </Card>
              )}

              {/* 项目图片 */}
              {project.images && project.images.length > 0 && (
                <Card title="项目截图" className="project-card">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {project.images.map((image) => (
                      <Image
                        key={image.id}
                        src={`/static/images/${image.file_name}`}
                        alt={image.original_name}
                        className="w-full rounded-lg"
                        preview={{
                          mask: '预览图片',
                        }}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {/* 评论区域 */}
              <ProjectComments projectId={project.id} />
            </Space>
          </Col>

          {/* 侧边栏信息 */}
          <Col xs={24} lg={8} className="order-2 lg:order-2">
            <Space direction="vertical" size="large" className="w-full">
              <Card title="项目状态" className="project-card w-full">
                <ProjectStatusControl project={project} />
              </Card>
              {/* 提交者信息 */}
              {/* <Card title="项目图片" className="project-card"> */}
              {/* <div className="mb-4 flex items-center gap-3">
                  <Avatar
                    size={{ xs: 40, sm: 48 }}
                    src={project.submitter.avatar}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <div className="font-medium">
                      {project.submitter.username}
                    </div>
                    {project.submitter.bio && (
                      <Text className="text-sm text-gray-500">
                        {project.submitter.bio}
                      </Text>
                    )}
                  </div>
                </div> */}
              {/* <Carousel
                  autoplay
                  autoplaySpeed={5000}
                  className="w-full rounded-lg"
                  arrows
                  adaptiveHeight
                >
                  {project.images.map((image) => (
                    <Image
                      key={image.id}
                      src={`/static/images/${image.file_name}`}
                      alt={image.original_name}
                      className="w-full rounded-lg"
                      preview={{
                        mask: '预览图片',
                      }}
                    />
                  ))}
                </Carousel>
              </Card> */}

              {/* 项目信息 */}
              <Card title="项目信息" className="project-card">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="创建时间">
                    <div className="flex items-center gap-1">
                      <CalendarOutlined className="text-gray-400" />
                      {formatDate(project.created_at)}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="更新时间">
                    <div className="flex items-center gap-1">
                      <CalendarOutlined className="text-gray-400" />
                      {formatDate(project.updated_at)}
                    </div>
                  </Descriptions.Item>

                  {project.last_commit_at && (
                    <Descriptions.Item label="最后提交">
                      <div className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        {formatDate(project.last_commit_at)}
                      </div>
                    </Descriptions.Item>
                  )}

                  {project.repo_created_at && (
                    <Descriptions.Item label="仓库创建">
                      <div className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        {formatDate(project.repo_created_at)}
                      </div>
                    </Descriptions.Item>
                  )}

                  <Descriptions.Item label="仓库ID">
                    <Text code>{project.repo_id}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 相关链接 */}
              <Card title="相关链接" className="project-card">
                <Space direction="vertical" className="w-full">
                  <Button
                    block
                    icon={<LinkOutlined />}
                    href={project.repo_url}
                    target="_blank"
                  >
                    源码仓库
                  </Button>

                  {project.website_url && (
                    <Button
                      block
                      icon={<GlobalOutlined />}
                      href={project.website_url}
                      target="_blank"
                    >
                      官方网站
                    </Button>
                  )}

                  {project.download_url && (
                    <Button
                      block
                      icon={<DownloadOutlined />}
                      href={project.download_url}
                      target="_blank"
                    >
                      下载地址
                    </Button>
                  )}
                </Space>
              </Card>

              {/* 项目评分 */}
              <ProjectRating
                projectId={project.id}
                averageRating={project.average_rating}
                ratingCount={project.rating_count}
              />

              {/* 收藏列表 */}
              <div id="favorites">
                <ProjectFavorites projectId={project.id} />
              </div>

              {/* 相关项目推荐 */}
              <RelatedProjects
                projectId={project.id}
                tags={project.tags}
                programmingLanguage={project.programming_language}
              />
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  )
}
