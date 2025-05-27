# 用户信息 ( /profile ) - 功能与实现细节

本页面用于展示用户的个人资料、提交的项目、收藏、通知，并为管理员提供用户管理、项目审核和标签管理等功能。

## 功能概述

-   **用户登录验证**：进入页面前检查用户是否已登录，未登录则重定向到登录页。
-   **多卡片布局**：页面采用多卡片布局，分别展示不同模块的信息。
    -   左侧：用户基本信息卡片。
    -   右侧：用户提交的项目、收藏的项目、通知；管理员还能看到待审核项目、标签管理、用户管理等卡片。
-   **面包屑导航**：提供 "首页 > 用户信息" 的导航路径。

## 实现细节

### 1. 页面组件 (`src/app/profile/page.tsx`)

-   **组件名称**: `ProfilePage`
-   **类型**: 客户端组件 (`'use client'`)
-   **主要职责**:
    -   从 `useUserStore` 获取当前登录用户信息。
    -   使用 `useHydrated` 确保 Zustand store 已完成客户端水合。
    -   通过 `useEffect` 进行登录状态检查，未登录则跳转到 `/login`。
    -   管理页面整体的加载状态 (`loading`)。
    -   根据用户信息和用户角色 (`user.role`)，动态渲染不同的卡片组件。

### 2. 主要卡片组件 (位于 `src/components/profile/`)

#### 2.1. `UserProfileCard.tsx` (用户个人信息)

-   **功能**:
    -   显示用户头像、用户名、邮箱、角色、简介、GitHub/Gitee 绑定信息、注册和最后登录时间。
    -   允许用户编辑自己的头像URL、邮箱、简介。
    -   允许用户修改自己的登录密码。
-   **实现**:
    -   通过 `/api/users/me` (PUT) 更新个人信息。
    -   通过 `/api/users/me/password` (PUT) 修改密码。
    -   包含编辑模式和显示模式的切换。

#### 2.2. `UserProjectsCard.tsx` (我的项目)

-   **功能**: 显示当前用户提交的项目列表。
-   **实现**:
    -   通过 `/api/projects/my` 获取项目数据。
    -   列表展示项目头像、名称、审核状态 (如：待审核、已通过、已拒绝)、简述以及星标、查看数等信息。
    -   点击项目可跳转到项目详情页。

#### 2.3. `UserFavoritesCard.tsx` (我的收藏)

-   **功能**: 显示当前用户收藏的项目列表。
-   **实现**:
    -   通过 `/api/favorites` 获取收藏数据。
    -   列表展示项目头像、名称、简述、收藏时间。
    -   提供取消收藏功能，通过 `/api/projects/{projectId}/favorite` (DELETE) 实现。
    -   点击项目可跳转到项目详情页。

#### 2.4. `UserNotificationsCard.tsx` (我的通知)

-   **功能**: 显示用户的通知列表，并允许管理员发布全局公告。
-   **实现**:
    -   通过 `/api/notifications` 获取通知数据。
    -   列表展示通知内容、发送时间、已读/未读状态。
    -   提供查看详情 (会将通知标记为已读，通过 `/api/notifications/{id}` PUT)、删除通知 (通过 `/api/notifications/{id}` DELETE) 功能。
    -   管理员可发布公告，通过 `/api/notifications/broadcast` (POST) 实现。

#### 2.5. `UnapprovedProjectsCard.tsx` (未审核项目 - 管理员)

-   **功能**: (管理员专属) 显示等待审核的项目列表。
-   **实现**:
    -   通过 `/api/projects/unapproved` (或类似API) 获取数据。
    -   列表展示项目信息，点击可跳转到项目详情页进行审核操作。

#### 2.6. `TagManagementCard.tsx` (标签管理 - 管理员)

-   **功能**: (管理员专属) 允许管理员添加、编辑、删除全局标签。
-   **实现**:
    -   通过 `/api/tags` (GET) 获取所有标签。
    -   通过 `/api/tags` (POST) 创建新标签。
    -   通过 `/api/tags/{id}` (PUT) 更新标签。
    -   通过 `/api/tags/{id}` (DELETE) 删除标签。
    -   使用模态框进行标签的创建和编辑。

#### 2.7. `AdminUserManagement.tsx` (用户管理 - 管理员)

-   **功能**: (管理员专属) 提供用户列表，允许管理员编辑用户信息、修改用户密码、启用/禁用用户、向特定用户发送通知。
-   **实现**:
    -   通过 `/api/users` (或类似管理员API) 获取用户列表。
    -   使用表格 (`Table`) 展示用户信息。
    -   通过 `/api/users/{id}` (PUT) 更新用户信息 (email, bio, role, in_use)。
    -   通过 `/api/users/{id}/password` (PUT) 修改用户密码。
    -   通过 `/api/notifications/user` (POST) 向用户发送通知。
    -   使用模态框进行编辑、修改密码、发送通知等操作。

### 3. UI 与依赖

-   大量使用 Ant Design 组件，如 `Card`, `Row`, `Col`, `Spin`, `Breadcrumb`, `List`, `Avatar`, `Form`, `Modal`, `Table`, `Tag`, `Button` 等。
-   使用 `ky` 进行 API 请求。
-   依赖 `@/store/userStore` 获取用户状态。
-   依赖 `@/utils/useHydrated` 确保状态水合。
-   依赖自定义图标和工具函数。 