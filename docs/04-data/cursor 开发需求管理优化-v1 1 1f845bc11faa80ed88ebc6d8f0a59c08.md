# cursor 开发需求管理优化-v1.1

好的，我明白了。您希望更具体地了解在实际开发过程中，尤其是在需求不断调整时，如何管理这些需求以及相关的 Cursor Prompt。我们不再赘述 Linear 的使用，而是聚焦于开发循环中的实践。

这是一个更详细的指南，重点关注需求演变时的开发过程和 Prompt 管理：

## **在 Cursor 开发循环中管理不断演变的需求**

当需求发生变化时，关键在于高效地更新 Cursor 的理解，并引导它修改或扩展现有的代码库。

**1. 反映需求变更以供 Cursor 理解：**

- **单一事实来源（概念上）：** 虽然您不直接为此使用 Linear，但至关重要的一点是，您需要*在某个地方*对需求有一个清晰的、更新的定义，以便参考。这可能是一个修订后的用户故事、一个规格文档，甚至是一个详细的注释。这个更新后的定义将构成您新的或修改后的 Prompt 的基础。
- **针对修改的迭代式 Prompting：**
    - 如果需求变更意味着要修改现有的 AI 生成的代码，尽可能避免从头开始。
    - 选中相关的代码块或在 Cursor 中打开特定的文件 (`@file/path/to/your/file.js`)。
        
        **1**
        
    - 使用聊天（Cmd+L 或 Ctrl+L）或内联编辑（Cmd+K 或 Ctrl+K），并使用一个清晰说明所需*变更*的 Prompt。例如：“根据更新后的需求，修改 `@file/src/services/userService.js` 中的 `@symbol/getUserProfile` 函数，使其同时获取用户的最后登录日期。”
        
        **2**
        
    - 具体说明需要添加、删除或更改的内容。
- **利用 `@-symbols` 实现精确性 1：** 当需求变更时，通常会影响代码库的特定部分。在您的 Prompt 中广泛使用 `@file/path/to/file.ext` 和 `@symbol/functionOrClassName`，以将 Cursor 的注意力引导至需要修改的确切区域。这比笼统的指令更有效。
- **Cursor 的 Agent 模式应对复杂变更 3：** 如果需求变更非常大（例如，添加新的子模块，跨多个文件进行重大重构），Cursor 的 Agent 模式会非常强大。向其提供高级别的更新需求，让它规划并在代码库范围内建议更改。您仍然需要审查其计划和建议的代码更改。
- **审查 AI 建议的变更：** 始终使用 Cursor 的差异视图（diff view）仔细检查 AI 根据您更新的 Prompt 提出的更改。 确保它们与新需求一致，并且没有引入回归。
    
    **4**
    
- **使用聊天选项卡和检查点 4：**
    - 如果需求变更导致您与 AI 一起探索多种实现方法，请使用 Cursor 的聊天选项卡（Cmd+T 或 Ctrl+T）将这些探索分开并保持组织性。
    - Cursor 会自动创建检查点。如果基于新需求的 AI 建议的更改将您引向错误的方向，您可以使用这些检查点恢复到代码库的先前状态。

**2. 处理需要调整的 AI 生成代码：**

- **不要将 AI 输出视为最终结果（尤其是在需求不断演变时）：** Cursor 最初生成的代码是一个起点。当需求发生变化时，您将提示 AI *重构*或*扩展*现有的基础代码。
- **提供现有代码的上下文：** 在请求修改时，确保 Cursor 拥有其先前生成的代码的上下文。在这里，使用 `@file` 和 `@symbol` 是关键。您可以说：“鉴于 `@file/src/paymentService.js` 中现有的 `@symbol/processOrder` 函数，我们现在需要根据需求增加一个应用区域税的步骤。”
    
    **1**
    
- **分解复杂变更：** 如果需求变更需要多个复杂的修改，请分解您的 Prompt。逐步引导 AI（这是一种链式思维 Prompting 的形式）。 例如：
    
    **5**
    
    1. “首先，在 `@file/src/models/order.js` 的 `Order` schema 中添加一个新字段 `regionalTaxRate`。”
    2. “接下来，更新 `@file/src/services/orderService.js` 中的 `@symbol/calculateTotal` 函数，以在计算中包含此 `regionalTaxRate`。”
    3. “最后，确保订单详情的 API 响应现在包含已应用的税额。”

## **针对不断变化的需求的实用 Prompt 管理策略**

有效地管理您的 Prompt 对于一致性、可追溯性和效率至关重要，尤其是在需求不稳定的情况下。

**1. 推荐的主要策略：项目内专用的 Prompt 目录**

将 Prompt 存储在项目内的一个专用目录中（例如 `.prompts/`、`docs/ai_prompts/` 或 `cursor_prompts/`），并使用 Git 进行版本控制，这是一种稳健的方法。

- **目录结构：**
    - 按功能/模块组织：`.prompts/user-authentication/registration.md`
    - 或按任务标识符（如果您有）：`.prompts/ENG-123/initial_setup.md`
- **Prompt 文件内容（例如，使用 Markdown）：**
    - **需求 ID/链接: [链接到您的需求来源，例如 ENG-123_v1.2]**
    - **目标: 实现用户注册端点，包含邮箱、密码和用户名。**
    - **版本: 1.2 (已更新，增加用户名唯一性检查)**
    - **关键上下文文件/符号:**
        - **@file/src/controllers/authController.js**
        - **@file/src/models/User.js**
        - **@symbol/hashPassword**
        - **@symbol/UserSchema**
    
    # 核心 Prompt:
    
    在 @file/src/controllers/authController.js 中生成一个 POST 端点 /api/auth/register。
    
    它应该在请求体中接受 email、password 和 username。
    
    验证邮箱格式并确保密码至少为 8 个字符。
    
    使用 @symbol/hashPassword 工具对密码进行哈希处理。
    
    在保存之前，使用 @symbol/UserSchema 模型检查 username 和 email 是否唯一。
    
    如果成功，将新用户保存到数据库，并返回 201 状态以及用户对象（不包括密码）。
    
    处理潜在错误（例如，重复的邮箱/用户名、验证错误），返回适当的 4xx 状态码和错误消息。
    
    ## **重要约束/说明:**
    
    - **所有异步操作必须使用 async/await。**
    - **遵循此控制器中现有的错误处理模式。**
    - **用户名唯一性检查不区分大小写。**
    - **迭代历史 (可选):**
        - **v1.0 (2024-05-18): 基础注册的初始 Prompt。**
        - **v1.1 (2024-05-19): 增加了密码强度要求。**
        - **v1.2 (2024-05-20): 增加了用户名字段和唯一性检查。**
- **好处：**
    - **版本控制：** Prompt 与您的代码一起演进，并在 Git 中进行跟踪。
    - **可追溯性：** 很容易查看哪个 Prompt 用于哪个版本的功能。
    - **协作：** 团队成员可以访问、使用和优化 Prompt。
    - **可重用性：** 精心设计的针对常见模式的 Prompt 可以被调整使用。
    - **详细上下文：** 您可以在 Prompt 文件本身中保留详尽的注释、上下文引用和迭代历史。

**2. Cursor Notepads 作为补充 7**

Notepads 非常适用于：

- **可重用的 Prompt 模板：** 用于常见任务，如“创建一个包含这些标准导入和结构的新 React 组件”。
- **复杂的指令集：** 您经常使用的多步骤指令。
- **样板上下文：** 项目特定的指南或架构说明，这些内容不完全是 `.cursorrules`，但经常需要。
- 您可以在主 Prompt 文件中或直接在聊天中引用 Notepad：`使用 @notepad/standardApiServiceSetup 中概述的步骤来实现新服务。`

**3. 利用 `.cursorrules` (项目规则) 1**

对于全局应用或项目特定部分应用的持久性指令，请使用项目规则（存储在 `.cursor/rules/` 中）：

- 定义编码标准（“在 TypeScript 中始终使用严格类型”）。
- 指定首选库或模式（“HTTP 请求使用 `axios`，而不是 `fetch`”）。
- 禁止某些做法（“此项目中禁止使用 jQuery”）。
- 这些规则为 AI 提供持久的上下文，减少了在每个 Prompt 中重复这些指令的需要，即使特定的功能需求发生变化。规则可以设置为“始终”应用、“自动附加”（基于文件模式）或由“Agent 请求”。
    
    **9**
    

**4. 管理 Prompt 序列和聊天历史 4**

- **链式思维：** 对于复杂功能，您通常会使用一系列 Prompt。在您的 Prompt markdown 文件中记录此序列的关键步骤。
- **Cursor 聊天历史：** 可通过命令面板访问（“显示聊天历史”）。 这提供了您交互的日志。
    
    **4**
    
- **复制聊天选项卡 4：** 如果需求变更导致探索不同的 AI 驱动解决方案，请复制聊天（从消息上的三点菜单）以分支对话，而不会丢失原始线程。这对于尝试修改很有用。
- **导出聊天 4：** 虽然可行，但仅依靠聊天导出来管理 Prompt 可能不如专门的 Prompt 文件有条理。将其用作补充记录。

## **工作流程示例：适应需求变更**

假设`需求 ENG-456` 最初是“实现按名称搜索产品的基本功能”。您使用了 `cursor_prompts/product-search/ENG-456_v1_basic_search.md`。

现在，`ENG-456` 更新为 `v1.1`：“增强产品搜索功能，使其也能按类别筛选并按价格排序。”

1. **理解变更：** 核心搜索功能需要修改以包含新的筛选器和排序功能。
2. **更新 Prompt 文件：**
    - 将 `ENG-456_v1_basic_search.md` 复制为 `ENG-456_v1.1_advanced_search.md`。
    - 在新文件中，更新“目标”和“版本”。
    - 修改“核心 Prompt”部分：
        
        **Diff**
        
        `## 核心 Prompt:
        - 修改 `@file/src/services/productSearchService.js` 中现有的产品搜索功能。
        + 扩展 `@file/src/services/productSearchService.js` 中的 `@symbol/searchProducts` 函数。
        它现在应该接受可选的 `category` (字符串) 和 `sortBy` ('price_asc', 'price_desc') 参数。
        如果提供了 `category`，则将结果筛选为仅包含该类别的产品。
        如果提供了 `sortBy`，则相应地对结果进行排序。
        现有的名称搜索功能应保持不变。
        确保针对这些新的筛选器和排序优化数据库查询。`
        
    - 添加任何新的相关 `@file` 或 `@symbol` 引用。
3. **Cursor 交互：**
    - 在 Cursor 中打开 `productSearchService.js`。
    - 在聊天面板中，粘贴您 markdown 文件中更新后的“核心 Prompt”。
    - AI 将建议对现有 `searchProducts` 函数的修改。
    - 查看差异。您可能需要进一步的迭代 Prompt：“确保类别筛选不区分大小写”，或“应为此新查询向数据库添加什么索引？”
4. **保存并提交：**
    - 满意后，保存代码更改。
    - 如果您的 Prompt 在交互过程中有所演变，请使用最终、最有效的版本更新 `ENG-456_v1.1_advanced_search.md`。
    - 提交代码更改和更新后的 Prompt 文件：`git commit -m "feat(search): 为产品搜索添加类别筛选和价格排序 (ENG-456 v1.1) - 已更新 AI prompts"`

通过遵循这些更细致的实践，您可以更好地应对不断变化的需求的复杂性，同时利用 Cursor 的 AI 功能，使您的开发过程保持井然有序，并使您的 Prompt 具有可追溯性和有效性。