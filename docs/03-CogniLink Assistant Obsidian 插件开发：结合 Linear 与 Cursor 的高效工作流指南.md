# **CogniLink Assistant Obsidian 插件开发：结合 Linear 与 Cursor 的高效工作流指南**

## **1\. 引言**

### **1.1. 目的**

本报告旨在为 CogniLink Assistant Obsidian 插件项目提供一份全面且可操作的指南。CogniLink Assistant 是一款旨在嵌入 Obsidian 1 笔记环境中的人工智能助手，其目标是通过上下文感知辅助、笔记合成和潜在的任务自动化等智能功能，提升用户的生产力。本指南的核心目标是详细阐述如何利用 Linear 2 进行项目管理，并结合 Cursor 7 作为 AI 优先的集成开发环境（IDE），来构建 CogniLink 插件的开发流程。特别地，本报告将重点介绍如何利用模型上下文协议（Model Context Protocol, MCP）6 连接 Cursor 和 Linear，从而优化开发工作流，实现更高效的项目推进。

### **1.2. 目标受众与范围**

本报告主要面向参与 CogniLink 插件项目的软件开发人员和技术负责人。假定读者已具备 Obsidian 1、IDE（特别是 VS Code 或 Cursor 7）以及基础项目管理概念的相关知识。  
报告范围涵盖：Linear 项目的详细配置方法、针对 CogniLink 的可操作 Issue 示例、分阶段的开发计划、通过 MCP 实现 Cursor 与 Linear 集成的分步说明（包括配置文件示例和 Mermaid 图）、以及实际的交互示例。

### **1.3. 关键技术概览**

* **Linear:** Linear 是一款专为现代软件团队打造的项目管理工具，以其速度快、结构清晰（项目、周期、路线图）和高效的事务跟踪（Issue Tracking）而著称 2。它提供了一个结构化的环境来规划和执行产品开发。  
* **Cursor:** Cursor 是一款基于 VS Code 构建的 AI 优先 IDE，其核心优势在于集成了强大的人工智能编码辅助功能（如聊天、代码生成、调试）34。它具备上下文感知能力（通过 @ 符号引用文件、文档、代码库）42，并可通过 VS Code 扩展和 MCP 进行功能拓展 7。  
* **Obsidian:** Obsidian 是 CogniLink 插件的目标平台，是一款功能强大、本地优先、基于 Markdown 的知识管理工具 1。其高度可扩展性依赖于活跃的社区插件生态系统 57。  
* **MCP (Model Context Protocol):** MCP 是由 Anthropic 发起 12 的开放标准，是实现本报告所述工作流集成的关键技术。它旨在让 AI 模型（如 Cursor 内置模型）能够安全地与外部工具和数据源（如 Linear 或潜在的 Obsidian 本身 59）进行交互 6。MCP 采用客户端-服务器架构 6，通过 stdio 或 SSE 等传输方式，使用 JSON-RPC 进行通信 6。

### **1.4. 工作流协同的价值**

本报告的核心价值在于展示这些工具之间的协同效应。Linear 提供了结构化的项目管理框架 2，Cursor 则提供了一个能够与该框架交互的 AI 加速开发环境 34，Obsidian 作为插件的目标平台，同时也是 AI 获取上下文数据的潜在来源 56，而 MCP 则充当了关键的连接层，实现了 Cursor 和 Linear 之间的无缝信息流和自动化 15。这种组合旨在减少开发过程中的上下文切换，提高任务跟踪的准确性，并利用 AI 处理常规的开发和项目管理任务。  
这种工作流的构建基于以下逻辑：高效的软件开发需要工具间的无缝集成以减少摩擦。Cursor 支持通过 MCP 与外部工具集成 43，而 Linear 存在可用的 MCP 服务器实现 121。因此，MCP 成为连接 Cursor 和 Linear 的自然选择。Obsidian 作为目标平台，也受益于 Linear 的结构化管理和 Cursor 的高效开发。未来，如果 Obsidian 也通过 MCP 集成 59，将进一步增强此工作流。协同的价值在于发挥各工具的优势（Linear 的结构化、Cursor 的 AI 编码能力、Obsidian 的知识库），并通过 MCP 将它们连接起来，形成一个比各部分独立使用时更高效的整体。

## **2\. 为 CogniLink 项目配置 Linear**

### **2.1. 创建 Linear 项目**

首先，需要在 Linear 中为 CogniLink 插件创建一个专门的项目。项目是组织工作的基本单元，用于跟踪特定目标或功能的进展 4。

* **操作:** 登录 Linear，点击 \+ 按钮创建新项目 126。  
* **配置:**  
  * **名称:** CogniLink Assistant Obsidian Plugin  
  * **描述:** "为 Obsidian 开发的人工智能助手插件，利用 提供上下文感知帮助、笔记合成和任务自动化功能。" 4  
  * **负责人 (Lead):** 指定项目的主要负责人，明确责任 126。  
  * **成员 (Members):** 添加所有相关的团队成员 126。  
  * **图标/颜色:** 选择合适的视觉标识符，便于区分。  
  * **状态 (Status):** 初始状态可设置为 Planned (已规划) 或 Backlog (待办) 4。

### **2.2. 配置工作流状态 (Workflow Statuses)**

定义清晰的工作流状态对于跟踪 Issue 的进展至关重要。一个结构化的工作流可以提高团队的透明度和效率 118。

* **理由:** 为插件开发定制一个清晰、顺序的流程，提供可见性和结构 4。  
* **操作:** 在 Linear 中，导航至团队设置 (Team Settings) \> 工作流 (Workflow) 134。  
* **推荐状态 (示例):**  
  * Backlog (待办事项): 尚未确定优先级的想法和任务。  
  * Todo (待处理): 已确定优先级，准备在本周期或下个周期开发。  
  * In Progress (进行中): 正在积极开发中。  
  * Code Review (代码审查): 代码已完成，等待审查（例如，可通过 GitHub PR 集成触发 136）。  
  * Testing (测试中): 已部署到测试环境或正在进行 QA。  
  * Done (已完成): 开发、审查、测试均已完成，并已合并/发布。  
  * Cancelled (已取消): 决定不实施的任务。  
* **状态转换说明:** 简要说明 Issue 如何在状态间流转。例如，开发者将任务从 Todo 移至 In Progress；当 Pull Request 合并时，通过自动化 136 将状态更新为 Testing。

### **2.3. 利用 Linear 功能管理 CogniLink**

Linear 提供了多种功能来帮助管理项目，如 Cycles（周期）、Milestones（里程碑）、Labels（标签）和 Templates（模板）。

* **Cycles (周期/迭代):**  
  * **目的:** 在固定的时间盒（例如 1-2 周）内管理工作，实现迭代进展和可预测性 3。这类似于敏捷开发中的 Sprint。  
  * **设置:** 在团队设置中配置周期的持续时间、开始日期以及未完成 Issue 的自动顺延选项 134。  
  * **工作流:** 在周期规划会议期间，将 Backlog 或 Todo 中的 Issue 分配到即将开始的周期。通过周期图表 (Cycle graph) 监控进度 127。  
* **Milestones (里程碑):**  
  * **目的:** 跟踪项目中的主要阶段或可交付成果（例如，版本发布、核心功能完成）4。  
  * **设置:** 在项目设置中创建里程碑，可选择性地为其分配目标日期 147。  
  * **工作流:** 将相关的 Issue 分配给里程碑。在项目概览 (Project overview) 或路线图 (Roadmap) 中跟踪里程碑进度 126。  
* **Labels (标签):**  
  * **目的:** 对 Issue 进行分类，以便于筛选、组织和报告 33。  
  * **CogniLink 推荐标签:**  
    * 类型 (Type): bug, feature, enhancement, chore, docs  
    * 领域 (Area): UI, AI-Core, Obsidian-API, Settings, Testing, Build  
    * 优先级 (Priority): P1-Urgent, P2-High, P3-Medium, P4-Low  
  * **工作流:** 在创建或分流 Issue 时应用相关标签。使用标签创建自定义视图 (Custom Views) 152。  
* **Templates (模板 \- Issue & Project):**  
  * **目的:** 标准化 Issue 的创建过程，确保捕获必要信息 32。项目模板可以为重复性项目预定义 Issue 和里程碑 129。  
  * **操作:** 为 Bug 报告和功能请求创建 Issue 模板（详见第 3 节）。如果经常开发类似插件，可以考虑创建项目模板 129。  
* **Roadmaps (路线图):**  
  * **目的:** 提供项目和计划的高层级、可视化时间线，辅助长期规划和与利益相关者的沟通 2。  
  * **使用:** 将 CogniLink 项目放置在相关的团队或公司路线图上，并根据需要设置目标日期 148。

### **2.4. 结构化规划提升效率**

通过系统地配置 Linear 的项目、工作流、周期、里程碑和标签，开发团队能够建立一个清晰、可预测且可跟踪的流程。这种结构不仅对人类协作和项目管理至关重要，也为后续通过 Cursor 和 MCP 实现有效的自动化和 AI 辅助奠定了基础。一个明确定义的流程可以最大限度地减少模糊性并简化执行过程。  
高效的软件开发依赖于结构化和清晰的流程。Linear 提供了多种工具来构建这种结构，包括项目、工作流、周期、里程碑、标签、模板和路线图 2。将这些工具应用于 CogniLink 插件的具体情境（例如，定义相关的标签、里程碑、工作流状态）可以创建一个量身定制的管理系统。这个结构化的系统不仅提高了人类团队的效率 2，更重要的是，它为 AI 工具（如 Cursor 的代理）通过 MCP 理解和交互项目状态提供了必要的基础，从而实现更有效的自动化 72。因此，在 Linear 中进行细致的设置，是最大化人机协作效率的前提。

## **3\. 可操作的 CogniLink Linear Issue 示例**

### **3.1. 清晰 Issue 的重要性**

详细且格式一致的 Issue 对于团队清晰沟通、减少歧义和实现高效跟踪至关重要 2。此外，这种结构化也有利于潜在的通过 MCP 进行的 AI 交互，因为 AI 代理能更好地解析和处理定义明确的任务 72。

### **3.2. Issue 模板：Bug 报告**

* **目的:** 标准化 Bug 报告流程，确保信息清晰且易于复现。  
* **Linear 模板设置:** 在 Linear 设置中创建 Issue 模板 32。  
* **字段:**  
  * **标题 (Title):** Bug: \[简洁的摘要\] (预填充前缀)  
  * 描述 (Description) (Markdown):  
    复现步骤 (Steps to Reproduce):  
    1....  
    2....  
    3....  
    预期行为 (Expected Behavior):  
    \[描述应该发生什么\]  
    实际行为 (Actual Behavior):  
    \[描述实际发生了什么\]  
    **环境信息 (Environment):**  
    * Obsidian 版本:  
    * CogniLink 插件版本:  
    * 操作系统:

  附加信息/日志 (Additional Context/Logs):\[在此处粘贴日志或添加额外细节\]

  * **标签 (Labels) (预分配):** bug 33  
  * **项目 (Project) (预分配):** CogniLink Assistant Obsidian Plugin  
* **使用:** 指导团队成员在报告 Bug 时使用此模板（快捷键 Option/Alt+C 或通过“New Issue”下拉菜单 155）。用户填写具体细节。

### **3.3. Issue 模板：功能请求**

* **目的:** 标准化功能建议流程，以便清晰理解和确定优先级。  
* **Linear 模板设置:** 创建另一个 Issue 模板 32。  
* **字段:**  
  * **标题 (Title):** Feature: \[简洁的摘要\] (预填充前缀)  
  * 描述 (Description) (Markdown):  
    用户故事/问题描述 (User Story/Problem):  
    作为一名 \[用户类型\], 我想要 \[执行某个操作\] 以便 \[获得某种好处\].  
    或者  
    此功能解决的问题是...  
    建议解决方案 (Proposed Solution):  
    \[描述功能及其工作原理\]  
    **验收标准 (Acceptance Criteria):**  
    * \[标准 1\]  
    * \[标准 2\]

  模型/参考 (Mockups/References) (可选):\[链接到 Figma、截图等\]

  * **标签 (Labels) (预分配):** feature 33  
  * **项目 (Project) (预分配):** CogniLink Assistant Obsidian Plugin

### **3.4. 核心功能 Issue 示例 (说明性)**

提供 2-3 个基于开发计划（第 4 节）的具体示例，展示已填写的字段。

* **示例 1 (功能):**  
  * **标题:** Feature: 实现从当前 Obsidian 笔记中检索上下文  
  * **描述:** (使用模板) 用户故事: 作为 Obsidian 用户，我希望 CogniLink 能够自动读取我当前活动笔记的内容，以便我可以向 AI 提问关于该笔记的问题。建议解决方案: 添加通过 Obsidian API 访问活动编辑器内容的功能。提取纯文本。通过已建立的 API 连接将文本发送到 AI 后端。验收标准: 1\. 打开聊天时，活动笔记内容作为上下文发送。 2\. 适用于 X 字符以内的笔记。 3\. 优雅地处理空笔记。  
  * **标签:** feature, priority:P1, area:AI-Core, area:Obsidian-API  
  * **里程碑:** v0.1 \- Core AI Integration  
* **示例 2 (Bug):**  
  * **标题:** Bug: 接收长 AI 响应时侧边栏聊天 UI 卡死  
  * **描述:** (使用模板) 复现步骤: 1\. 提出一个会产生超过 2000 字响应的问题。 2\. 观察聊天 UI。预期行为: 响应流畅地流式传输。实际行为: 在流式传输期间 UI 无响应。环境信息: Obsidian 1.6.3, CogniLink 0.0.2, Windows 11。  
  * **标签:** bug, priority:P1, area:UI  
  * **周期:** Cycle 3

### **3.5. 表格：CogniLink 推荐的 Linear Issue 类型**

* **目的:** 为标准化 Issue 创建提供快速参考指南。  
* **位置:** 第 3 节末尾。  
* **列:**  
  * Issue 类型: Bug, Feature, Enhancement, Task, Chore, Docs  
  * 示例标题格式: Bug: \[摘要\], Feature: \[摘要\], 等。  
  * 关键描述部分: 复现步骤, 用户故事, 建议解决方案, 任务描述, 等。  
  * 推荐标签: bug, feature, enhancement, task, chore, docs, priority:P\[1-4\], area:\[UI/AI-Core/etc\]  
  * 典型分配: Cycle 或 Milestone  
* **构建逻辑:**  
  1. 用户查询要求 *可操作* 的示例。  
  2. 上述模板提供了特定类型（Bug、Feature）的 *如何做*。  
  3. 一个总结性的表格整合了这些示例，并将其扩展到其他常见的 Issue 类型（Task、Chore、Docs）。  
  4. 该表格作为一个快速参考，强化了第 2 节倡导的结构化方法。  
  5. 通过提供推荐 Issue 结构的简洁概览，增强了报告的实用价值。

| Issue 类型 | 示例标题格式 | 关键描述部分 | 推荐标签 | 典型分配 |
| :---- | :---- | :---- | :---- | :---- |
| Bug | Bug: \[摘要\] | 复现步骤, 预期/实际行为, 环境信息 | bug, priority:P\[1-4\], area:\[UI/AI-Core/etc\] | Cycle |
| Feature | Feature: \[摘要\] | 用户故事/问题描述, 建议解决方案, 验收标准 | feature, priority:P\[1-4\], area:\[UI/AI-Core/etc\] | Milestone/Cycle |
| Enhancement | Enh: \[摘要\] | 当前行为, 建议改进, 理由 | enhancement, priority:P\[1-4\], area:\[UI/AI-Core/etc\] | Cycle |
| Task | Task: \[摘要\] | 任务描述, 验收标准 (可选) | task, priority:P\[1-4\], area: | Cycle |
| Chore | Chore: \[摘要\] | 任务描述 (通常是维护性任务) | chore, priority:P\[3-4\], area: | Cycle |
| Docs | Docs: \[摘要\] | 需要文档化的内容, 目标受众 | docs, priority:P\[3-4\], area:\[Documentation\] | Cycle |

### **3.6. 模板驱动一致性与 AI 就绪性**

在 Linear 中持续使用 Issue 模板不仅是人类团队的良好实践，更能创建结构化、可预测的数据。这种结构化的数据对于 AI 代理（例如通过 MCP 的 Cursor 代理）来说，在自动化任务（如从代码注释生成 Issue 或总结 Bug 报告）时，能够更可靠地解析和执行。AI 模型在处理结构化、一致的输入时表现更佳。Linear 模板强制实现了 Issue 创建的结构和一致性 32。Cursor 的 AI 代理可以通过 MCP 与 Linear 交互 43。因此，使用 Linear 模板使得 Linear 中的数据更“AI 就绪”，从而提高了 Cursor-MCP-Linear 集成在涉及 Issue 创建或修改的任务中的潜在效力和可靠性。

## **4\. CogniLink 开发计划概要**

### **4.1. 概述**

本节提出 CogniLink 插件的分阶段开发计划。该计划与 Linear Cycles 对齐以进行迭代进度跟踪 127，并使用 Milestones 标记主要成就 147。需要强调的是，这是一个计划模板；实际的 Issue 估算和周期分配将随着项目的进展而演变。

### **4.2. 阶段 1: 基础与核心 AI (周期 1-3, 里程碑: v0.1 \- Core AI Integration)**

* **任务:** 设置 Obsidian 插件项目：使用 Obsidian 示例插件或工具创建基础插件结构。配置构建过程（例如，TypeScript, esbuild）31。  
* **任务:** 集成 AI 提供商 API：选择 AI 提供商（OpenAI, Anthropic 63 等）。实现安全的 API 密钥处理（例如，使用 Obsidian 设置）。创建用于发送请求和接收响应的服务类。  
* **任务:** 实现基本上下文检索：通过 Obsidian API 访问当前活动笔记的内容 171。将此内容作为 Prompt 的一部分发送给 AI API。  
* **任务:** 开发初始 Prompt 策略：为基本的问答或摘要功能设计初始的系统 Prompt 和用户 Prompt 格式 172。  
* **任务:** 构建最小化聊天 UI (侧边栏)：为侧边栏创建一个 Obsidian Item View 183。实现基本的输入字段、消息显示区域（用户/AI）和发送功能。将 UI 连接到 AI API 服务。  
* **任务:** 设置基本单元测试：为 TypeScript 配置测试框架（例如，Jest, Vitest）。为 API 交互逻辑编写初始测试。

### **4.3. 阶段 2: 功能扩展 (周期 4-6, 里程碑: v0.5 \- UI & Context)**

* **任务:** 高级上下文 \- 链接笔记：实现识别活动笔记中 \[\[wikilinks\]\] 的逻辑。检索链接笔记的内容（可配置深度）以丰富 AI 上下文 59。  
* **任务:** 高级上下文 \- 标签与元数据：访问活动笔记的 frontmatter 和标签 59。将此元数据包含在 Prompt 上下文中。  
* **任务:** 对话历史管理：实现插件内或作为单独笔记存储和检索聊天历史记录的逻辑 174。通过总结或截断旧消息来管理上下文窗口限制。  
* **任务:** 构建插件设置 UI：创建一个 Obsidian 设置选项卡 193。允许用户输入 API 密钥、选择 AI 模型、配置上下文检索选项（深度、包含标签等）。  
* **任务:** 集成 Obsidian 命令：注册插件命令（例如，“Ask CogniLink about this note”，“Summarize selection with CogniLink”），可通过命令面板访问 198。  
* **任务:** 探索 RAG 实现：研究使用向量嵌入（例如，通过本地模型 199 或 API）和向量存储，以支持在整个库中进行查询 207。如果使用 RAG，实现基本的来源归因 207。

### **4.4. 阶段 3: 测试与优化 (周期 7-8, 里程碑: Beta Release)**

* **任务:** 全面测试：为核心逻辑（上下文处理、API 调用）编写单元测试。为 UI 组件和 Obsidian API 交互编写集成测试。  
* **任务:** 内部 Alpha/Beta 测试计划：招募内部用户或小范围外部测试者。收集关于可用性、功能和 Bug 的反馈 193。  
* **任务:** Bug 修复与性能调优：解决测试中发现的问题。优化上下文检索和 AI 响应时间。分析资源使用情况（内存、CPU）。  
* **任务:** UI/UX 优化：根据反馈改进聊天界面、设置面板的可用性和整体工作流 193。  
* **任务:** Prompt 优化：分析 AI 性能，并优化系统/用户 Prompt 以获得更好的准确性、相关性和语气 172。

### **4.5. 阶段 4: 发布与文档 (周期 9, 里程碑: v1.0 \- Public Release)**

* **任务:** 编写用户文档：在 GitHub 上创建全面的 README。准备关于设置、使用、功能和故障排除的指南 227。  
* **任务:** 准备社区插件发布：确保符合 Obsidian 插件指南 228。创建 manifest.json 并打包插件。  
* **任务:** 提交到 Obsidian 社区插件。  
* **任务:** 建立反馈与支持渠道：监控 GitHub Issues 以获取 Bug 报告和功能请求。考虑建立 Discord 频道或论坛帖子。  
* **任务:** 规划维护策略：概述处理未来 Obsidian 更新、AI 模型变更/弃用 229 和 Bug 修复的方法。

### **4.6. 迭代与反馈的关键性**

这个分阶段、按 Linear Cycles 组织的计划，天然地支持了迭代开发模型。每个阶段都会产出一个潜在可交付的增量（即使仅用于内部测试），从而允许纳入反馈并进行调整。这对于开发面向用户的工具（如 AI 助手）至关重要，因为其可用性和有效性通常需要基于实际使用情况进行优化。  
AI 助手和用户界面通常需要基于用户反馈进行迭代优化才能真正有效。敏捷方法论，通常通过 sprints/cycles 实现，就是为迭代开发和反馈循环而设计的 4。Linear 支持 Cycles，促进了这种迭代方法 3。将 CogniLink 计划按 Cycles 分阶段构建，使团队能够增量地构建、测试、获取反馈和调整。与非迭代的“瀑布式”方法相比，这降低了构建错误功能或糟糕用户体验的风险 118。

## **5\. 通过 MCP 集成 Linear 与 Cursor**

### **5.1. MCP 作为集成桥梁**

MCP（模型上下文协议）是使 Cursor 的 AI 代理能够与 Linear 等外部服务通信的关键技术 6。其客户端-服务器模型在此场景中表现为：Cursor 作为 MCP 客户端发起请求 20，而一个专门的 Linear MCP 服务器处理这些请求并与 Linear API 交互 19。通信通过 stdio 或 SSE 等传输方式，使用 JSON-RPC 协议进行 6。

### **5.2. 在 Cursor 中配置 Linear MCP 服务器**

* **配置文件位置:** Cursor 的 MCP 服务器配置通过 .cursor/mcp.json 文件管理。该文件可以放置在项目根目录（\<project\_root\>/.cursor/mcp.json）以实现项目特定的工具配置，或放置在用户主目录（\~/.cursor/mcp.json）以实现全局工具配置 43。对于 CogniLink 项目，建议使用项目特定的配置。  
* **寻找 Linear MCP 服务器:** 可以通过多种途径寻找可用的 MCP 服务器，例如官方 MCP 服务器仓库 233、awesome-mcp-servers 列表 99 或 MCP 服务器注册中心如 Smithery 92 或 cursor.directory 61。cline/linear-mcp 124 是一个可以参考的具体实现。  
* **配置示例 (.cursor/mcp.json):** 以下是使用 cline/linear-mcp 服务器的示例配置。请注意，实际的 command 和 args 可能需要根据服务器的安装方式和具体实现进行调整。  
  JSON  
  {  
    "mcpServers": {  
      "linear": {   
        "command": "node",   
        "args": \[  
          "/absolute/path/to/your/cloned/linear-mcp/build/index.js"   
          // 根据需要添加服务器特定参数  
        \],  
        "env": {  
          "LINEAR\_ACCESS\_TOKEN": "YOUR\_LINEAR\_PERSONAL\_ACCESS\_TOKEN"   
        }  
      }  
    }  
  }

  * **字段说明:**  
    * "linear": 在 Cursor 中标识此服务器的唯一名称。  
    * "command": 运行服务器的命令（例如 node, npx, uvx 等，取决于服务器实现）43。  
    * "args": 传递给命令的参数数组，通常包括服务器脚本的路径和任何必要的标志。  
    * "env": 用于设置环境变量，特别是 API 密钥或其他敏感配置 43。  
* **认证:** 需要在 Linear 设置中生成个人访问令牌 (Personal Access Token) 124。强烈建议将令牌存储在 env 字段中，而不是硬编码在 args 里，以提高安全性。  
* **验证:** 保存配置文件后，重启 Cursor。然后检查 Cursor 的 MCP 设置选项卡，确认名为 "linear" 的服务器已连接，并且其提供的工具（如 create\_issue, search\_issues 72）已列出 43。如果连接失败，请参考故障排除步骤 239。

### **5.3. 工作流可视化 (Mermaid 图)**

* **目的:** 清晰地展示开发者在 Cursor 中通过 MCP 与 Linear API 交互创建 Issue 的流程。  
* **位置:** 第 5 节，配置说明之后。  
* **Mermaid 代码:**  
  代码段  
  sequenceDiagram  
      participant Dev as Developer  
      participant Cursor as Cursor IDE (Agent)  
      participant LinearMCP as Linear MCP Server  
      participant LinearAPI as Linear API

      Dev-\>\>Cursor: 编写代码/注释 (例如, // TODO: 修复认证 Bug)  
      Dev-\>\>Cursor: 调用 Agent ("从此 TODO 创建 Linear issue")  
      Note over Cursor: Agent 解析 Prompt, 识别 TODO, 决定使用工具  
      Cursor-\>\>LinearMCP: tools/call 请求 (tool='create\_issue', args={title: "修复认证 Bug",...})  
      LinearMCP-\>\>LinearAPI: POST /issues (携带令牌的 API 请求)  
      LinearAPI--\>\>LinearMCP: API 响应 (成功, Issue ID: LIN-123)  
      LinearMCP--\>\>Cursor: tools/call 响应 (result={issueId: "LIN-123",...})  
      Note over Cursor: Agent 处理结果  
      Cursor--\>\>Dev: 显示确认信息 ("Issue LIN-123 创建成功.")

* **图解说明:** 简要解释该图，强调请求从用户 Prompt 到 Linear API 调用再返回确认信息的流程。

### **5.4. Cursor 内交互示例**

* **前提:** 假设 Linear MCP 服务器已在 Cursor 中正确配置并运行。  
* **Prompt 语法:** 解释如何使用 @Linear（或配置的服务器名称）来指定请求目标，或者依赖 Agent 的自动工具选择功能 43。  
* **示例 Prompts:**  
  * **从代码创建 Issue:** 选中包含 // TODO: 重构此逻辑 注释的代码块。调用 Cursor 聊天 (Cmd+L) 或内联编辑 (Cmd+K)，然后输入 Prompt: 从此 TODO 创建一个 Linear issue，分配给我 (@me)，添加 'refactor' 和 'P3-Medium' 标签，并将其添加到当前 cycle。  
  * **创建 Bug 报告:** @Linear create issue type=bug title="设置保存时 UI 闪烁" description="保存设置时按钮保持禁用状态。见附件截图 \[如果支持/添加了图像上下文\]" priority="P1-Urgent" labels="bug,UI"  
  * **搜索 Issues:** @Linear search issues status="Code Review" assignee=@me  
  * **更新 Issue:** @Linear update issue id=COG-123 status="Testing" comment="已部署到 staging 环境进行 QA。" (注意: 更新/评论功能取决于具体的 MCP 服务器实现 124)。  
* **预期 Agent 行为:** 描述 Cursor Agent 可能如何解析 Prompt，识别正确的 Linear MCP 工具（create\_issue, search\_issues, update\_issue），构建参数，请求用户批准（除非禁用了批准步骤 35），通过 MCP 服务器执行工具，并显示结果 43。

### **5.5. 局限性与安全考量**

* **Cursor MCP 限制:** 重申 Cursor 目前仅支持所有已连接服务器的前约 40 个工具，并且尚不支持 MCP Resources（资源）43。这可能会影响功能复杂的服务器。在 SSH 等远程开发环境中使用 MCP 也可能存在问题 43。  
* **MCP 生态系统成熟度:** MCP 仍在发展中 18。开发者应准备好应对协议或服务器实现中可能出现的破坏性变更。建议关注 MCP 路线图 245 和服务器仓库以获取更新。  
* **安全 \- API 密钥:** 强调保护 Linear 个人访问令牌的重要性。虽然在 mcp.json 中使用 env 字段比硬编码更好，但令牌在运行服务器进程的本地机器上仍然可以访问 43。建议使用具有最低必要权限的令牌。  
* **安全 \- 本地服务器执行:** 解释 Cursor 是以用户权限在本地执行配置的 command 239。务必只配置来自可信来源的 MCP 服务器 75。恶意服务器可能访问本地文件或执行任意代码 247。对于不可信的服务器，可以考虑在沙盒环境（如 Docker，尽管设置更复杂 105）中运行。  
* **安全 \- Prompt 注入:** 虽然风险不如直接执行恶意服务器代码高，但需要注意发送到 Linear 的 Prompt（例如，由 AI 生成的 Issue 描述）如果未经过适当清理，也可能包含恶意指令 249。

### **5.6. MCP 集成：强大但需谨慎**

通过 MCP 将 Linear 集成到 Cursor IDE 中，通过减少上下文切换和实现自动化，提供了显著的工作流改进。然而，作为一项新兴技术，它需要仔细的设置、对安全最佳实践的关注（特别是关于 API 密钥和服务器信任），以及对当前局限性和潜在生态系统波动性的认识。  
这种集成的价值在于它连接了结构化的项目管理（Linear）和 AI 驱动的开发（Cursor）。然而，成功的实施不仅仅是技术连接。MCP 协议本身仍在发展 18，这意味着可能会有变更。更重要的是安全风险：运行本地服务器 75 和处理 API 密钥 84 需要用户高度警惕，只信任可靠的服务器来源，并使用权限最小化的令牌。Cursor 自身的 MCP 实现也有局限性 43。因此，尽管集成潜力巨大，但必须辅以谨慎的操作和持续的风险评估。

## **6\. 结论与建议**

### **6.1. 总结**

本报告提出了一个为 CogniLink Obsidian 插件设计的结构化开发工作流，该工作流结合了 Linear 进行项目管理和 Cursor 进行 AI 辅助开发。报告详细介绍了 Linear 项目的关键配置（项目、周期、里程碑、模板）、针对 CogniLink 的具体 Issue 示例、一个分阶段的开发计划，以及实现 Cursor 与 Linear 之间交互的 MCP 集成方法。

### **6.2. 核心建议**

* **采纳结构化管理:** 强烈建议从项目一开始就采纳所提议的 Linear 设置（Cycles, Milestones, Labels, Templates），以保持清晰度和可跟踪性。  
* **实施 MCP 集成:** 实现 Cursor-Linear MCP 集成，以直接在 IDE 中简化任务创建和更新流程。  
* **从模板开始:** 使用明确定义的项目结构和 Issue 模板来启动项目。  
* **迭代开发:** 根据周期回顾和反馈，迭代开发计划。  
* **关注 MCP 发展:** 持续关注 MCP 协议和相关服务器的发展及潜在变更 18。

### **6.3. 未来考量**

* **Obsidian MCP 集成:** 探索未来可能出现的 Obsidian MCP 服务器，以实现 Cursor 与 Obsidian Vault 的直接交互，从而进一步增强上下文感知能力 59。  
* **高级 AI 代理:** 考虑利用基于 MCP 构建的更高级 AI 代理框架（如 LangGraph 253 或其他类似工具）来实现更复杂的自动化工作流。

成功实施此工作流需要团队对 Linear 中定义的结构化流程的承诺，并有效地利用 Cursor 内的 AI 功能。基于团队经验的持续优化将是成功的关键。

#### **引用的著作**

1. Obsidian \- Sharpen your thinking, 访问时间为 四月 22, 2025， [https://obsidian.md/](https://obsidian.md/)  
2. How to Use Linear: A Comprehensive Guide \- Guru, 访问时间为 四月 22, 2025， [https://www.getguru.com/reference/how-to-use-linear-a-comprehensive-guide](https://www.getguru.com/reference/how-to-use-linear-a-comprehensive-guide)  
3. Ultimate Beginner's Guide to Linear: Get Started \- Tool Finder, 访问时间为 四月 22, 2025， [https://toolfinder.co/guides/linear-for-beginners](https://toolfinder.co/guides/linear-for-beginners)  
4. Linear – Plan and build products, 访问时间为 四月 22, 2025， [https://linear.app/](https://linear.app/)  
5. What is Linear App? Features, Pricing & Reviews \- Bardeen AI, 访问时间为 四月 22, 2025， [https://www.bardeen.ai/answers/what-is-linear-app](https://www.bardeen.ai/answers/what-is-linear-app)  
6. Linear Project Management: Streamline Your Workflow and Boost Productivity \- Everhour, 访问时间为 四月 22, 2025， [https://everhour.com/blog/linear-project-management/](https://everhour.com/blog/linear-project-management/)  
7. Cursor – Welcome to Cursor, 访问时间为 四月 22, 2025， [https://docs.cursor.com/get-started/welcome](https://docs.cursor.com/get-started/welcome)  
8. Enhancing Software Development with AI Tools: A Practical Look at Cursor IDE \- ELEKS, 访问时间为 四月 22, 2025， [https://eleks.com/research/cursor-ide/](https://eleks.com/research/cursor-ide/)  
9. How to Use Cursor AI in Visual Studio Code: Complete Step-by-Step Guide | GeeksforGeeks, 访问时间为 四月 22, 2025， [https://www.geeksforgeeks.org/how-to-use-cursor-ai-in-visual-studio-code/](https://www.geeksforgeeks.org/how-to-use-cursor-ai-in-visual-studio-code/)  
10. How to Setup Cursor: A Beginner's Guide \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/cursor-setup-guide](https://apidog.com/blog/cursor-setup-guide)  
11. Must-Have MCP Servers for Coding and Beyond : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1k0f3vs/musthave\_mcp\_servers\_for\_coding\_and\_beyond/](https://www.reddit.com/r/ClaudeAI/comments/1k0f3vs/musthave_mcp_servers_for_coding_and_beyond/)  
12. Anthropic Publishes Model Context Protocol Specification for LLM App Integration \- InfoQ, 访问时间为 四月 22, 2025， [https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/)  
13. Model Context Protocol: What You Need To Know \- Gradient Flow, 访问时间为 四月 22, 2025， [https://gradientflow.com/model-context-protocol-what-you-need-to-know/](https://gradientflow.com/model-context-protocol-what-you-need-to-know/)  
14. Model Context Protocol (MCP) \- Anthropic API, 访问时间为 四月 22, 2025， [https://docs.anthropic.com/en/docs/agents-and-tools/mcp](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)  
15. Introducing the Model Context Protocol \- Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)  
16. Model Context Protocol (MCP): A Guide With Demo Project \- DataCamp, 访问时间为 四月 22, 2025， [https://www.datacamp.com/tutorial/mcp-model-context-protocol](https://www.datacamp.com/tutorial/mcp-model-context-protocol)  
17. Specification \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/specification/2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26)  
18. Understanding the Model Context Protocol (MCP) | deepset Blog, 访问时间为 四月 22, 2025， [https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp](https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp)  
19. Model Context Protocol (MCP) \- Everything You Need to Know, 访问时间为 四月 22, 2025， [https://zencoder.ai/blog/model-context-protocol](https://zencoder.ai/blog/model-context-protocol)  
20. Model Context Protocol: Introduction, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)  
21. Model Context Protocol (MCP): A comprehensive introduction for developers \- Stytch, 访问时间为 四月 22, 2025， [https://stytch.com/blog/model-context-protocol-introduction/](https://stytch.com/blog/model-context-protocol-introduction/)  
22. How to Use Model Context Protocol the Right Way | Boomi, 访问时间为 四月 22, 2025， [https://boomi.com/blog/model-context-protocol-how-to-use/](https://boomi.com/blog/model-context-protocol-how-to-use/)  
23. In-Depth review of the MCP authorization spec (2025-03-26 edition) \- Logto blog, 访问时间为 四月 22, 2025， [https://blog.logto.io/mcp-auth-spec-review-2025-03-26](https://blog.logto.io/mcp-auth-spec-review-2025-03-26)  
24. Frequently Asked Questions About Model Context Protocol (MCP) and Integrating with AI for Agentic Applications \- Blog | Tenable®, 访问时间为 四月 22, 2025， [https://www.tenable.com/blog/faq-about-model-context-protocol-mcp-and-integrating-ai-for-agentic-applications](https://www.tenable.com/blog/faq-about-model-context-protocol-mcp-and-integrating-ai-for-agentic-applications)  
25. Anthropic's Model Context Protocol (MCP): A Universal Connector for AI | GPT-trainer Blog, 访问时间为 四月 22, 2025， [https://gpt-trainer.com/blog/anthropic+model+context+protocol+mcp](https://gpt-trainer.com/blog/anthropic+model+context+protocol+mcp)  
26. API Integration in Web Development: Best Practices \- Netguru, 访问时间为 四月 22, 2025， [https://www.netguru.com/blog/api-integration-best-practices](https://www.netguru.com/blog/api-integration-best-practices)  
27. Leveraging model context protocol to unlock strategic advantage in generative AI deployments \- UST, 访问时间为 四月 22, 2025， [https://www.ust.com/en/insights/leveraging-model-context-protocol-to-unlock-strategic-advantage-in-generative-ai-deployments](https://www.ust.com/en/insights/leveraging-model-context-protocol-to-unlock-strategic-advantage-in-generative-ai-deployments)  
28. AI Model Context Protocol (MCP) and Security \- Cisco Community, 访问时间为 四月 22, 2025， [https://community.cisco.com/t5/security-blogs/ai-model-context-protocol-mcp-and-security/ba-p/5274394](https://community.cisco.com/t5/security-blogs/ai-model-context-protocol-mcp-and-security/ba-p/5274394)  
29. MCP and AI Security: What You Need to Know \- Treblle Blog, 访问时间为 四月 22, 2025， [https://blog.treblle.com/model-context-protocol-ai-security/](https://blog.treblle.com/model-context-protocol-ai-security/)  
30. Cursor might be my VSCode replacement \- Dev Talk \- ProcessWire Support Forums, 访问时间为 四月 22, 2025， [https://processwire.com/talk/topic/29439-cursor-might-be-my-vscode-replacement/](https://processwire.com/talk/topic/29439-cursor-might-be-my-vscode-replacement/)  
31. Helixform/CodeCursor: An extension for using Cursor in Visual Studio Code. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/Helixform/CodeCursor](https://github.com/Helixform/CodeCursor)  
32. Linear – A better way to build products, 访问时间为 四月 22, 2025， [https://linear-beige.vercel.app/](https://linear-beige.vercel.app/)  
33. Moving to Linear for project management \- Yummygum, 访问时间为 四月 22, 2025， [https://yummygum.com/blog/moving-to-linear-for-project-management](https://yummygum.com/blog/moving-to-linear-for-project-management)  
34. Cursor AI: A Guide With 10 Practical Examples \- DataCamp, 访问时间为 四月 22, 2025， [https://www.datacamp.com/tutorial/cursor-ai-code-editor](https://www.datacamp.com/tutorial/cursor-ai-code-editor)  
35. How I use Cursor (+ my best tips) \- Builder.io, 访问时间为 四月 22, 2025， [https://www.builder.io/blog/cursor-tips](https://www.builder.io/blog/cursor-tips)  
36. App completely build using Claude Sonnet and Cursor AI IDE : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1f1es5i/cursor\_ai\_app\_completely\_build\_using\_claude/](https://www.reddit.com/r/ChatGPTCoding/comments/1f1es5i/cursor_ai_app_completely_build_using_claude/)  
37. Anyone using Cursor AI and barely writing any code? Anything better than Cursor AI ? : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1c1o8wm/anyone\_using\_cursor\_ai\_and\_barely\_writing\_any/](https://www.reddit.com/r/ChatGPTCoding/comments/1c1o8wm/anyone_using_cursor_ai_and_barely_writing_any/)  
38. How To Use Cursor AI For Beginners \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=Rgz6mX93C4Y](https://www.youtube.com/watch?v=Rgz6mX93C4Y)  
39. Cursor AI Tutorial for Beginners \[2025 Edition\] \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=3289vhOUdKA](https://www.youtube.com/watch?v=3289vhOUdKA)  
40. Cursor AI Tutorial for Beginners in 10 minutes\! (VSCode killer?) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=ZOpH-rFq2TE](https://www.youtube.com/watch?v=ZOpH-rFq2TE)  
41. Get Started with Cursor \- The AI Code Editor \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=CqkZ-ybl3lg](https://www.youtube.com/watch?v=CqkZ-ybl3lg)  
42. Cursor – @Docs, 访问时间为 四月 22, 2025， [https://docs.cursor.com/context/@-symbols/@-docs](https://docs.cursor.com/context/@-symbols/@-docs)  
43. Model Context Protocol \- Cursor, 访问时间为 四月 22, 2025， [https://docs.cursor.com/context/model-context-protocol](https://docs.cursor.com/context/model-context-protocol)  
44. Cursor and Updated OpenAI API Documentation, 访问时间为 四月 22, 2025， [https://community.openai.com/t/cursor-and-updated-openai-api-documentation/1110926](https://community.openai.com/t/cursor-and-updated-openai-api-documentation/1110926)  
45. 20+ Awesome Cursor Rules You Can Setup for Your Cursor AI IDE Now \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/awesome-cursor-rules/](https://apidog.com/blog/awesome-cursor-rules/)  
46. Cursor IDE: Setup and Workflow in Larger Projects \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/cursor/comments/1ikq9m6/cursor\_ide\_setup\_and\_workflow\_in\_larger\_projects/](https://www.reddit.com/r/cursor/comments/1ikq9m6/cursor_ide_setup_and_workflow_in_larger_projects/)  
47. The VS Code/Cursor Setup to INCREASE Productivity (2025) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=fG6HV3pxtOI](https://www.youtube.com/watch?v=fG6HV3pxtOI)  
48. Coding with Cursor \- I built a Chrome Extension from Scratch \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=EvEvK8yQchw](https://www.youtube.com/watch?v=EvEvK8yQchw)  
49. Cursor IDE or copy+paste into the API? What do you use and why? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1eqjtcv/cursor\_ide\_or\_copypaste\_into\_the\_api\_what\_do\_you/](https://www.reddit.com/r/ChatGPTCoding/comments/1eqjtcv/cursor_ide_or_copypaste_into_the_api_what_do_you/)  
50. Will extensions be able to access the cursor ai features via an API?, 访问时间为 四月 22, 2025， [https://forum.cursor.com/t/will-extensions-be-able-to-access-the-cursor-ai-features-via-an-api/1307](https://forum.cursor.com/t/will-extensions-be-able-to-access-the-cursor-ai-features-via-an-api/1307)  
51. getcursor/cursor: The AI Code Editor \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/getcursor/cursor](https://github.com/getcursor/cursor)  
52. So how many of you have permanently switched to cursor IDE and how's that working out for you? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1fdrbwa/so\_how\_many\_of\_you\_have\_permanently\_switched\_to/](https://www.reddit.com/r/ClaudeAI/comments/1fdrbwa/so_how_many_of_you_have_permanently_switched_to/)  
53. My experience with Github Copilot vs Cursor : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1cft751/my\_experience\_with\_github\_copilot\_vs\_cursor/](https://www.reddit.com/r/ChatGPTCoding/comments/1cft751/my_experience_with_github_copilot_vs_cursor/)  
54. Integrate OpenAI into Obsidian \- Data Engineering Blog, 访问时间为 四月 22, 2025， [https://www.ssp.sh/brain/integrate-openai-into-obsidian/](https://www.ssp.sh/brain/integrate-openai-into-obsidian/)  
55. Obsidian is not just my PKM, it's my content creation hub : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1k4vmz1/obsidian\_is\_not\_just\_my\_pkm\_its\_my\_content/](https://www.reddit.com/r/ObsidianMD/comments/1k4vmz1/obsidian_is_not_just_my_pkm_its_my_content/)  
56. How I Manage Myself and My Team Using Obsidian Tasks \- Pelayo Arbués, 访问时间为 四月 22, 2025， [https://www.pelayoarbues.com/notes/How-I-Manage-Myself-and-My-Team-Using-Obsidian-Tasks](https://www.pelayoarbues.com/notes/How-I-Manage-Myself-and-My-Team-Using-Obsidian-Tasks)  
57. Plugins \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?id=](https://obsidian.md/plugins?id)  
58. Plugins \- Prompt \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=prompt](https://obsidian.md/plugins?search=prompt)  
59. MCP server for Obsidian \- GenAI Works, 访问时间为 四月 22, 2025， [https://genai.works/mcp-servers/mcp-server-for-obsidian-m99w3cvw](https://genai.works/mcp-servers/mcp-server-for-obsidian-m99w3cvw)  
60. StevenStavrakis/obsidian-mcp: A simple MCP server for ... \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/StevenStavrakis/obsidian-mcp](https://github.com/StevenStavrakis/obsidian-mcp)  
61. MCP Servers for Cursor \- Cursor Directory, 访问时间为 四月 22, 2025， [https://cursor.directory/mcp](https://cursor.directory/mcp)  
62. Model Context Protocol (MCP) server designed for LLMs to interact with Obsidian vaults. Provides secure, token-aware tools for seamless knowledge base management through a standardized interface. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/obsidian-mcp-server](https://github.com/cyanheads/obsidian-mcp-server)  
63. jacksteamdev/obsidian-mcp-tools: Add Obsidian ... \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools](https://github.com/jacksteamdev/obsidian-mcp-tools)  
64. How to work with Local Files Directly Using an MCP Server and Claude \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/local-file-mcp-server/](https://apidog.com/blog/local-file-mcp-server/)  
65. Universal Tools For AI | \- MCP Run, 访问时间为 四月 22, 2025， [https://docs.mcp.run/blog/2024/12/18/universal-tools-for-ai/](https://docs.mcp.run/blog/2024/12/18/universal-tools-for-ai/)  
66. agent-architectures-with-mcp \- AIXplore \- Tech Articles \- Obsidian Publish, 访问时间为 四月 22, 2025， [https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agent-architectures-with-mcp](https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agent-architectures-with-mcp)  
67. How to Use the Obsidian MCP Server \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/obsidian-mcp-server/](https://apidog.com/blog/obsidian-mcp-server/)  
68. marcelmarais/obsidian-mcp-server \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/marcelmarais/obsidian-mcp-server](https://github.com/marcelmarais/obsidian-mcp-server)  
69. can't process the image returned from MCP server · Issue \#1033 · cline/cline \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cline/cline/issues/1033](https://github.com/cline/cline/issues/1033)  
70. Mind blown: MCP \+ Obsidian : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1hdl0cl/mind\_blown\_mcp\_obsidian/](https://www.reddit.com/r/ClaudeAI/comments/1hdl0cl/mind_blown_mcp_obsidian/)  
71. MCP and Python MCP Server Development Explained-Chief AI Sharing Circle, 访问时间为 四月 22, 2025， [https://www.aisharenet.com/en/mcp-he-python-mcp-s/](https://www.aisharenet.com/en/mcp-he-python-mcp-s/)  
72. 30+ MCP Ideas with Complete Source Code \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/copilotkit/30-mcp-ideas-with-complete-source-code-d8e](https://dev.to/copilotkit/30-mcp-ideas-with-complete-source-code-d8e)  
73. README.md \- StevenStavrakis/obsidian-mcp \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/StevenStavrakis/obsidian-mcp/blob/main/README.md](https://github.com/StevenStavrakis/obsidian-mcp/blob/main/README.md)  
74. MarkusPfundstein/mcp-obsidian: MCP server that interacts with Obsidian via the Obsidian rest API community plugin \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/MarkusPfundstein/mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian)  
75. Get started with Claude Desktop and Neon MCP Server \- Neon Guides, 访问时间为 四月 22, 2025， [https://neon.tech/guides/neon-mcp-server](https://neon.tech/guides/neon-mcp-server)  
76. Introducing Claude Crew: Enhancing Claude Desktop's Coding Agent Capabilities, 访问时间为 四月 22, 2025， [https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah](https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah)  
77. How does Cursor compare to using Claude desktop app with MCP? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1ivuhs4/how\_does\_cursor\_compare\_to\_using\_claude\_desktop/](https://www.reddit.com/r/ClaudeAI/comments/1ivuhs4/how_does_cursor_compare_to_using_claude_desktop/)  
78. Claude Code tutorials \- Anthropic API, 访问时间为 四月 22, 2025， [https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/tutorials](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/tutorials)  
79. obsidian-mcp-tools/.clinerules at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/.clinerules](https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/.clinerules)  
80. Claude MCP for Obsidian using Rest API \- Developers: Plugin & API, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284](https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284)  
81. How to use an MCP Server in Claude Desktop, 访问时间为 四月 22, 2025， [https://blog.egmond.dev/mcp-server-claude](https://blog.egmond.dev/mcp-server-claude)  
82. obsidian-mcp-tools/README.md at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/README.md](https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/README.md)  
83. Obsidian \- Awesome MCP Servers, 访问时间为 四月 22, 2025， [https://mcpservers.org/servers/MarkusPfundstein/mcp-obsidian](https://mcpservers.org/servers/MarkusPfundstein/mcp-obsidian)  
84. Supercharge your knowledge management \- integrating Obsidian MCP with Claude, 访问时间为 四月 22, 2025， [https://www.qed42.com/insights/supercharge-your-knowledge-management---integrating-obsidian-mcp-with-claude](https://www.qed42.com/insights/supercharge-your-knowledge-management---integrating-obsidian-mcp-with-claude)  
85. Let Claude Automate Your Obsidian Notes: Second Brain AI Agent (MCP) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=VeTnndXyJQI](https://www.youtube.com/watch?v=VeTnndXyJQI)  
86. Releases · jacksteamdev/obsidian-mcp-tools \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/releases](https://github.com/jacksteamdev/obsidian-mcp-tools/releases)  
87. Obsidian knowledgebase \+ MCP (Claude desktop) : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1jwqxeq/obsidian\_knowledgebase\_mcp\_claude\_desktop/](https://www.reddit.com/r/ObsidianMD/comments/1jwqxeq/obsidian_knowledgebase_mcp_claude_desktop/)  
88. How to Set Up MCP Servers on Claude Desktop (Mac) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=4QnA8ci--r8](https://www.youtube.com/watch?v=4QnA8ci--r8)  
89. smithery-ai/mcp-obsidian: A connector for Claude Desktop to read and search an Obsidian vault. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/smithery-ai/mcp-obsidian](https://github.com/smithery-ai/mcp-obsidian)  
90. Claude Reads My Obsidian Second Brain. I Just Vibe \- mcp \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/mcp/comments/1jnal2u/claude\_reads\_my\_obsidian\_second\_brain\_i\_just\_vibe/](https://www.reddit.com/r/mcp/comments/1jnal2u/claude_reads_my_obsidian_second_brain_i_just_vibe/)  
91. How to connect Cursor to 100+ MCP Servers within minutes \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/composiodev/how-to-connect-cursor-to-100-mcp-servers-within-minutes-3h74](https://dev.to/composiodev/how-to-connect-cursor-to-100-mcp-servers-within-minutes-3h74)  
92. Claude \+ MCPs \- 'Vibe Coding' Without Specialized IDEs Part 1 \- Stephan Miller, 访问时间为 四月 22, 2025， [https://www.stephanmiller.com/using-mcps-with-claude-desktop/](https://www.stephanmiller.com/using-mcps-with-claude-desktop/)  
93. How to Build an MCP Server, 访问时间为 四月 22, 2025， [https://www.differentiated.io/blog/how-to-build-an-mcp-server](https://www.differentiated.io/blog/how-to-build-an-mcp-server)  
94. Developers: Plugin & API \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/c/developers-api/14](https://forum.obsidian.md/c/developers-api/14)  
95. Obsidian MCP REST Server \- UBOS.tech, 访问时间为 四月 22, 2025， [https://ubos.tech/mcp/obsidian-mcp-rest-server/](https://ubos.tech/mcp/obsidian-mcp-rest-server/)  
96. MCP Servers with Claude Desktop \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=UIDsUfmtIqc](https://www.youtube.com/watch?v=UIDsUfmtIqc)  
97. Can someone explain MCP to me? How are you using it? And what has it allowed you to do that you couldn't do before? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h55zxd/can\_someone\_explain\_mcp\_to\_me\_how\_are\_you\_using/](https://www.reddit.com/r/ClaudeAI/comments/1h55zxd/can_someone_explain_mcp_to_me_how_are_you_using/)  
98. Request for Web Clipper Template for Claude \- Help \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/request-for-web-clipper-template-for-claude/94684](https://forum.obsidian.md/t/request-for-web-clipper-template-for-claude/94684)  
99. punkpeye/awesome-mcp-servers: A collection of MCP servers. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)  
100. Model Context Protocol (MCP) an overview \- Philschmid, 访问时间为 四月 22, 2025， [https://www.philschmid.de/mcp-introduction](https://www.philschmid.de/mcp-introduction)  
101. Powering AI Agents with Real-Time Data Using Anthropic's MCP and Confluent, 访问时间为 四月 22, 2025， [https://www.confluent.io/blog/ai-agents-using-anthropic-mcp/](https://www.confluent.io/blog/ai-agents-using-anthropic-mcp/)  
102. 10 Best MCP Servers for Developers to Try in 2025 \- Trickle AI, 访问时间为 四月 22, 2025， [https://www.trickle.so/blog/10-best-mcp-servers-for-developers](https://www.trickle.so/blog/10-best-mcp-servers-for-developers)  
103. Breaking Down Model Context Protocol (MCP) \- Botpress, 访问时间为 四月 22, 2025， [https://botpress.com/blog/model-context-protocol](https://botpress.com/blog/model-context-protocol)  
104. The Model Context Protocol (MCP) by Anthropic: Origins, functionality, and impact \- Wandb, 访问时间为 四月 22, 2025， [https://wandb.ai/onlineinference/mcp/reports/The-Model-Context-Protocol-MCP-by-Anthropic-Origins-functionality-and-impact--VmlldzoxMTY5NDI4MQ](https://wandb.ai/onlineinference/mcp/reports/The-Model-Context-Protocol-MCP-by-Anthropic-Origins-functionality-and-impact--VmlldzoxMTY5NDI4MQ)  
105. Everything you need to get up and running with MCP – Anthropic's USB-C for AI, 访问时间为 四月 22, 2025， [https://www.theregister.com/2025/04/21/mcp\_guide/](https://www.theregister.com/2025/04/21/mcp_guide/)  
106. MCP and LLM Security Research Briefing | Wiz Blog, 访问时间为 四月 22, 2025， [https://www.wiz.io/blog/mcp-security-research-briefing](https://www.wiz.io/blog/mcp-security-research-briefing)  
107. Everything you need to know about MCP \- Replit Blog, 访问时间为 四月 22, 2025， [https://blog.replit.com/everything-you-need-to-know-about-mcp](https://blog.replit.com/everything-you-need-to-know-about-mcp)  
108. A surprising discovery me\! About MCP and Function calling \- Use cases and examples, 访问时间为 四月 22, 2025， [https://community.openai.com/t/a-surprising-discovery-me-about-mcp-and-function-calling/1223345](https://community.openai.com/t/a-surprising-discovery-me-about-mcp-and-function-calling/1223345)  
109. MCP And The Future Of LLMs: A New Standard For Enterprise SaaS Integration \- Verdantix, 访问时间为 四月 22, 2025， [https://www.verdantix.com/insights/blogs/mcp-and-the-future-of-llms-a-new-standard-for-enterprise-saas-integration](https://www.verdantix.com/insights/blogs/mcp-and-the-future-of-llms-a-new-standard-for-enterprise-saas-integration)  
110. Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2503.23278](https://arxiv.org/html/2503.23278)  
111. MCP (Model Context Protocol): The Future of AI Integration \- Digidop, 访问时间为 四月 22, 2025， [https://www.digidop.com/blog/mcp-ai-revolution](https://www.digidop.com/blog/mcp-ai-revolution)  
112. What is the Model Context Protocol (MCP)? \- Builder.io, 访问时间为 四月 22, 2025， [https://www.builder.io/blog/model-context-protocol](https://www.builder.io/blog/model-context-protocol)  
113. An Introduction to MCP and Authorization | Auth0, 访问时间为 四月 22, 2025， [https://auth0.com/blog/an-introduction-to-mcp-and-authorization/](https://auth0.com/blog/an-introduction-to-mcp-and-authorization/)  
114. A Developer's Guide to the MCP \- Zep \- AI, 访问时间为 四月 22, 2025， [https://www.getzep.com/ai-agents/developer-guide-to-mcp?ref=blog.getzep.com](https://www.getzep.com/ai-agents/developer-guide-to-mcp?ref=blog.getzep.com)  
115. Model Context Protocol (MCP) Comprehensive Guide for 2025 \- Dysnix, 访问时间为 四月 22, 2025， [https://dysnix.com/blog/model-context-protocol](https://dysnix.com/blog/model-context-protocol)  
116. model-context-protocol-resources/guides/mcp-client-development-guide.md at main, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md)  
117. model-context-protocol-resources/guides/mcp-server-development-guide.md at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md)  
118. Linear Project Management Indepth Overview & 14 Key Benefits, 访问时间为 四月 22, 2025， [https://aims.education/linear-project-management-overview-and-tools/](https://aims.education/linear-project-management-overview-and-tools/)  
119. AI-Aided Obsidian? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1iyiu50/aiaided\_obsidian/](https://www.reddit.com/r/ObsidianMD/comments/1iyiu50/aiaided_obsidian/)  
120. A Deep Dive Into MCP and the Future of AI Tooling | Andreessen ..., 访问时间为 四月 22, 2025， [https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/](https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/)  
121. Linear MCP Server – Facilitates project management with the Linear API via the Model Context Protocol, allowing users to manage initiatives, projects, issues, and their relationships through features like creation, viewing, updating, and prioritization. \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/mcp/comments/1iq5ttv/linear\_mcp\_server\_facilitates\_project\_management/](https://www.reddit.com/r/mcp/comments/1iq5ttv/linear_mcp_server_facilitates_project_management/)  
122. Linear MCP Server \- GenAI Works, 访问时间为 四月 22, 2025， [https://genai.works/mcp-servers/linear-mcp-server-m9a2ifnx](https://genai.works/mcp-servers/linear-mcp-server-m9a2ifnx)  
123. Linear MCP Server – Enables interaction with Linear resources through an MCP interface, offering functionality for issue management and resource retrieval with rate limiting and error handling support. \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/mcp/comments/1impvnz/linear\_mcp\_server\_enables\_interaction\_with\_linear/](https://www.reddit.com/r/mcp/comments/1impvnz/linear_mcp_server_enables_interaction_with_linear/)  
124. cline/linear-mcp: a private MCP server for accessing Linear \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cline/linear-mcp](https://github.com/cline/linear-mcp)  
125. Example Servers \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/examples](https://modelcontextprotocol.io/examples)  
126. Projects – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/projects](https://linear.app/docs/projects)  
127. How we use Linear \- One Build At A Time, 访问时间为 四月 22, 2025， [https://build.plumhq.com/how-we-use-linear/](https://build.plumhq.com/how-we-use-linear/)  
128. How we run projects at Linear \- Linear Blog, 访问时间为 四月 22, 2025， [https://linear.app/blog/how-we-run-projects-at-linear](https://linear.app/blog/how-we-run-projects-at-linear)  
129. Project templates – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/project-templates](https://linear.app/docs/project-templates)  
130. Linear workflow: Definition and tips – TimeTrack Blog, 访问时间为 四月 22, 2025， [https://www.timetrackapp.com/en/blog/linear-workflow/](https://www.timetrackapp.com/en/blog/linear-workflow/)  
131. 11 Workflow Examples & Use Cases \[2024\] \- Atlassian, 访问时间为 四月 22, 2025， [https://www.atlassian.com/agile/project-management/workflow-examples](https://www.atlassian.com/agile/project-management/workflow-examples)  
132. Linear Project Management for Creative Agencies: A Simple Guide \- ManyRequests, 访问时间为 四月 22, 2025， [https://www.manyrequests.com/blog/linear-project-management](https://www.manyrequests.com/blog/linear-project-management)  
133. Linear Project Management: An In-Depth Overview \- Knowledgewoods, 访问时间为 四月 22, 2025， [https://www.knowledgewoods.com/blog/linear-project-management-an-in-depth-overview](https://www.knowledgewoods.com/blog/linear-project-management-an-in-depth-overview)  
134. Getting Started with Linear Project management software, 访问时间为 四月 22, 2025， [https://devdeba.hashnode.dev/getting-started-with-linear-project-management-software](https://devdeba.hashnode.dev/getting-started-with-linear-project-management-software)  
135. How to Create Custom Workflows in Linear: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-create-custom-workflows-in-linear](https://www.storylane.io/tutorials/how-to-create-custom-workflows-in-linear)  
136. Integrations \- Linear, 访问时间为 四月 22, 2025， [https://linear.app/integrations](https://linear.app/integrations)  
137. Linear Integrations | Automated Workflows with Latenode, 访问时间为 四月 22, 2025， [https://latenode.com/integrations/linear?4b77e0b0\_page=2&820bb7f0\_page=10](https://latenode.com/integrations/linear?4b77e0b0_page=2&820bb7f0_page=10)  
138. Linear Integrations | Automated Workflows with Latenode, 访问时间为 四月 22, 2025， [https://latenode.com/integrations/linear](https://latenode.com/integrations/linear)  
139. Linear Trigger integrations | Workflow automation with n8n, 访问时间为 四月 22, 2025， [https://n8n.io/integrations/linear-trigger/](https://n8n.io/integrations/linear-trigger/)  
140. Linear integrations | Workflow automation with n8n, 访问时间为 四月 22, 2025， [https://n8n.io/integrations/linear/](https://n8n.io/integrations/linear/)  
141. Linear work flow? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/Linear/comments/1i6mmr6/linear\_work\_flow/](https://www.reddit.com/r/Linear/comments/1i6mmr6/linear_work_flow/)  
142. How To Use Cycles In Linear \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=XFEAOxvZ-Vs](https://www.youtube.com/watch?v=XFEAOxvZ-Vs)  
143. Cycles – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/cycles](https://linear.app/docs/cycles)  
144. Cycles – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/use-cycles](https://linear.app/docs/use-cycles)  
145. How to Use Linear's Cycle Feature: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-use-linears-cycle-feature](https://www.storylane.io/tutorials/how-to-use-linears-cycle-feature)  
146. Is Anybody using Linear as personal task management app? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/Linear/comments/17padaw/is\_anybody\_using\_linear\_as\_personal\_task/](https://www.reddit.com/r/Linear/comments/17padaw/is_anybody_using_linear_as_personal_task/)  
147. Project milestones – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/project-milestones](https://linear.app/docs/project-milestones)  
148. How to Use Linear: A Complete Walkthrough for Beginners \- Everhour, 访问时间为 四月 22, 2025， [https://everhour.com/blog/how-to-use-linear/](https://everhour.com/blog/how-to-use-linear/)  
149. Linear Plan – Set the product direction, 访问时间为 四月 22, 2025， [https://linear.app/plan](https://linear.app/plan)  
150. Creating a Strategic Roadmap with Linear \- SteelSync, 访问时间为 四月 22, 2025， [https://www.steelsync.io/blog/creating-a-strategic-roadmap-with-linear](https://www.steelsync.io/blog/creating-a-strategic-roadmap-with-linear)  
151. Linear Issue Tracking: Automate, Prioritize & Resolve Tasks Faster \- Everhour, 访问时间为 四月 22, 2025， [https://everhour.com/blog/linear-issue-tracking/](https://everhour.com/blog/linear-issue-tracking/)  
152. Custom Views – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/custom-views](https://linear.app/docs/custom-views)  
153. Linear Task Management: How to Avoid Bottlenecks in Your Workflow \- Everhour, 访问时间为 四月 22, 2025， [https://everhour.com/blog/linear-task-management/](https://everhour.com/blog/linear-task-management/)  
154. How to Create Custom Fields in Linear: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-create-custom-fields-in-linear](https://www.storylane.io/tutorials/how-to-create-custom-fields-in-linear)  
155. Create issues – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/creating-issues](https://linear.app/docs/creating-issues)  
156. Linear Issue Tracker Template | Notion Marketplace, 访问时间为 四月 22, 2025， [https://www.notion.com/templates/linear-issue-tracker](https://www.notion.com/templates/linear-issue-tracker)  
157. Content Workflow: Breaking Down the 9 Step Process \- Slickplan, 访问时间为 四月 22, 2025， [https://slickplan.com/content/workflow](https://slickplan.com/content/workflow)  
158. Linear Issue Tracker Notion Template, 访问时间为 四月 22, 2025， [https://www.notionize.it/templates/linear-issue-tracker](https://www.notionize.it/templates/linear-issue-tracker)  
159. Content Workflow in 2025: A Step-by-Step Guide with Tips \- Planable, 访问时间为 四月 22, 2025， [https://planable.io/blog/content-workflow/](https://planable.io/blog/content-workflow/)  
160. How to Create a Social Media Content Creation Workflow \- SocialBee, 访问时间为 四月 22, 2025， [https://socialbee.com/blog/content-creation-workflow/](https://socialbee.com/blog/content-creation-workflow/)  
161. Free Waterfall Project Management Template \[2024\] \- Asana, 访问时间为 四月 22, 2025， [https://asana.com/templates/waterfall-project-management](https://asana.com/templates/waterfall-project-management)  
162. Automate Your Content Creation | Scale Up Content To Stand Out \- Make, 访问时间为 四月 22, 2025， [https://www.make.com/en/automate/content-creation](https://www.make.com/en/automate/content-creation)  
163. Building powerful content workflows that scale | Magnolia Headless CMS, 访问时间为 四月 22, 2025， [https://www.magnolia-cms.com/blog/building-powerful-content-workflows-that-scale.html](https://www.magnolia-cms.com/blog/building-powerful-content-workflows-that-scale.html)  
164. How to Create Issue Templates in Linear: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-create-issue-templates-in-linear](https://www.storylane.io/tutorials/how-to-create-issue-templates-in-linear)  
165. Linear Preview: Roadmap Timeline – Changelog, 访问时间为 四月 22, 2025， [https://linear.app/changelog/2021-05-27-linear-preview-roadmap-timeline](https://linear.app/changelog/2021-05-27-linear-preview-roadmap-timeline)  
166. Product Roadmap Tools & why Linear Sync should be a must-have | Productlane, 访问时间为 四月 22, 2025， [https://productlane.com/blog/product-roadmap-tools](https://productlane.com/blog/product-roadmap-tools)  
167. Unable to find the Roadmaps view : r/Linear \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/Linear/comments/1jqde1v/unable\_to\_find\_the\_roadmaps\_view/](https://www.reddit.com/r/Linear/comments/1jqde1v/unable_to_find_the_roadmaps_view/)  
168. Linear Deep Dive: Issue & Project Management \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=C7L6tk11oS4](https://www.youtube.com/watch?v=C7L6tk11oS4)  
169. Smart Templates \- Smart Templates is an AI powered templates for generating structured content in Obsidian. Works with Local Models, Anthropic Claude, Gemini, OpenAI and more., 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/smart-templates](https://www.obsidianstats.com/plugins/smart-templates)  
170. Plugins \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=ai](https://obsidian.md/plugins?search=ai)  
171. VS Code API | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/references/vscode-api\#workspace](https://code.visualstudio.com/api/references/vscode-api#workspace)  
172. Aman's AI Journal • Primers • Prompt Engineering, 访问时间为 四月 22, 2025， [https://aman.ai/primers/ai/prompt-engineering/](https://aman.ai/primers/ai/prompt-engineering/)  
173. Prompt engineering techniques \- Azure OpenAI \- Learn Microsoft, 访问时间为 四月 22, 2025， [https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering)  
174. InterwebAlchemy/obsidian-ai-research-assistant: Prompt Engineering Research Tool for AI APIs \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/InterwebAlchemy/obsidian-ai-research-assistant](https://github.com/InterwebAlchemy/obsidian-ai-research-assistant)  
175. Mastering AI-Powered Research: My Guide to Deep Research, Prompt Engineering, and Multi-Step Workflows : r/ChatGPTPro \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTPro/comments/1in87ic/mastering\_aipowered\_research\_my\_guide\_to\_deep/](https://www.reddit.com/r/ChatGPTPro/comments/1in87ic/mastering_aipowered_research_my_guide_to_deep/)  
176. Prompt Engineering: Techniques, Uses & Advanced Approaches \- Acorn Labs, 访问时间为 四月 22, 2025， [https://www.acorn.io/resources/learning-center/prompt-engineering/](https://www.acorn.io/resources/learning-center/prompt-engineering/)  
177. AI Assistant for Obsidian | Christian B. B. Houmann, 访问时间为 四月 22, 2025， [https://bagerbach.com/blog/obsidian-ai/](https://bagerbach.com/blog/obsidian-ai/)  
178. AI Prompt Engineering: The Art of AI Instruction \- K2view, 访问时间为 四月 22, 2025， [https://www.k2view.com/blog/ai-prompt-engineering/](https://www.k2view.com/blog/ai-prompt-engineering/)  
179. Prompt Design and Engineering: Introduction and Advanced Methods \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2401.14423v4](https://arxiv.org/html/2401.14423v4)  
180. Prompt engineering for RAG \- OpenAI Developer Forum, 访问时间为 四月 22, 2025， [https://community.openai.com/t/prompt-engineering-for-rag/621495](https://community.openai.com/t/prompt-engineering-for-rag/621495)  
181. Prompt Engineering: Using AI and Large Language Models (LLMs) for Grant Writing, 访问时间为 四月 22, 2025， [https://bouviergrant.com/prompt-engineering-using-ai-and-large-language-models-llms-for-grant-writing/](https://bouviergrant.com/prompt-engineering-using-ai-and-large-language-models-llms-for-grant-writing/)  
182. Using AI in research \- APS111T: Engineering Strategies & Practice, 访问时间为 四月 22, 2025， [https://guides.library.utoronto.ca/c.php?g=719022\&p=5371872](https://guides.library.utoronto.ca/c.php?g=719022&p=5371872)  
183. brianpetro/obsidian-smart-connections: Chat with your notes & see links to related content with AI embeddings. Use local models or 100+ via APIs like Claude, Gemini, ChatGPT & Llama 3 \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/brianpetro/obsidian-smart-connections](https://github.com/brianpetro/obsidian-smart-connections)  
184. taichimaeda/markpilot: AI-powered inline completions and chat view for Obsidian \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/taichimaeda/markpilot](https://github.com/taichimaeda/markpilot)  
185. Obsidian Chat \- Plugins ideas, 访问时间为 四月 23, 2025， [https://forum.obsidian.md/t/obsidian-chat/5262](https://forum.obsidian.md/t/obsidian-chat/5262)  
186. Chat with Bard \- An obsidian plugin that enables you to talk to Google Gemnini directly, 访问时间为 四月 23, 2025， [https://www.obsidianstats.com/plugins/chat-with-bard](https://www.obsidianstats.com/plugins/chat-with-bard)  
187. A Visual Tour of Every Single Obsidian Plugin I Use in 2024 \- YouTube, 访问时间为 四月 23, 2025， [https://www.youtube.com/watch?v=y3SYqPx\_9Rs](https://www.youtube.com/watch?v=y3SYqPx_9Rs)  
188. How to chat with Local LLM in Obsidian \- DEV Community, 访问时间为 四月 23, 2025， [https://dev.to/luca1iu/how-to-chat-with-local-llm-in-obsidian-231o](https://dev.to/luca1iu/how-to-chat-with-local-llm-in-obsidian-231o)  
189. Just wanted to mention that the smart connections plugin is incredible. : r/ObsidianMD, 访问时间为 四月 23, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1fzmkdk/just\_wanted\_to\_mention\_that\_the\_smart\_connections/](https://www.reddit.com/r/ObsidianMD/comments/1fzmkdk/just_wanted_to_mention_that_the_smart_connections/)  
190. Assistant Sidebar Demo (short) \#plugins \#obsidian \#productivity \#chatgpt \- YouTube, 访问时间为 四月 23, 2025， [https://www.youtube.com/watch?v=ez52ZEDs-Hc](https://www.youtube.com/watch?v=ez52ZEDs-Hc)  
191. Chat with your notes \- Now available in the Smart Connections plugin : r/ObsidianMD \- Reddit, 访问时间为 四月 23, 2025， [https://www.reddit.com/r/ObsidianMD/comments/11s0oxb/chat\_with\_your\_notes\_now\_available\_in\_the\_smart/](https://www.reddit.com/r/ObsidianMD/comments/11s0oxb/chat_with_your_notes_now_available_in_the_smart/)  
192. Side bar plugins \- Obsidian Hub, 访问时间为 四月 23, 2025， [https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Side+bar+plugins](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Side+bar+plugins)  
193. SaaS UX Design: 18 Best Practices \- Userpilot, 访问时间为 四月 22, 2025， [https://userpilot.com/blog/saas-ux-design/](https://userpilot.com/blog/saas-ux-design/)  
194. Implement Best Practices for UX Design | Mendix Documentation, 访问时间为 四月 22, 2025， [https://docs.mendix.com/howto/front-end/ux-best-practices/](https://docs.mendix.com/howto/front-end/ux-best-practices/)  
195. Top 10 UX & UI Best Practices for Building Better Frictionless Interfaces \- Mendix, 访问时间为 四月 22, 2025， [https://www.mendix.com/blog/top-10-ux-ui-best-practices-for-building-better-frictionless-interfaces/](https://www.mendix.com/blog/top-10-ux-ui-best-practices-for-building-better-frictionless-interfaces/)  
196. UX and UI Best Practices \- Wix Developers, 访问时间为 四月 22, 2025， [https://dev.wix.com/docs/build-apps/develop-your-app/design/ux-and-ui-best-practices](https://dev.wix.com/docs/build-apps/develop-your-app/design/ux-and-ui-best-practices)  
197. User experience best practices | Firefox Extension Workshop, 访问时间为 四月 22, 2025， [https://extensionworkshop.com/documentation/develop/user-experience-best-practices/](https://extensionworkshop.com/documentation/develop/user-experience-best-practices/)  
198. Commands | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/extension-guides/command](https://code.visualstudio.com/api/extension-guides/command)  
199. Sentence Embeddings and Dimension Reduction in the Browser \- Observable, 访问时间为 四月 23, 2025， [https://observablehq.com/@huggingface/sentence-embeddings-and-dimension-reduction-in-the-browse](https://observablehq.com/@huggingface/sentence-embeddings-and-dimension-reduction-in-the-browse)  
200. Transcript: Local AI Models in JavaScript \- Machine Learning Deep Dive With Xenova, 访问时间为 四月 23, 2025， [https://syntax.fm/show/740/local-ai-models-in-javascript-machine-learning-deep-dive-with-xenova/transcript](https://syntax.fm/show/740/local-ai-models-in-javascript-machine-learning-deep-dive-with-xenova/transcript)  
201. xenova/transformers \- NPM, 访问时间为 四月 23, 2025， [https://www.npmjs.com/package/@xenova/transformers](https://www.npmjs.com/package/@xenova/transformers)  
202. Use WebGPU \+ ONNX Runtime Web \+ Transformer.js to build RAG applications by Phi-3-mini \- Microsoft Tech Community, 访问时间为 四月 23, 2025， [https://techcommunity.microsoft.com/blog/educatordeveloperblog/use-webgpu--onnx-runtime-web--transformer-js-to-build-rag-applications-by-phi-3-/4190968](https://techcommunity.microsoft.com/blog/educatordeveloperblog/use-webgpu--onnx-runtime-web--transformer-js-to-build-rag-applications-by-phi-3-/4190968)  
203. Build for web | onnxruntime, 访问时间为 四月 23, 2025， [https://onnxruntime.ai/docs/build/web.html](https://onnxruntime.ai/docs/build/web.html)  
204. onnxruntime-web fails to find ort-wasm-simd.wasm, doesn't use my /static folder in SvelteKit, 访问时间为 四月 23, 2025， [https://stackoverflow.com/questions/77179151/onnxruntime-web-fails-to-find-ort-wasm-simd-wasm-doesnt-use-my-static-folder](https://stackoverflow.com/questions/77179151/onnxruntime-web-fails-to-find-ort-wasm-simd-wasm-doesnt-use-my-static-folder)  
205. Embeddings differ between transformers.js and sentence-transformers (Python) · Issue \#36, 访问时间为 四月 23, 2025， [https://github.com/xenova/transformers.js/issues/36](https://github.com/xenova/transformers.js/issues/36)  
206. sentence-transformers/all-MiniLM-L6-v2 · I'm trying to run this model in the browser using wonnx, but it isn't working \- Hugging Face, 访问时间为 四月 23, 2025， [https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/discussions/71](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/discussions/71)  
207. Walkthrough | The most advanced AI retrieval system. Agentic Retrieval-Augmented Generation (RAG) with a RESTful API. \- R2R \- SciPhi.ai, 访问时间为 四月 23, 2025， [https://r2r-docs.sciphi.ai/documentation/walkthrough](https://r2r-docs.sciphi.ai/documentation/walkthrough)  
208. Retrieval-Augmented Generation for Large Language Models: A Survey \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/pdf/2312.10997](https://arxiv.org/pdf/2312.10997)  
209. Local Source Code Indexing & Querying with RAG : r/LangChain \- Reddit, 访问时间为 四月 23, 2025， [https://www.reddit.com/r/LangChain/comments/1de4yz8/local\_source\_code\_indexing\_querying\_with\_rag/](https://www.reddit.com/r/LangChain/comments/1de4yz8/local_source_code_indexing_querying_with_rag/)  
210. Build a Retrieval Augmented Generation (RAG) App: Part 1 \- LangChain.js, 访问时间为 四月 23, 2025， [https://js.langchain.com/docs/tutorials/rag/](https://js.langchain.com/docs/tutorials/rag/)  
211. The Power of Retrieval Augmented Generation (RAG) in GenAI & Global Content, 访问时间为 四月 22, 2025， [https://www.welocalize.com/insights/the-power-of-retrieval-augmented-generation-rag-in-genai-global-content/](https://www.welocalize.com/insights/the-power-of-retrieval-augmented-generation-rag-in-genai-global-content/)  
212. RAG (Retrieval-augmented generation) \- Reddit, 访问时间为 四月 23, 2025， [https://www.reddit.com/r/Rag/best/?after=dDNfMWplcjMyMQ%3D%3D\&sort=top\&t=MONTH](https://www.reddit.com/r/Rag/best/?after=dDNfMWplcjMyMQ%3D%3D&sort=top&t=MONTH)  
213. How Retrieval Augmented Generation (RAG) Boosts AI Creativity? \- AiThority, 访问时间为 四月 22, 2025， [https://aithority.com/machine-learning/how-retrieval-augmented-generation-rag-boosts-ai-creativity/](https://aithority.com/machine-learning/how-retrieval-augmented-generation-rag-boosts-ai-creativity/)  
214. Why Retrieval-Augmented Generation (RAG) Matters for Brands \- Idomoo, 访问时间为 四月 22, 2025， [https://www.idomoo.com/blog/the-rise-of-retrieval-augmented-generation-in-ai-what-brands-need-to-know/](https://www.idomoo.com/blog/the-rise-of-retrieval-augmented-generation-in-ai-what-brands-need-to-know/)  
215. Attributing Sources in RAG Generated Output \- ApX Machine Learning, 访问时间为 四月 23, 2025， [https://apxml.com/courses/getting-started-rag/chapter-4-rag-generation-augmentation/attributing-sources](https://apxml.com/courses/getting-started-rag/chapter-4-rag-generation-augmentation/attributing-sources)  
216. Effective Source Tracking in RAG Systems \- Chitika, 访问时间为 四月 23, 2025， [https://www.chitika.com/source-tracking-rag/](https://www.chitika.com/source-tracking-rag/)  
217. Retrieval-Augmented Generation (RAG) Improves AI Content Relevance and Accuracy, 访问时间为 四月 22, 2025， [https://shelf.io/blog/retrieval-augmented-generation-rag-improves-ai-content-relevance-and-accuracy/](https://shelf.io/blog/retrieval-augmented-generation-rag-improves-ai-content-relevance-and-accuracy/)  
218. What is retrieval-augmented generation (RAG)? \- IBM Research, 访问时间为 四月 22, 2025， [https://research.ibm.com/blog/retrieval-augmented-generation-RAG](https://research.ibm.com/blog/retrieval-augmented-generation-RAG)  
219. Retrieval Augmented Generation \- Amazon SageMaker AI \- AWS Documentation, 访问时间为 四月 23, 2025， [https://docs.aws.amazon.com/sagemaker/latest/dg/jumpstart-foundation-models-customize-rag.html](https://docs.aws.amazon.com/sagemaker/latest/dg/jumpstart-foundation-models-customize-rag.html)  
220. What is RAG? \- Retrieval-Augmented Generation AI Explained \- AWS, 访问时间为 四月 22, 2025， [https://aws.amazon.com/what-is/retrieval-augmented-generation/](https://aws.amazon.com/what-is/retrieval-augmented-generation/)  
221. HKUDS/LightRAG: "LightRAG: Simple and Fast Retrieval-Augmented Generation" \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/HKUDS/LightRAG](https://github.com/HKUDS/LightRAG)  
222. User interface \- Visual Studio Code, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface)  
223. Extensions » Patterns and principles \- vscode-docs, 访问时间为 四月 22, 2025， [https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/](https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/)  
224. UX Guidelines | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/ux-guidelines/overview](https://code.visualstudio.com/api/ux-guidelines/overview)  
225. Extensibility Principles and Patterns \- vscode-docs1 \- Read the Docs, 访问时间为 四月 22, 2025， [https://vscode-docs1.readthedocs.io/en/latest/extensionAPI/patterns-and-principles/](https://vscode-docs1.readthedocs.io/en/latest/extensionAPI/patterns-and-principles/)  
226. I spent 10 DAYS redesigning Visual Studio Code... | Speed UI Design \- YouTube, 访问时间为 四月 22, 2025， [https://m.youtube.com/watch?v=m\_d7K28CSXg](https://m.youtube.com/watch?v=m_d7K28CSXg)  
227. microsoft/vscode-extension-samples: Sample code illustrating the VS Code extension API. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/microsoft/vscode-extension-samples](https://github.com/microsoft/vscode-extension-samples)  
228. Plugin security \- Obsidian Help, 访问时间为 四月 22, 2025， [https://help.obsidian.md/plugin-security](https://help.obsidian.md/plugin-security)  
229. Advanced API Spec Management with AI: Shaping the Future of API Editing, 访问时间为 四月 22, 2025， [https://www.getambassador.io/blog/advanced-api-spec-management-ai-future-of-api-editing](https://www.getambassador.io/blog/advanced-api-spec-management-ai-future-of-api-editing)  
230. MCP Development Workflows: Optimize AI Tooling \- BytePlus, 访问时间为 四月 22, 2025， [https://www.byteplus.com/en/topic/542281](https://www.byteplus.com/en/topic/542281)  
231. New tools for building agents | OpenAI, 访问时间为 四月 22, 2025， [https://openai.com/index/new-tools-for-building-agents/](https://openai.com/index/new-tools-for-building-agents/)  
232. Project Life Cycle \[Phases & Best Practices\] | The Workstream \- Atlassian, 访问时间为 四月 22, 2025， [https://www.atlassian.com/work-management/project-management/project-life-cycle](https://www.atlassian.com/work-management/project-management/project-life-cycle)  
233. Model Context Protocol Servers (Browserbase Version) \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/browserbase/browserbase-servers](https://github.com/browserbase/browserbase-servers)  
234. Model Context Protocol \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)  
235. modelcontextprotocol/servers: Model Context Protocol Servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)  
236. alezkv/modelcontextprotocol-servers: Model Context Protocol Servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/alezkv/modelcontextprotocol-servers](https://github.com/alezkv/modelcontextprotocol-servers)  
237. riza-io/modelcontextprotocol-servers: Model Context Protocol Servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/riza-io/modelcontextprotocol-servers](https://github.com/riza-io/modelcontextprotocol-servers)  
238. wong2/awesome-mcp-servers: A curated list of Model Context Protocol (MCP) servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)  
239. For Claude Desktop Users \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/quickstart/user](https://modelcontextprotocol.io/quickstart/user)  
240. Debugging \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/docs/tools/debugging](https://modelcontextprotocol.io/docs/tools/debugging)  
241. For Client Developers \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/quickstart/client](https://modelcontextprotocol.io/quickstart/client)  
242. MCP: Getting Connection timed out error when running setup-users. \- Ciena, 访问时间为 四月 22, 2025， [https://my.ciena.com/CienaPortal/s/article/MCP-Getting-Connection-timed-out-error-when-running-setup-users](https://my.ciena.com/CienaPortal/s/article/MCP-Getting-Connection-timed-out-error-when-running-setup-users)  
243. Everything a Developer Needs to Know About the Model Context Protocol (MCP) \- Neo4j, 访问时间为 四月 22, 2025， [https://neo4j.com/blog/developer/model-context-protocol/](https://neo4j.com/blog/developer/model-context-protocol/)  
244. MCP Changelog: Latest Updates & Release Notes \- BytePlus, 访问时间为 四月 22, 2025， [https://www.byteplus.com/en/topic/541587](https://www.byteplus.com/en/topic/541587)  
245. Hermes MCP Roadmap — hermes\_mcp v0.3.11 \- HexDocs, 访问时间为 四月 22, 2025， [https://hexdocs.pm/hermes\_mcp/roadmap.html](https://hexdocs.pm/hermes_mcp/roadmap.html)  
246. Roadmap \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/development/roadmap](https://modelcontextprotocol.io/development/roadmap)  
247. Old Security Rakes In New MCP Yards \- Den Delimarsky, 访问时间为 四月 22, 2025， [https://den.dev/blog/security-rakes-mcp/](https://den.dev/blog/security-rakes-mcp/)  
248. MCP Server \- Agent.ai Documentation, 访问时间为 四月 22, 2025， [https://docs.agent.ai/mcp-server](https://docs.agent.ai/mcp-server)  
249. Unpacking the Security Risks of Model Context Protocol (MCP) Servers \- Upwind, 访问时间为 四月 22, 2025， [https://www.upwind.io/feed/unpacking-the-security-risks-of-model-context-protocol-mcp-servers](https://www.upwind.io/feed/unpacking-the-security-risks-of-model-context-protocol-mcp-servers)  
250. Cato CTRL™ Threat Research: Exploiting Model Context Protocol (MCP) – Demonstrating Risks and Mitigating GenAI Threats \- Cato Networks, 访问时间为 四月 22, 2025， [https://www.catonetworks.com/blog/cato-ctrl-exploiting-model-context-protocol-mcp/](https://www.catonetworks.com/blog/cato-ctrl-exploiting-model-context-protocol-mcp/)  
251. The Security Risks of Model Context Protocol (MCP) \- SECNORA, 访问时间为 四月 22, 2025， [https://secnora.com/blog/the-security-risks-of-model-context-protocol-mcp/](https://secnora.com/blog/the-security-risks-of-model-context-protocol-mcp/)  
252. API Security Risks, Testing and Protection Best Practices | Entro, 访问时间为 四月 22, 2025， [https://entro.security/blog/api-security-and-protection-best-practices/](https://entro.security/blog/api-security-and-protection-best-practices/)  
253. Comparing Open-Source AI Agent Frameworks \- Langfuse Blog, 访问时间为 四月 22, 2025， [https://langfuse.com/blog/2025-03-19-ai-agent-comparison](https://langfuse.com/blog/2025-03-19-ai-agent-comparison)  
254. LLM Function-Calling vs. Model Context Protocol (MCP) \- Gentoro, 访问时间为 四月 22, 2025， [https://www.gentoro.com/blog/function-calling-vs-model-context-protocol-mcp](https://www.gentoro.com/blog/function-calling-vs-model-context-protocol-mcp)  
255. Model Context Protocol vs Function Calling: What's the Big Difference? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h0w1z6/model\_context\_protocol\_vs\_function\_calling\_whats/](https://www.reddit.com/r/ClaudeAI/comments/1h0w1z6/model_context_protocol_vs_function_calling_whats/)