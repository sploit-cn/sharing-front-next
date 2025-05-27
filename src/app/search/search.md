# 高级搜索 ( /search ) - 功能与实现细节

本页面提供了一个高级搜索界面，允许用户根据多种条件筛选和排序项目列表。

## 功能概述

-   **多条件筛选**：用户可以通过以下条件进行搜索：
    -   关键词
    -   编程语言
    -   许可证
    -   项目平台 (GitHub, Gitee)
    -   是否为精选项目
    -   标签
-   **结果排序**：用户可以对搜索结果按照多种字段进行升序或降序排序，例如：
    -   相关度 (默认基于ID，可能由后端定义)
    -   Star 数量
    -   Issue 数量
    -   更新时间
    -   创建时间
    -   项目名称等
-   **分页**：搜索结果支持分页显示。
-   **URL参数化搜索**：支持通过 URL query 参数 (如 `?keyword=xxx`) 进行初始搜索。
-   **动态加载与反馈**：
    -   搜索过程中显示加载指示。
    -   动态获取可选标签列表。

## 实现细节

### 1. 页面组件 (`src/app/search/page.tsx`)

-   **组件名称**: `AdvancedSearchPage`
-   **类型**: 客户端组件 (`'use client'`)

### 2. 状态管理

-   **`form`**: Ant Design Form 实例。
-   **`searchFilters` (State Object)**: 存储当前的搜索筛选条件。
    -   `keyword: string`
    -   `programmingLanguage: string | undefined`
    -   `license: string | undefined`
    -   `platform: Platform | undefined`
    -   `isFeatured: boolean | undefined`
    -   `selectedTags: number[]` (存储标签ID)
-   **排序与分页状态 (State)**:
    -   `orderBy: ProjectOrderFields` (排序字段，如 `'updated_at'`)
    -   `order: Order` (`'asc'` 或 `'desc'`)
    -   `currentPage: number`
    -   `pageSize: number`
    -   `totalItems: number` (搜索结果总数)
-   **数据与加载状态 (State)**:
    -   `searchResults: ProjectBaseResponse[]` (当前页的搜索结果)
    -   `allTags: TagResponse[]` (从API获取的所有可用标签列表)
    -   `loading: boolean` (全局加载状态)
    -   `searchedProjectIds: number[] | null` (核心状态：存储第一阶段搜索API返回的项目ID列表。当筛选条件改变时设为 `null`，触发重新获取ID；分页和排序时基于此列表获取详细数据)。

### 3. 主要逻辑流程

#### a. 初始化

-   **`useEffect` (componentDidMount-like)**:
    -   异步调用 `/api/tags` 获取所有标签，更新 `allTags` 状态。
-   **`useEffect` (componentDidMount-like, for URL params)**:
    -   解析 `window.location.search` 获取 URL 查询参数。
    -   如果存在 `keyword` 参数，则更新 `searchFilters.keyword` 并延迟调用 `handleSearch` 执行初始搜索。

#### b. 核心搜索逻辑 (`handleSearch` - useCallback)

此函数负责执行实际的搜索操作，分为两个主要阶段：

1.  **阶段一: 获取匹配的项目 ID 列表 (ID-based Filtering)**
    -   **触发条件**: 当 `searchedProjectIds` 为 `null` (表示筛选条件已更改) 或 `page` 为 `1` (表示是新的搜索或用户跳回第一页) 时执行。
    -   构建 `ProjectSearchParams` 对象，包含 `searchFilters` 中的所有条件 (关键词、语言、许可证、平台、是否精选、标签)。
    -   向 `/api/projects/search` API 发送 GET 请求。该 API 预期返回一个项目 ID 数组 (`number[]`)，这些项目满足所有筛选条件。
    -   将返回的 ID 列表存储到 `searchedProjectIds` 状态中。
    -   如果此阶段出错或未返回任何 ID，则清空搜索结果并停止。

2.  **阶段二: 获取项目详细信息 (Pagination & Sorting on Filtered IDs)**
    -   **触发条件**: 总是执行（除非阶段一失败）。
    -   使用阶段一获取的 `projectIdsToFetch` (或已存在的 `searchedProjectIds`)。
    -   构建 `ProjectPaginationParams` 对象，包含：
        -   `page`: 当前请求的页码。
        -   `page_size`: 每页数量。
        -   `order_by`: 排序字段 (如果 `orderBy` 是 `'id'` 则可能传 `undefined`，表示按后端默认相关度排序)。
        -   `order`: 排序顺序 (`asc`/`desc`)。
        -   `ids`: 阶段一获取的项目 ID 列表。
    -   向 `/api/projects` API 发送 GET 请求。该 API 预期根据提供的 ID 列表进行分页和排序，并返回具体的项目数据 (`PaginatedResponse<ProjectBaseResponse>`)。
    -   更新 `searchResults` (当前页的项目列表) 和 `totalItems` (基于 `projectIdsToFetch.length` 或API返回的总数)。

-   **加载状态与错误处理**: `handleSearch` 函数会管理 `loading` 状态，并在 API 请求失败时记录错误并清空结果。

#### c. 筛选条件更新

-   **`updateFilter(key, value)` (useCallback)**:
    -   一个通用的辅助函数，用于更新 `searchFilters` 对象中的特定字段。
    -   **关键**: 在更新筛选条件后，它会将 `searchedProjectIds` 设置为 `null`。这确保了下一次调用 `handleSearch` 时，会重新执行上述的"阶段一"搜索，以获取与新筛选条件匹配的项目 ID 列表。
-   **各个筛选条件的回调函数** (如 `handleKeywordChange`, `handleProgrammingLanguageChange`, `handlePlatformChange`, `handleTagChange`, `handleIsFeaturedChange` 等):
    -   这些函数通常在对应的 UI 输入组件 (Input, Select, Checkbox) 的 `onChange` 事件中被调用。
    -   它们接收用户输入的值，然后调用 `updateFilter` 来更新相应的 `searchFilters` 字段。
    -   例如，关键词输入的 `handleKeywordChange` 可能会包含防抖 (debouncing) 逻辑，以避免在用户输入过程中过于频繁地更新状态和触发搜索。

#### d. 排序条件更新

-   **`handleOrderByChange(value)`**, **`handleOrderChange(e)`**:
    -   当用户更改排序字段或排序顺序时，更新 `orderBy` 和 `order` 状态。
    -   **重要**: 更改排序条件后，通常会立即调用 `handleSearch(1, pageSize)` 从第一页开始重新获取数据，因为排序会影响整个结果集的顺序，而不仅仅是当前页。

#### e. 表单操作与分页

-   **`onFinishSearch()` (useCallback)**: (表单的 `onFinish` 事件)
    -   将 `searchedProjectIds` 设为 `null`。
    -   调用 `handleSearch(1, pageSize)` 执行搜索，从第一页开始。
-   **`handleReset()`**: (重置按钮的 `onClick` 事件)
    -   使用 `form.resetFields()` 清空表单。
    -   重置 `searchFilters`, `orderBy`, `order`, `currentPage` 到初始状态。
    -   将 `searchedProjectIds` 设为 `null`。
    -   调用 `handleSearch(1, pageSize)` 以显示默认的、未筛选的列表 (如果后端支持空筛选条件)。
-   **`handleTableChange(newPage, newPageSize)` (useCallback)**: (分页组件的 `onChange` 事件)
    -   调用 `handleSearch(newPage, newPageSize || pageSize)` 来获取指定页的数据。
    -   此时，如果筛选条件和排序条件未变，`searchedProjectIds` 不会是 `null`，因此 `handleSearch` 会跳过"阶段一"，直接使用已有的 ID 列表进行分页获取。

### 4. UI 组件与元素

-   **导航**: `Breadcrumb` (例如: 首页 > 高级搜索)。
-   **搜索表单 (`Form`)**: 包含多个输入控件：
    -   `Input` 用于关键词、编程语言、许可证。
    -   `Select` 用于平台、标签 (多选)、排序字段。
    -   `Radio.Group` 用于排序顺序 (`asc`/`desc`) 和是否精选 (`true`/`false`/`undefined`)。
    -   `Button` "搜索" 和 "重置"。
-   **结果展示**: `ProjectList` 组件 (与首页共享) 用于渲染 `searchResults`。
-   **分页**: `Pagination` 组件，与 `currentPage`, `pageSize`, `totalItems` 和 `handleTableChange` 绑定。
-   **加载指示**: `Spin` 组件，根据 `loading` 状态显示。

### 5. 依赖与类型

-   **`@/types`**: `ProjectBaseResponse`, `ProjectSearchParams`, `ProjectPaginationParams`, `TagResponse`, `Platform`, `ProjectOrderFields`, `Order`。
-   **`@/components/ProjectList`**: 用于展示项目列表的复用组件。
-   **Ant Design**: `Input`, `Button`, `Select`, `Checkbox`, `Row`, `Col`, `Form`, `List`, `Pagination`, `Spin`, `Typography`, `Radio`, `Card`, `Breadcrumb`。
-   **Ant Design Icons**: `HomeOutlined`。

## 优化与注意事项

-   **两阶段搜索**: 这种设计模式 (先获取ID，再根据ID获取详情) 在复杂筛选和分页场景下可以提高性能，尤其是在ID列表相对稳定而详情数据较大时。它避免了每次分页或排序都重新执行重量级的筛选查询。
-   **`useCallback` 和 `useMemo`**: 用于优化性能，减少不必要的子组件重渲染和计算。
-   **URL参数同步**: 当前实现中，初始加载时会从URL读取 `keyword`。可以考虑将所有筛选条件、排序和分页状态同步到URL，这样用户可以分享带有特定搜索状态的链接，并且刷新页面时能恢复搜索状态。
-   **防抖/节流**: 对于输入框 (如关键词)，应用防抖可以防止在用户快速输入时过于频繁地触发搜索。
-   **"相关度"排序**: 当 `orderBy` 为 `'id'` (或特定表示相关度的值) 时，排序逻辑通常由后端处理，可能涉及到更复杂的算法 (如全文检索引擎的评分)。 