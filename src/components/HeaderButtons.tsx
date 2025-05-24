'use client'
import { App, AutoComplete, Avatar, Button, Flex, Popover } from 'antd'
import Search from 'antd/es/input/Search'
import ThemeSwitcher from './ThemeSwitcher'
import Link from 'next/link'
import { CloudUploadOutlined } from '@ant-design/icons'
import useUserStore from '@/store/userStore'
import { useState } from 'react'
import ky from 'ky'
import { DataResponse, MessageResponse } from '@/types'
import { useDebounceFn } from '@reactuses/core'
import { useRouter } from 'next/navigation'
const HeaderButtons = () => {
  const [suggestions, setSuggestions] = useState<{ value: string }[]>([])
  const { message } = App.useApp()
  const router = useRouter()
  const searchForSuggest = async (value: string) => {
    const data = await ky<DataResponse<string[]>>('/api/projects/suggest', {
      searchParams: {
        keyword: value,
      },
    }).json()
    alert(JSON.stringify(data))
    setSuggestions(data.data.map((item) => ({ value: item })))
  }
  const { run: searchForSuggestDebounced } = useDebounceFn(
    searchForSuggest,
    1000,
  )
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  return (
    <Flex gap="small" className="leading-none">
      <AutoComplete
        className="w-36"
        options={suggestions}
        onSearch={searchForSuggestDebounced}
        placeholder="搜索开源项目"
      >
        <Search />
      </AutoComplete>
      <ThemeSwitcher />
      {user && (
        <Link href="/submit">
          <Button autoInsertSpace={false} icon={<CloudUploadOutlined />}>
            提交项目
          </Button>
        </Link>
      )}
      {!user && (
        <Link className="flex items-center" href="/login">
          <Button autoInsertSpace={false}>登录</Button>
        </Link>
      )}
      {user && (
        <Popover
          placement="bottomRight"
          content={
            <Flex gap="small">
              <Link href="/profile">
                <Button>个人中心</Button>
              </Link>
              <Button
                onClick={async () => {
                  const res = await ky
                    .post<MessageResponse>('/api/auth/logout')
                    .json()
                  if (res.code === 200) {
                    message.success('登出成功')
                    logout()
                    router.push('/')
                  } else {
                    message.error(res.message)
                  }
                }}
              >
                登出
              </Button>
            </Flex>
          }
          title={
            <Flex gap="small">
              <div>
                <p>
                  <b>{user.username}</b>
                </p>
                <p>{user.email}</p>
              </div>
            </Flex>
          }
        >
          <Avatar size={32} src={user.avatar} alt={user.username} />
        </Popover>
      )}
    </Flex>
  )
}

export default HeaderButtons
