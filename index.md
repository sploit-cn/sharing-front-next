# 开源项目分享平台

## 项目简介

本项目是一个开源项目分享平台，旨在为用户提供一个发现、分享和交流优秀开源项目的社区。用户可以提交自己喜欢或开发的开源项目，对项目进行评论和评分，收藏感兴趣的项目，并与其他开发者互动。

平台分为前端和后端两部分：

*   **前端 (Next.js + TypeScript)**: 负责用户界面展示和交互，提供响应式设计，适配不同设备。使用 Ant Design 作为主要的 UI 组件库。
*   **后端 (FastAPI + Python)**: 提供 RESTful API 服务，处理业务逻辑、数据存储和用户认证等。

## 主要功能

*   **项目浏览与发现**:
    *   首页展示项目列表，支持无限滚动加载。
    *   项目详情页展示项目完整信息，包括：
        *   基本信息：名称、Logo、简介、平台 (GitHub/Gitee)、编程语言、开源协议、自定义标签。
        *   链接：源码链接、官方网站、下载链接。
        *   统计数据：星标数、Fork 数、查看数、Issue 数、创建/更新时间。
        *   详细描述和代码示例 (Markdown格式，代码高亮)。
        *   项目截图。
    *   (推测) 搜索功能，允许用户根据关键词、标签等搜索项目。
    *   (推测) 相关项目推荐。
*   **用户认证**:
    *   用户名/密码注册和登录。
    *   支持 GitHub 和 Gitee 第三方 OAuth 登录/注册。
    *   OAuth 首次登录且邮箱未注册时，引导用户补充信息完成注册。
*   **项目分享与提交 (`/submit`)**:
    *   用户可以提交新的开源项目。
    *   通过 GitHub/Gitee 仓库链接自动解析并预填部分项目信息 (名称、平台、Repo ID)。
    *   从远程仓库获取详细信息 (星标、Fork、协议等) 展示给用户。
    *   用户可编辑项目简称、详细描述 (Markdown)、代码示例 (Markdown)、选择标签、上传项目截图。
    *   提交的项目需要管理员审核。
*   **互动与评价 (项目详情页)**:
    *   **评论**: 用户可以对项目发表评论，查看他人评论，回复评论 (后端支持，前端组件 `ProjectComments` 实现)。
    *   **评分**: 用户可以对项目进行1-5星评分，查看项目平均分和评分人数 (前端组件 `ProjectRating` 实现)。
    *   **收藏**: 用户可以收藏/取消收藏项目 (前端组件 `ProjectFavorites` 实现)。
*   **用户中心 (`/profile`)**:
    *   **个人信息**: 展示用户头像、用户名、邮箱等 (`UserProfileCard`)。
    *   **我的项目**: 列出用户提交的项目 (`UserProjectsCard`)。
    *   **我的收藏**: 列出用户收藏的项目 (`UserFavoritesCard`)。
    *   **我的通知**: 查看收到的系统通知，支持标记已读和删除 (`UserNotificationsCard`)。
*   **管理员功能 (集成在用户中心或特定路由)**:
    *   **项目审核**: 审核用户提交的项目 (通过/驳回)，设置/取消精选项目 (前端组件 `UnapprovedProjectsCard` 和 `ProjectStatusControl`)。
    *   **用户管理**: 查看用户列表，(推测) 编辑用户信息、禁用/启用用户 (前端组件 `AdminUserManagement`)。
    *   **标签管理**: 创建、编辑、删除项目标签 (前端组件 `TagManagementCard`)。
    *   **通知管理**: 发送广播通知或针对特定用户的通知。
    *   (推测) 图片管理、数据同步等。

## 技术栈

**前端 (`sharing-front-next`):**

*   Next.js (React 框架, App Router)
*   TypeScript
*   Ant Design (UI 组件库)
*   ky (HTTP客户端)
*   Zustand (状态管理, `useUserStore`)
*   react-markdown (Markdown 渲染)
*   rehype-highlight (Markdown 代码高亮)
*   Tailwind CSS (从 `globals.css` 和 `postcss.config.mjs` 配置推测，实际使用情况需检查具体组件样式)

**后端 (`sharing`):**

*   FastAPI (Python Web 框架)
*   Tortoise ORM (异步 ORM)
*   PostgreSQL / MySQL (具体数据库由 `config.py` 中的 `DB_URL` 决定)
*   Elasticsearch (用于项目搜索和建议，通过 `tasks/elastic_sync.py` 同步)
*   Pydantic (数据校验与序列化)
*   JWT (用户认证)
*   Passlib (密码哈希)

## 目录结构 (主要)

**前端 (`sharing-front-next/src`):**
app/
├── (main)/ # 路由组，可能包含通用布局或逻辑
│ ├── layout.tsx # 主布局 (Header, Content, Footer)
│ └── page.tsx # 首页 (项目列表展示)
├── login/
│ └── page.tsx # 登录/注册页
├── oauth-failure/
│ └── page.tsx # OAuth 失败提示页
├── oauth-register/
│ └── page.tsx # OAuth 首次登录注册页
├── oauth-success/
│ └── page.tsx # OAuth 成功中转页
├── profile/
│ └── page.tsx # 用户中心页
├── projects/
│ └── [id]/
│ └── page.tsx # 项目详情页 (动态路由)
├── submit/
│ └── page.tsx # 提交项目页
├── globals.css # 全局样式
└── layout.tsx # 根布局 (html, body, AntdProvider)
components/ # 可复用UI组件
├── profile/ # 用户中心相关组件
├── project/ # 项目详情页相关组件
├── HeaderButtons.tsx # 页头按钮组
├── ProjectsClientRenderer.tsx # 首页项目列表客户端渲染器
├── CodeBlock.tsx # Markdown代码块高亮组件
└── ...
lib/ # Next.js 特定库或配置 (较少内容)
store/
└── userStore.ts # Zustand 用户状态管理
themes/ # 主题配置 (可能用于 Ant Design)
types/ # TypeScript 类型定义 (接口、枚举等)
utils/ # 通用工具函数 (URL处理、数字格式化、useHydrated hook等)


**后端 (`sharing`):**
api/
├── endpoints/ # 各模块API具体实现 (FastAPI APIRouter)
│ ├── auth.py
│ ├── comments.py
│ ├── favorites.py
│ ├── images.py
│ ├── notifications.py
│ ├── projects.py
│ ├── ratings.py
│ ├── tags.py
│ └── users.py
└── router.py # 聚合所有 endpoints 的主路由
core/ # 核心模块
├── exceptions/ # 自定义异常类
└── config.py # 应用配置 (通过Settings类加载环境变量)
models/
└── models.py # Tortoise ORM 数据模型定义 (User, Project, Tag, Comment, etc.)
schemas/ # Pydantic 数据模型 (用于请求/响应体验证和序列化)
├── comments.py
├── common.py # 通用响应模型 (DataResponse, PaginatedResponse, etc.)
└── ... (其他模块的schema)
services/ # 服务层 (封装业务逻辑)
├── auth_service.py
├── comment_service.py
└── ... (其他模块的服务)
tasks/
└── elastic_sync.py # Elasticsearch 数据同步任务
utils/ # 通用工具和辅助函数
├── github_api.py # GitHub API 客户端
├── gitee_api.py # Gitee API 客户端
├── security.py # 安全相关 (密码处理, JWT, OAuth依赖)
└── time.py # 时间工具
main.py # FastAPI 应用入口 (创建app, 挂载路由, 中间件等)
config.py # (此文件实际为core/config.py的引用或早期版本，配置在core/config.py)

# API 接口文档

本文档详细描述了“开源项目分享平台”后端提供的所有 API 接口。

## 基础URL

所有API均相对于后端服务的基础URL。例如 `http://localhost:8000/api`。
所有响应都包含 `code` (200表示成功) 和 `message` 字段。成功时数据在 `data` 字段中。

## 认证 (Auth)

**路由前缀**: `/auth`

### `POST /login`
*   **描述**: 用户通过用户名和密码登录。
*   **请求体**: `schemas.users.UserLogin` (`username`, `password`)
*   **响应**: `schemas.common.DataResponse[LoginResponse]`
    *   `LoginResponse` (自定义模型): `access_token: str`, `token_type: str = "bearer"`, `user: schemas.users.UserResponse`
    *   成功时会在 HTTPOnly Cookie 中设置 `user_token`。
*   **错误**: `401 AuthenticationError` (用户名或密码错误), `403 PermissionDeniedError` (用户禁用)。

### `POST /login_form`
*   **描述**: 用户通过表单登录 (主要用于 FastAPI/Swagger UI 的 OAuth2PasswordBearer)。
*   **请求体**: `OAuth2PasswordRequestForm` (`username`, `password`)
*   **响应**: `LoginResponse` (同上, 但不设置Cookie，直接返回Token)。
*   **错误**: `HTTPException 401/403`.

### `POST /register`
*   **描述**: 用户注册。
*   **请求体**: `schemas.users.UserCreate` (`username`, `email`, `password`)
*   **响应**: `schemas.common.DataResponse[LoginResponse]` (注册成功后自动登录)。
*   **错误**: `409 ResourceConflictError` (用户名或邮箱已存在)。

### `POST /logout`
*   **描述**: 用户登出。
*   **请求体**: 无
*   **响应**: `schemas.common.MessageResponse` (`message: "登出成功"`)
    *   清除 `user_token` 和 `oauth_token` Cookie。

### `GET /github`
*   **描述**: 获取 GitHub OAuth 授权 URL。
*   **响应**: `schemas.common.DataResponse[str]` (包含 GitHub 授权 URL)。

### `GET /github/callback`
*   **描述**: GitHub OAuth 授权回调。
*   **参数 (Query)**: `code: str` (GitHub 返回的授权码)
*   **行为**:
    1.  用 `code` 获取 GitHub token，再获取 GitHub 用户信息。
    2.  若用户已通过 GitHub ID 关联平台账户: 更新信息，生成平台JWT，设 `user_token` Cookie, 重定向到前端 `/oauth-success?token={jwt_token}`。
    3.  若用户GitHub邮箱已在平台注册但未关联: 绑定GitHub信息，登录并重定向。
    4.  全新用户: 生成临时 `oauth_token` (含GitHub信息)，设 `oauth_token` Cookie, 重定向到前端 `/oauth-register?token={oauth_token}&email={github_email}`。
*   **错误**: 失败则重定向到前端 `/oauth-failure?message={error_message}`。

### `GET /gitee`
*   **描述**: 获取 Gitee OAuth 授权 URL。
*   **响应**: `schemas.common.DataResponse[str]` (包含 Gitee 授权 URL)。

### `GET /gitee/callback`
*   **描述**: Gitee OAuth 授权回调。
*   **行为**: 逻辑同 `GET /github/callback`。

### `POST /oauth-register`
*   **描述**: OAuth 用户首次登录时，补充信息完成注册。
*   **安全**: 需要有效的临时 `oauth_token` (通过 `Authorization: Bearer <token>` 请求头传递，该 token 从前端 `/oauth-register` 页面的 URL 参数获取)。
*   **请求体**: `schemas.users.UserCreate` (`username`, `email`, `password`)
*   **响应**: `schemas.common.DataResponse[LoginResponse]` (注册成功后自动登录)。
*   **错误**: `401 AuthenticationError` (无效 OAuth token), `409 ResourceConflictError` (用户名或邮箱已占用)。

## 用户 (Users)

**路由前缀**: `/users`
**安全**: 大部分接口需要登录 (`verify_current_user`)，特定操作需要管理员权限 (`verify_current_admin_user`)。

### `GET /me`
*   **描述**: 获取当前登录用户的详细信息。
*   **安全**: `verify_current_user`
*   **响应**: `schemas.common.DataResponse[schemas.users.UserResponse]`

### `PUT /me`
*   **描述**: 更新当前登录用户的信息。
*   **安全**: `verify_current_user`
*   **请求体**: `schemas.users.UserUpdate` (可更新 `nickname`, `avatar`, `bio`, `github_name`, `gitee_name`)
*   **响应**: `schemas.common.DataResponse[schemas.users.UserResponse]`

### `PUT /me/password`
*   **描述**: 当前登录用户修改自己的密码。
*   **安全**: `verify_current_user`
*   **请求体**: `schemas.users.UserUpdatePassword` (`old_password`, `new_password`)
*   **响应**: `schemas.common.MessageResponse` (`message: "用户密码更新成功"`)
*   **错误**: `401 AuthenticationError` (旧密码错误)。

### `GET /` (即 `/users`)
*   **描述**: 获取用户列表 (管理员权限)。
*   **安全**: `verify_current_admin_user`
*   **参数 (Query)**: `schemas.users.UserPaginationParams` (分页、排序、筛选)
*   **响应**: `schemas.common.PaginatedResponse[schemas.users.UserResponse]`

### `GET /{user_id}`
*   **描述**: 获取指定 ID 用户的信息 (任何登录用户均可访问)。
*   **安全**: `verify_current_user` (虽然代码中没显式加，但路由通常会经过全局依赖)
*   **响应**: `schemas.common.DataResponse[schemas.users.UserResponse]`
*   **错误**: `404 ResourceNotFoundError`

### `PUT /{user_id}`
*   **描述**: 管理员更新指定用户的信息。
*   **安全**: `verify_current_admin_user`
*   **请求体**: `schemas.users.UserUpdateByAdmin` (可更新 `UserUpdate` 字段外加 `role`, `in_use`)
*   **响应**: `schemas.common.DataResponse[schemas.users.UserResponse]`

### `PUT /{user_id}/password`
*   **描述**: 管理员为指定用户重置密码。
*   **安全**: `verify_current_admin_user`
*   **请求体**: `schemas.users.AdminUpdatePassword` (`new_password`)
*   **响应**: `schemas.common.MessageResponse` (`message: "用户密码更新成功"`)

## 项目 (Projects)

**路由前缀**: `/projects`

### `GET /` (即 `/projects`)
*   **描述**: 获取项目列表，支持分页、排序和筛选。
*   **参数 (Query)**: `schemas.projects.ProjectPaginationParams` (包含 `page`, `page_size`, `order_by`, `order`, `tags` (ID列表), `platform`, `language`, `is_approved`, `is_featured`, `submitter_id`)
*   **响应**: `schemas.common.PaginatedResponse[schemas.projects.ProjectBaseResponse]`

### `POST /` (即 `/projects`)
*   **描述**: 用户提交新项目。
*   **安全**: `verify_current_user`
*   **请求体**: `schemas.projects.ProjectCreate` (包含 `platform`, `repo_id`, `name`, `brief`, `description` (Markdown), `project_url`, `doc_url`, `demo_url`, `cover_image` (URL), `code_example` (Markdown), `tag_ids` (ID列表), `image_ids` (ID列表，关联已上传图片))
*   **行为**:
    1.  从 GitHub/Gitee 获取仓库详情并与提交信息合并。
    2.  创建项目记录 (初始 `is_approved=False`)。
    3.  通知管理员和提交者。
    4.  后台任务同步到 Elasticsearch。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`
*   **错误**: `400` (例如项目已存在，通过 platform 和 repo_id 判断)

### `GET /my`
*   **描述**: 获取当前登录用户提交的或作为项目所有者 (通过platform_id匹配) 的项目列表。
*   **安全**: `verify_current_user`
*   **响应**: `schemas.common.DataResponse[list[schemas.projects.ProjectBaseResponse]]`

### `GET /unapproved`
*   **描述**: 管理员获取待审核的项目列表。
*   **安全**: `verify_current_admin_user`
*   **响应**: `schemas.common.DataResponse[list[schemas.projects.ProjectBaseResponse]]`

### `GET /search`
*   **描述**: 根据关键词等从 Elasticsearch 搜索项目，返回项目 ID 列表。
*   **参数 (Query)**: `schemas.projects.ProjectSearchParams` (`keyword`, `tags` (名称列表), `platform`, `language`, `order_by`, `order`)
*   **响应**: `schemas.common.DataResponse[list[int]]` (项目 ID 列表)

### `GET /suggest`
*   **描述**: 根据关键词获取项目名称建议 (用于搜索框自动完成)。
*   **参数 (Query)**: `keyword: str`
*   **响应**: `schemas.common.DataResponse[list[str]]`

### `GET /repo_detail`
*   **描述**: 根据平台和仓库 ID (如 `owner/repo_name`) 获取远程仓库的详细信息。
*   **参数 (Query)**: `platform: models.Platform` (enum), `repo_id: str`
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectRepoDetail]`
*   **错误**: `404 ResourceNotFoundError` (若仓库不存在或API调用失败)

### `GET /{project_id}`
*   **描述**: 获取指定 ID 项目的完整信息。
*   **行为**: 每次请求会增加项目浏览次数 (`view_count`)。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`
*   **错误**: `404 ResourceNotFoundError`

### `PUT /my/{project_id}`
*   **描述**: 项目提交者或所有者更新自己项目的信息。
*   **安全**: `verify_current_user`
    *   提交者: 仅在项目未审核通过 (`is_approved=False`) 时可修改。
    *   项目所有者 (通过匹配 GitHub/Gitee ID): 可随时修改。
*   **请求体**: `schemas.projects.ProjectOwnerUpdate` (可更新 `name`, `brief`, `description`, `project_url`, `doc_url`, `demo_url`, `cover_image`, `code_example`, `tag_ids`, `image_ids`)
*   **行为**: 通知管理员，后台任务同步到 Elasticsearch。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`
*   **错误**: `403 PermissionDeniedError`, `404 ResourceNotFoundError`

### `PUT /{project_id}`
*   **描述**: 管理员更新指定项目信息。
*   **安全**: `verify_current_admin_user`
*   **请求体**: `schemas.projects.ProjectAdminUpdate` (可更新 `ProjectOwnerUpdate` 字段外加 `is_approved`, `approved_at`, `is_featured`, `featured_at`, `is_pinned`)
*   **行为**: 后台任务同步到 Elasticsearch。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`

### `DELETE /{project_id}`
*   **描述**: 管理员删除指定项目。
*   **安全**: `verify_current_admin_user`
*   **行为**: 从数据库删除，后台任务从 Elasticsearch 删除。
*   **响应**: `schemas.common.MessageResponse` (`message: "项目删除成功"`)

### `PUT /{project_id}/approve`
*   **描述**: 管理员审核通过项目。
*   **安全**: `verify_current_admin_user`
*   **行为**: 设置 `is_approved=True`, `approved_at=now()`. 通知提交者。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`

### `PUT /{project_id}/reject`
*   **描述**: 管理员驳回项目 (标记为未通过，但项目本身不删除，状态可能仍是 `is_approved=False` 或有特定拒绝状态)。
*   **安全**: `verify_current_admin_user`
*   **行为**: (当前实现仅更新项目，未明确拒绝状态字段，但会通知提交者)
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`

### `PUT /{project_id}/feature`
*   **描述**: 管理员设置项目为精选。
*   **安全**: `verify_current_admin_user`
*   **行为**: 设置 `is_featured=True`, `featured_at=now()`. 通知提交者。同步到 Elasticsearch。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`

### `PUT /{project_id}/unfeature`
*   **描述**: 管理员取消项目精选。
*   **安全**: `verify_current_admin_user`
*   **行为**: 设置 `is_featured=False`. 通知提交者。同步到 Elasticsearch。
*   **响应**: `schemas.common.DataResponse[schemas.projects.ProjectFullResponse]`

---
(API 文档的其他部分：Comments, Ratings, Favorites, Notifications, Tags, Images 将遵循类似格式进行补充)
---

## 评论 (Comments)

**路由前缀**: `/comments` (针对单个评论的操作)
             `/projects/{project_id}/comment` (在项目下创建评论)

### `POST /projects/{project_id}/comment`
*   **描述**: 用户在指定项目下发表评论。
*   **安全**: `verify_current_user`
*   **路径参数**: `project_id: int`
*   **请求体**: `schemas.comments.CommentCreate` (`content: str`, `parent_id: Optional[int] = None` 用于回复)
*   **行为**:
    1.  创建评论。
    2.  如果 `parent_id` 存在 (是回复)，通知被回复的评论者。
    3.  否则 (是新评论)，通知项目提交者。
*   **响应**: `schemas.common.DataResponse[schemas.comments.CommentResponse]`

### `GET /projects/{project_id}/comments`
*   **描述**: 获取指定项目下的所有评论 (通常是根评论，回复通过其他接口获取或嵌套返回)。
*   **路径参数**: `project_id: int`
*   **响应**: `schemas.common.DataResponse[list[schemas.comments.CommentResponse]]`

### `GET /comments/{comment_id}`
*   **描述**: 获取单条评论的详细信息。
*   **路径参数**: `comment_id: int`
*   **响应**: `schemas.common.DataResponse[schemas.comments.CommentResponse]`

### `GET /comments/{comment_id}/replies`
*   **描述**: 获取某条评论的所有直接回复。
*   **路径参数**: `comment_id: int`
*   **响应**: `schemas.common.DataResponse[list[schemas.comments.CommentResponse]]`

### `PUT /comments/{comment_id}`
*   **描述**: 更新评论内容。
*   **安全**: 评论者本人 (`comment.user.id == payload.id`) 或管理员 (`payload.role == Role.ADMIN`)。
*   **路径参数**: `comment_id: int`
*   **请求体**: `schemas.comments.CommentUpdate` (`content: str`)
*   **响应**: `schemas.common.DataResponse[schemas.comments.CommentResponse]`
*   **错误**: `403 PermissionDeniedError`

### `DELETE /comments/{comment_id}`
*   **描述**: 删除评论。
*   **安全**: 评论者本人或管理员。
*   **路径参数**: `comment_id: int`
*   **响应**: `schemas.common.MessageResponse` (`message: "评论删除成功"`)
*   **错误**: `403 PermissionDeniedError`

## 评分 (Ratings)

**路由前缀**: `/ratings` (针对评分的特殊操作)
             `/projects/{project_id}/rating` (在项目下创建/更新评分)
             `/projects/{project_id}/ratings` (获取项目评分分布)
             `/projects/{project_id}/my-rating` (获取我的评分)

### `POST /projects/{project_id}/rating`
*   **描述**: 用户为项目创建评分 (如果之前未评分)。
*   **安全**: `verify_current_user`
*   **路径参数**: `project_id: int`
*   **请求体**: `schemas.ratings.RatingCreate` (`score: int` 1-5)
*   **响应**: `schemas.common.DataResponse[schemas.ratings.RatingModifiedResponse]` (包含创建/更新的评分记录和项目新的平均分/数量)
*   **行为**: 如果用户已对该项目评分，此接口行为类似更新，但 `projects.py` 中分开定义了 `create_rating` 和 `update_rating` 调用不同的 service 方法。

### `PUT /projects/{project_id}/rating`
*   **描述**: 用户更新已有的项目评分。
*   **安全**: `verify_current_user`
*   **路径参数**: `project_id: int`
*   **请求体**: `schemas.ratings.RatingUpdate` (`score: int` 1-5)
*   **响应**: `schemas.common.DataResponse[schemas.ratings.RatingModifiedResponse]`
*   **错误**: `404 ResourceNotFoundError` (如果用户之前未对该项目评分)

### `GET /projects/{project_id}/ratings`
*   **描述**: 获取指定项目的评分分布 (例如，各星级评分数量)。
*   **路径参数**: `project_id: int`
*   **响应**: `schemas.common.DataResponse[schemas.ratings.RatingDistributionResponse]` (包含 `total_ratings`, `average_rating`, `distribution` (字典，key为1-5星，value为数量))

### `GET /projects/{project_id}/my-rating`
*   **描述**: 获取当前登录用户对指定项目的评分。
*   **安全**: `verify_current_user`
*   **路径参数**: `project_id: int`
*   **响应**: `schemas.common.DataResponse[schemas.ratings.RatingResponse]`
*   **错误**: `404 ResourceNotFoundError` (如果用户未对该项目评分)

### `GET /ratings/sync`
*   **描述**: 同步项目评分的统计数据 (管理员接口)。
*   **安全**: `verify_current_admin_user`
*   **行为**: 调用 `RatingService.sync_rating()` 重新计算并更新所有项目的平均分和评分总数。
*   **响应**: `schemas.common.MessageResponse` (`message: "评分同步成功"`)

## 收藏 (Favorites)

**路由前缀**: `/favorites` (获取我的收藏列表)
             `/projects/{project_id}/favorite` (收藏/取消收藏项目)

### `POST /projects/{project_id}/favorite`
*   **描述**: 用户收藏项目。
*   **安全**: `verify_current_user`
*   **路径参数**: `project_id: int`
*   **响应**: `schemas.common.DataResponse[schemas.favorites.FavoriteResponse]`
*   **错误**: `409 ResourceConflictError` (如果已收藏)

### `DELETE /projects/{project_id}/favorite`
*   **描述**: 用户取消收藏项目。
*   **安全**: `verify_current_user`
*   **路径参数**: `project_id: int`
*   **响应**: `schemas.common.MessageResponse` (`message: "取消收藏成功"`)
*   **错误**: `404 ResourceNotFoundError` (如果未收藏)

### `GET /projects/{project_id}/favorites`
*   **描述**: 获取收藏了指定项目的用户列表 (简要信息)。
*   **路径参数**: `project_id: int`
*   **响应**: `schemas.common.DataResponse[list[schemas.favorites.FavoriteUserResponse]]`

### `GET /favorites`
*   **描述**: 获取当前登录用户收藏的所有项目列表。
*   **安全**: `verify_current_user`
*   **响应**: `schemas.common.DataResponse[list[schemas.favorites.FavoriteProjectResponse]]` (包含项目详情)


## 通知 (Notifications)

**路由前缀**: `/notifications`

### `GET /` (即 `/notifications`)
*   **描述**: 获取当前登录用户的通知列表。
*   **安全**: `verify_current_user`
*   **响应**: `schemas.common.DataResponse[list[schemas.notifications.NotificationResponse]]`

### `POST /broadcast`
*   **描述**: 管理员创建广播通知 (发送给所有用户)。
*   **安全**: `verify_current_admin_user`
*   **请求体**: `schemas.notifications.NotificationBroadcastCreate` (`content: str`)
*   **响应**: `schemas.common.MessageResponse` (`message: "通知已创建"`)

### `POST /user`
*   **描述**: 管理员创建针对特定用户的通知。
*   **安全**: `verify_current_admin_user`
*   **请求体**: `schemas.notifications.NotificationUserCreate` (`content: str`, `user_id: int`)
*   **响应**: `schemas.common.MessageResponse` (`message: "通知已创建"`)

### `PUT /{notification_id}`
*   **描述**: 用户将指定通知标记为已读。
*   **安全**: `verify_current_user` (且通知属于该用户)
*   **路径参数**: `notification_id: int`
*   **响应**: `schemas.common.MessageResponse` (`message: "已读"`)
*   **错误**: `403 PermissionDeniedError` (若通知不属于该用户)

### `PUT /all`
*   **描述**: 用户将所有未读通知标记为已读。
*   **安全**: `verify_current_user`
*   **响应**: `schemas.common.MessageResponse` (`message: "已读"`)

### `DELETE /{notification_id}`
*   **描述**: 用户删除指定通知。
*   **安全**: `verify_current_user` (且通知属于该用户)
*   **路径参数**: `notification_id: int`
*   **响应**: `schemas.common.MessageResponse` (`message: "删除成功"`)
*   **错误**: `403 PermissionDeniedError`

## 标签 (Tags)

**路由前缀**: `/tags`

### `GET /` (即 `/tags`)
*   **描述**: 获取所有标签列表。
*   **响应**: `schemas.common.DataResponse[list[schemas.tags.TagResponse]]`

### `GET /{tag_id}`
*   **描述**: 获取指定 ID 的标签信息。
*   **路径参数**: `tag_id: int`
*   **响应**: `schemas.common.DataResponse[schemas.tags.TagResponse]`
*   **错误**: `404 ResourceNotFoundError`

### `POST /` (即 `/tags`)
*   **描述**: 管理员创建新标签。
*   **安全**: `verify_current_admin_user`
*   **请求体**: `schemas.tags.TagCreate` (`name: str`, `description: Optional[str] = None`)
*   **响应**: `schemas.common.DataResponse[schemas.tags.TagResponse]`
*   **错误**: `409 ResourceConflictError` (标签名已存在)

### `PUT /{tag_id}`
*   **描述**: 管理员更新标签信息。
*   **安全**: `verify_current_admin_user`
*   **路径参数**: `tag_id: int`
*   **请求体**: `schemas.tags.TagUpdate` (`name: Optional[str] = None`, `description: Optional[str] = None`)
*   **响应**: `schemas.common.DataResponse[schemas.tags.TagResponse]`
*   **错误**: `409 ResourceConflictError` (新标签名已存在)

### `DELETE /{tag_id}`
*   **描述**: 管理员删除标签。
*   **安全**: `verify_current_admin_user`
*   **路径参数**: `tag_id: int`
*   **响应**: `schemas.common.MessageResponse` (`message: "标签删除成功"`)

## 图片 (Images)

**路由前缀**: `/images`

### `POST /upload`
*   **描述**: 上传图片。图片与上传用户关联，可选择关联到某个项目。
*   **安全**: `verify_current_user`
*   **请求体 (Form Data)**:
    *   `file: UploadFile` (图片文件)
    *   `project_id: Optional[int]` (可选，关联的项目ID)
*   **行为**: 图片保存到服务器 (`Settings.IMAGES_DIR`)，文件名UUID化，数据库记录图片信息。
*   **响应**: `schemas.common.DataResponse[schemas.images.ImageResponse]`
*   **错误**: `415 FileTypeNotAllowedError` (如果不是图片类型)

### `DELETE /clean`
*   **描述**: 清理当前用户上传的、但未关联到任何项目 (`project_id is None`) 的图片。
*   **安全**: `verify_current_user`
*   **行为**: 删除文件系统中的图片文件和数据库记录。
*   **响应**: `schemas.common.MessageResponse` (`message: "图片清理成功"`)

### `DELETE /{image_id}`
*   **描述**: 删除指定的图片。
*   **安全**: `verify_current_user` (当前实现允许用户删除自己上传的任何图片，无论是否关联项目，需要确认这是否是预期行为)。
*   **路径参数**: `image_id: int`
*   **行为**: 删除文件系统中的图片文件和数据库记录。
*   **响应**: `schemas.common.MessageResponse` (`message: "图片删除成功"`)
*   **错误**: `404 ResourceNotFoundError`

---


## 潜在的进一步探索/确认点

*   前端搜索页面的具体实现 (`src/app/search/page.tsx` 未在初始列表，但后端有 `/projects/search` 和 `/projects/suggest` API)。
*   前端状态管理库 (`src/store/`) 是否仅用了 Zustand，或有其他。
*   `config.py` (根目录) 与 `core/config.py` 的关系，后者似乎是实际的配置加载点。
*   数据库的具体类型 (PostgreSQL/MySQL) 取决于环境变量 `DB_URL`。
*   后台任务的具体执行方式 (e.g., Celery, ARQ, or FastAPI BackgroundTasks for simple cases like ES sync)。从代码看，`BackgroundTasks` 被用于部分 ES 同步。

## 快速开始

(待补充详细的本地开发环境搭建、依赖安装和启动命令)

---

