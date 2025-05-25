'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { List, Spin, Typography } from 'antd'
import { PaginatedResponse, ProjectBaseResponse } from '@/types'
import ProjectList from '@/components/ProjectList'

const HomePage = () => {
  const [projects, setProjects] = useState<ProjectBaseResponse[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [initialLoad, setInitialLoad] = useState<boolean>(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const fetchProjects = useCallback(
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
        setProjects((prevProjects) =>
          page === 1 ? data.data.items : [...prevProjects, ...data.data.items],
        )
        setCurrentPage(data.data.page)
        setHasMore(data.data.page < data.data.pages)
        if (page === 1) setInitialLoad(false)
      } catch (error) {
        console.error('Error fetching projects:', error)
        // Optionally, handle error state in UI
        setHasMore(false) // Stop trying if there's an error
      } finally {
        setLoading(false)
      }
    },
    [loading, hasMore],
  )

  useEffect(() => {
    fetchProjects(1) // Load initial data
  }, [fetchProjects]) // fetchProjects is stable due to useCallback

  useEffect(() => {
    if (loading || initialLoad || !hasMore) return

    const currentLoaderRef = loaderRef.current
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchProjects(currentPage + 1)
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
  }, [loading, hasMore, fetchProjects, currentPage, initialLoad])

  return (
    <div className="w-dvw p-8">
      {initialLoad && loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : projects.length === 0 && !hasMore ? (
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
      <div ref={loaderRef} style={{ height: '50px', textAlign: 'center' }}>
        {loading && !initialLoad && <Spin tip="加载中..." />}
        {!loading && !hasMore && projects.length > 0 && (
          <Typography.Text type="secondary">没有更多了</Typography.Text>
        )}
      </div>
    </div>
  )
}

export default HomePage
