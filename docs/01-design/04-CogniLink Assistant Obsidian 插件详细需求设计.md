# **CogniLink Assistant Obsidian 插件详细需求设计**

版本： 1.0  
日期： 2025年7月26日  
**专家简介：** 本文档由一位在人工智能（AI）和人机交互（HCI）领域拥有深厚背景的博士研究员撰写。该专家在设计软件规范和集成AI功能方面拥有丰富经验，擅长将用户需求转化为精确的技术要求和文档。

## **1\. 引言**

### **1.1. 项目概述**

CogniLink Assistant 是一款旨在通过集成先进的人工智能功能来增强 Obsidian 笔记记录和知识管理体验的插件 1。作为用户的智能伙伴，它旨在简化信息处理、激发创意并促进更深层次的知识连接。本文档的核心目的在于为 CogniLink Assistant 的关键功能——聊天界面、原始材料引用（集成检索增强生成技术）和原创性检测——提供详尽的功能性与非功能性需求说明。本文档主要面向参与 CogniLink Assistant 插件开发的 产品经理、软件开发人员 和 UI/UX 设计师 2。

### **1.2. 范围**

本需求设计文档明确界定了 CogniLink Assistant 插件以下核心功能的详细需求：

- **聊天界面 (Chat Interface):** 用户与 AI 助手进行交互的主要界面。
- **原始材料引用 (Source Material Citation):** 基于用户 Obsidian 库中的笔记内容，为 AI 生成的回答提供来源追溯和引用的能力，主要利用检索增强生成（Retrieval-Augmented Generation, RAG）技术实现。
- **原创性检测 (Originality Detection):** 提供工具帮助用户评估文本相对于其 Obsidian 库内容的相似度或独特性。

本文档**不包含**以下内容：详细的安装过程、特定的 AI 模型训练细节、与核心功能（聊天、引用、原创性检测）无直接关联的高级项目管理集成或其他扩展功能。

### **1.3. 定义与缩略语**

- **AI:** 人工智能 (Artificial Intelligence)
- **LLM:** 大语言模型 (Large Language Model)
- **RAG:** 检索增强生成 (Retrieval-Augmented Generation)
- **MCP:** 模型上下文协议 (Model Context Protocol)
- **Obsidian Vault:** Obsidian 笔记库，存储 Markdown 文件及相关附件的本地文件夹。
- **Note:** Obsidian 中的笔记文件，通常为 Markdown 格式。
- **Embedding:** 嵌入，将文本或其他数据转换为数值向量表示，用于语义相似度计算。
- **Token:** 令牌，LLM 处理文本的基本单位。
- **Perplexity:** 困惑度，衡量语言模型预测文本序列能力的指标，较低的困惑度通常表示文本更可预测 3。
- **MMD:** 最大均值差异 (Maximum Mean Discrepancy)，一种用于比较两个概率分布差异的统计方法 4。
- **UI:** 用户界面 (User Interface)
- **UX:** 用户体验 (User Experience)
- **API:** 应用程序编程接口 (Application Programming Interface)
- **JSON:** JavaScript 对象表示法 (JavaScript Object Notation)
- **Markdown:** 一种轻量级标记语言。
- **YAML:** YAML Ain't Markup Language，一种常用于配置文件的数据序列化语言。
- **FIFO:** 先进先出 (First-In, First-Out)，一种队列管理策略。
- **IDE:** 集成开发环境 (Integrated Development Environment)
- **HCI:** 人机交互 (Human-Computer Interaction)

## **2\. 核心功能与需求**

### **2.1. 聊天界面**

聊天界面是用户与 CogniLink Assistant 交互的核心枢纽。其设计应遵循 Obsidian 的界面规范，确保用户体验的流畅性和一致性。

#### **2.1.1. UI 容器与布局**

- **需求:** 聊天界面应嵌入标准的 Obsidian UI 容器中，例如专用的侧边栏视图（Sidebar View）或面板（Panel）6。
- **理由:** 与 Obsidian 及类似 IDE 环境（如 VS Code）的 UI 模式保持一致，可以显著提高可用性并降低用户的学习成本 13。侧边栏是放置辅助工具和聊天界面的常见选择 6。
- **最佳实践:** 遵循 VS Code/Obsidian 的 UI 指南进行容器设计 12。考虑允许用户根据个人偏好移动视图（例如，拖动到次侧边栏），以提供布局灵活性 12。

#### **2.1.2. 输入区域**

- **需求:** 提供一个清晰的文本输入区域，供用户输入提示或消息给 AI 助手。
- **需求:** 输入区域应支持标准的 Markdown 语法输入。
- **需求:** 包含一个明确的“发送”按钮，并支持使用“Enter”键提交（可配置 Shift+Enter 换行，这是常见的交互模式 8）。
- **需求:** （可选）考虑通过操作系统级别的听写功能（如 Windows Key \+ H, macOS Dictation/Whisper）支持语音输入，以提高可访问性和便利性 18。

#### **2.1.3. 消息显示**

- **需求:** 按时间顺序展示对话历史，清晰地区分用户消息和 AI 回复 20。
- **需求:** AI 回复的渲染应支持标准的 Markdown 格式（如列表、代码块、链接等），并与 Obsidian 的原生渲染效果保持一致 21。
- **需求:** 在 AI 处理请求或生成回复时，应有明确的视觉指示（例如，加载动画或状态提示）。
- **需求:** 提供便捷的方式复制单条消息或其中的代码块。

#### **2.1.4. 对话管理**

- **需求:** 允许用户随时发起新的聊天会话。
- **需求:** 对话历史应持久化存储在用户的 Obsidian 库中，可以采用专用的 Markdown 文件（例如，.chat 扩展名）或存储在特定文件夹内 7。这符合 Obsidian 本地优先的原则 1。
- **需求:** 用户应能够重命名、搜索和删除过去的聊天会话/笔记。
- **需求:** 实现有效的上下文管理控制机制（详见 2.1.5 节）。

#### **2.1.5. 上下文处理与提示工程**

- **需求:** 允许用户明确地将当前活动笔记的内容或选定的文本包含在发送给 AI 的提示中，作为上下文信息 23。
- **需求:** 必须实现一种机制来管理发送给 LLM 的对话上下文，并考虑模型的 Token 限制 20。此机制应包括：
  - 清晰地指示对话历史中的哪些部分被包含在当前上下文中。
  - 提供用户控件，允许手动包含/排除特定消息，或“钉住”关键信息（“核心记忆”）以确保其始终包含在上下文中 2。
  - 当接近 Token 限制时，采用自动上下文截断策略（例如，FIFO 队列、对旧消息进行摘要）。
- **需求:** 支持可配置的“前导指令”（Preamble）或系统提示（System Prompt），用于指导 AI 在特定会话中的行为、角色或个性 20。允许用户保存和复用前导指令模板。
- **需求:** （潜在功能）允许在提示中通过类似 Cursor 的 @ 符号引用其他笔记 27 或库中的特定文件/文件夹，以提供更广泛的上下文。这可能需要与文件系统访问功能集成（见 3.1 节）。
- **设计考量:** 高效的 AI 交互在很大程度上依赖于精心设计的提示和有效的上下文管理 26。LLM 的运作基于提供的提示和上下文 36，而有限的上下文窗口是一个主要制约因素 46。有效的提示技术涉及清晰性、相关性和结构化 35。现有的 Obsidian AI 插件，如 AI Research Assistant 2 和 Smart Connections 19，提供了复杂的上下文/记忆管理功能。因此，CogniLink Assistant 必须提供强大的上下文管理功能，允许用户控制发送给 LLM 的信息，例如通过钉住核心消息或选择相关笔记，从而提高 AI 回复的相关性和准确性 2。

#### **2.1.6. UI/UX 最佳实践**

- **需求:** 遵循通用的 UX 设计最佳实践：清晰性、一致性、提供反馈、错误预防、简洁性 14。
- **需求:** 确保界面响应迅速且性能良好，避免阻塞 Obsidian 主 UI 49。
- **需求:** 为 AI 操作、权限请求（如果使用工具/MCP）和错误提供清晰的视觉提示 48。
- **需求:** 在 UI 设计中考虑可访问性指南。

### **2.2. 原始材料引用 (RAG 集成)**

此功能的核心是利用检索增强生成（RAG）技术，使 AI 的回答能够基于用户 Obsidian 库中的内容，并提供明确的来源引用。

#### **2.2.1. 来源识别与检索**

- **需求:** 插件必须能够从用户的 Obsidian 库中识别并检索相关信息，作为 AI 回答的基础。
- **需求:** 实现语义搜索能力（例如，使用句嵌入技术 50），以根据用户查询的含义查找相关笔记，超越简单的关键词匹配 20。这是 RAG 中“检索”步骤的核心 46。
- **需求:** 在检索过程中利用 Obsidian 的结构化信息：考虑笔记链接、标签、文件夹结构和 YAML Frontmatter 元数据，以提高检索的相关性 73。
- **需求:** （潜在功能）处理库中可能存在的多种文件类型（如 PDF、图片），这可能需要特定的解析和嵌入策略 63。注意：Obsidian 插件在处理图片方面可能存在限制 80，初期范围可能优先集中于 Markdown 笔记。
- **需求:** 嵌入向量应在用户本地的 Obsidian 库中存储和管理（例如，存储在 .obsidian/plugins 或用户可配置的隐藏文件夹内），以维护隐私和本地优先原则 1。

#### **2.2.2. 增强与生成**

- **需求:** 将检索到的相关文本片段（及其关联的元数据）与用户的原始提示一起传递给 LLM 46。
- **需求:** 通过提示工程（Prompt Engineering）指导 LLM 主要基于提供的上下文来生成答案，尽量减少对其内部知识的依赖，以降低“幻觉”（Hallucination）的风险 43。
- **需求:** 指导 LLM 在提供的上下文不足以自信地回答查询时明确指出 43。

#### **2.2.3. 归因机制**

- **需求:** 实现一个清晰的机制，将 AI 生成的回复追溯到其来源的 Obsidian 库中的具体笔记。
- **需求:** 支持多种归因显示方法，并可能允许用户进行配置：
  - **内联引用 (Inline Citations):** 在文本中使用数字或标记链接到来源 84。
  - **附加来源列表 (Appended Source List):** 在 AI 回复后附加一个来源笔记列表 85。
  - **UI 集成 (UI Integration):** 在回复的特定部分关联可点击的图标或链接，点击后显示来源信息 85。
- **需求:** 引用必须直接链接到源 Obsidian 笔记，理想情况下允许用户点击跳转。这需要利用 Obsidian 的 URI 方案或内部链接能力。
- **需求:** 在检索步骤中存储并传递必要的元数据（文件名、路径，如果可行的话，还包括章节/块 ID），以实现准确归因 78。
- **需求:** 解决当 AI 回复综合了多个来源信息时进行归因的挑战 85。此时，归因可能需要指向一组相关的来源笔记，而不是提供精确的句子到来源的映射。
- **设计考量:** 强大的来源归因对于建立用户信任、支持信息验证和维护学术诚信至关重要 38。RAG 技术通过将生成过程锚定在具体的检索文档上，天然地支持了这一点 63。用户需要信任 AI 的输出，特别是当它利用用户的个人知识库时 70。提供清晰的来源笔记链接使用户能够进行核查 85。现有的 RAG 系统都强调来源追踪 78。因此，本插件必须实现一个用户友好且可靠的引用机制，并与 Obsidian 的链接系统集成。在检索阶段捕获的元数据 85 是实现这一目标的关键。
- **表格:** 来源引用方法比较

| 方法             | 优点                                  | 缺点                                        | 实现复杂度 (Obsidian 内) | 用户体验影响                               |
| :--------------- | :------------------------------------ | :------------------------------------------ | :----------------------- | :----------------------------------------- |
| 内联引用         | 精确指向信息来源                      | 可能打断阅读流畅性；对综合性回复归因困难 85 | 中等（需处理链接生成）   | 清晰但可能干扰阅读                         |
| 附加来源列表     | 不干扰正文；易于实现                  | 无法直接关联回复中的具体信息与来源 85       | 低                       | 归因信息分离，查找对应关系可能不便         |
| UI 集成 (可点击) | 不干扰正文；提供按需查看的详细信息 85 | 实现复杂度较高（需要自定义 UI 元素）        | 高                       | 交互性好，保持正文简洁，但依赖 UI 设计质量 |

#### **2.2.4. 避免（自我）剽窃**

- **需求:** RAG 的目标是基于来源进行回答，但系统设计应鼓励信息整合与转述，而不是直接复制来源笔记中的大段文本，以减少（自我）剽窃的担忧 84。提示工程应强调使用 AI 自己的（生成的）语言进行总结和综合。
- **需求:** 如果实现了引用来源文本的功能，必须清晰区分 AI 生成的文本和直接引用的文本。

### **2.3. 原创性检测**

此功能旨在帮助用户评估文本内容相对于其 Obsidian 库的独特性或相似性。

#### **2.3.1. 原创性的定义**

- **需求:** 必须明确“原创性”在本插件上下文中的具体含义。是与以下哪个基准进行比较？
  - 用户自己的 Obsidian 库内容？（检测自我重复或冗余）
  - 外部来源？（需要集成网络搜索，复杂度高）
  - 典型的 AI 生成文本模式？（检测是否由 AI 生成）3
- **理由:** 原创性的定义直接决定了所需的比较对象和检测方法。与库内笔记比较在本地是可行的；与外部来源比较则显著增加了复杂性，并可能引发成本和隐私问题。检测文本是否由 AI 生成的技术目前被广泛认为不可靠 93。
- **决策:** 本插件的原创性检测功能应**主要聚焦于**评估目标文本与用户 Obsidian 库中现有内容的**相似度**，帮助用户识别潜在的自我重复或查找相关笔记，而非判定绝对原创性或 AI 生成。

#### **2.3.2. 检测方法**

- **需求:** 根据选定的定义（与库内容比较），实现一种或多种方法来评估相似度。可行的方法包括：
  - **语义相似度 (Semantic Similarity):** 计算目标文本的嵌入向量，并将其与库中笔记（或其子集）的嵌入向量进行比较（例如，使用余弦相似度 95）。高相似度可能表明与库内容重复度高 4。
  - **N-gram 重叠 (N-gram Overlap):** 分析目标文本与库内容之间重叠的词语序列（n-grams）98。高重叠率可能暗示复制。
  - **（备选，谨慎使用）困惑度/突发性分析 (Perplexity/Burstiness Analysis):** 计算文本的可预测性（困惑度）和风格变化性（突发性）。极低的困惑度或突发性可能暗示 AI 生成 3。_警告：此方法在确定 AI 写作方面不可靠 93。_
  - **（备选，复杂度高）最大均值差异 (MMD):** 如果需要比较文本分布（例如，AI 输出 vs. 人类笔记），MMD 可以量化分布差异，从而暗示新颖性 4。这通常计算量较大，且需要比较文档集合。
- **需求:** 所选方法必须在插件环境中计算可行，或者依赖外部 API（并承担相应的成本/隐私风险）。对于与库内容的比较，本地语义相似度计算是目前最可行的起点。
- **设计考量:** 衡量原创性，特别是 AI 生成内容的原创性，是一个复杂的问题，目前缺乏绝对可靠的方法 3。将重点放在衡量文本与用户*自身库内*的相似性上，是一个更易于处理且对用户更有价值的目标，可以帮助用户避免自我重复或找到已有的相关笔记。
- **表格:** 原创性检测方法比较

| 方法                    | 比较目标         | 优点                                 | 缺点                                           | 在 Obsidian 插件中的可行性              |
| :---------------------- | :--------------- | :----------------------------------- | :--------------------------------------------- | :-------------------------------------- |
| 语义相似度 (Embeddings) | 库内容           | 能捕捉深层含义相似性 4；技术相对成熟 | 计算密集型（需本地或 API）；对措辞变化敏感     | 中到高（取决于本地计算能力或 API 依赖） |
| N-gram 重叠             | 库内容           | 计算相对简单；对直接复制敏感 98      | 无法捕捉语义相似性；易受简单改写影响           | 高（本地计算可行）                      |
| 困惑度/突发性分析       | AI 生成模式      | 计算相对简单 3                       | **极不可靠**，易误判 93；无法检测剽窃          | 高（本地计算可行）                      |
| MMD                     | 文本分布（集合） | 能捕捉分布层面的差异 4               | 计算复杂度高；需要比较文档集合；解释性可能较差 | 低                                      |

#### **2.3.3. 用户界面与报告**

- **需求:** 提供明确的方式让用户触发原创性检查（例如，通过命令面板、右键菜单对选定文本或当前笔记执行）。
- **需求:** 以易于理解的方式呈现原创性（相似度）结果。鉴于检测方法的固有不确定性 94，应避免提供简单的二元（“原创/非原创”）判断。考虑采用以下方式：
  - 显示一个相对于库内容的相似度百分比分数。
  - 高亮显示与库中特定笔记高度相似的段落。
  - 提供指向库中最相似笔记的链接。
  - 如果尝试进行 AI 写作模式检测，则展示统计指标（如困惑度），并附带关于其可靠性的明确警告。
- **需求:** 允许用户配置原创性检查设置（例如，相似度阈值、库内比较范围）。

#### **2.3.4. 伦理考量**

- **需求:** 必须向用户清晰地说明所使用的原创性检测方法的局限性和潜在的不准确性 93。
- **需求:** 确保该过程尊重用户隐私，尤其是在使用外部 API 进行检测时。优先考虑在本地对库内容进行分析。

## **3\. 技术设计与架构**

### **3.1. 高层架构**

- **需求:** 插件应遵循标准的 Obsidian 插件架构指南。
- **需求:** 清晰地分离 UI 组件（可使用 React/Svelte/HTML）、核心逻辑（TypeScript/JavaScript）和 AI 交互模块。
- **需求:** 定义与所选 LLM（如 OpenAI, Anthropic, 或通过 Ollama/LM Studio 的本地模型 19）交互的接口。
- **需求:** 在 Obsidian 库结构内（例如 .obsidian/plugins/cognilink-assistant/）为嵌入向量、聊天记录和插件设置设计数据存储方案。

### **3.2. AI 模型集成**

- **需求:** 支持与主流 LLM API 的集成（例如 OpenAI, Anthropic Claude 21）。
- **需求:** 允许用户安全地配置 API 密钥（见第 5 节 安全性）。
- **需求:** 考虑支持通过 Ollama 或 LM Studio API 连接本地 LLM，以满足注重隐私的用户的需求 19。
- **需求:** 对 LLM 交互层进行抽象，以便未来更容易添加对新模型/提供商的支持。

### **3.3. 数据流**

- **需求:** 为每个核心功能记录清晰的数据流图：
  - **聊天:** 用户输入 \-\> 上下文组装（历史记录、活动笔记？） \-\> LLM API 调用 \-\> 回复渲染。
  - **引用 (RAG):** 用户查询 \-\> 语义搜索（嵌入向量） \-\> 上下文检索 \-\> LLM API 调用（增强提示） \-\> 回复生成 \-\> 归因格式化 \-\> 回复渲染。
  - **原创性检查:** 目标文本 \-\> 嵌入向量计算 \-\> 库内比较（嵌入向量/N-grams） \-\> 相似度评分 \-\> 结果显示。

### **3.4. 集成方法：直接 API vs. MCP**

- **背景:** 插件需要与外部 LLM API 以及潜在的本地资源（如用于存储嵌入向量的文件系统）进行交互。对于单一目的的集成，直接调用 API 更为简单 116。模型上下文协议（MCP）提供了一种标准化的方式与“工具”（如 LLM API 或本地文件系统服务器）交互，未来可能为集成多个客户端或服务器提供灵活性，但也增加了复杂性 116。目前存在多个 Obsidian MCP 服务器实现 61。
- **需求:** **初始版本应优先采用直接 API 集成**的方式与 LLM 进行交互，以降低初期复杂性并聚焦核心功能。
- **需求:** 插件架构设计应具备模块化特性，以便在未来需要更广泛的互操作性时，能够重构以支持 MCP。
- **理由:** 对于本插件描述的核心聊天、RAG 和原创性功能，直接调用 API 已足够满足需求。引入 MCP 会增加依赖（MCP 客户端库，可能需要运行本地 MCP 服务器以访问文件系统/嵌入向量），这会提高最终用户的设置复杂度 18 和开发开销。尽管 MCP 正在获得关注 118，但其生态系统的成熟度和在生产环境中的稳定性仍在发展中 143。直接集成是 V1 版本更务实的选择。
- **设计权衡:** 在直接 API 调用和 MCP 之间进行选择，是在初期简易性与未来灵活性/互操作性之间的权衡。对于一个主要与标准 LLM API 交互的独立 Obsidian 插件而言，直接集成通常是更实际的起点。

## **4\. 集成策略**

### **4.1. Obsidian 核心功能交互**

- **需求:** 利用 Obsidian API 读取笔记、访问元数据（标签、Frontmatter）和理解链接关系 152。
- **需求:** 使用 Obsidian 的 Markdown 渲染引擎在聊天界面中显示 AI 回复。
- **需求:** 在适当的情况下，与 Obsidian 的搜索功能集成（尽管语义搜索可能需要自定义实现）。
- **需求:** 使用 Obsidian 的通知系统向用户提供反馈（如错误提示、操作确认）12。
- **需求:** 在命令面板中注册关键操作的命令（例如，“CogniLink: 开始新聊天”，“CogniLink: 检查原创性”）155。

### **4.2. 插件依赖**

- **需求:** 尽量减少对其他社区插件的依赖，以降低潜在冲突和维护负担。
- **需求:** 如果某些功能依赖于其他插件（例如，使用 Dataview 进行高级查询 156，或使用 Templater 管理提示模板 26），必须在文档中清晰说明这些依赖关系，并优雅地处理插件缺失的情况。

### **4.3. 配置**

- **需求:** 在 Obsidian 的设置区域提供一个专用的设置标签页 13。
- **需求:** 允许用户配置以下选项：
  - AI 提供商和模型选择（例如，OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, 本地 Ollama 模型）2。
  - API 密钥（需安全存储）。
  - 默认的系统提示/前导指令。
  - 上下文管理设置（例如，包含的消息数量）。
  - 原创性检测设置（例如，比较范围、相似度阈值）。
  - 功能开关（例如，启用/禁用原创性检查）。
- **需求:** 在设置配置界面遵循清晰的 UX 最佳实践 13。为复杂设置提供工具提示或说明。

## **5\. 安全与伦理考量**

### **5.1. API 密钥管理**

- **需求:** API 密钥绝不能以明文形式存储。应利用 Obsidian 或操作系统提供的安全存储机制（如果可用），或在本地对密钥进行加密。必须明确警告用户 API 密钥泄露的风险 166。
- **需求:** 对外部 LLM API 的调用必须使用 HTTPS 169。

### **5.2. 数据隐私**

- **需求:** 必须清晰告知用户哪些数据（例如，选定的文本、当前笔记内容、对话历史、用于 RAG/原创性检查的库内容）会被发送到外部 LLM API 171。
- **需求:** 遵守所选 LLM 提供商的隐私政策（例如，Anthropic 默认不使用 API 数据进行训练的承诺 166）。在设置中提供指向相关提供商隐私政策的链接。
- **需求:** 如果实现超出读取笔记范围的本地文件访问（例如，保存聊天记录、管理嵌入向量），必须严格限制访问范围，并请求明确的用户许可，遵循 Obsidian 的安全指南 168。避免任意的文件系统访问。
- **设计考量:** 用户信任建立在透明度和对数据的控制之上 171。明确的同意和关于数据使用的清晰沟通至关重要，特别是考虑到 Obsidian 用户群体对隐私的高度关注 108。Obsidian 插件有潜力访问文件系统和网络 168。将库内容发送到外部 API 存在隐私风险 171。用户需要控制权和透明度 173。因此，插件必须清晰记录数据流向，在必要时（尤其是在访问库结构之外的文件以存储嵌入向量时）获取用户同意，并在可行的情况下优先考虑本地处理（例如，本地嵌入向量、本地库内原创性检查）。

### **5.3. AI 输出透明度与可靠性**

- **需求:** 在聊天界面中清晰地标记由 AI 生成的内容。
- **需求:** 为 RAG 生成的回复提供来源引用（依据 2.2.3 节）。
- **需求:** 当 RAG 失败或未使用时，应显示关于 AI 可能产生幻觉或不准确信息的警告，尤其是在这种情况下 44。
- **需求:** 提供用于生成回复的 AI 模型信息（可在设置中配置）。

### **5.4. 偏见缓解**

- **需求:** 承认 LLM 中存在潜在偏见的可能性 171。
- **需求:** 允许用户选择不同的模型，可能包括那些在减少偏见方面做出已知努力的模型（例如，Anthropic 的 Constitutional AI 方法 175）。
- **需求:** 鼓励用户批判性地评估 AI 输出是否存在偏见。

## **6\. 未来增强**

- 未来可能添加的功能包括：
  - 与 Obsidian Canvas 更深入的集成，实现可视化聊天交互 10。
  - 支持对笔记中的图片进行分析（需要具备多模态能力的模型，并谨慎处理图片数据 29）。注意当前的技术限制 80。
  - 高级提示链（Prompt Chaining）功能 26。
  - 与 Obsidian 内的项目管理功能集成（例如，将聊天讨论链接到任务）。
  - 支持更多 LLM 提供商和本地模型。
  - 提供切换到基于 MCP 的集成的选项，以增强互操作性。

## **7\. 结论**

CogniLink Assistant 旨在成为 Obsidian 用户强大的 AI 伙伴，无缝集成聊天、基于库内容的来源引用（RAG）和库内相似度检测功能。本需求设计文档详细阐述了这些核心功能的具体要求，强调了在 Obsidian 生态系统中提供流畅、智能体验的重要性。设计优先考虑用户控制、操作透明度和数据安全，确保 AI 功能的集成既强大又负责任。通过遵循这些需求，开发团队可以构建一个有价值的工具，赋能用户更有效地管理和利用他们的知识库。\# CogniLink Assistant Obsidian 插件详细需求设计  
版本： 1.0  
日期： 2025年7月26日  
**专家简介：** 本文档由一位在人工智能（AI）和人机交互（HCI）领域拥有深厚背景的博士研究员撰写。该专家在设计软件规范和集成AI功能方面拥有丰富经验，擅长将用户需求转化为精确的技术要求和文档。

## **1\. 引言**

### **1.1. 项目概述**

CogniLink Assistant 是一款旨在通过集成先进的人工智能功能来增强 Obsidian 笔记记录和知识管理体验的插件 1。作为用户的智能伙伴，它旨在简化信息处理、激发创意并促进更深层次的知识连接。本文档的核心目的在于为 CogniLink Assistant 的关键功能——聊天界面、原始材料引用（集成检索增强生成技术）和原创性检测——提供详尽的功能性与非功能性需求说明。本文档主要面向参与 CogniLink Assistant 插件开发的 产品经理、软件开发人员 和 UI/UX 设计师 2。

### **1.2. 范围**

本需求设计文档明确界定了 CogniLink Assistant 插件以下核心功能的详细需求：

- **聊天界面 (Chat Interface):** 用户与 AI 助手进行交互的主要界面。
- **原始材料引用 (Source Material Citation):** 基于用户 Obsidian 库中的笔记内容，为 AI 生成的回答提供来源追溯和引用的能力，主要利用检索增强生成（Retrieval-Augmented Generation, RAG）技术实现。
- **原创性检测 (Originality Detection):** 提供工具帮助用户评估文本相对于其 Obsidian 库内容的相似度或独特性。

本文档**不包含**以下内容：详细的安装过程、特定的 AI 模型训练细节、与核心功能（聊天、引用、原创性检测）无直接关联的高级项目管理集成或其他扩展功能。

### **1.3. 定义与缩略语**

- **AI:** 人工智能 (Artificial Intelligence)
- **LLM:** 大语言模型 (Large Language Model)
- **RAG:** 检索增强生成 (Retrieval-Augmented Generation)
- **MCP:** 模型上下文协议 (Model Context Protocol)
- **Obsidian Vault:** Obsidian 笔记库，存储 Markdown 文件及相关附件的本地文件夹。
- **Note:** Obsidian 中的笔记文件，通常为 Markdown 格式。
- **Embedding:** 嵌入，将文本或其他数据转换为数值向量表示，用于语义相似度计算。
- **Token:** 令牌，LLM 处理文本的基本单位。
- **Perplexity:** 困惑度，衡量语言模型预测文本序列能力的指标，较低的困惑度通常表示文本更可预测 3。
- **MMD:** 最大均值差异 (Maximum Mean Discrepancy)，一种用于比较两个概率分布差异的统计方法 4。
- **UI:** 用户界面 (User Interface)
- **UX:** 用户体验 (User Experience)
- **API:** 应用程序编程接口 (Application Programming Interface)
- **JSON:** JavaScript 对象表示法 (JavaScript Object Notation)
- **Markdown:** 一种轻量级标记语言。
- **YAML:** YAML Ain't Markup Language，一种常用于配置文件的数据序列化语言。
- **FIFO:** 先进先出 (First-In, First-Out)，一种队列管理策略。
- **IDE:** 集成开发环境 (Integrated Development Environment)
- **HCI:** 人机交互 (Human-Computer Interaction)

## **2\. 核心功能与需求**

### **2.1. 聊天界面**

聊天界面是用户与 CogniLink Assistant 交互的核心枢纽。其设计应遵循 Obsidian 的界面规范，确保用户体验的流畅性和一致性。

#### **2.1.1. UI 容器与布局**

- **需求:** 聊天界面应嵌入标准的 Obsidian UI 容器中，例如专用的侧边栏视图（Sidebar View）或面板（Panel）6。
- **理由:** 与 Obsidian 及类似 IDE 环境（如 VS Code）的 UI 模式保持一致，可以显著提高可用性并降低用户的学习成本 13。侧边栏是放置辅助工具和聊天界面的常见选择 6。
- **最佳实践:** 遵循 VS Code/Obsidian 的 UI 指南进行容器设计 12。考虑允许用户根据个人偏好移动视图（例如，拖动到次侧边栏），以提供布局灵活性 12。

#### **2.1.2. 输入区域**

- **需求:** 提供一个清晰的文本输入区域，供用户输入提示或消息给 AI 助手。
- **需求:** 输入区域应支持标准的 Markdown 语法输入。
- **需求:** 包含一个明确的“发送”按钮，并支持使用“Enter”键提交（可配置 Shift+Enter 换行，这是常见的交互模式 8）。
- **需求:** （可选）考虑通过操作系统级别的听写功能（如 Windows Key \+ H, macOS Dictation/Whisper）支持语音输入，以提高可访问性和便利性 18。

#### **2.1.3. 消息显示**

- **需求:** 按时间顺序展示对话历史，清晰地区分用户消息和 AI 回复 20。
- **需求:** AI 回复的渲染应支持标准的 Markdown 格式（如列表、代码块、链接等），并与 Obsidian 的原生渲染效果保持一致 21。
- **需求:** 在 AI 处理请求或生成回复时，应有明确的视觉指示（例如，加载动画或状态提示）。
- **需求:** 提供便捷的方式复制单条消息或其中的代码块。

#### **2.1.4. 对话管理**

- **需求:** 允许用户随时发起新的聊天会话。
- **需求:** 对话历史应持久化存储在用户的 Obsidian 库中，可以采用专用的 Markdown 文件（例如，.chat 扩展名）或存储在特定文件夹内 7。这符合 Obsidian 本地优先的原则 1。
- **需求:** 用户应能够重命名、搜索和删除过去的聊天会话/笔记。
- **需求:** 实现有效的上下文管理控制机制（详见 2.1.5 节）。

#### **2.1.5. 上下文处理与提示工程**

- **需求:** 允许用户明确地将当前活动笔记的内容或选定的文本包含在发送给 AI 的提示中，作为上下文信息 23。
- **需求:** 必须实现一种机制来管理发送给 LLM 的对话上下文，并考虑模型的 Token 限制 20。此机制应包括：
  - 清晰地指示对话历史中的哪些部分被包含在当前上下文中。
  - 提供用户控件，允许手动包含/排除特定消息，或“钉住”关键信息（“核心记忆”）以确保其始终包含在上下文中 2。
  - 当接近 Token 限制时，采用自动上下文截断策略（例如，FIFO 队列、对旧消息进行摘要）。
- **需求:** 支持可配置的“前导指令”（Preamble）或系统提示（System Prompt），用于指导 AI 在特定会话中的行为、角色或个性 20。允许用户保存和复用前导指令模板。
- **需求:** （潜在功能）允许在提示中通过类似 Cursor 的 @ 符号引用其他笔记 27 或库中的特定文件/文件夹，以提供更广泛的上下文。这可能需要与文件系统访问功能集成（见 3.1 节）。
- **设计考量:** 高效的 AI 交互在很大程度上依赖于精心设计的提示和有效的上下文管理 26。LLM 的运作基于提供的提示和上下文 36，而有限的上下文窗口是一个主要制约因素 46。有效的提示技术涉及清晰性、相关性和结构化 35。现有的 Obsidian AI 插件，如 AI Research Assistant 2 和 Smart Connections 19，提供了复杂的上下文/记忆管理功能。因此，CogniLink Assistant 必须提供强大的上下文管理功能，允许用户控制发送给 LLM 的信息，例如通过钉住核心消息或选择相关笔记，从而提高 AI 回复的相关性和准确性 2。

#### **2.1.6. UI/UX 最佳实践**

- **需求:** 遵循通用的 UX 设计最佳实践：清晰性、一致性、提供反馈、错误预防、简洁性 14。
- **需求:** 确保界面响应迅速且性能良好，避免阻塞 Obsidian 主 UI 49。
- **需求:** 为 AI 操作、权限请求（如果使用工具/MCP）和错误提供清晰的视觉提示 48。
- **需求:** 在 UI 设计中考虑可访问性指南。

### **2.2. 原始材料引用 (RAG 集成)**

此功能的核心是利用检索增强生成（RAG）技术，使 AI 的回答能够基于用户 Obsidian 库中的内容，并提供明确的来源引用。RAG 通过结合外部知识库（在此场景下是用户的 Obsidian 库）来增强 LLM 的能力，从而提高生成内容的准确性和可靠性 63。

#### **2.2.1. 来源识别与检索**

- **需求:** 插件必须能够从用户的 Obsidian 库中识别并检索相关信息，作为 AI 回答的基础。这是 RAG 流程的第一步 46。
- **需求:** 实现语义搜索能力（例如，使用句嵌入技术 50），以根据用户查询的含义查找相关笔记，超越简单的关键词匹配 20。这种基于向量的相似性搜索是 RAG 检索阶段的核心技术 68。
- **需求:** 在检索过程中利用 Obsidian 的结构化信息：考虑笔记链接、标签、文件夹结构和 YAML Frontmatter 元数据，以提高检索的相关性 73。提示工程也可以指导 AI 更好地利用这些结构化信息 77。
- **需求:** （潜在功能）处理库中可能存在的多种文件类型（如 PDF、图片），这可能需要特定的解析和嵌入策略 63。注意：Obsidian 插件在处理图片方面可能存在限制 80，初期范围可能优先集中于 Markdown 笔记。
- **需求:** 嵌入向量应在用户本地的 Obsidian 库中存储和管理（例如，存储在 .obsidian/plugins 或用户可配置的隐藏文件夹内），以维护隐私和本地优先原则 1。

#### **2.2.2. 增强与生成**

- **需求:** 将检索到的相关文本片段（及其关联的元数据）与用户的原始提示一起传递给 LLM 46。这个过程被称为“增强”（Augmentation）。
- **需求:** 通过提示工程（Prompt Engineering）指导 LLM 主要基于提供的上下文来生成答案，尽量减少对其内部知识（参数化知识）的依赖，以降低“幻觉”（Hallucination）的风险 43。RAG 的核心优势之一就是提高事实准确性 63。
- **需求:** 指导 LLM 在提供的上下文不足以自信地回答查询时明确指出 43。这有助于管理用户预期并保持透明度。

#### **2.2.3. 归因机制**

- **需求:** 实现一个清晰的机制，将 AI 生成的回复追溯到其来源的 Obsidian 库中的具体笔记。这是 RAG 提高可信度和透明度的关键 70。
- **需求:** 支持多种归因显示方法，并可能允许用户进行配置：
  - **内联引用 (Inline Citations):** 在文本中使用数字或标记链接到来源 84。这种方式直接明了，但可能影响阅读体验。
  - **附加来源列表 (Appended Source List):** 在 AI 回复后附加一个来源笔记列表 85。这种方式保持正文简洁，但用户需要额外步骤来关联信息点和来源。
  - **UI 集成 (UI Integration):** 在回复的特定部分关联可点击的图标或链接，点击后显示来源信息 85。这种方式交互性好，但实现复杂度较高。
- **需求:** 引用必须直接链接到源 Obsidian 笔记，理想情况下允许用户点击跳转。这需要利用 Obsidian 的 URI 方案或内部链接能力。
- **需求:** 在检索步骤中存储并传递必要的元数据（文件名、路径，如果可行的话，还包括章节/块 ID），以实现准确归因 78。元数据管理是实现可靠归因的基础 85。
- **需求:** 解决当 AI 回复综合了多个来源信息时进行归因的挑战 85。LLM 通常会综合信息而非直接摘录，这使得精确到句子的归因变得困难。此时，归因可能需要指向一组相关的来源笔记，而不是提供精确的句子到来源的映射。
- **设计考量:** 强大的来源归因对于建立用户信任、支持信息验证和维护学术诚信至关重要 38。RAG 技术通过将生成过程锚定在具体的检索文档上，天然地支持了这一点 63。用户需要信任 AI 的输出，特别是当它利用用户的个人知识库时 70。提供清晰的来源笔记链接使用户能够进行核查 85。现有的 RAG 系统都强调来源追踪 78。因此，本插件必须实现一个用户友好且可靠的引用机制，并与 Obsidian 的链接系统集成。在检索阶段捕获的元数据 85 是实现这一目标的关键。  
  **表格: 来源引用方法比较**

| 方法             | 优点                                  | 缺点                                        | 实现复杂度 (Obsidian 内) | 用户体验影响                               |
| :--------------- | :------------------------------------ | :------------------------------------------ | :----------------------- | :----------------------------------------- |
| 内联引用         | 精确指向信息来源                      | 可能打断阅读流畅性；对综合性回复归因困难 85 | 中等（需处理链接生成）   | 清晰但可能干扰阅读                         |
| 附加来源列表     | 不干扰正文；易于实现                  | 无法直接关联回复中的具体信息与来源 85       | 低                       | 归因信息分离，查找对应关系可能不便         |
| UI 集成 (可点击) | 不干扰正文；提供按需查看的详细信息 85 | 实现复杂度较高（需要自定义 UI 元素）        | 高                       | 交互性好，保持正文简洁，但依赖 UI 设计质量 |

#### **2.2.4. 避免（自我）剽窃**

- **需求:** RAG 的目标是基于来源进行回答，但系统设计应鼓励信息整合与转述，而不是直接复制来源笔记中的大段文本，以减少（自我）剽窃的担忧 84。提示工程应强调使用 AI 自己的（生成的）语言进行总结和综合。
- **需求:** 如果实现了引用来源文本的功能，必须清晰区分 AI 生成的文本和直接引用的文本。这对于维护学术诚信和避免误解至关重要 84。

### **2.3. 原创性检测**

此功能旨在帮助用户评估文本内容相对于其 Obsidian 库的独特性或相似性。需要注意的是，绝对的“原创性”检测，尤其是针对 AI 生成内容的检测，是极其困难且目前没有完美解决方案的 4。

#### **2.3.1. 原创性的定义**

- **需求:** 必须明确“原创性”在本插件上下文中的具体含义。是与以下哪个基准进行比较？
  - 用户自己的 Obsidian 库内容？（检测自我重复或冗余）
  - 外部来源？（需要集成网络搜索，复杂度高）
  - 典型的 AI 生成文本模式？（检测是否由 AI 生成）3
- **理由:** 原创性的定义直接决定了所需的比较对象和检测方法。与库内笔记比较在本地是可行的；与外部来源比较则显著增加了复杂性，并可能引发成本和隐私问题。检测文本是否由 AI 生成的技术目前被广泛认为不可靠 93，且容易产生偏见（例如，对非母语写作者的误判 94）。
- **决策:** 本插件的原创性检测功能应**主要聚焦于**评估目标文本与用户 Obsidian 库中现有内容的**相似度**，帮助用户识别潜在的自我重复或查找相关笔记，而非判定绝对原创性或 AI 生成。这一定位更加务实且对用户更有价值 185。

#### **2.3.2. 检测方法**

- **需求:** 根据选定的定义（与库内容比较），实现一种或多种方法来评估相似度。可行的方法包括：
  - **语义相似度 (Semantic Similarity):** 计算目标文本的嵌入向量，并将其与库中笔记（或其子集）的嵌入向量进行比较（例如，使用余弦相似度 95）。高相似度可能表明与库内容重复度高 4。这是目前 RAG 和相关性搜索中常用的技术。
  - **N-gram 重叠 (N-gram Overlap):** 分析目标文本与库内容之间重叠的词语序列（n-grams）98。高重叠率可能暗示复制。这种方法计算相对简单，但无法捕捉深层语义。
  - **（备选，谨慎使用）困惑度/突发性分析 (Perplexity/Burstiness Analysis):** 计算文本的可预测性（困惑度）和风格变化性（突发性）。非常低（过于流畅和可预测）的困惑度或低突发性（风格过于一致）有时被认为是 AI 生成文本的特征 3。_警告：此方法在确定 AI 写作方面不可靠 93，且可能对人类写作产生误判。_
  - **（备选，复杂度高）最大均值差异 (MMD):** 如果需要比较文本分布（例如，AI 输出 vs. 人类笔记），MMD 可以量化分布差异，从而暗示新颖性 4。这通常计算量较大，且需要比较文档集合，可能不适合实时插件应用。
- **需求:** 所选方法必须在插件环境中计算可行，或者依赖外部 API（并承担相应的成本/隐私风险）。对于与库内容的比较，本地语义相似度计算是目前最可行的起点。
- **设计考量:** 衡量原创性，特别是 AI 生成内容的原创性，是一个复杂的问题，目前缺乏绝对可靠的方法 3。将重点放在衡量文本与用户*自身库内*的相似性上，是一个更易于处理且对用户更有价值的目标，可以帮助用户避免自我重复或找到已有的相关笔记。AI 生成文本检测工具的准确性普遍不高，且存在偏见风险 93。因此，本插件应避免声称能“检测 AI”，而是提供相似度分析工具。  
  **表格: 原创性（库内相似度）检测方法比较**

| 方法                    | 比较目标         | 优点                                 | 缺点                                           | 在 Obsidian 插件中的可行性              |
| :---------------------- | :--------------- | :----------------------------------- | :--------------------------------------------- | :-------------------------------------- |
| 语义相似度 (Embeddings) | 库内容           | 能捕捉深层含义相似性 4；技术相对成熟 | 计算密集型（需本地或 API）；对措辞变化敏感     | 中到高（取决于本地计算能力或 API 依赖） |
| N-gram 重叠             | 库内容           | 计算相对简单；对直接复制敏感 98      | 无法捕捉语义相似性；易受简单改写影响           | 高（本地计算可行）                      |
| 困惑度/突发性分析       | AI 生成模式      | 计算相对简单 3                       | **极不可靠**，易误判 93；无法检测剽窃          | 高（本地计算可行）                      |
| MMD                     | 文本分布（集合） | 能捕捉分布层面的差异 4               | 计算复杂度高；需要比较文档集合；解释性可能较差 | 低                                      |

#### **2.3.3. 用户界面与报告**

- **需求:** 提供明确的方式让用户触发原创性检查（例如，通过命令面板、右键菜单对选定文本或当前笔记执行）。
- **需求:** 以易于理解的方式呈现原创性（相似度）结果。鉴于检测方法的固有不确定性 94，应避免提供简单的二元（“原创/非原创”）判断。考虑采用以下方式：
  - 显示一个相对于库内容的相似度百分比分数。
  - 高亮显示与库中特定笔记高度相似的段落。
  - 提供指向库中最相似笔记的链接。
  - 如果尝试进行 AI 写作模式检测，则展示统计指标（如困惑度），并附带关于其可靠性的明确警告。
- **需求:** 允许用户配置原创性检查设置（例如，相似度阈值、库内比较范围）。

#### **2.3.4. 伦理考量**

- **需求:** 必须向用户清晰地说明所使用的原创性检测方法的局限性和潜在的不准确性 93。强调结果仅为相似度指标，而非最终判断。
- **需求:** 确保该过程尊重用户隐私，尤其是在使用外部 API 进行检测时。优先考虑在本地对库内容进行分析。

## **3\. 技术设计与架构**

### **3.1. 高层架构**

- **需求:** 插件应遵循标准的 Obsidian 插件架构指南。
- **需求:** 清晰地分离 UI 组件（可使用 React/Svelte/HTML）、核心逻辑（TypeScript/JavaScript）和 AI 交互模块。
- **需求:** 定义与所选 LLM（如 OpenAI, Anthropic, 或通过 Ollama/LM Studio 的本地模型 19）交互的接口。
- **需求:** 在 Obsidian 库结构内（例如 .obsidian/plugins/cognilink-assistant/）为嵌入向量、聊天记录和插件设置设计数据存储方案。

### **3.2. AI 模型集成**

- **需求:** 支持与主流 LLM API 的集成（例如 OpenAI, Anthropic Claude 21）。
- **需求:** 允许用户安全地配置 API 密钥（见第 5 节 安全性）。
- **需求:** 考虑支持通过 Ollama 或 LM Studio API 连接本地 LLM，以满足注重隐私的用户的需求 19。
- **需求:** 对 LLM 交互层进行抽象，以便未来更容易添加对新模型/提供商的支持。

### **3.3. 数据流**

- **需求:** 为每个核心功能记录清晰的数据流图：
  - **聊天:** 用户输入 \-\> 上下文组装（历史记录、活动笔记？） \-\> LLM API 调用 \-\> 回复渲染。
  - **引用 (RAG):** 用户查询 \-\> 语义搜索（嵌入向量） \-\> 上下文检索 \-\> LLM API 调用（增强提示） \-\> 回复生成 \-\> 归因格式化 \-\> 回复渲染。
  - **原创性检查:** 目标文本 \-\> 嵌入向量计算 \-\> 库内比较（嵌入向量/N-grams） \-\> 相似度评分 \-\> 结果显示。

### **3.4. 集成方法：直接 API vs. MCP**

- **背景:** 插件需要与外部 LLM API 以及潜在的本地资源（如用于存储嵌入向量的文件系统）进行交互。对于单一目的的集成，直接调用 API 更为简单 116。模型上下文协议（MCP）提供了一种标准化的方式与“工具”（如 LLM API 或本地文件系统服务器）交互，未来可能为集成多个客户端或服务器提供灵活性，但也增加了复杂性 116。目前存在多个 Obsidian MCP 服务器实现 61。MCP 的目标是解决 M x N 的集成问题，提供统一接口 118。
- **需求:** **初始版本应优先采用直接 API 集成**的方式与 LLM 进行交互，以降低初期复杂性并聚焦核心功能。
- **需求:** 插件架构设计应具备模块化特性，以便在未来需要更广泛的互操作性时，能够重构以支持 MCP。
- **理由:** 对于本插件描述的核心聊天、RAG 和原创性功能，直接调用 API 已足够满足需求。引入 MCP 会增加依赖（MCP 客户端库，可能需要运行本地 MCP 服务器以访问文件系统/嵌入向量），这会提高最终用户的设置复杂度 18 和开发开销。尽管 MCP 正在获得关注 118，其生态系统的成熟度和在生产环境中的稳定性仍在发展中 143。直接集成是 V1 版本更务实的选择。
- **设计权衡:** 在直接 API 调用和 MCP 之间进行选择，是在初期简易性与未来灵活性/互操作性之间的权衡。对于一个主要与标准 LLM API 交互的独立 Obsidian 插件而言，直接集成通常是更实际的起点。如果未来需要与更多本地工具（如版本控制、浏览器自动化）或需要与其他 MCP 客户端（如 Cursor, Claude Desktop 190）进行更复杂的交互，则可以考虑迁移到 MCP 架构。

## **4\. 集成策略**

### **4.1. Obsidian 核心功能交互**

- **需求:** 利用 Obsidian API 读取笔记、访问元数据（标签、Frontmatter）和理解链接关系 152。
- **需求:** 使用 Obsidian 的 Markdown 渲染引擎在聊天界面中显示 AI 回复。
- **需求:** 在适当的情况下，与 Obsidian 的搜索功能集成（尽管语义搜索可能需要自定义实现）。
- **需求:** 使用 Obsidian 的通知系统向用户提供反馈（如错误提示、操作确认）12。
- **需求:** 在命令面板中注册关键操作的命令（例如，“CogniLink: 开始新聊天”，“CogniLink: 检查原创性”）155。

### **4.2. 插件依赖**

- **需求:** 尽量减少对其他社区插件的依赖，以降低潜在冲突和维护负担。
- **需求:** 如果某些功能依赖于其他插件（例如，使用 Dataview 进行高级查询 156，或使用 Templater 管理提示模板 26），必须在文档中清晰说明这些依赖关系，并优雅地处理插件缺失的情况。

### **4.3. 配置**

- **需求:** 在 Obsidian 的设置区域提供一个专用的设置标签页 13。
- **需求:** 允许用户配置以下选项：
  - AI 提供商和模型选择（例如，OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, 本地 Ollama 模型）2。
  - API 密钥（需安全存储）。
  - 默认的系统提示/前导指令。
  - 上下文管理设置（例如，包含的消息数量）。
  - 原创性检测设置（例如，比较范围、相似度阈值）。
  - 功能开关（例如，启用/禁用原创性检查）。
- **需求:** 在设置配置界面遵循清晰的 UX 最佳实践 13。为复杂设置提供工具提示或说明。用户应能轻松理解每个设置的作用。

## **5\. 安全与伦理考量**

### **5.1. API 密钥管理**

- **需求:** API 密钥绝不能以明文形式存储。应利用 Obsidian 或操作系统提供的安全存储机制（如果可用），或在本地对密钥进行加密。必须明确警告用户 API 密钥泄露的风险 166。
- **需求:** 对外部 LLM API 的调用必须使用 HTTPS 169。

### **5.2. 数据隐私**

- **需求:** 必须清晰告知用户哪些数据（例如，选定的文本、当前笔记内容、对话历史、用于 RAG/原创性检查的库内容）会被发送到外部 LLM API 171。
- **需求:** 遵守所选 LLM 提供商的隐私政策（例如，Anthropic 默认不使用 API 数据进行训练的承诺 166）。在设置中提供指向相关提供商隐私政策的链接。
- **需求:** 如果实现超出读取笔记范围的本地文件访问（例如，保存聊天记录、管理嵌入向量），必须严格限制访问范围，并请求明确的用户许可，遵循 Obsidian 的安全指南 168。避免任意的文件系统访问。
- **设计考量:** 用户信任建立在透明度和对数据的控制之上 171。明确的同意和关于数据使用的清晰沟通至关重要，特别是考虑到 Obsidian 用户群体对隐私的高度关注 108。Obsidian 插件有潜力访问文件系统和网络 168。将库内容发送到外部 API 存在隐私风险 171。用户需要控制权和透明度 173。因此，插件必须清晰记录数据流向，在必要时（尤其是在访问库结构之外的文件以存储嵌入向量时）获取用户同意，并在可行的情况下优先考虑本地处理（例如，本地嵌入向量、本地库内原创性检查）。

### **5.3. AI 输出透明度与可靠性**

- **需求:** 在聊天界面中清晰地标记由 AI 生成的内容。这是负责任 AI 实践的重要组成部分 87。
- **需求:** 为 RAG 生成的回复提供来源引用（依据 2.2.3 节）。
- **需求:** 当 RAG 失败或未使用时，应显示关于 AI 可能产生幻觉或不准确信息的警告，尤其是在这种情况下 44。
- **需求:** 提供用于生成回复的 AI 模型信息（可在设置中配置）。

### **5.4. 偏见缓解**

- **需求:** 承认 LLM 中存在潜在偏见的可能性 171。训练数据的偏差可能导致输出带有偏见 192。
- **需求:** 允许用户选择不同的模型，可能包括那些在减少偏见方面做出已知努力的模型（例如，Anthropic 的 Constitutional AI 方法 175）。
- **需求:** 鼓励用户批判性地评估 AI 输出是否存在偏见。

## **6\. 未来增强**

- 未来可能添加的功能包括：
  - 与 Obsidian Canvas 更深入的集成，实现可视化聊天交互 10。
  - 支持对笔记中的图片进行分析（需要具备多模态能力的模型，并谨慎处理图片数据 29）。注意当前的技术限制 80。
  - 高级提示链（Prompt Chaining）功能 26。
  - 与 Obsidian 内的项目管理功能集成（例如，将聊天讨论链接到任务）。
  - 支持更多 LLM 提供商和本地模型。
  - 提供切换到基于 MCP 的集成的选项，以增强互操作性。

## **7\. 结论**

CogniLink Assistant 旨在成为 Obsidian 用户强大的 AI 伙伴，无缝集成聊天、基于库内容的来源引用（RAG）和库内相似度检测功能。本需求设计文档详细阐述了这些核心功能的具体要求，强调了在 Obsidian 生态系统中提供流畅、智能体验的重要性。设计优先考虑用户控制、操作透明度和数据安全，确保 AI 功能的集成既强大又负责任。通过遵循这些需求，开发团队可以构建一个有价值的工具，赋能用户更有效地管理和利用他们的知识库。

#### **引用的著作**

1. Obsidian \- Sharpen your thinking, 访问时间为 四月 22, 2025， [https://obsidian.md/](https://obsidian.md/)
2. AI Research Assistant \- Prompt Engineering Research Tool for AI APIs \- Obsidian Stats, 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/ai-research-assistant](https://www.obsidianstats.com/plugins/ai-research-assistant)
3. How Does AI Detection Work? A Complete Guide to Identifying AI-Generated Content, 访问时间为 四月 22, 2025， [https://www.link-assistant.com/rankdots/blog/how-do-ai-detectors-work.html](https://www.link-assistant.com/rankdots/blog/how-do-ai-detectors-work.html)
4. \[2504.08446\] Charting the Parrot's Song: A Maximum Mean Discrepancy Approach to Measuring AI Novelty, Originality, and Distinctiveness \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/abs/2504.08446](https://arxiv.org/abs/2504.08446)
5. Charting the Parrot's Song: A Maximum Mean Discrepancy Approach to Measuring AI Novelty, Originality, and Distinctiveness \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/pdf/2504.08446](https://arxiv.org/pdf/2504.08446)
6. How to chat with Local LLM in Obsidian \- DEV Community, 访问时间为 四月 23, 2025， [https://dev.to/luca1iu/how-to-chat-with-local-llm-in-obsidian-231o](https://dev.to/luca1iu/how-to-chat-with-local-llm-in-obsidian-231o)
7. Chat with Bard \- An obsidian plugin that enables you to talk to Google Gemnini directly, 访问时间为 四月 23, 2025， [https://www.obsidianstats.com/plugins/chat-with-bard](https://www.obsidianstats.com/plugins/chat-with-bard)
8. taichimaeda/markpilot: AI-powered inline completions and chat view for Obsidian \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/taichimaeda/markpilot](https://github.com/taichimaeda/markpilot)
9. Side bar plugins \- Obsidian Hub, 访问时间为 四月 23, 2025， [https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Side+bar+plugins](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Side+bar+plugins)
10. Obsidian Chat \- Plugins ideas, 访问时间为 四月 23, 2025， [https://forum.obsidian.md/t/obsidian-chat/5262](https://forum.obsidian.md/t/obsidian-chat/5262)
11. User interface \- Visual Studio Code, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface)
12. UX Guidelines | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/ux-guidelines/overview](https://code.visualstudio.com/api/ux-guidelines/overview)
13. SaaS UX Design: 18 Best Practices \- Userpilot, 访问时间为 四月 22, 2025， [https://userpilot.com/blog/saas-ux-design/](https://userpilot.com/blog/saas-ux-design/)
14. Implement Best Practices for UX Design | Mendix Documentation, 访问时间为 四月 22, 2025， [https://docs.mendix.com/howto/front-end/ux-best-practices/](https://docs.mendix.com/howto/front-end/ux-best-practices/)
15. Top 10 UX & UI Best Practices for Building Better Frictionless Interfaces \- Mendix, 访问时间为 四月 22, 2025， [https://www.mendix.com/blog/top-10-ux-ui-best-practices-for-building-better-frictionless-interfaces/](https://www.mendix.com/blog/top-10-ux-ui-best-practices-for-building-better-frictionless-interfaces/)
16. I spent 10 DAYS redesigning Visual Studio Code... | Speed UI Design \- YouTube, 访问时间为 四月 22, 2025， [https://m.youtube.com/watch?v=m_d7K28CSXg](https://m.youtube.com/watch?v=m_d7K28CSXg)
17. microsoft/vscode-extension-samples: Sample code illustrating the VS Code extension API. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/microsoft/vscode-extension-samples](https://github.com/microsoft/vscode-extension-samples)
18. My Claude Workflow Guide: Advanced Setup with MCP External Tools : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1ji8ruv/my_claude_workflow_guide_advanced_setup_with_mcp/](https://www.reddit.com/r/ClaudeAI/comments/1ji8ruv/my_claude_workflow_guide_advanced_setup_with_mcp/)
19. AI / LLMs in your Obsidian \- what's actually been useful for you? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1dedmeu/ai_llms_in_your_obsidian_whats_actually_been/](https://www.reddit.com/r/ObsidianMD/comments/1dedmeu/ai_llms_in_your_obsidian_whats_actually_been/)
20. InterwebAlchemy/obsidian-ai-research-assistant: Prompt Engineering Research Tool for AI APIs \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/InterwebAlchemy/obsidian-ai-research-assistant](https://github.com/InterwebAlchemy/obsidian-ai-research-assistant)
21. ChatGPT in Obsidian (Plugin) \- OpenAI Developer Forum, 访问时间为 四月 22, 2025， [https://community.openai.com/t/chatgpt-in-obsidian-plugin/85323](https://community.openai.com/t/chatgpt-in-obsidian-plugin/85323)
22. Prompting Evolved: Obsidian as a Human to AI-Agent Interface : r/ChatGPTPro \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTPro/comments/1h7kblg/prompting_evolved_obsidian_as_a_human_to_aiagent/](https://www.reddit.com/r/ChatGPTPro/comments/1h7kblg/prompting_evolved_obsidian_as_a_human_to_aiagent/)
23. ittuann/obsidian-gpt-liteinquirer-plugin: Experience OpenAI ChatGPT assistance directly within Obsidian, drafting content without interrupting your creative flow. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/ittuann/obsidian-gpt-liteinquirer-plugin](https://github.com/ittuann/obsidian-gpt-liteinquirer-plugin)
24. OpenAI's “Assistants” and Obsidian integration : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/19f6p12/openais_assistants_and_obsidian_integration/](https://www.reddit.com/r/ObsidianMD/comments/19f6p12/openais_assistants_and_obsidian_integration/)
25. Plugins \- Prompt \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=prompt](https://obsidian.md/plugins?search=prompt)
26. AI Assistant for Obsidian | Christian B. B. Houmann, 访问时间为 四月 22, 2025， [https://bagerbach.com/blog/obsidian-ai/](https://bagerbach.com/blog/obsidian-ai/)
27. Cursor – @Docs, 访问时间为 四月 22, 2025， [https://docs.cursor.com/context/@-symbols/@-docs](https://docs.cursor.com/context/@-symbols/@-docs)
28. Cursor might be my VSCode replacement \- Dev Talk \- ProcessWire Support Forums, 访问时间为 四月 22, 2025， [https://processwire.com/talk/topic/29439-cursor-might-be-my-vscode-replacement/](https://processwire.com/talk/topic/29439-cursor-might-be-my-vscode-replacement/)
29. Cursor AI: A Guide With 10 Practical Examples \- DataCamp, 访问时间为 四月 22, 2025， [https://www.datacamp.com/tutorial/cursor-ai-code-editor](https://www.datacamp.com/tutorial/cursor-ai-code-editor)
30. How to Use Cursor AI in Visual Studio Code: Complete Step-by-Step Guide | GeeksforGeeks, 访问时间为 四月 22, 2025， [https://www.geeksforgeeks.org/how-to-use-cursor-ai-in-visual-studio-code/](https://www.geeksforgeeks.org/how-to-use-cursor-ai-in-visual-studio-code/)
31. App completely build using Claude Sonnet and Cursor AI IDE : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1f1es5i/cursor_ai_app_completely_build_using_claude/](https://www.reddit.com/r/ChatGPTCoding/comments/1f1es5i/cursor_ai_app_completely_build_using_claude/)
32. Cursor and Updated OpenAI API Documentation, 访问时间为 四月 22, 2025， [https://community.openai.com/t/cursor-and-updated-openai-api-documentation/1110926](https://community.openai.com/t/cursor-and-updated-openai-api-documentation/1110926)
33. How to Setup Cursor: A Beginner's Guide \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/cursor-setup-guide](https://apidog.com/blog/cursor-setup-guide)
34. My experience with Github Copilot vs Cursor : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1cft751/my_experience_with_github_copilot_vs_cursor/](https://www.reddit.com/r/ChatGPTCoding/comments/1cft751/my_experience_with_github_copilot_vs_cursor/)
35. Aman's AI Journal • Primers • Prompt Engineering, 访问时间为 四月 22, 2025， [https://aman.ai/primers/ai/prompt-engineering/](https://aman.ai/primers/ai/prompt-engineering/)
36. Prompt engineering techniques \- Azure OpenAI \- Learn Microsoft, 访问时间为 四月 22, 2025， [https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering)
37. Mastering AI-Powered Research: My Guide to Deep Research, Prompt Engineering, and Multi-Step Workflows : r/ChatGPTPro \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTPro/comments/1in87ic/mastering_aipowered_research_my_guide_to_deep/](https://www.reddit.com/r/ChatGPTPro/comments/1in87ic/mastering_aipowered_research_my_guide_to_deep/)
38. How to Use Images Legally Online for Your Blog? \- Content Whale, 访问时间为 四月 22, 2025， [https://content-whale.com/blog/using-images-legally-online/](https://content-whale.com/blog/using-images-legally-online/)
39. Prompt Engineering: Techniques, Uses & Advanced Approaches \- Acorn Labs, 访问时间为 四月 22, 2025， [https://www.acorn.io/resources/learning-center/prompt-engineering/](https://www.acorn.io/resources/learning-center/prompt-engineering/)
40. AI Prompt Engineering: The Art of AI Instruction \- K2view, 访问时间为 四月 22, 2025， [https://www.k2view.com/blog/ai-prompt-engineering/](https://www.k2view.com/blog/ai-prompt-engineering/)
41. Prompt Design and Engineering: Introduction and Advanced Methods \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2401.14423v4](https://arxiv.org/html/2401.14423v4)
42. The Only Prompt You Need : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1gds696/the_only_prompt_you_need/](https://www.reddit.com/r/ClaudeAI/comments/1gds696/the_only_prompt_you_need/)
43. Prompt engineering for RAG \- OpenAI Developer Forum, 访问时间为 四月 22, 2025， [https://community.openai.com/t/prompt-engineering-for-rag/621495](https://community.openai.com/t/prompt-engineering-for-rag/621495)
44. Prompt Engineering: Using AI and Large Language Models (LLMs) for Grant Writing, 访问时间为 四月 22, 2025， [https://bouviergrant.com/prompt-engineering-using-ai-and-large-language-models-llms-for-grant-writing/](https://bouviergrant.com/prompt-engineering-using-ai-and-large-language-models-llms-for-grant-writing/)
45. Using AI in research \- APS111T: Engineering Strategies & Practice, 访问时间为 四月 22, 2025， [https://guides.library.utoronto.ca/c.php?g=719022\&p=5371872](https://guides.library.utoronto.ca/c.php?g=719022&p=5371872)
46. Key Concepts and Considerations in Generative AI | Microsoft Learn, 访问时间为 四月 22, 2025， [https://learn.microsoft.com/en-us/azure/developer/ai/gen-ai-concepts-considerations-developers](https://learn.microsoft.com/en-us/azure/developer/ai/gen-ai-concepts-considerations-developers)
47. brianpetro/obsidian-smart-connections: Chat with your notes & see links to related content with AI embeddings. Use local models or 100+ via APIs like Claude, Gemini, ChatGPT & Llama 3 \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/brianpetro/obsidian-smart-connections](https://github.com/brianpetro/obsidian-smart-connections)
48. UX and UI Best Practices \- Wix Developers, 访问时间为 四月 22, 2025， [https://dev.wix.com/docs/build-apps/develop-your-app/design/ux-and-ui-best-practices](https://dev.wix.com/docs/build-apps/develop-your-app/design/ux-and-ui-best-practices)
49. Extensibility Principles and Patterns \- vscode-docs1 \- Read the Docs, 访问时间为 四月 22, 2025， [https://vscode-docs1.readthedocs.io/en/latest/extensionAPI/patterns-and-principles/](https://vscode-docs1.readthedocs.io/en/latest/extensionAPI/patterns-and-principles/)
50. ColBERT Wasm Demo · Issue \#656 · huggingface/transformers.js \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/xenova/transformers.js/issues/656](https://github.com/xenova/transformers.js/issues/656)
51. Sentence Embeddings and Dimension Reduction in the Browser \- Observable, 访问时间为 四月 23, 2025， [https://observablehq.com/@huggingface/sentence-embeddings-and-dimension-reduction-in-the-browse](https://observablehq.com/@huggingface/sentence-embeddings-and-dimension-reduction-in-the-browse)
52. Build for web | onnxruntime, 访问时间为 四月 23, 2025， [https://onnxruntime.ai/docs/build/web.html](https://onnxruntime.ai/docs/build/web.html)
53. onnxruntime-web fails to find ort-wasm-simd.wasm, doesn't use my /static folder in SvelteKit, 访问时间为 四月 23, 2025， [https://stackoverflow.com/questions/77179151/onnxruntime-web-fails-to-find-ort-wasm-simd-wasm-doesnt-use-my-static-folder](https://stackoverflow.com/questions/77179151/onnxruntime-web-fails-to-find-ort-wasm-simd-wasm-doesnt-use-my-static-folder)
54. Embeddings differ between transformers.js and sentence-transformers (Python) · Issue \#36, 访问时间为 四月 23, 2025， [https://github.com/xenova/transformers.js/issues/36](https://github.com/xenova/transformers.js/issues/36)
55. Use WebGPU \+ ONNX Runtime Web \+ Transformer.js to build RAG applications by Phi-3-mini \- Microsoft Tech Community, 访问时间为 四月 23, 2025， [https://techcommunity.microsoft.com/blog/educatordeveloperblog/use-webgpu--onnx-runtime-web--transformer-js-to-build-rag-applications-by-phi-3-/4190968](https://techcommunity.microsoft.com/blog/educatordeveloperblog/use-webgpu--onnx-runtime-web--transformer-js-to-build-rag-applications-by-phi-3-/4190968)
56. xenova/transformers \- NPM, 访问时间为 四月 23, 2025， [https://www.npmjs.com/package/@xenova/transformers](https://www.npmjs.com/package/@xenova/transformers)
57. sentence-transformers/all-MiniLM-L6-v2 · I'm trying to run this model in the browser using wonnx, but it isn't working \- Hugging Face, 访问时间为 四月 23, 2025， [https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/discussions/71](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/discussions/71)
58. Transformers.js \- Hugging Face, 访问时间为 四月 23, 2025， [https://huggingface.co/docs/transformers.js/index](https://huggingface.co/docs/transformers.js/index)
59. Transcript: Local AI Models in JavaScript \- Machine Learning Deep Dive With Xenova, 访问时间为 四月 23, 2025， [https://syntax.fm/show/740/local-ai-models-in-javascript-machine-learning-deep-dive-with-xenova/transcript](https://syntax.fm/show/740/local-ai-models-in-javascript-machine-learning-deep-dive-with-xenova/transcript)
60. What AI Tools do you use with Obsidian? How do you use them? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1fhhbnw/what_ai_tools_do_you_use_with_obsidian_how_do_you/](https://www.reddit.com/r/ObsidianMD/comments/1fhhbnw/what_ai_tools_do_you_use_with_obsidian_how_do_you/)
61. jacksteamdev/obsidian-mcp-tools: Add Obsidian ... \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools](https://github.com/jacksteamdev/obsidian-mcp-tools)
62. Using RAG to Enrich LLMs \- Synthesis AI, 访问时间为 四月 22, 2025， [https://synthesis.ai/2024/09/18/using-rag-to-enrich-llms/](https://synthesis.ai/2024/09/18/using-rag-to-enrich-llms/)
63. Retrieval-Augmented Generation for Large Language Models: A Survey \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/pdf/2312.10997](https://arxiv.org/pdf/2312.10997)
64. QA-RAG: Exploring LLM Reliance on External Knowledge \- MDPI, 访问时间为 四月 22, 2025， [https://www.mdpi.com/2504-2289/8/9/115](https://www.mdpi.com/2504-2289/8/9/115)
65. The Power of Retrieval Augmented Generation (RAG) in GenAI & Global Content, 访问时间为 四月 22, 2025， [https://www.welocalize.com/insights/the-power-of-retrieval-augmented-generation-rag-in-genai-global-content/](https://www.welocalize.com/insights/the-power-of-retrieval-augmented-generation-rag-in-genai-global-content/)
66. How Retrieval Augmented Generation (RAG) Boosts AI Creativity? \- AiThority, 访问时间为 四月 22, 2025， [https://aithority.com/machine-learning/how-retrieval-augmented-generation-rag-boosts-ai-creativity/](https://aithority.com/machine-learning/how-retrieval-augmented-generation-rag-boosts-ai-creativity/)
67. Why Retrieval-Augmented Generation (RAG) Matters for Brands \- Idomoo, 访问时间为 四月 22, 2025， [https://www.idomoo.com/blog/the-rise-of-retrieval-augmented-generation-in-ai-what-brands-need-to-know/](https://www.idomoo.com/blog/the-rise-of-retrieval-augmented-generation-in-ai-what-brands-need-to-know/)
68. Retrieval-Augmented Generation (RAG) Improves AI Content Relevance and Accuracy, 访问时间为 四月 22, 2025， [https://shelf.io/blog/retrieval-augmented-generation-rag-improves-ai-content-relevance-and-accuracy/](https://shelf.io/blog/retrieval-augmented-generation-rag-improves-ai-content-relevance-and-accuracy/)
69. What is retrieval-augmented generation (RAG)? \- IBM Research, 访问时间为 四月 22, 2025， [https://research.ibm.com/blog/retrieval-augmented-generation-RAG](https://research.ibm.com/blog/retrieval-augmented-generation-RAG)
70. What is RAG? \- Retrieval-Augmented Generation AI Explained \- AWS, 访问时间为 四月 22, 2025， [https://aws.amazon.com/what-is/retrieval-augmented-generation/](https://aws.amazon.com/what-is/retrieval-augmented-generation/)
71. In what scenario might it be better to rely on the LLM's parametric knowledge rather than retrieving from an external source (e.g., very simple common knowledge questions), and how to detect those? \- Milvus Blog, 访问时间为 四月 22, 2025， [https://blog.milvus.io/ai-quick-reference/in-what-scenario-might-it-be-better-to-rely-on-the-llms-parametric-knowledge-rather-than-retrieving-from-an-external-source-eg-very-simple-common-knowledge-questions-and-how-to-detect-those](https://blog.milvus.io/ai-quick-reference/in-what-scenario-might-it-be-better-to-rely-on-the-llms-parametric-knowledge-rather-than-retrieving-from-an-external-source-eg-very-simple-common-knowledge-questions-and-how-to-detect-those)
72. Using AI Tools to Optimise A Content Creation Workflow | IoA \- Institute of Analytics, 访问时间为 四月 22, 2025， [https://ioaglobal.org/blog/using-ai-tools-to-optimise-a-content-creation-workflow/](https://ioaglobal.org/blog/using-ai-tools-to-optimise-a-content-creation-workflow/)
73. MCP server for Obsidian \- GenAI Works, 访问时间为 四月 22, 2025， [https://genai.works/mcp-servers/mcp-server-for-obsidian-m99w3cvw](https://genai.works/mcp-servers/mcp-server-for-obsidian-m99w3cvw)
74. Model Context Protocol (MCP) server designed for LLMs to interact with Obsidian vaults. Provides secure, token-aware tools for seamless knowledge base management through a standardized interface. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/obsidian-mcp-server](https://github.com/cyanheads/obsidian-mcp-server)
75. How to Use the Obsidian MCP Server \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/obsidian-mcp-server/](https://apidog.com/blog/obsidian-mcp-server/)
76. README.md \- StevenStavrakis/obsidian-mcp \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/StevenStavrakis/obsidian-mcp/blob/main/README.md](https://github.com/StevenStavrakis/obsidian-mcp/blob/main/README.md)
77. Mind blown: MCP \+ Obsidian : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1hdl0cl/mind_blown_mcp_obsidian/](https://www.reddit.com/r/ClaudeAI/comments/1hdl0cl/mind_blown_mcp_obsidian/)
78. Walkthrough | The most advanced AI retrieval system. Agentic Retrieval-Augmented Generation (RAG) with a RESTful API. \- R2R \- SciPhi.ai, 访问时间为 四月 23, 2025， [https://r2r-docs.sciphi.ai/documentation/walkthrough](https://r2r-docs.sciphi.ai/documentation/walkthrough)
79. Cursor – Welcome to Cursor, 访问时间为 四月 22, 2025， [https://docs.cursor.com/get-started/welcome](https://docs.cursor.com/get-started/welcome)
80. agent-architectures-with-mcp \- AIXplore \- Tech Articles \- Obsidian Publish, 访问时间为 四月 22, 2025， [https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agent-architectures-with-mcp](https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agent-architectures-with-mcp)
81. can't process the image returned from MCP server · Issue \#1033 · cline/cline \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cline/cline/issues/1033](https://github.com/cline/cline/issues/1033)
82. How to connect Cursor to 100+ MCP Servers within minutes \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/composiodev/how-to-connect-cursor-to-100-mcp-servers-within-minutes-3h74](https://dev.to/composiodev/how-to-connect-cursor-to-100-mcp-servers-within-minutes-3h74)
83. How to use Obsidian for image management? \- Help, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/how-to-use-obsidian-for-image-management/71446](https://forum.obsidian.md/t/how-to-use-obsidian-for-image-management/71446)
84. Claude AI in Academic Writing and Research: Essential Tips for Optimal Results \- Yomu AI, 访问时间为 四月 22, 2025， [https://www.yomu.ai/blog/claude-ai-in-academic-writing-and-research-essential-tips-for-optimal-results](https://www.yomu.ai/blog/claude-ai-in-academic-writing-and-research-essential-tips-for-optimal-results)
85. Attributing Sources in RAG Generated Output \- ApX Machine Learning, 访问时间为 四月 23, 2025， [https://apxml.com/courses/getting-started-rag/chapter-4-rag-generation-augmentation/attributing-sources](https://apxml.com/courses/getting-started-rag/chapter-4-rag-generation-augmentation/attributing-sources)
86. RAG (Retrieval-augmented generation) \- Reddit, 访问时间为 四月 23, 2025， [https://www.reddit.com/r/Rag/best/?after=dDNfMWplcjMyMQ%3D%3D\&sort=top\&t=MONTH](https://www.reddit.com/r/Rag/best/?after=dDNfMWplcjMyMQ%3D%3D&sort=top&t=MONTH)
87. The ethics of disclosing the use of artificial intelligence tools in writing scholarly manuscripts, 访问时间为 四月 22, 2025， [https://pmc.ncbi.nlm.nih.gov/articles/PMC11694804/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11694804/)
88. Day 2 – Summarising text \- The 12 Days of AI, 访问时间为 四月 22, 2025， [https://12daysofai.myblog.arts.ac.uk/2023/11/30/day-2-summarising-text/](https://12daysofai.myblog.arts.ac.uk/2023/11/30/day-2-summarising-text/)
89. How Teachers Can Utilize Claude, the AI Assistant, in the Classroom, 访问时间为 四月 22, 2025， [https://annmichaelsen.com/2024/03/28/how-teachers-can-utilize-claude-the-ai-assistant-in-the-classroom/](https://annmichaelsen.com/2024/03/28/how-teachers-can-utilize-claude-the-ai-assistant-in-the-classroom/)
90. Effective Source Tracking in RAG Systems \- Chitika, 访问时间为 四月 23, 2025， [https://www.chitika.com/source-tracking-rag/](https://www.chitika.com/source-tracking-rag/)
91. Customizing Academic Writing with Claude AI: The Future of Research Composition, 访问时间为 四月 22, 2025， [https://www.yomu.ai/blog/customizing-academic-writing-with-claude-ai-the-future-of-research-composition](https://www.yomu.ai/blog/customizing-academic-writing-with-claude-ai-the-future-of-research-composition)
92. LLM-DetectAIve: a Tool for Fine-Grained Machine-Generated Text Detection, 访问时间为 四月 22, 2025， [https://aclanthology.org/2024.emnlp-demo.35/](https://aclanthology.org/2024.emnlp-demo.35/)
93. A Survey on LLM-Generated Text Detection: Necessity, Methods, and Future Directions, 访问时间为 四月 22, 2025， [https://direct.mit.edu/coli/article/51/1/275/127462/A-Survey-on-LLM-Generated-Text-Detection-Necessity](https://direct.mit.edu/coli/article/51/1/275/127462/A-Survey-on-LLM-Generated-Text-Detection-Necessity)
94. Accuracy and Reliability of AI-Generated Text Detection Tools: A Literature Review, 访问时间为 四月 22, 2025， [https://www.researchgate.net/publication/389114020_Accuracy_and_Reliability_of_AI-Generated_Text_Detection_Tools_A_Literature_Review](https://www.researchgate.net/publication/389114020_Accuracy_and_Reliability_of_AI-Generated_Text_Detection_Tools_A_Literature_Review)
95. Javascript Cosine Similarity for Similarity Search | Restackio, 访问时间为 四月 23, 2025， [https://www.restack.io/p/similarity-search-answer-javascript-cosine-similarity-cat-ai](https://www.restack.io/p/similarity-search-answer-javascript-cosine-similarity-cat-ai)
96. Javascript String Similarity Techniques | Restackio, 访问时间为 四月 23, 2025， [https://www.restack.io/p/similarity-search-answer-javascript-string-similarity-cat-ai](https://www.restack.io/p/similarity-search-answer-javascript-string-similarity-cat-ai)
97. keywords:cosine similarity \- npm search, 访问时间为 四月 23, 2025， [https://www.npmjs.com/search?q=keywords:cosine%20similarity](https://www.npmjs.com/search?q=keywords:cosine+similarity)
98. Rabbitzzc/js-string-comparison: A library implementing different string similarity using JavaScript. \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/Rabbitzzc/js-string-comparison](https://github.com/Rabbitzzc/js-string-comparison)
99. n-gram sentence similarity with cosine similarity measurement \- Stack Overflow, 访问时间为 四月 23, 2025， [https://stackoverflow.com/questions/4037174/n-gram-sentence-similarity-with-cosine-similarity-measurement](https://stackoverflow.com/questions/4037174/n-gram-sentence-similarity-with-cosine-similarity-measurement)
100. strsimpy · PyPI, 访问时间为 四月 23, 2025， [https://pypi.org/project/strsimpy/](https://pypi.org/project/strsimpy/)
101. The N-Grams Based Text Similarity Detection Approach Using Self-Organizing Maps and Similarity Measures \- MDPI, 访问时间为 四月 23, 2025， [https://www.mdpi.com/2076-3417/9/9/1870](https://www.mdpi.com/2076-3417/9/9/1870)
102. andreekeberg/ml-classify-text-js: Machine learning based text classification in JavaScript using n-grams and cosine similarity \- GitHub, 访问时间为 四月 23, 2025， [https://github.com/andreekeberg/ml-classify-text-js](https://github.com/andreekeberg/ml-classify-text-js)
103. Javascript text similarity algorithm \- Stack Overflow, 访问时间为 四月 23, 2025， [https://stackoverflow.com/questions/5042873/javascript-text-similarity-algorithm](https://stackoverflow.com/questions/5042873/javascript-text-similarity-algorithm)
104. CS-PaperSum: A Large-Scale Dataset of AI-Generated Summaries for Scientific Papers \- arXiv, 访问时间为 四月 22, 2025， [https://www.arxiv.org/pdf/2502.20582](https://www.arxiv.org/pdf/2502.20582)
105. Automate Your Content Creation | Scale Up Content To Stand Out \- Make, 访问时间为 四月 22, 2025， [https://www.make.com/en/automate/content-creation](https://www.make.com/en/automate/content-creation)
106. Claude Vs. ChatGPT: Creative Writing Quality Compared \- AI, 访问时间为 四月 22, 2025， [https://aicompetence.org/claude-vs-chatgpt-creative-writing-compared/](https://aicompetence.org/claude-vs-chatgpt-creative-writing-compared/)
107. Any solution for Integrating AI to Obsidian? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1jfhkdj/any_solution_for_integrating_ai_to_obsidian/](https://www.reddit.com/r/ObsidianMD/comments/1jfhkdj/any_solution_for_integrating_ai_to_obsidian/)
108. AI-Aided Obsidian? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1iyiu50/aiaided_obsidian/](https://www.reddit.com/r/ObsidianMD/comments/1iyiu50/aiaided_obsidian/)
109. Integrate OpenAI into Obsidian \- Data Engineering Blog, 访问时间为 四月 22, 2025， [https://www.ssp.sh/brain/integrate-openai-into-obsidian/](https://www.ssp.sh/brain/integrate-openai-into-obsidian/)
110. Adding AI to your Obsidian Notes with SmartConnections and CoPilot, 访问时间为 四月 22, 2025， [https://effortlessacademic.com/adding-ai-to-your-obsidian-notes-with-smartconnections-and-copilot/](https://effortlessacademic.com/adding-ai-to-your-obsidian-notes-with-smartconnections-and-copilot/)
111. Claude MCP for Obsidian using Rest API \- Developers: Plugin & API, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284](https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284)
112. Smart Templates \- Smart Templates is an AI powered templates for generating structured content in Obsidian. Works with Local Models, Anthropic Claude, Gemini, OpenAI and more., 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/smart-templates](https://www.obsidianstats.com/plugins/smart-templates)
113. Plugins \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=ai](https://obsidian.md/plugins?search=ai)
114. Let Claude Automate Your Obsidian Notes: Second Brain AI Agent (MCP) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=VeTnndXyJQI](https://www.youtube.com/watch?v=VeTnndXyJQI)
115. Connecting Claude and Obsidian: A Step-by-Step Guide | Video Summary by LunaNotes, 访问时间为 四月 22, 2025， [https://lunanotes.io/summary/connecting-claude-and-obsidian-a-step-by-step-guide](https://lunanotes.io/summary/connecting-claude-and-obsidian-a-step-by-step-guide)
116. punkpeye/awesome-mcp-servers: A collection of MCP servers. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
117. Model Context Protocol (MCP): 8 MCP Servers Every Developer Should Try\!, 访问时间为 四月 22, 2025， [https://dev.to/pavanbelagatti/model-context-protocol-mcp-8-mcp-servers-every-developer-should-try-5hm2](https://dev.to/pavanbelagatti/model-context-protocol-mcp-8-mcp-servers-every-developer-should-try-5hm2)
118. Model Context Protocol: What You Need To Know \- Gradient Flow, 访问时间为 四月 22, 2025， [https://gradientflow.com/model-context-protocol-what-you-need-to-know/](https://gradientflow.com/model-context-protocol-what-you-need-to-know/)
119. Model Context Protocol (MCP) an overview \- Philschmid, 访问时间为 四月 22, 2025， [https://www.philschmid.de/mcp-introduction](https://www.philschmid.de/mcp-introduction)
120. A Deep Dive Into MCP and the Future of AI Tooling | Andreessen ..., 访问时间为 四月 22, 2025， [https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/](https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/)
121. A surprising discovery me\! About MCP and Function calling \- Use cases and examples, 访问时间为 四月 22, 2025， [https://community.openai.com/t/a-surprising-discovery-me-about-mcp-and-function-calling/1223345](https://community.openai.com/t/a-surprising-discovery-me-about-mcp-and-function-calling/1223345)
122. Beyond the Hype: Understanding the Limitations of Anthropic's Model Context Protocol for Tool Integration \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/ramkey982/beyond-the-hype-understanding-the-limitations-of-anthropics-model-context-protocol-for-tool-48kk](https://dev.to/ramkey982/beyond-the-hype-understanding-the-limitations-of-anthropics-model-context-protocol-for-tool-48kk)
123. Comparing Open-Source AI Agent Frameworks \- Langfuse Blog, 访问时间为 四月 22, 2025， [https://langfuse.com/blog/2025-03-19-ai-agent-comparison](https://langfuse.com/blog/2025-03-19-ai-agent-comparison)
124. LLM Function-Calling vs. Model Context Protocol (MCP) \- Gentoro, 访问时间为 四月 22, 2025， [https://www.gentoro.com/blog/function-calling-vs-model-context-protocol-mcp](https://www.gentoro.com/blog/function-calling-vs-model-context-protocol-mcp)
125. Model Context Protocol vs Function Calling: What's the Big Difference? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h0w1z6/model_context_protocol_vs_function_calling_whats/](https://www.reddit.com/r/ClaudeAI/comments/1h0w1z6/model_context_protocol_vs_function_calling_whats/)
126. Function Calling vs. Model Context Protocol (MCP): What You Need to Know, 访问时间为 四月 22, 2025， [https://dev.to/fotiecodes/function-calling-vs-model-context-protocol-mcp-what-you-need-to-know-4nbo](https://dev.to/fotiecodes/function-calling-vs-model-context-protocol-mcp-what-you-need-to-know-4nbo)
127. StevenStavrakis/obsidian-mcp: A simple MCP server for ... \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/StevenStavrakis/obsidian-mcp](https://github.com/StevenStavrakis/obsidian-mcp)
128. A Nix-based configuration framework for Model Control Protocol (MCP) servers with ready-to-use packages. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/natsukium/mcp-servers-nix](https://github.com/natsukium/mcp-servers-nix)
129. Universal Tools For AI | \- MCP Run, 访问时间为 四月 22, 2025， [https://docs.mcp.run/blog/2024/12/18/universal-tools-for-ai/](https://docs.mcp.run/blog/2024/12/18/universal-tools-for-ai/)
130. MarkusPfundstein/mcp-obsidian: MCP server that interacts with Obsidian via the Obsidian rest API community plugin \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/MarkusPfundstein/mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian)
131. obsidian-mcp-tools/.clinerules at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/.clinerules](https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/.clinerules)
132. Obsidian knowledgebase \+ MCP (Claude desktop) : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1jwqxeq/obsidian_knowledgebase_mcp_claude_desktop/](https://www.reddit.com/r/ObsidianMD/comments/1jwqxeq/obsidian_knowledgebase_mcp_claude_desktop/)
133. smithery-ai/mcp-obsidian: A connector for Claude Desktop to read and search an Obsidian vault. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/smithery-ai/mcp-obsidian](https://github.com/smithery-ai/mcp-obsidian)
134. How to Build an MCP Server, 访问时间为 四月 22, 2025， [https://www.differentiated.io/blog/how-to-build-an-mcp-server](https://www.differentiated.io/blog/how-to-build-an-mcp-server)
135. Developers: Plugin & API \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/c/developers-api/14](https://forum.obsidian.md/c/developers-api/14)
136. Can someone explain MCP to me? How are you using it? And what has it allowed you to do that you couldn't do before? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h55zxd/can_someone_explain_mcp_to_me_how_are_you_using/](https://www.reddit.com/r/ClaudeAI/comments/1h55zxd/can_someone_explain_mcp_to_me_how_are_you_using/)
137. For Claude Desktop Users \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/quickstart/user](https://modelcontextprotocol.io/quickstart/user)
138. How to Set Up MCP Servers on Claude Desktop (Mac) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=4QnA8ci--r8](https://www.youtube.com/watch?v=4QnA8ci--r8)
139. Claude \+ MCPs \- 'Vibe Coding' Without Specialized IDEs Part 1 \- Stephan Miller, 访问时间为 四月 22, 2025， [https://www.stephanmiller.com/using-mcps-with-claude-desktop/](https://www.stephanmiller.com/using-mcps-with-claude-desktop/)
140. How to Use MCP with Claude Desktop App to do Anything You Want \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=PszckLRtFWI](https://www.youtube.com/watch?v=PszckLRtFWI)
141. MCP Servers with Claude Desktop \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=UIDsUfmtIqc](https://www.youtube.com/watch?v=UIDsUfmtIqc)
142. How Model Context Protocol Is Changing Enterprise AI Integration \- CMS Wire, 访问时间为 四月 22, 2025， [https://www.cmswire.com/digital-experience/how-model-context-protocol-is-changing-enterprise-ai-integration/](https://www.cmswire.com/digital-experience/how-model-context-protocol-is-changing-enterprise-ai-integration/)
143. Understanding the Model Context Protocol (MCP) | deepset Blog, 访问时间为 四月 22, 2025， [https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp](https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp)
144. AI Model Context Protocol (MCP) and Security \- Cisco Community, 访问时间为 四月 22, 2025， [https://community.cisco.com/t5/security-blogs/ai-model-context-protocol-mcp-and-security/ba-p/5274394](https://community.cisco.com/t5/security-blogs/ai-model-context-protocol-mcp-and-security/ba-p/5274394)
145. How to Use Model Context Protocol the Right Way | Boomi, 访问时间为 四月 22, 2025， [https://boomi.com/blog/model-context-protocol-how-to-use/](https://boomi.com/blog/model-context-protocol-how-to-use/)
146. Everything a Developer Needs to Know About the Model Context Protocol (MCP) \- Neo4j, 访问时间为 四月 22, 2025， [https://neo4j.com/blog/developer/model-context-protocol/](https://neo4j.com/blog/developer/model-context-protocol/)
147. MCP Changelog: Latest Updates & Release Notes \- BytePlus, 访问时间为 四月 22, 2025， [https://www.byteplus.com/en/topic/541587](https://www.byteplus.com/en/topic/541587)
148. Model Context Protocol (MCP): A comprehensive introduction for developers \- Stytch, 访问时间为 四月 22, 2025， [https://stytch.com/blog/model-context-protocol-introduction/](https://stytch.com/blog/model-context-protocol-introduction/)
149. Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2503.23278](https://arxiv.org/html/2503.23278)
150. Hermes MCP Roadmap — hermes_mcp v0.3.11 \- HexDocs, 访问时间为 四月 22, 2025， [https://hexdocs.pm/hermes_mcp/roadmap.html](https://hexdocs.pm/hermes_mcp/roadmap.html)
151. Leveraging model context protocol to unlock strategic advantage in generative AI deployments \- UST, 访问时间为 四月 22, 2025， [https://www.ust.com/en/insights/leveraging-model-context-protocol-to-unlock-strategic-advantage-in-generative-ai-deployments](https://www.ust.com/en/insights/leveraging-model-context-protocol-to-unlock-strategic-advantage-in-generative-ai-deployments)
152. VS Code API | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/references/vscode-api\#workspace](https://code.visualstudio.com/api/references/vscode-api#workspace)
153. Extensions » Patterns and principles \- vscode-docs, 访问时间为 四月 22, 2025， [https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/](https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/)
154. VS Code API | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/references/vscode-api\#window](https://code.visualstudio.com/api/references/vscode-api#window)
155. Commands | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/extension-guides/command](https://code.visualstudio.com/api/extension-guides/command)
156. My Obsidian Note-Taking Workflow | ssp.sh \- Data Engineering Blog, 访问时间为 四月 22, 2025， [https://www.ssp.sh/blog/obsidian-note-taking-workflow/](https://www.ssp.sh/blog/obsidian-note-taking-workflow/)
157. Kanban Plugin and Dataview \- Help \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/kanban-plugin-and-dataview/36660](https://forum.obsidian.md/t/kanban-plugin-and-dataview/36660)
158. My Obsidian-Based Kanban Writing Workflow \- The Sweet Setup, 访问时间为 四月 22, 2025， [https://thesweetsetup.com/my-obsidian-based-kanban-writing-workflow/](https://thesweetsetup.com/my-obsidian-based-kanban-writing-workflow/)
159. Plugins \- Kanban \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=kanban](https://obsidian.md/plugins?search=kanban)
160. Unlocking Efficiency: How Obsidian's Kanban Changes Task Management \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=wKPlkp40kYM](https://www.youtube.com/watch?v=wKPlkp40kYM)
161. Build a Kanban Board with Obsidian \+ Dataview Plugin \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=rGFb6j9KDh4](https://www.youtube.com/watch?v=rGFb6j9KDh4)
162. My Obsidian People Note Template | Dann Berg: blog, newsletter, shop, and more, 访问时间为 四月 22, 2025， [https://dannb.org/blog/2022/obsidian-people-note-template/](https://dannb.org/blog/2022/obsidian-people-note-template/)
163. How I Manage Myself and My Team Using Obsidian Tasks \- Pelayo Arbués, 访问时间为 四月 22, 2025， [https://www.pelayoarbues.com/notes/How-I-Manage-Myself-and-My-Team-Using-Obsidian-Tasks](https://www.pelayoarbues.com/notes/How-I-Manage-Myself-and-My-Team-Using-Obsidian-Tasks)
164. The UX/UI designer's guide to forms \- Formsort, 访问时间为 四月 22, 2025， [https://formsort.com/article/form-design-for-ux-ui-designers/](https://formsort.com/article/form-design-for-ux-ui-designers/)
165. User experience best practices | Firefox Extension Workshop, 访问时间为 四月 22, 2025， [https://extensionworkshop.com/documentation/develop/user-experience-best-practices/](https://extensionworkshop.com/documentation/develop/user-experience-best-practices/)
166. obsidian-mcp-tools/README.md at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/README.md](https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/README.md)
167. Old Security Rakes In New MCP Yards \- Den Delimarsky, 访问时间为 四月 22, 2025， [https://den.dev/blog/security-rakes-mcp/](https://den.dev/blog/security-rakes-mcp/)
168. Plugin security \- Obsidian Help, 访问时间为 四月 22, 2025， [https://help.obsidian.md/plugin-security](https://help.obsidian.md/plugin-security)
169. API Security Risks, Testing and Protection Best Practices | Entro, 访问时间为 四月 22, 2025， [https://entro.security/blog/api-security-and-protection-best-practices/](https://entro.security/blog/api-security-and-protection-best-practices/)
170. API Integration Best Practices: Process and Approach | ASD Blog, 访问时间为 四月 22, 2025， [https://asd.team/blog/api-integration-best-practices/](https://asd.team/blog/api-integration-best-practices/)
171. Ethical Considerations and Best Practices in LLM Development \- Neptune.ai, 访问时间为 四月 22, 2025， [https://neptune.ai/blog/llm-ethical-considerations](https://neptune.ai/blog/llm-ethical-considerations)
172. AI and the Law: Navigating Legal Risks in Content Creation \- Acrolinx, 访问时间为 四月 22, 2025， [https://www.acrolinx.com/blog/ai-laws-for-content-creation/](https://www.acrolinx.com/blog/ai-laws-for-content-creation/)
173. Implementing risk assessments for high-risk AI systems \- Washington Technology Solutions, 访问时间为 四月 22, 2025， [https://watech.wa.gov/sites/default/files/2025-01/EO%2024-01%20Risk%20Guidance_Final.pdf](https://watech.wa.gov/sites/default/files/2025-01/EO%2024-01%20Risk%20Guidance_Final.pdf)
174. Specification \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/specification/2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26)
175. Meet Claude: A New Era of AI from Anthropic | US Data Corporation, 访问时间为 四月 22, 2025， [https://www.usdatacorporation.com/blog/meet-claude-a-new-era-of-ai-from-anthropic/](https://www.usdatacorporation.com/blog/meet-claude-a-new-era-of-ai-from-anthropic/)
176. The Definition of Claude AI | TIME, 访问时间为 四月 22, 2025， [https://time.com/collections/the-ai-dictionary-from-allbusiness-com/7273938/definition-of-claude-ai/](https://time.com/collections/the-ai-dictionary-from-allbusiness-com/7273938/definition-of-claude-ai/)
177. Meet Claude \- Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/claude](https://www.anthropic.com/claude)
178. Anthropic Launches 'Constitution Classifier': Successfully Prevents 95% of Model Jailbreak Attempts \- AIbase, 访问时间为 四月 22, 2025， [https://www.aibase.com/news/15075](https://www.aibase.com/news/15075)
179. Anthropic Expands Claude's Capabilities With Research And Google Workspace Integration, 访问时间为 四月 22, 2025， [https://www.techdogs.com/tech-news/td-newsdesk/anthropic-expands-claudes-capabilities-with-research-and-google-workspace-integration](https://www.techdogs.com/tech-news/td-newsdesk/anthropic-expands-claudes-capabilities-with-research-and-google-workspace-integration)
180. Anthropic's Claude \- Models in Amazon Bedrock \- AWS, 访问时间为 四月 22, 2025， [https://aws.amazon.com/bedrock/claude/](https://aws.amazon.com/bedrock/claude/)
181. Home \\ Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/](https://www.anthropic.com/)
182. Collective Constitutional AI: Aligning a Language Model with Public Input \- Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input)
183. Claude vs. ChatGPT: A Detailed Comparison \- Writesonic Blog, 访问时间为 四月 22, 2025， [https://writesonic.com/blog/claude-vs-chatgpt](https://writesonic.com/blog/claude-vs-chatgpt)
184. Supercharge your knowledge management \- integrating Obsidian MCP with Claude, 访问时间为 四月 22, 2025， [https://www.qed42.com/insights/supercharge-your-knowledge-management---integrating-obsidian-mcp-with-claude](https://www.qed42.com/insights/supercharge-your-knowledge-management---integrating-obsidian-mcp-with-claude)
185. Quality and Originality: Ensuring Successful Content Creation \- AOK Marketing, 访问时间为 四月 22, 2025， [https://aokmarketing.com/quality-and-originality-ensuring-a-successful-content-creation/](https://aokmarketing.com/quality-and-originality-ensuring-a-successful-content-creation/)
186. Tips for Creating Original Content to Grow Your Audience \- Crowd Content, 访问时间为 四月 22, 2025， [https://www.stellarcontent.com/blog/writers-hub/how-to-create-original-content/](https://www.stellarcontent.com/blog/writers-hub/how-to-create-original-content/)
187. How to create original content: an in-depth guide \- The PickFu blog, 访问时间为 四月 22, 2025， [https://www.pickfu.com/blog/how-to-create-original-content/](https://www.pickfu.com/blog/how-to-create-original-content/)
188. Original Content | Tendo Communications, 访问时间为 四月 22, 2025， [https://tendocom.com/glossary/original-content/](https://tendocom.com/glossary/original-content/)
189. Anthropic Publishes Model Context Protocol Specification for LLM App Integration \- InfoQ, 访问时间为 四月 22, 2025， [https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/)
190. Introducing Claude Crew: Enhancing Claude Desktop's Coding Agent Capabilities, 访问时间为 四月 22, 2025， [https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah](https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah)
191. How does Cursor compare to using Claude desktop app with MCP? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1ivuhs4/how_does_cursor_compare_to_using_claude_desktop/](https://www.reddit.com/r/ClaudeAI/comments/1ivuhs4/how_does_cursor_compare_to_using_claude_desktop/)
192. LLMs: Fine-tuning, distillation, and prompt engineering | Machine Learning, 访问时间为 四月 22, 2025， [https://developers.google.com/machine-learning/crash-course/llm/tuning](https://developers.google.com/machine-learning/crash-course/llm/tuning)
