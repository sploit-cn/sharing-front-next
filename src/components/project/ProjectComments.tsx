'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Avatar,
  Button,
  Input,
  Space,
  Typography,
  Divider,
  Spin,
  App,
} from 'antd'
import {
  MessageOutlined,
  UserOutlined,
  SendOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { CommentResponse } from '@/types'
import ky from 'ky'
import useUserStore from '@/store/userStore'

const { TextArea } = Input
const { Text } = Typography

interface ProjectCommentsProps {
  projectId: number
  initialComments?: CommentResponse[]
}

interface CommentItemProps {
  comment: CommentResponse
  onReply: (parentId: number, content: string) => void
  level?: number
  onDelete?: (comment: CommentResponse) => void
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  level = 0,
  onDelete,
}) => {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { message } = App.useApp()
  const user = useUserStore((state) => state.user)

  const handleReply = async () => {
    if (!replyContent.trim()) {
      message.warning('请输入回复内容')
      return
    }

    setSubmitting(true)
    try {
      await onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReply(false)
      message.success('回复成功')
    } catch {
      message.error('回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  return (
    <div className={`${level > 0 ? 'mt-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar
          src={comment.user.avatar}
          icon={<UserOutlined />}
          size={level > 0 ? 32 : 40}
        />
        <div className="flex-1">
          <Card className="bg-bghover rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between">
              <Space>
                <Text strong className={level > 0 ? 'text-sm' : ''}>
                  {comment.user.username}
                </Text>
                {comment.user.bio && (
                  <Text type="secondary" className="text-xs">
                    {comment.user.bio}
                  </Text>
                )}
              </Space>
              <Text type="secondary" className="text-xs">
                {formatTime(comment.created_at)}
              </Text>
            </div>

            <Text
              className={`block ${level > 0 ? 'text-sm' : ''} whitespace-pre-wrap`}
            >
              {comment.content}
            </Text>

            <div className="mt-3 flex justify-between">
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => setShowReply(!showReply)}
                className="text-blue-500 hover:text-blue-600"
              >
                回复
              </Button>
              {comment.user.id === user?.id && (
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete?.(comment)}
                  className="text-red-500 hover:text-red-600"
                >
                  删除
                </Button>
              )}
            </div>
          </Card>

          {showReply && (
            <div className="mt-3 ml-4">
              <TextArea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`回复 @${comment.user.username}`}
                autoSize={{ minRows: 2 }}
                className="mb-2!"
              />
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  loading={submitting}
                  onClick={handleReply}
                >
                  发送
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setShowReply(false)
                    setReplyContent('')
                  }}
                >
                  取消
                </Button>
              </Space>
            </div>
          )}

          {/* 渲染子评论 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  level={level + 1}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function buildCommentTree(comments: CommentResponse[]) {
  // 创建一个映射，便于通过 id 快速查找评论
  const commentMap: Record<number, CommentResponse> = {}
  const tree: CommentResponse[] = []
  // 首先将所有评论存入 map
  comments.forEach((comment) => {
    comment.replies = [] // 初始化 replies 数组
    commentMap[comment.id] = comment
  })
  // 遍历评论，根据 parent_id 构建树结构
  comments.forEach((comment) => {
    if (comment.parent_id === null) {
      // 顶层评论直接加入 tree
      tree.push(comment)
    } else {
      // 非顶层评论加入其父评论的 replies 数组
      if (commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies?.push(comment)
      }
    }
  })

  return tree
}
const ProjectComments: React.FC<ProjectCommentsProps> = ({
  projectId,
  initialComments = [],
}) => {
  const [comments, setComments] = useState<CommentResponse[]>(initialComments)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const { message } = App.useApp()
  const user = useUserStore((state) => state.user)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ky
        .get(`/api/projects/${projectId}/comments`)
        .json<{
          data: CommentResponse[]
        }>()
      setComments(buildCommentTree(response.data))
    } catch {
      message.error('获取评论失败')
    } finally {
      setLoading(false)
    }
  }, [projectId, message])

  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [projectId, initialComments.length, fetchComments])

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning('请输入评论内容')
      return
    }

    setSubmitting(true)
    try {
      const response = await ky
        .post(`/api/projects/${projectId}/comment`, {
          json: { content: newComment },
        })
        .json<{ data: CommentResponse }>()

      setComments([...comments, response.data])
      setNewComment('')
      message.success('评论发表成功')
    } catch {
      message.error('发表评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: number, content: string) => {
    const response = await ky
      .post(`/api/projects/${projectId}/comment`, {
        json: { content, parent_id: parentId },
      })
      .json<{ data: CommentResponse }>()

    // 更新评论列表，将回复添加到对应的父评论下
    setComments((prevComments) => {
      const updateComments = (
        commentList: CommentResponse[],
      ): CommentResponse[] => {
        return commentList.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data],
            }
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComments(comment.replies),
            }
          }
          return comment
        })
      }
      return updateComments(prevComments)
    })
  }

  const handleDeleteComment = async (comment: CommentResponse) => {
    if (user?.role !== 'admin' && comment.user.id !== user?.id) {
      message.warning('您没有权限删除该评论')
      return
    }

    setSubmitting(true)
    try {
      await ky.delete(`/api/comments/${comment.id}`)
      message.success('删除成功')
      setComments((prevComments) => {
        function deleteCommentById(
          comments: CommentResponse[],
          targetId: number,
        ): CommentResponse[] {
          return comments
            .filter((comment) => comment.id !== targetId) // 过滤掉当前层级的匹配项
            .map((comment) => ({
              ...comment,
              replies: comment.replies
                ? deleteCommentById(comment.replies, targetId)
                : undefined,
            }))
        }
        return deleteCommentById(prevComments, comment.id)
      })
    } catch {
      message.error('删除失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 过滤出顶级评论（没有parent_id的）
  const topLevelComments = comments.filter((comment) => !comment.parent_id)

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <MessageOutlined />
          <span>评论 ({comments.length})</span>
        </div>
      }
      className="border-0 shadow-lg"
    >
      {/* 发表新评论 */}
      <div className="mb-6">
        <TextArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="发表你的看法..."
          autoSize={{ minRows: 4 }}
          className="mb-3!"
        />
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleAddComment}
          >
            发表评论
          </Button>
        </div>
      </div>

      <Divider />

      {/* 评论列表 */}
      <Spin spinning={loading}>
        {topLevelComments.length === 0 ? (
          <div className="py-8 text-center">
            <Text type="secondary">暂无评论，快来发表第一条评论吧！</Text>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </Spin>
    </Card>
  )
}

export default ProjectComments
