# 更新项目 ( /update/[id] ) - 功能与实现细节

本页面允许授权用户修改已存在的项目信息。

## 功能概述

-   **权限控制**：只有项目的提交者（在项目未审核通过前）、项目所有者（根据 GitHub/Gitee ID 判断）或管理员才能修改项目。
-   **项目信息加载**：进入页面后，根据 URL 中的项目 ID (`[id]`) 从后端获取项目当前详细信息。
-   **表单编辑**：提供一个表单，允许用户修改项目的以下字段：
    -   简述 (`brief`)
    -   详细描述 (`description`)
    -   代码示例 (`codeExample`)
    -   关联标签 (`tagIds`)
    -   项目截图/图片 (`imageIds`)
-   **不可编辑信息展示**：项目的核心仓库信息（如仓库地址、平台、名称、星标、Fork 数等）会展示给用户，但不能通过此页面修改。
-   **标签管理**：
    -   从后端获取所有可用标签列表供用户选择。
    -   用户可以添加或移除项目的标签。
-   **图片管理**：
    -   用户可以上传新的项目图片（上传时直接关联当前项目 ID）。
    -   用户可以删除已有的项目图片。
-   **提交更新**：用户提交表单后，将修改后的数据发送到后端 API 进行保存。
-   **用户反馈**：通过消息提示（成功、失败、警告）告知用户操作结果。
-   **加载状态**：在数据加载和提交过程中显示加载指示。

## 实现细节

### 1. 页面组件 (`src/app/update/[id]/page.tsx`)

-   **组件名称**: `ProjectUpdatePage`
-   **类型**: 客户端组件 (`'use client'`)
-   **路由参数**: `id` (项目 ID)，通过 `useParams` 从 URL 中获取。

### 2. 状态管理

-   `form`: Ant Design Form 实例，用于表单控制。
-   `submitting`: 布尔值，表示表单是否正在提交中。
-   `tags`: 数组，存储从后端获取的所有可用标签列表 (`TagResponse[]`)。
-   `selectedTags`: 数组，存储当前项目已选择的标签 ID (`number[]`)。
-   `uploadedImages`: 数组，存储当前项目已上传的图片信息 (`ImageResponse[]`)。
-   `projectDetail`: 对象，存储从后端获取的当前项目的完整信息 (`ProjectFullResponse | null`)。
-   `repoDetail`: 对象，存储从 `projectDetail` 提取的与仓库相关的信息 (`ProjectRepoDetail | null`)，用于展示。
-   `loadingProject`: 布尔值，表示是否正在加载项目初始数据。
-   `hasPermission`: 布尔值，表示当前用户是否有权限修改此项目。
-   `user`: 从 `useUserStore` (Zustand) 获取的当前登录用户信息。
-   `isHydrated`: 通过 `useHydrated()` 工具函数判断 Zustand store 是否已完成客户端水合。

### 3. 主要逻辑流程

#### a. 初始化与数据获取

-   **`useEffect` (依赖 `isHydrated`, `user`, `projectDetail`) - 权限检查**:
    -   确保客户端状态已水合 (`isHydrated`)。
    -   如果用户未登录 (`!user`)，提示并重定向到 `/login`。
    -   当 `projectDetail` 加载完成后，进行权限判断：
        -   管理员 (`user.role === 'admin'`) 拥有权限。
        -   项目所有者：通过比较 `projectDetail.platform` 和 `projectDetail.owner_platform_id` 与 `user.github_id` 或 `user.gitee_id` 来确定。
        -   项目提交者 (`user.id === projectDetail.submitter_id`)：仅当项目未被批准 (`projectDetail.is_approved === false || projectDetail.is_approved === null`) 时拥有权限。
    -   如果无权限 (`!canEdit`)，提示错误并重定向到项目详情页 (`/projects/${projectId}`)。
    -   设置 `hasPermission` 状态。
-   **`useEffect` (依赖 `fetchProjectDetails`) - 获取项目详情**:
    -   调用 `fetchProjectDetails` 函数。
-   **`fetchProjectDetails` (useCallback)**:
    -   异步请求 `/api/projects/${projectId}` 获取项目数据。
    -   成功后，更新 `projectDetail` 和 `repoDetail` 状态。
    -   从返回的项目数据中提取 `tags` 和 `images`，分别更新 `selectedTags` 和 `uploadedImages` 状态。
    -   若获取失败，提示错误并重定向到首页 (`/`)。
    -   在开始和结束时设置 `loadingProject` 状态。
-   **`useEffect` (空依赖数组，仅首次渲染时) - 获取标签列表**:
    -   异步请求 `/api/tags` 获取所有可用标签。
    -   成功后更新 `tags` 状态。
    -   若获取失败，提示错误。

#### b. 表单数据填充

-   当 `projectDetail` 获取成功后，表单的初始值会基于 `projectDetail` 的内容进行设置（例如，通过 `Form` 的 `initialValues` 属性或 `form.setFieldsValue` 方法，具体实现细节在前250行未完全展示，但这是标准做法）。
    -   `brief`: `projectDetail.brief`
    -   `description`: `projectDetail.description`
    -   `codeExample`: `projectDetail.code_example`
    -   `tagIds` 会间接通过 `selectedTags` 状态反映在 `Select` 组件中。
    -   `imageIds` 会间接通过 `uploadedImages` 状态反映在图片列表和 `Upload` 组件中。

#### c. 图片处理

-   **`handleImageUpload(file: File)`**: (当用户通过 `Upload` 组件选择图片后触发)
    -   构建 `FormData`，包含图片文件和当前 `projectId`。
    -   POST 请求到 `/api/images/upload`。
    -   成功后，将返回的 `ImageResponse` 添加到 `uploadedImages` 状态，并提示成功。
    -   失败则提示错误。
-   **`handleImageRemove(image: ImageResponse)`**: (当用户点击图片的删除按钮时触发)
    -   DELETE 请求到 `/api/images/${image.id}`。
    -   成功后，从 `uploadedImages` 状态中移除该图片，并提示成功。
    -   失败则提示错误。

#### d. 提交表单

-   **`handleSubmit(values: UpdateFormData)`**: (当用户点击提交按钮且表单校验通过后触发)
    -   检查 `projectDetail` 是否已加载，否则提示用户稍候。
    -   设置 `submitting` 为 `true`。
    -   构造 `ProjectOwnerUpdate` 类型的数据对象，包含：
        -   `brief: values.brief`
        -   `description: values.description`
        -   `code_example: values.codeExample`
        -   `tag_ids: selectedTags` (从状态中获取最新的已选标签)
        -   (图片ID `image_ids` 可能由后端根据与 `project_id` 关联的图片自动处理，或者在更完整的代码中显式包含)
    -   向后端 API (可能是 `/api/projects/owner-update/${projectId}` 或 `PATCH /api/projects/${projectId}`) 发送更新请求。
    -   **请求成功**：提示成功信息，可能清除表单或重定向到项目详情页 (如 `/projects/${projectId}`)。
    -   **请求失败**：处理错误（如网络错误、校验错误），并向用户显示相应的错误信息（可能来自 `error.response.json()`）。
    -   最后设置 `submitting` 为 `false`。

### 4. UI 组件与元素

-   **导航**: `Breadcrumb` (例如：首页 > 项目详情 > 修改项目)
-   **返回按钮**: 允许用户返回项目详情页或上一页。
-   **加载指示**: `Spin` 组件，用于 `loadingProject` 和 `submitting` 状态。
-   **信息提示**: `App.useApp().message` 用于显示成功、错误、警告信息。 `Alert` 组件可能用于更持久的提示。
-   **卡片布局**: `Card` 组件用于组织页面内容。
-   **表单元素**: `Form`, `Input`, `TextArea`, `Select` (用于标签选择), `Upload` (用于图片上传，带有预览和删除功能), `Button`。
-   **图标**: 大量使用 Ant Design Icons (如 `EditOutlined`, `PlusOutlined`, `DeleteOutlined` 等) 增强用户界面。
-   **项目仓库信息展示**: 在表单外部或并列展示项目的不可编辑信息，如：
    -   头像、名称、简介
    -   星标数、Fork数、Watcher数、贡献者数、Issue数 (使用 `formatNumber` 格式化)
    -   许可证、主编程语言、最后提交时间、仓库创建时间等。

### 5. 依赖

-   **`ky`**: HTTP 客户端库，用于发起 API 请求。
-   **`@/store/userStore`**: Zustand store，管理用户状态。
-   **`@/types`**: 包含各种类型定义，如 `ProjectOwnerUpdate`, `Platform`, `TagResponse`, `ImageResponse`, `DataResponse`, `ProjectRepoDetail`, `ProjectFullResponse`。
-   **`@/utils/useHydrated`**: 确保 Zustand store 客户端水合的工具函数。
-   **`@/utils/numbers.formatNumber`**: 格式化数字显示的工具函数。
-   **Ant Design**: 大量使用其组件库及图标。

## 注意事项/潜在改进

-   由于文件较长，部分实现细节 (如表单的具体校验规则、错误处理的完整逻辑、提交成功后的具体行为) 需要查阅完整代码才能完全确定。
-   图片管理中，对于未保存的已上传图片，在用户离开页面前是否有清理机制，需要确认。
-   错误处理可以更加细化，针对不同的后端错误码给出更具体的提示。 