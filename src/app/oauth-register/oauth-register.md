# OAuth 补充注册信息 ( /oauth-register ) - 功能与实现细节

当用户首次通过第三方 OAuth 提供商（如 GitHub, Gitee）登录，并且该用户在我们的系统中尚不存在时，会被引导至此页面以完成在本系统的注册流程。

## 功能概述

-   **OAuth凭证校验**：
    -   页面加载时，从 URL 的查询参数中获取一个临时的 `token`。
    -   此 `token` 是后端在 OAuth 初步验证成功后签发的，用于授权本次注册操作。
    -   如果 `token` 缺失，则认为是非法访问，提示错误并重定向到登录页面 (`/login`)。
-   **Email信息预填**：
    -   如果 URL 查询参数中包含 `email` (通常由 OAuth 提供商返回)，则该 Email 会被自动填充到表单的邮箱字段，并且该字段会被禁用，防止用户修改。
    -   如果 URL 中没有 `email` 参数，则邮箱字段允许用户输入。
-   **补充注册信息表单**：用户需要提供以下信息以创建本地账户：
    -   **用户名 (`username`)**: 必填，有格式和长度限制。
    -   **邮箱 (`email`)**: 必填，标准邮箱格式。如已从 OAuth 获取则不可编辑。
    -   **密码 (`password`)**: 必填，设置在本系统使用的密码，有最小长度要求。
    -   **确认密码 (`confirmPassword`)**: 必填，需与密码字段一致。
-   **提交注册**：
    -   用户提交表单后，数据将连同 URL 中的 `token` (通过 Authorization 请求头) 发送到后端 API (`/api/auth/oauth-register`)。
    -   后端API会校验 `token`，然后使用表单数据为该 OAuth 用户创建新的本地账户记录。
-   **注册成功处理**：
    -   注册成功后，后端通常会返回用户信息和新的登录凭证 (JWT)。
    -   前端使用 `useUserStore` 的 `login` 方法将用户信息和凭证存入状态和本地存储。
    -   之后，用户将被重定向到应用首页 (`/`)，并处于登录状态。
-   **错误处理**：
    -   表单校验失败、API 请求失败或后端返回错误时，会向用户显示相应的错误提示信息。

## 实现细节

### 1. 页面组件 (`src/app/oauth-register/page.tsx`)

-   **组件名称**: `OAuthRegisterPage`
-   **类型**: 客户端组件 (`\'use client\'`)

### 2. 状态管理

-   `form`: Ant Design Form 实例，用于表单控制 (`OAuthRegisterForm` 类型)。
-   `loading: boolean`: 控制提交按钮的加载状态。
-   `allowEmail: boolean`: 控制邮箱输入框是否可编辑，默认为 `true`。如果从 URL 获取到 email，则设为 `false` 并禁用输入框。

### 3. 主要逻辑流程

-   **URL参数解析 (`useEffect` - 依赖: `searchParams`, `router`, `message`, `form`)**:
    -   获取 URL 中的 `email` 和 `token` 参数。
    -   **Token 校验**: 如果 `token` 不存在，显示错误消息并重定向到 `/login`。
    -   **Email 处理**: 如果 `email` 参数存在，则使用 `form.setFieldsValue({ email })` 预填邮箱，并将 `allowEmail` 设为 `false` (禁用邮箱输入框)。
-   **注册逻辑 (`handleRegister(values: OAuthRegisterForm)`)**:
    -   再次检查 URL 中是否存在 `token`，如果不存在则中止并提示。
    -   设置 `loading` 为 `true`。
    -   构造 `UserCreate` 对象，包含 `username`, `email`, `password`。
    -   使用 `ky` 向 `/api/auth/oauth-register` 发起 POST 请求：
        -   `json`: 构造的 `registerData`。
        -   `headers`: `{ Authorization: \`Bearer ${token}\` }`。
    -   **请求成功 (res.code === 200)**:
        -   显示成功消息 (\"注册成功！\")。
        -   调用 `useUserStore` 的 `login(res.data)` 方法，传入后端返回的 `LoginResponse` (包含用户信息和token)。
        -   重定向到首页 (`router.push(\'/\')`)。
    -   **请求失败 (res.code !== 200 或捕获到异常)**:
        -   显示从后端获取的错误消息 (`res.message`) 或通用错误消息 (\"注册失败，请重试\")。
    -   无论成功或失败，最后将 `loading` 设置为 `false`。

### 4. UI 组件与元素

-   **布局**: 页面内容垂直居中显示。
-   **卡片 (`Card`)**: 包裹整个注册表单和标题。
-   **标题**: \"Opensource Sharing\" 和 \"完成OAuth注册\"。
-   **表单 (`Form`)**: Ant Design 表单，包含以下字段和校验规则：
    -   `username` (Input, `UserOutlined` icon): 必填，长度3-20，正则 `/^[a-zA-Z0-9\\-_]+$/`。
    -   `email` (Input, `MailOutlined` icon): 必填，`type: \'email\'`。`disabled` 属性绑定到 `!allowEmail`。
    -   `password` (Input.Password, `LockOutlined` icon): 必填，最小长度6。
    -   `confirmPassword` (Input.Password, `LockOutlined` icon): 必填，自定义校验器确保与 `password` 字段一致。
-   **按钮 (`Button`)**:
    -   \"完成注册\" (类型 `submit`, `loading` 状态绑定)。
    -   \"返回登录\" (跳转到 `/login`)。
-   **Ant Design 组件**: `App` (for `message`), `Button`, `Card`, `Flex`, `Form`, `Input`。
-   **Ant Design Icons**: `LockOutlined`, `MailOutlined`, `UserOutlined`。

## 依赖

-   **`ky`**: HTTP客户端，用于API请求。
-   **`@/store/userStore`**: Zustand store，用于登录状态管理。
-   **`@/types`**: `DataResponse`, `LoginResponse`, `UserCreate`。 