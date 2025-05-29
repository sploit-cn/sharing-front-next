import React from 'react'
import { Typography } from 'antd'
import { PaginatedResponse, ProjectBaseResponse } from '@/types'
import { getBaseUrl } from '@/utils/urls' // Assuming getBaseUrl is still needed for server-side fetch
import ProjectsClientRenderer from '@/components/ProjectsClientRenderer'

// Client-side component for rendering the list and handling infinite scroll

// Server component for initial data fetching and rendering ProjectsClientRenderer
const HomePage = async () => {
  let initialProjects: ProjectBaseResponse[] = []
  let initialCurrentPage = 1
  let initialTotalPages = 1
  let fetchError = false
  try {
    // Fetch the first page of projects on the server
    const response = await fetch(
      `${getBaseUrl()}/api/projects?page=1&page_size=5&order_by=updated_at&order=desc`,
      { cache: 'no-store' },
    )
    if (!response.ok) {
      throw new Error('Failed to fetch initial projects')
    }
    const data =
      (await response.json()) as PaginatedResponse<ProjectBaseResponse>
    initialProjects = data.data.items
    initialCurrentPage = data.data.page
    initialTotalPages = data.data.pages
  } catch (error) {
    console.error('SSR 获取项目错误:', error)
    fetchError = true
    // initialProjects will remain empty, currentPage and totalPages will be default
  }

  return (
    <div className="w-dvw p-8">
      {fetchError && initialProjects.length === 0 ? (
        <Typography.Text
          style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}
          type="danger"
        >
          加载初始项目失败，请稍后重试。
        </Typography.Text>
      ) : (
        <ProjectsClientRenderer
          initialProjects={initialProjects}
          initialCurrentPage={initialCurrentPage}
          initialTotalPages={initialTotalPages}
        />
      )}
    </div>
  )
}

export default HomePage
