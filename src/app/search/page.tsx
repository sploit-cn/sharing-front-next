'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

  // 搜索条件状态
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    programmingLanguage: undefined as string | undefined,
    license: undefined as string | undefined,
    platform: undefined as Platform | undefined,
    isFeatured: undefined as boolean | undefined,
    selectedTags: [] as number[],
  })

  // 排序和分页状态
  const [orderBy, setOrderBy] = useState<ProjectOrderFields>('updated_at')
  const [order, setOrder] = useState<Order>('desc')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalItems, setTotalItems] = useState<number>(0)

  // 数据状态
  const [searchResults, setSearchResults] = useState<ProjectBaseResponse[]>([])
  const [allTags, setAllTags] = useState<TagResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchedProjectIds, setSearchedProjectIds] = useState<number[] | null>(
    null,
  )

  const availableOrderByFields: { label: string; value: ProjectOrderFields }[] =
    [
      { label: '相关度', value: 'id' },
      { label: 'Star数量', value: 'stars' },
      { label: 'Issue数量', value: 'issues' },
      { label: '平均评分', value: 'average_rating' },
      { label: '评分数量', value: 'rating_count' },
      { label: '浏览次数', value: 'view_count' },
      { label: '创建时间', value: 'created_at' },
      { label: '更新时间', value: 'updated_at' },
      { label: '项目名称', value: 'name' },
    ]

  // 优化：缓存标签选项
  const tagOptions = useMemo(
    () =>
      allTags.map((tag) => ({
        label: tag.name,
        value: tag.id,
      })),
    [allTags],
  )

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
      setSearchFilters((prev) => ({ ...prev, keyword }))
      // 延迟执行搜索，避免初始化时的竞态条件
      setTimeout(() => handleSearch(1, pageSize, keyword), 0)
    }
  }, [])

  // 优化：减少依赖项，使用 useCallback 的 ref 模式
  const handleSearch = useCallback(
    async (page = 1, pSize = pageSize, keywordOverride?: string) => {
      setLoading(true)
      setCurrentPage(page)
      setPageSize(pSize)

      const currentFilters = {
        ...searchFilters,
        ...(keywordOverride !== undefined && { keyword: keywordOverride }),
      }

      const searchParams: ProjectSearchParams = {
        keyword: currentFilters.keyword || undefined,
        programming_language: currentFilters.programmingLanguage || undefined,
        license: currentFilters.license || undefined,
        platform: currentFilters.platform || undefined,
        is_featured: currentFilters.isFeatured,
        tags: currentFilters.selectedTags,
      }

      try {
        let projectIdsToFetch = searchedProjectIds

        // 只有在需要新搜索时才调用 /search
        if (searchedProjectIds === null || page === 1) {
          const searchRes = await fetch(
            `/api/projects/search?${new URLSearchParams(
              Object.entries(searchParams).reduce(
                (acc, [key, value]) => {
                  if (value !== undefined && value !== null && value !== '') {
                    if (!Array.isArray(value)) {
                      acc[key] = String(value)
                    }
                  }
                  return acc
                },
                {} as Record<string, string>,
              ),
            )}${searchParams.tags.length > 0 ? `&tags=${searchParams.tags.join('&tags=')}` : ''}`,
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

        const paginationParams: ProjectPaginationParams = {
          page,
          page_size: pSize,
          order_by: orderBy === 'id' ? undefined : orderBy,
          order,
          ids: projectIdsToFetch,
        }

        const projectsRes = await fetch(
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
    [searchFilters, orderBy, order, pageSize, searchedProjectIds],
  )

  // 优化：使用稳定的更新函数
  const updateFilter = useCallback(
    (key: keyof typeof searchFilters, value: any) => {
      setSearchFilters((prev) => ({ ...prev, [key]: value }))
      setSearchedProjectIds(null)
    },
    [],
  )

  const onFinishSearch = useCallback(() => {
    setSearchedProjectIds(null)
    handleSearch(1, pageSize)
  }, [handleSearch, pageSize])

  const handleTableChange = useCallback(
    (newPage: number, newPageSize?: number) => {
      handleSearch(newPage, newPageSize || pageSize)
    },
    [handleSearch, pageSize],
  )

  // 优化：防抖输入处理
  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      updateFilter('keyword', value)
    },
    [updateFilter],
  )

  const handleProgrammingLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      updateFilter('programmingLanguage', value)
    },
    [updateFilter],
  )

  const handleLicenseChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      updateFilter('license', value)
    },
    [updateFilter],
  )

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
                  value={searchFilters.keyword}
                  onChange={handleKeywordChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="平台">
                <Select
                  placeholder="选择平台"
                  value={searchFilters.platform}
                  onChange={(value) => updateFilter('platform', value)}
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
                  value={searchFilters.programmingLanguage}
                  onChange={handleProgrammingLanguageChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="许可证">
                <Input
                  placeholder="例如：MIT, Apache-2.0"
                  value={searchFilters.license}
                  onChange={handleLicenseChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="标签">
                <Select
                  mode="multiple"
                  placeholder="选择标签"
                  value={searchFilters.selectedTags}
                  onChange={(values) => updateFilter('selectedTags', values)}
                  options={tagOptions}
                  loading={allTags.length === 0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label=" ">
                <Checkbox
                  checked={searchFilters.isFeatured}
                  onChange={(e) => updateFilter('isFeatured', e.target.checked)}
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
