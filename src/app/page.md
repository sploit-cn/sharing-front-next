# 首页 (/) - 功能与实现细节

本页面是应用的主页，主要用于展示项目列表。

## 功能概述

-   **项目列表展示**：默认按更新时间降序显示项目。
-   **无限滚动加载**：当用户滚动到页面底部时，会自动加载更多项目。
-   **初始数据服务端渲染 (SSR)**：首页的初始项目数据在服务器端获取，以优化首次加载速度和 SEO。
-   **加载状态与错误处理**：
    -   在加载初始数据或后续数据时，会显示加载指示。
    -   如果初始数据加载失败，会向用户显示错误提示。
    -   如果没有项目，会显示 "没有找到项目。" 的提示。
    -   当所有项目加载完毕，会显示 "没有更多了" 的提示。

## 实现细节

### 1. 页面组件 (`src/app/page.tsx`)

-   **组件名称**: `HomePage`
-   **类型**: 服务器组件 (Server Component)
-   **主要职责**:
    -   在服务器端通过 API `/api/projects?page=1&page_size=10&order_by=updated_at&order=desc` 获取第一页的项目数据。
    -   处理数据获取过程中的潜在错误。
    -   将获取到的初始项目数据 (`initialProjects`)、当前页码 (`initialCurrentPage`) 和总页数 (`initialTotalPages`) 传递给客户端组件 `ProjectsClientRenderer`。
    -   如果获取初始项目失败且没有项目数据，则显示错误信息。

### 2. 客户端渲染与交互组件 (`src/components/ProjectsClientRenderer.tsx`)

-   **组件名称**: `ProjectsClientRenderer`
-   **类型**: 客户端组件 (`'use client'`)
-   **主要职责**:
    -   接收来自 `HomePage` 的初始项目数据和分页信息。
    -   使用 `React.useState` 管理项目列表 (`projects`)、当前页 (`currentPage`)、加载状态 (`loading`) 和是否有更多项目 (`hasMore`)。
    -   **无限滚动**:
        -   通过 `IntersectionObserver` API 监测一个位于列表底部的不可见元素 (`loaderRef`) 是否进入视口。
        -   当该元素可见、仍有更多项目 (`hasMore` 为 true) 且当前不在加载中 (`loading` 为 false) 时，调用 `fetchMoreProjects` 方法。
    -   **`fetchMoreProjects(page: number)` 方法**:
        -   异步从 `/api/projects?page={page}&page_size=10&order_by=updated_at&order=desc` 获取指定页码的项目数据。
        -   成功获取数据后，将新项目追加到现有 `projects` 列表，并更新 `currentPage` 和 `hasMore` 状态。
        -   处理API请求错误，并在出错时将 `hasMore` 设置为 `false`。
        -   在请求开始和结束时更新 `loading` 状态。
    -   将整理好的项目列表数据传递给 `ProjectList` 组件进行渲染。
    -   根据加载状态和是否有更多数据，显示加载指示器 (`Spin`) 或 "没有更多了" 的提示。
    -   如果最终项目列表为空，显示 "没有找到项目。"

### 3. 项目列表渲染组件 (`src/components/ProjectList.tsx`)

此组件包含两个子组件：`ProjectListItem` 和 `ProjectList`。

#### 3.1. `ProjectList`

-   **组件名称**: `ProjectList`
-   **类型**: 客户端组件 (`'use client'`)
-   **主要职责**:
    -   接收 `projects` (项目对象数组) 作为属性。
    -   从 Zustand 状态管理器 (`useUserStore`) 获取当前登录用户的信息。
    -   遍历 `projects` 数组，为每个项目渲染一个 `ProjectListItem` 组件。
    -   **权限控制**:
        -   如果一个项目尚未被批准 (`project.is_approved` 为 `false`)，并且当前用户既不是管理员 (`user?.role !== 'admin'`) 也不是该项目的提交者 (`user?.id !== project.submitter_id`)，则该项目不会被渲染。
    -   **精选项目**:
        -   如果项目被标记为精选 (`project.is_featured` 为 `true`)，则在其 `ProjectListItem` 外包裹一个 Ant Design 的 `Ribbon` 组件，并显示 "精选" 标识。

#### 3.2. `ProjectListItem`

-   **组件名称**: `ProjectListItem`
-   **类型**: 客户端组件 (`'use client'`)
-   **主要职责**:
    -   接收单个 `project` 对象作为属性，并展示其详细信息。
    -   使用 Ant Design 的 `List.Item` (`Item`) 作为基本布局。
    -   **显示内容**:
        -   项目头像 (`Avatar`)
        -   项目名称 (`Meta` title)
        -   项目简述 (`Meta` description, 截断单行)
        -   项目详细描述 (`Paragraph`, 最多显示两行，超出部分省略)
    -   **底部操作/信息栏 (`actions`)**:
        -   使用自定义的 `IconText` 组件展示以下信息：
            -   平台来源 (GitHub 或 Gitee，根据 `project.platform` 判断，使用 `GithubOutlined` 或自定义的 `GiteeIcon`)
            -   星标数 (`StarOutlined`, 使用 `formatNumber` 工具函数格式化数字)
            -   Issue 数 (自定义的 `IssuesIcon`, 使用 `formatNumber` 格式化数字)
            -   查看次数 (`EyeOutlined`, 使用 `formatNumber` 格式化数字)
            -   许可证信息 (自定义的 `LawIcon`, 显示 `project.license` 或 'Unknown')
    -   **样式与交互**:
        -   鼠标悬浮和激活时有背景色过渡效果。
        -   如果项目未经批准 (`!project.is_approved`)，其透明度会降低，并应用灰度滤镜。
        -   点击整个列表项会使用 `next/navigation` 的 `router.push()` 跳转到该项目的详情页 `/projects/${project.id}`。

### 4. 图标与文本组合组件 (`src/components/IconText.tsx`)

-   **组件名称**: `IconText`
-   **类型**: 客户端组件
-   **主要职责**:
    -   接收一个 React 函数式组件作为图标 (`icon: React.FC`)、一段文本 (`text: string`) 和一个可选的间距大小 (`size?: SpaceSize`)。
    -   使用 Ant Design 的 `Space` 组件将图标和文本并排显示，并应用指定的间距。

## 依赖的工具函数和类型

-   **`@/utils/urls.getBaseUrl()`**: 用于获取 API 请求的基础 URL (在 `HomePage` 中使用)。
-   **`@/utils/numbers.formatNumber()`**: 用于格式化数字（如星标数、Issue 数），使其更易读 (在 `ProjectListItem` 中使用)。
-   **`@/types`**:
    -   `PaginatedResponse<T>`: 定义了分页响应的通用结构。
    -   `ProjectBaseResponse`: 定义了项目基本信息的结构。
-   **`@/store/userStore`**: Zustand store，用于管理和获取当前登录用户状态 (在 `ProjectList` 中使用)。
-   **Ant Design 组件**: `Typography`, `List`, `Spin`, `Avatar`, `Item`, `Meta`, `Paragraph`, `Space`, `Ribbon`。
-   **Ant Design Icons**: `EyeOutlined`, `GithubOutlined`, `StarOutlined`。
-   **自定义图标**: `GiteeIcon`, `IssuesIcon`, `LawIcon` (位于 `src/components/icons` 目录，具体路径未在此次分析中确认，但通常在此类位置)。

## 待办/可以改进的点

-   错误处理可以更细致，例如针对不同类型的网络错误显示不同的用户提示。
-   无限滚动部分可以考虑增加节流 (throttling) 以防止过于频繁的 API 调用，尽管 `IntersectionObserver` 本身具有一定的性能优势。
-   对于未批准项目的视觉提示可以考虑更明显的区分方式。 