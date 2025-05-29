'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  DataResponse,
  PaginatedResponse,
} from '@/types'
import ProjectList from '@/components/ProjectList'
import { HomeOutlined } from '@ant-design/icons'

const { Option } = Select

// 表单字段类型定义
interface SearchFormValues {
  keyword?: string
  programmingLanguage?: string
  license?: string
  platform?: Platform
  isFeatured?: boolean
  selectedTags?: number[]
  orderBy: ProjectOrderFields
  order: Order
}

const AdvancedSearchPage = () => {
  const [form] = Form.useForm<SearchFormValues>()

  // 分页状态
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

  const formChanged = useRef(true)

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

  // 缓存标签选项
  const tagOptions = useMemo(
    () =>
      allTags.map((tag) => ({
        label: tag.name,
        value: tag.id,
      })),
    [allTags],
  )

  // 获取标签数据
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/tags')
        if (res.ok) {
          const data = await res.json()
          setAllTags(data.data || [])
        } else {
          console.error('获取标签列表失败')
        }
      } catch (error) {
        console.error('获取标签列表失败:', error)
      }
    }
    fetchTags()
  }, [])

  // 核心搜索函数
  const handleSearch = useCallback(
    async (formValues: SearchFormValues, page = 1, pSize = pageSize) => {
      setLoading(true)
      setCurrentPage(page)
      setPageSize(pSize)

      const searchParams: ProjectSearchParams = {
        keyword: formValues.keyword || undefined,
        programming_language: formValues.programmingLanguage || undefined,
        license: formValues.license || undefined,
        platform: formValues.platform || undefined,
        is_featured: formValues.isFeatured,
        tags: formValues.selectedTags || [],
      }

      let projectIdsToFetch = searchedProjectIds
      try {
        if (formChanged.current) {
          const searchQueryParams = new URLSearchParams()

          Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (Array.isArray(value)) {
                if (value.length > 0) {
                  value.forEach((v) => searchQueryParams.append(key, String(v)))
                }
              } else {
                searchQueryParams.set(key, String(value))
              }
            }
          })

          const searchRes = await fetch(
            `/api/projects/search?${searchQueryParams.toString()}`,
          )

          if (!searchRes.ok) {
            console.error('搜索项目失败')
            setSearchResults([])
            setTotalItems(0)
            setSearchedProjectIds([])
            setLoading(false)
            return
          }

          const searchData = (await searchRes.json()) as DataResponse<number[]>
          projectIdsToFetch = searchData.data || []
          setSearchedProjectIds(projectIdsToFetch)
          formChanged.current = false
        }

        // 如果没有搜索结果
        if (!projectIdsToFetch || projectIdsToFetch.length === 0) {
          setSearchResults([])
          setTotalItems(0)
          setLoading(false)
          return
        }

        // 获取项目详情
        const paginationParams: ProjectPaginationParams = {
          page,
          page_size: pSize,
          order_by:
            formValues.orderBy === 'id' ? undefined : formValues.orderBy,
          order: formValues.order,
          ids: projectIdsToFetch,
        }
        const queryParams = new URLSearchParams()
        Object.entries(paginationParams).forEach(([key, value]) => {
          if (key === 'ids' && Array.isArray(value)) {
            value.forEach((id) => queryParams.append(key, String(id)))
          } else if (value !== undefined) {
            queryParams.set(key, String(value))
          }
        })

        const projectsRes = await fetch(
          `/api/projects?${queryParams.toString()}`,
        )

        if (projectsRes.ok) {
          const projectsData =
            (await projectsRes.json()) as PaginatedResponse<ProjectBaseResponse>
          setSearchResults(projectsData.data.items || [])
          setTotalItems(projectsData.data.total || 0)
        } else {
          console.error('获取项目信息失败')
          setSearchResults([])
          setTotalItems(0)
        }
      } catch (error) {
        console.error('搜索项目信息失败', error)
        setSearchResults([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    },
    [pageSize, searchedProjectIds],
  )

  // 初始化表单默认值和 URL 参数处理
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const keyword = searchParams.get('keyword')

    // 设置表单初始值
    const initialValues: SearchFormValues = {
      keyword: keyword || undefined,
      orderBy: 'id',
      order: 'desc',
    }

    form.setFieldsValue(initialValues)

    // 如果有关键词，自动执行搜索
    if (keyword) {
      setTimeout(() => {
        handleSearch(initialValues, 1, pageSize)
      }, 0)
    }
  }, [])

  // 表单提交处理
  const onFinishSearch = useCallback(
    (values: SearchFormValues) => {
      // setSearchedProjectIds(null)
      handleSearch(values, 1, pageSize)
    },
    [handleSearch, pageSize],
  )

  // 分页处理
  const handleTableChange = useCallback(
    (newPage: number, newPageSize?: number) => {
      const currentValues = form.getFieldsValue()
      handleSearch(currentValues, newPage, newPageSize || pageSize)
    },
    [form, handleSearch, pageSize],
  )

  const handleFieldChange = useCallback(() => {
    formChanged.current = true
  }, [])

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

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishSearch}
          preserve={false} // 防止表单被销毁时保留值
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="keyword" label="关键词">
                <Input
                  placeholder="搜索项目名称、简介、描述"
                  onChange={handleFieldChange}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="platform" label="平台">
                <Select
                  placeholder="选择平台"
                  allowClear
                  onChange={handleFieldChange}
                >
                  <Option value={Platform.GITHUB}>GitHub</Option>
                  <Option value={Platform.GITEE}>Gitee</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="programmingLanguage" label="编程语言">
                <Input
                  placeholder="例如：Python, JavaScript"
                  onChange={handleFieldChange}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="license" label="许可证">
                <Input
                  placeholder="例如：MIT, Apache-2.0"
                  onChange={handleFieldChange}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="selectedTags" label="标签">
                <Select
                  mode="multiple"
                  placeholder="选择标签"
                  options={tagOptions}
                  loading={allTags.length === 0}
                  onChange={handleFieldChange}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="isFeatured" valuePropName="checked" label=" ">
                <Checkbox onChange={handleFieldChange}>仅显示精选项目</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="bottom">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="orderBy" label="排序字段" initialValue="id">
                <Select style={{ width: '100%' }} onChange={handleFieldChange}>
                  {availableOrderByFields.map((field) => (
                    <Option key={field.value} value={field.value}>
                      {field.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="order" label="排序顺序" initialValue="desc">
                <Radio.Group onChange={handleFieldChange}>
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
              style={{
                marginTop: '20px',
                marginBottom: '20px',
                textAlign: 'right',
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default AdvancedSearchPage
