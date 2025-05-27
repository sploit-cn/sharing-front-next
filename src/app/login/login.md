
# 登录页面 ( `/login` ) - 功能与实现细节

本页面提供用户登录和注册功能，并支持通过第三方 OAuth 服务 (GitHub, Gitee) 进行登录。

## 功能概述

*   **用户登录**：允许已注册用户通过用户名和密码登录。
*   **用户注册**：允许新用户通过提供用户名、邮箱和密码进行注册。
*   **OAuth 登录**：
    *   支持通过 GitHub 账号授权登录。
    *   支持通过 Gitee 账号授权登录。
*   **表单切换**：用户可以在登录表单和注册表单之间轻松切换。
*   **输入验证**：对用户输入（如用户名格式、邮箱格式、密码长度、两次密码一致性）进行实时验证。
*   **反馈提示**：通过消息提示用户操作成功（如登录/注册成功）或失败（如无效输入、认证失败）。
*   **页面跳转**：登录或注册成功后，用户将被重定向到首页 (`/`)。

## 实现细节

### 1. 页面组件 (`src/app/login/page.tsx`)

*   **组件名称**: `LoginPage`
*   **类型**: 客户端组件 (`'use client'`)

### 2. 状态管理

*   **`form`**: Ant Design `Form` 实例，用于管理表单数据和验证状态。
*   **`isRegister` (State)**: 布尔值，用于控制当前显示的是登录表单 (`false`) 还是注册表单 (`true`)。默认为 `false`。
*   **`message` (来自 `App.useApp()`)**: Ant Design 的全局消息提示函数，用于显示成功或错误信息。
*   **`login` (来自 `useUserStore`)**: Zustand store 中的 action，用于在登录或注册成功后更新全局用户状态和 token。
*   **`router` (来自 `next/navigation`)**: Next.js 的路由实例，用于在操作成功后进行页面跳转。

### 3. 主要逻辑流程

#### a. 初始化

*   组件加载时，`isRegister` 状态默认为 `false`，显示登录表单。
*   创建 Ant Design `Form` 实例。

#### b. 表单模式切换

*   **点击 "登录" 按钮**:
    *   如果当前是注册模式 (`isRegister` 为 `true`)，则切换到登录模式 (`setIsRegister(false)`)。
    *   如果当前已是登录模式，则触发表单的 `submit` 事件，执行登录逻辑。
*   **点击 "注册" 按钮**:
    *   如果当前是登录模式 (`isRegister` 为 `false`)，则切换到注册模式 (`setIsRegister(true)`)。
    *   如果当前已是注册模式，则触发表单的 `submit` 事件，执行注册逻辑。

#### c. 用户名/密码登录 (`userLogin` async 函数)

*   **触发**: 当 `isRegister` 为 `false` 时，表单提交 (`onFinish` 事件) 时调用。
*   **API 调用**:
    *   向 `/api/auth/login` 发送 `POST` 请求。
    *   请求体 (JSON): `{ username: "...", password: "..." }`。
*   **成功处理**:
    *   如果 API 返回 `code === 200`：
        *   调用 `message.success('登录成功')` 显示成功提示。
        *   调用 `useUserStore` 中的 `login(res.data)` 更新全局用户状态。
        *   调用 `router.push('/')` 跳转到首页。
*   **失败处理**:
    *   如果 API 返回其他 `code` 或请求失败，调用 `message.error(res.message)` 显示错误信息。

#### d. 用户注册 (`userRegister` async 函数)

*   **触发**: 当 `isRegister` 为 `true` 时，表单提交 (`onFinish` 事件) 时调用。
*   **API 调用**:
    *   向 `/api/auth/register` 发送 `POST` 请求。
    *   请求体 (JSON): `{ username: "...", email: "...", password: "..." }` (确认密码字段由前端校验，不发送给后端)。
*   **成功处理**:
    *   如果 API 返回 `code === 200`：
        *   调用 `message.success('注册成功')` 显示成功提示。
        *   调用 `useUserStore` 中的 `login(res.data)` 更新全局用户状态 (注册成功通常也意味着登录)。
        *   调用 `router.push('/')` 跳转到首页。
*   **失败处理**:
    *   如果 API 返回其他 `code` 或请求失败，调用 `message.error(res.message)` 显示错误信息。

#### e. OAuth 登录 (`handleOAuthLogin` async 函数)

*   **参数**: `platform: 'github' | 'gitee'`。
*   **触发**: 点击 "GitHub 登录" 或 "Gitee 登录" 按钮时调用。
*   **API 调用**:
    *   向 `/api/auth/{platform}` (例如 `/api/auth/github`) 发送 `GET` 请求。此 API 预期返回一个重定向 URL。
*   **成功处理**:
    *   如果 API 返回 `code === 200` 且包含重定向 URL (`res.data`)：
        *   执行 `window.location.href = res.data`，将用户浏览器重定向到 OAuth 提供商的授权页面。
*   **失败处理**:
    *   如果 API 返回其他 `code` 或请求失败，调用 `message.error()` 显示相应的错误信息。

#### f. 表单验证

*   使用 Ant Design `Form.Item` 的 `rules` 属性进行声明式验证。
*   **通用字段**:
    *   `username`: 注册时必填，长度3-20，只能包含字母、数字、下划线、连字符。登录时无显式规则（由后端验证）。
    *   `password`: 注册时必填，至少6位。登录时无显式规则。
*   **注册特定字段**:
    *   `email`: 必填，必须是合法的邮箱格式。
    *   `confirmPassword`: 必填，且必须与 `password` 字段的值一致 (通过 `dependencies` 和自定义 `validator` 实现)。
*   **提交失败**: 如果表单验证未通过 (`onFinishFailed` 事件)，显示 `message.error('无效字段，请检查输入内容')`。

### 4. UI 组件与元素

*   **`Card`**: 作为登录/注册表单的容器。
*   **`Flex`**: 用于布局标题、按钮组等。
*   **`Form`**: Ant Design 表单，包裹所有输入项。
    *   `Form.Item`: 包裹每个输入控件及其标签和验证规则。
*   **`Input`**: 用于输入用户名和邮箱。
    *   `Input.Password`: 用于输入密码和确认密码。
*   **`Button`**:
    *   "登录" 按钮。
    *   "注册" 按钮。
    *   "GitHub 登录" 按钮。
    *   "Gitee 登录" 按钮。
*   **`Divider`**: 在用户名/密码登录和 OAuth 登录之间显示 "或" 分隔线。
*   **Icons**:
    *   `UserOutlined`: 用户名输入框前缀。
    *   `MailOutlined`: 邮箱输入框前缀。
    *   `LockOutlined`: 密码输入框前缀。
    *   `GithubOutlined`: GitHub 登录按钮图标。
    *   `GiteeIcon`: Gitee 登录按钮图标 (自定义图标组件)。

### 5. 依赖与类型

*   **`@/store/userStore`**: `useUserStore` (用于获取 `login` action)。
*   **`@/types`**: `DataResponse`, `LoginResponse` (用于 API 响应类型)。
*   **`antd`**: `App` (用于 `useApp` 获取 `message`), `Button`, `Card`, `Flex`, `Form`, `Input`, `Divider`。
*   **`@ant-design/icons`**: `LockOutlined`, `MailOutlined`, `UserOutlined`, `GithubOutlined`。
*   **`@/components/icons`**: `GiteeIcon` (自定义 Gitee 图标组件)。
*   **`ky`**: 用于发起 HTTP API 请求。
*   **`next/navigation`**: `useRouter` (用于页面跳转)。
*   **`react`**: `useState`。

---