'use client'

import { useState, useEffect } from 'react'
import { Row, Col, Spin, App, Breadcrumb } from 'antd'
import useUserStore from '@/store/userStore'
import { useRouter } from 'next/navigation'
import UserProfileCard from '@/components/profile/UserProfileCard'
import UserProjectsCard from '@/components/profile/UserProjectsCard'
import UserFavoritesCard from '@/components/profile/UserFavoritesCard'
import UserNotificationsCard from '@/components/profile/UserNotificationsCard'
import AdminUserManagement from '@/components/profile/AdminUserManagement'
import { useHydrated } from '@/utils/useHydrated'
import { HomeOutlined } from '@ant-design/icons'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const { message } = App.useApp()
  const user = useUserStore((state) => state.user)
  const router = useRouter()
  const isHydrated = useHydrated()

  useEffect(() => {
    if (isHydrated && !user) {
      message.warning('请先登录')
      router.push('/login')
      return
    }
    setLoading(false)
  }, [user, router, message])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen min-w-4/5 py-8">
      <div className="mx-auto px-4">
        {/* 面包屑导航 */}
        <Breadcrumb
          className="project-breadcrumb mb-4!"
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
              title: '用户信息',
            },
          ]}
        />
        <Row gutter={[24, 24]}>
          {/* Left Sidebar - User Profile */}
          <Col xs={24} lg={6}>
            <UserProfileCard user={user} />
          </Col>

          {/* Right Side */}
          <Col xs={24} lg={18}>
            <div className="space-y-6!">
              {/* Top Section - Projects */}
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                  <UserProjectsCard userId={user.id} />
                </Col>
                <Col xs={24} xl={12}>
                  <UserFavoritesCard userId={user.id} />
                </Col>
              </Row>

              {/* Bottom Section - Notifications */}
              <UserNotificationsCard userId={user.id} />

              {/* Admin Section */}
              {user.role === 'admin' && <AdminUserManagement />}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}
