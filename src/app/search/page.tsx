'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  Input,
  Button,
  Select,
  Checkbox,
  Row,
  Col,
  Form,
  List,
  Pagination,
  Spin,
  Typography,
  Radio,
  Card,
  Breadcrumb,
} from 'antd'
import {
  ProjectBaseResponse,
  ProjectSearchParams,
  ProjectPaginationParams,
  TagResponse,
  Platform,
  ProjectOrderFields,
  Order,
} from '@/types'
import ProjectList from '@/components/ProjectList'
import { HomeOutlined } from '@ant-design/icons'

const { Option } = Select

const AdvancedSearchPage = () => {
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState<string>('')
  const [programmingLanguage, setProgrammingLanguage] = useState<
    string | undefined
  >(undefined)
  const [license, setLicense] = useState<string | undefined>(undefined)
  const [platform, setPlatform] = useState<Platform | undefined>(undefined)
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined)
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const [orderBy, setOrderBy] = useState<ProjectOrderFields>('updated_at')
  const [order, setOrder] = useState<Order>('desc')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalItems, setTotalItems] = useState<number>(0)

  const [searchResults, setSearchResults] = useState<ProjectBaseResponse[]>([])
  const [allTags, setAllTags] = useState<TagResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchedProjectIds, setSearchedProjectIds] = useState<number[] | null>(
    null,
  )

  const availableOrderByFields: { label: string; value: ProjectOrderFields }[] =
    [
      { label: '相关度', value: 'id' }, // Placeholder, actual relevance is from /search
      { label: 'Star数量', value: 'stars' },
      { label: 'Issue数量', value: 'issues' },
      { label: '平均评分', value: 'average_rating' },
      { label: '评分数量', value: 'rating_count' },
      { label: '浏览次数', value: 'view_count' },
      { label: '创建时间', value: 'created_at' },
      { label: '更新时间', value: 'updated_at' },
      { label: '项目名称', value: 'name' },
    ]

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags')
        if (res.ok) {
          const data = await res.json()
          setAllTags(data.data || [])
        } else {
          console.error('Failed to fetch tags')
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }
    fetchTags()
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const keyword = searchParams.get('keyword')
    if (keyword) {
      setKeyword(keyword)
      handleSearch(1, pageSize, keyword)
    }
  }, [])

  const handleSearch = useCallback(
    async (page = 1, pSize = pageSize, _keyword = '') => {
      setLoading(true)
      setCurrentPage(page)
      setPageSize(pSize)

      const searchParams: ProjectSearchParams = {
        keyword: keyword || _keyword || undefined,
        programming_language: programmingLanguage || undefined,
        license: license || undefined,
        platform: platform || undefined,
        is_featured: isFeatured,
        tags: selectedTags,
      }

      try {
        // Step 1: Get all matching project IDs
        let projectIdsToFetch = searchedProjectIds
        if (searchedProjectIds === null) {
          // Only call /search if it's a new search filter or first search
          const searchRes = await fetch(
            `/api/projects/search?${new URLSearchParams(
              Object.entries(searchParams).reduce(
                (acc, [key, value]) => {
                  if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                      value.forEach((v, i) => (acc[`${key}[${i}]`] = String(v)))
                    } else {
                      acc[key] = String(value)
                    }
                  }
                  return acc
                },
                {} as Record<string, string>,
              ),
            )}`,
          )
          if (!searchRes.ok) {
            console.error('Failed to search projects')
            setSearchResults([])
            setTotalItems(0)
            setSearchedProjectIds([])
            setLoading(false)
            return
          }
          const searchData = await searchRes.json()
          projectIdsToFetch = searchData.data || []
          setSearchedProjectIds(projectIdsToFetch)
        }

        if (!projectIdsToFetch || projectIdsToFetch.length === 0) {
          setSearchResults([])
          setTotalItems(0)
          setLoading(false)
          return
        }

        // Step 2: Fetch project details for the current page using the IDs
        const paginationParams: ProjectPaginationParams = {
          page,
          page_size: pSize,
          order_by: orderBy,
          order,
          ids: projectIdsToFetch,
        }

        const projectsRes = await fetch(
          // Construct query parameters carefully, especially for arrays like 'ids'
          `/api/projects?${new URLSearchParams(
            Object.entries(paginationParams).reduce((acc, [key, value]) => {
              if (key === 'ids' && Array.isArray(value)) {
                value.forEach((id) => acc.append(key, String(id)))
              } else if (value !== undefined) {
                acc.set(key, String(value))
              }
              return acc
            }, new URLSearchParams()),
          )}`,
        )

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setSearchResults(projectsData.data.items || [])
          setTotalItems(projectsData.data.total_items || 0)
        } else {
          console.error('Failed to fetch project details')
          setSearchResults([])
          setTotalItems(0)
        }
      } catch (error) {
        console.error('Error during search:', error)
        setSearchResults([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    },
    [
      keyword,
      programmingLanguage,
      license,
      platform,
      isFeatured,
      selectedTags,
      orderBy,
      order,
      pageSize,
      searchedProjectIds,
    ],
  )

  const onFinishSearch = () => {
    setSearchedProjectIds(null) // Reset IDs to trigger new /search call
    handleSearch(1, pageSize)
  }

  const handleTableChange = (newPage: number, newPageSize?: number) => {
    handleSearch(newPage, newPageSize || pageSize)
  }

  return (
    <div className="mx-auto px-4">
      <Breadcrumb
        className="project-breadcrumb m-4!"
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
            title: '高级搜索',
          },
        ]}
      />
      <Card className="">
        <Form form={form} layout="vertical" onFinish={onFinishSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="关键词">
                <Input
                  placeholder="搜索项目名称、简介、描述"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                    setSearchedProjectIds(null)
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="平台">
                <Select
                  placeholder="选择平台"
                  value={platform}
                  onChange={(value) => {
                    setPlatform(value)
                    setSearchedProjectIds(null)
                  }}
                  allowClear
                >
                  <Option value={Platform.GITHUB}>GitHub</Option>
                  <Option value={Platform.GITEE}>Gitee</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="编程语言">
                <Input
                  placeholder="例如：Python, JavaScript"
                  value={programmingLanguage}
                  onChange={(e) => {
                    setProgrammingLanguage(e.target.value)
                    setSearchedProjectIds(null)
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="许可证">
                <Input
                  placeholder="例如：MIT, Apache-2.0"
                  value={license}
                  onChange={(e) => {
                    setLicense(e.target.value)
                    setSearchedProjectIds(null)
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="标签">
                <Select
                  mode="multiple"
                  placeholder="选择标签"
                  value={selectedTags}
                  onChange={(values) => {
                    setSelectedTags(values)
                    setSearchedProjectIds(null)
                  }}
                  options={allTags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))}
                  loading={allTags.length === 0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label=" ">
                {' '}
                {/* For alignment with checkbox */}
                <Checkbox
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked)
                    setSearchedProjectIds(null)
                  }}
                >
                  仅显示精选项目
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="排序字段">
                <Select
                  value={orderBy}
                  onChange={(value) => {
                    setOrderBy(value)
                    setSearchedProjectIds(null)
                  }}
                  style={{ width: '100%' }}
                >
                  {availableOrderByFields.map((field) => (
                    <Option key={field.value} value={field.value}>
                      {field.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="排序顺序">
                <Radio.Group
                  value={order}
                  onChange={(e) => {
                    setOrder(e.target.value)
                    setSearchedProjectIds(null)
                  }}
                >
                  <Radio.Button value="desc">降序</Radio.Button>
                  <Radio.Button value="asc">升序</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={6}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  搜索
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {!loading &&
        searchedProjectIds !== null &&
        searchedProjectIds.length === 0 && (
          <Typography.Text
            style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}
          >
            没有找到符合条件的项目。
          </Typography.Text>
        )}

      {!loading && searchResults.length > 0 && (
        <>
          <List itemLayout="vertical" bordered className="my-4!">
            <ProjectList projects={searchResults} />
          </List>
          {totalItems > pageSize && (
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={handleTableChange}
              showSizeChanger
              onShowSizeChange={handleTableChange}
              style={{ marginTop: '20px', textAlign: 'right' }}
            />
          )}
        </>
      )}
      {!loading && searchedProjectIds === null && (
        <Typography.Text
          style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}
        >
          请输入搜索条件并点击搜索按钮。
        </Typography.Text>
      )}
    </div>
  )
}

export default AdvancedSearchPage
