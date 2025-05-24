import React from 'react'
import { List } from 'antd'
import { PaginatedResponse, ProjectBaseResponse } from '@/types'
import ProjectList from '@/components/ProjectList'
import { getBaseUrl } from '@/utils/urls'

const Home = async () => {
  const data = await fetch(`${getBaseUrl()}/api/projects`)
  const response = (await data.json()) as PaginatedResponse<ProjectBaseResponse>
  const projects = response.data.items
  return (
    <div className="w-dvw p-8">
      <List itemLayout="vertical" bordered>
        <ProjectList projects={projects} />
      </List>
    </div>
  )
}
export default Home
