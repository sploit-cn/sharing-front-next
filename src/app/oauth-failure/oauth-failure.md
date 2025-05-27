# OAuth 登录失败 ( /oauth-failure ) - 功能与实现细节

当用户通过第三方 OAuth 提供商（如 GitHub, Gitee）进行登录或授权过程中发生错误时，会被重定向到此页面。

## 功能概述

-   **错误信息展示**：
    -   从 URL 的查询参数 (`?message=...`) 中获取具体的错误信息。
    -   在页面上清晰地展示 "OAuth 登录失败" 的标题和具体的错误描述。
    -   使用 Ant Design 的全局消息提示 (`message.error`) 显示错误信息。
-   **用户操作引导**：
    -   提供一个 "返回登录" 按钮，引导用户返回到应用的登录页面 (`/login`)。
    -   提供一个 "重试" 按钮，允许用户返回到 OAuth 流程的上一步尝试重新授权。

## 实现细节

### 1. 页面组件 (`src/app/oauth-failure/page.tsx`)

-   **组件名称**: `OAuthFailurePage`
-   **类型**: 客户端组件 (`'use client'`)

### 2. 状态管理

-   `errorMessage: string`: 存储从 URL 查询参数或默认的错误信息，初始值为 "OAuth 登录失败"。

### 3. 主要逻辑流程

-   **获取 URL 参数**: 使用 `useSearchParams()` Hook 从当前 URL 获取查询参数。
-   **`useEffect` (依赖: `searchParams`, `message`, `errorMessage`)**:
    -   当组件加载或 `searchParams` 变化时执行。
    -   尝试从查询参数中获取 `message` 的值。
    -   如果 `message` 参数存在，则解码该参数值 (使用 `decodeURIComponent`) 并更新 `errorMessage` 状态。
    -   使用 Ant Design 的 `App.useApp().message.error()` 显示 `errorMessage`。
        *注：useEffect 的依赖项包含 errorMessage 自身，这可能导致初次渲染时 antd message 显示的是初始值，随后状态更新再显示从URL获取的值。更常见的做法可能是不依赖 errorMessage，或者在 setErrorMessage 后直接调用 antd message。*
-   **导航**: 使用 `useRouter()` Hook 获取路由器实例，用于 "返回登录" 按钮的跳转。
-   **重试逻辑**: "重试" 按钮使用 `window.history.back()` 返回到浏览器历史记录的上一页，通常是 OAuth 提供商的授权页面或本应用发起 OAuth 请求前的页面。

### 4. UI 组件与元素

-   **布局**: 页面内容垂直居中显示。
-   **卡片 (`Card`)**: 用于包裹错误信息和操作按钮，提供统一的视觉样式。
-   **图标 (`CloseCircleOutlined`)**: 红色的错误图标，增强视觉提示。
-   **文本**: 标题 "OAuth 登录失败" 和动态的 `errorMessage`。
-   **按钮 (`Button`)**: "返回登录" (跳转到 `/login`) 和 "重试"。
-   **Ant Design 组件**: `App` (用于 `message`), `Button`, `Card`, `Flex`。
-   **Ant Design Icons**: `CloseCircleOutlined`。

## 使用场景

-   用户在 OAuth 提供商处取消授权。
-   OAuth 提供商返回错误状态码或错误信息。
-   应用在处理 OAuth 回调时发生内部错误。
-   网络问题导致 OAuth 流程中断。 