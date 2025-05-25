'use client'
import { ProjectBaseResponse, PaginatedResponse } from '@/types'
import { Typography, List, Spin } from 'antd'
import React from 'react'
import ProjectList from './ProjectList'

// This component is a client component
const ProjectsClientRenderer = ({
  initialProjects,
  initialCurrentPage,
  initialTotalPages,
}: {
  initialProjects: ProjectBaseResponse[]
  initialCurrentPage: number
  initialTotalPages: number
}) => {
  const [projects, setProjects] =
    React.useState<ProjectBaseResponse[]>(initialProjects)
  const [currentPage, setCurrentPage] =
    React.useState<number>(initialCurrentPage)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [hasMore, setHasMore] = React.useState<boolean>(
    initialCurrentPage < initialTotalPages,
  )
  const observer = React.useRef<IntersectionObserver | null>(null)
  const loaderRef = React.useRef<HTMLDivElement | null>(null)

  const fetchMoreProjects = React.useCallback(
    async (page: number) => {
      if (loading || !hasMore) return
      setLoading(true)
      try {
        const response = await fetch(
          `/api/projects?page=${page}&page_size=10&order_by=updated_at&order=desc`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        const data =
          (await response.json()) as PaginatedResponse<ProjectBaseResponse>
        setProjects((prevProjects) => [...prevProjects, ...data.data.items])
        setCurrentPage(data.data.page)
        setHasMore(data.data.page < data.data.pages)
      } catch (error) {
        console.error('Error fetching projects:', error)
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    },
    [loading, hasMore],
  )

  React.useEffect(() => {
    if (!hasMore) return // Don't observe if no more items initially

    const currentLoaderRef = loaderRef.current
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchMoreProjects(currentPage + 1)
      }
    })

    if (currentLoaderRef) {
      observer.current.observe(currentLoaderRef)
    }

    return () => {
      if (observer.current && currentLoaderRef) {
        observer.current.unobserve(currentLoaderRef)
      }
    }
  }, [loading, hasMore, fetchMoreProjects, currentPage])

  return (
    <>
      {projects.length === 0 && !hasMore && !loading ? (
        <Typography.Text
          style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}
        >
          没有找到项目。
        </Typography.Text>
      ) : (
        <List itemLayout="vertical" bordered>
          <ProjectList projects={projects} />
        </List>
      )}
      <div
        ref={loaderRef}
        style={{ height: '12px', textAlign: 'center', marginTop: '20px' }}
      >
        {loading && <Spin tip="加载中..." />}
        {!loading && !hasMore && projects.length > 0 && (
          <Typography.Text type="secondary">没有更多了</Typography.Text>
        )}
      </div>
    </>
  )
}
export default ProjectsClientRenderer
