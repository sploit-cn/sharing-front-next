'use client'
import { ProjectBaseResponse } from '@/types'
import { formatNumber } from '@/utils/numbers'
import { EyeOutlined, GithubOutlined, StarOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'
import Item from 'antd/es/list/Item'
import Paragraph from 'antd/es/typography/Paragraph'
import React from 'react'
import { Meta } from 'antd/es/list/Item'
import { GiteeIcon, IssuesIcon, LawIcon } from './icons'
import IconText from './IconText'
import { useRouter } from 'next/navigation'
import useUserStore from '@/store/userStore'
const ProjectListItem = ({ project }: { project: ProjectBaseResponse }) => {
  const router = useRouter()
  return (
    <Item
      key={project.id}
      actions={[
        <IconText
          icon={project.platform == 'GitHub' ? GithubOutlined : GiteeIcon}
          text={project.platform}
          key="list-vertical-gitee"
        />,
        <IconText
          icon={StarOutlined}
          text={formatNumber(project.stars)}
          key="list-vertical-stars"
        />,
        <IconText
          icon={IssuesIcon}
          text={formatNumber(project.issues)}
          key="list-vertical-issues"
        />,
        <IconText
          icon={EyeOutlined}
          text={formatNumber(project.view_count)}
          key="list-vertical-views"
        />,
        <IconText
          icon={LawIcon}
          text={project.license || 'Unknown'}
          key="list-vertical-license"
        />,
      ]}
      className="hover:bg-bghover active:bg-bgactive transition-colors duration-300"
      style={{
        opacity: project.is_approved ? 1 : 0.5,
        filter: project.is_approved ? 'none' : 'grayscale(100%)',
      }}
      onClick={() => {
        router.push(`/projects/${project.id}`)
      }}
    >
      <Meta
        avatar={<Avatar src={project.avatar} size={64} />}
        title={<span className="text-2xl">{project.name}</span>}
        description={<p className="truncate">{project.brief}</p>}
      />
      <Paragraph ellipsis={{ rows: 2 }}>{project.description}</Paragraph>
    </Item>
  )
}
const ProjectList = ({ projects }: { projects: ProjectBaseResponse[] }) => {
  const user = useUserStore((state) => state.user)
  return (
    <>
      {projects.map((project) => {
        if (
          !project.is_approved &&
          user?.role !== 'admin' &&
          user?.id !== project.submitter_id
        ) {
          return null
        }
        return <ProjectListItem project={project} key={project.id} />
      })}
    </>
  )
}

export default ProjectList
