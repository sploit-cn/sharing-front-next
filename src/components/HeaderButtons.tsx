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
  const [searchValue, setSearchValue] = useState('')
  const { message } = App.useApp()
  const router = useRouter()
  const searchForSuggest = async (value: string) => {
    const data = await ky<DataResponse<string[]>>('/api/projects/suggest', {
      searchParams: {
        keyword: value,
      },
    }).json()
    setSuggestions(data.data.map((item) => ({ value: item })))
  }
  const { run: searchForSuggestDebounced } = useDebounceFn(
    searchForSuggest,
    1000,
  )
  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(value.trim())}`)
    } else {
      router.push('/search')
    }
  }
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  return (
    <Flex gap="small" className="leading-none">
      <AutoComplete
        className="w-36"
        options={suggestions}
        onSearch={(text) => {
          searchForSuggestDebounced(text)
          setSearchValue(text)
        }}
        onSelect={(value) => {
          setSearchValue(value)
          handleSearch(value)
        }}
        placeholder="搜索开源项目"
        value={searchValue}
        onChange={(text) => setSearchValue(text)}
      >
        <Search onSearch={handleSearch} />
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
