import { DataResponse, ProjectFullResponse } from '@/types'
import { getBaseUrl } from '@/utils/urls'
import ky from 'ky'
import { redirect } from 'next/navigation'

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
  if (res.code === 200) {
    const project = res.data
    return <div>Project Name: {project.name}</div>
  } else {
    redirect('/404')
  }
}
