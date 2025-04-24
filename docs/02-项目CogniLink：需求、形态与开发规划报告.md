# **项目CogniLink：需求、形态与开发规划报告**

## **1\. 引言与愿景**

### **1.1. 问题陈述**

知识工作者、开发者和内容创作者在跨不同工具和数据源进行信息整合、原创内容生成以及复杂工作流管理时，常常面临效率低下的挑战 1。现有的工具可能缺乏与个人知识库（如Obsidian）的深度集成，或者无法在特定工作流（例如内容创作、编码、研究）中根据上下文有效利用先进的AI能力 5。AI工具的整合往往需要大量的手动操作（如复制粘贴、切换上下文）或复杂的自定义设置，这严重阻碍了生产力 6。  
核心问题不仅仅在于任务执行，更在于**上下文感知**的任务执行。用户需要一种能够理解其特定知识领域（Obsidian库）和工作流上下文（编码、写作、研究）的AI助手，并且能够与相关工具和数据无缝交互。研究材料显示，用户在工作流中存在脱节 6，渴望本地上下文感知能力 9，并认识到将AI直接集成到Obsidian 9 或IDE 24 等环境中的巨大潜力。模型上下文协议（Model Context Protocol, MCP）的出现 48 为解决这一集成问题提供了一个潜在的**标准化**方案，超越了临时的插件或手动流程。因此，当前面临的问题是缺乏一个统一的、具备上下文感知能力的AI助手，该助手能够利用MCP等标准实现无缝集成，特别是与Obsidian等知识库的集成。

### **1.2. 愿景与目标**

开发一款智能助手工具，该工具能深度集成用户的知识库（初期聚焦于Obsidian），并通过标准化协议（如MCP）利用AI模型（如Claude、GPT）来简化工作流程、增强内容创作能力、促进研究与分析。

* **目标1:** 在用户主要的工作环境（如Obsidian、IDE）中提供无缝的、上下文感知的AI辅助。  
* **目标2:** 通过统一界面，实现与本地知识（Obsidian笔记、文件）和外部工具/数据源（网页搜索、API、项目管理工具）的交互。  
* **目标3:** 增强内容创作工作流（构思、起草、大纲、图片整合、发布），提供尊重原创性和署名权的AI支持。  
* **目标4:** 提供灵活且可扩展的架构，倾向于利用MCP进行工具集成。

### **1.3. 建议项目名称**

* *选项1:* **Project CogniLink** (认知连接项目 \- 强调认知辅助和知识/工具的连接)  
* *选项2:* **Project SynapseFlow** (突触流项目 \- 突出思想连接和工作流自动化)  
* *选项3:* **Project ObsidianBridge** (黑曜石桥项目 \- 直接引用核心集成目标)  
* **建议:** **Project CogniLink** \- 该名称更具普适性，并能很好地体现AI与知识连接的方面。

### **1.4. 建议工具名称**

* *选项1:* **CogniLink Assistant** (认知连接助手 \- 与项目名称直接相关)  
* *选项2:* **Synapse Agent** (突触智能体 \- 侧重于AI代理方面)  
* *选项3:* **Obsidian AI Bridge** (黑曜石AI桥 \- 功能明确，但若范围扩展可能受限)  
* *选项4:* **Context Weaver** (上下文编织者 \- 强调上下文整合)  
* **建议:** **CogniLink Assistant** \- 与项目名称保持一致，并清晰地说明了其功能。

## **2\. 目标受众与关键用例**

### **2.1. 主要用户画像**

* **知识工作者/研究人员:** 使用Obsidian（或类似工具）进行大量笔记记录、卡片盒笔记法（Zettelkasten）、研究整合和学术写作的个人。他们需要帮助来连接想法、总结资料来源，并生成结构化内容 6。  
* **内容创作者/博主:** 利用Obsidian进行构思、起草、管理内容日历和发布工作流的用户。他们需要在大纲生成、草稿撰写、图片查找/放置、SEO优化以及潜在的自动化发布步骤方面获得辅助 2。  
* **开发者/技术主管:** 在使用IDE（如VS Code/Cursor）的同时，也使用知识库（可能是Obsidian）进行编码、文档编写、调试和项目管理的个人。他们需要将AI辅助集成到他们的编码环境中，使其能够理解代码库上下文并与开发工具（Git、问题跟踪器）交互 24。

### **2.2. 关键用例**

* **上下文感知AI聊天:** 与AI进行对话，AI能够理解当前Obsidian笔记、选定文本或整个知识库/项目代码库的上下文 29。  
* **知识整合与摘要:** 总结长篇笔记、多篇选定笔记或通过集成工具检索到的外部文档（PDF、网页），同时确保原创性和适当的署名 121。  
* **内容生成与增强:** 辅助进行博客主题构思 106，基于知识库内容生成大纲 9，起草文本段落 73，建议相关的内部链接 6，以及查找/放置相关的图片 91。  
* **工作流自动化:** 自动化内容发布流程中的步骤 17，任务管理（通过MCP将笔记链接到Linear/Jira问题 \- 316），或编码（重构、文档生成 \- 24）。  
* **研究辅助:** 利用AI对知识库进行语义查询 6，通过MCP从外部来源检索信息（网页搜索 \- 169），并整合来自多个来源的发现 136。  
* **核心价值:** 核心价值主张在于**协同增效**。该工具不应仅仅执行孤立的AI任务，而应利用用户的**个人**知识图谱（Obsidian）和偏好的外部工具（通过MCP），在其现有工作流程中提供高度情境化和可操作的辅助。用户明确表达了需要能够理解其**本地**上下文的AI 9。Obsidian被强调为一个强大的个人知识管理工具 74。MCP提供了将AI连接到此本地上下文（Obsidian MCP服务器 \- 21）和外部工具 151 的机制。结合这些能力，AI可以执行基于用户特定笔记并由外部数据/操作增强的任务（如摘要或内容生成），从而满足已识别的核心用户需求。

## **3\. 产品需求**

### **3.1. 功能需求 (FR)**

* **FR1: 核心AI交互:**  
  * 提供聊天界面，用于与选定的LLM（例如Claude、GPT，通过API）进行交互 156。  
  * 允许用户配置其偏好的LLM提供商和API密钥 18。  
  * 支持基于当前笔记/文件或用户选择的上下文感知 72。  
* **FR2: Obsidian集成 (若产品形态为Obsidian插件):**  
  * 读取当前笔记、选定文本或指定笔记的内容 135。  
  * 访问Obsidian元数据（标签、frontmatter、链接） 78。  
  * 执行库范围内的搜索（关键词和语义搜索，可能通过本地REST API/MCP利用Smart Connections等插件） 6。  
  * 在库中创建、编辑和移动笔记/目录 135。  
  * 管理标签（添加、删除、重命名） 163。  
  * 通过动态输入执行Obsidian Templater模板 77。  
* **FR3: IDE集成 (若产品形态为Cursor/VS Code扩展):**  
  * 访问活动编辑器或选定代码的内容 168。  
  * 提供内联代码生成/编辑（Cursor中的Cmd+K） 24。  
  * 提供AI驱动的代码补全/建议 24。  
  * 促进代码库范围的聊天和查询 25。  
  * 与IDE功能集成，如终端执行和文件系统操作（可能通过MCP） 28。  
  * 允许添加文档上下文（Cursor中的@Docs） 25。  
* **FR4: MCP客户端实现:**  
  * 连接并管理多个MCP服务器（stdio和SSE传输） 52。  
  * 发现连接的服务器提供的工具、资源和提示 50。  
  * 促进LLM与MCP工具的交互（解析LLM意图、格式化工具调用、处理响应） 50。  
  * 实现工具执行的用户同意/批准机制 56。  
* **FR5: 内容创作辅助:**  
  * 基于选定的笔记或主题生成大纲 9。  
  * 基于提示和上下文起草内容段落 73。  
  * 在Obsidian中建议相关的内部链接 6。  
  * 集成图像生成/图库MCP服务器（例如Unsplash、Stability AI、通过Apify的Midjourney）以建议和放置相关图像 107。  
  * 辅助将内容格式化为特定平台（例如博客文章，使用模板） 15。  
* **FR6: 原创性与署名:**  
  * 实现功能以帮助用户在基于来源进行总结或生成内容时避免抄袭（例如，清晰的来源指示、RAG技术） 121。  
  * 集成用于评估内容原创性或语义新颖性的工具/技术（可能使用如354的MMD方法或分类器276）。  
  * 促进对使用的来源和图像进行适当署名（例如，CC许可证管理） 229。

### **3.2. 非功能需求 (NFR)**

* **NFR1: 性能:** 确保UI交互响应迅速，AI响应及时。最小化MCP工具调用的延迟 233。考虑缓存MCP工具列表 235。  
* **NFR2: 可扩展性:** 设计应能处理可能的大型Obsidian库和复杂的代码库。确保MCP客户端能够有效管理多个服务器连接 236。解决潜在的上下文窗口限制问题 233。考虑扩展内容创作工作流的策略 1。  
* **NFR3: 安全性:**  
  * 实现API密钥的安全处理 18。  
  * 遵守MCP安全最佳实践（用户同意、数据隐私、工具安全、采样控制） 56。  
  * 解决与本地文件访问相关的风险（通过插件/MCP访问Obsidian库） 180。  
  * 减轻与MCP服务器相关的风险（令牌盗窃、服务器受损、提示注入、权限过大） 244。  
  * 考虑使用第三方MCP服务器的安全影响 247。  
* **NFR4: 可用性与用户体验 (UX):**  
  * 提供直观的界面来配置AI模型和MCP服务器 249。  
  * 遵循IDE/编辑器扩展的UX最佳实践（清晰的说明、专注的功能、适当的UI元素，如状态栏更新、通知、上下文菜单） 37。  
  * 在AI处理和工具执行期间向用户提供清晰的反馈 260。  
* **NFR5: 可靠性与稳定性:** 确保与AI API和MCP服务器的连接稳定。优雅地处理错误（连接超时、API错误、MCP服务器故障） 169。考虑MCP生态系统的成熟度和稳定性 58。  
* **NFR6: 可维护性:** 采用模块化架构设计，尤其是在利用MCP时。确保核心应用程序、AI交互层和工具集成之间关注点分离清晰 52。遵循编码最佳实践 275。  
* **NFR7: 伦理AI:**  
  * 整合机制以减轻AI生成内容中的偏见 157。  
  * 确保内容创作中AI参与的透明度 277。  
  * 遵守负责任的AI原则（例如，Anthropic的Constitutional AI） 156。

### **3.3. 未来考虑 (潜在增强功能)**

* 支持除Obsidian之外的其他知识来源。  
* 随着生态系统的发展，集成更多样化的MCP服务器 247。  
* 高级工作流自动化功能（例如，多步代理流程） 290。  
* 支持多模态输入/输出（超越文本和基本图像） 127。  
* 离线/本地LLM支持 5。

## **4\. 产品形态与架构**

### **4.1. 建议的产品形态**

* **选项A: Obsidian插件:**  
  * *优点:* 与用户的知识库深度集成，利用现有的Obsidian UI/API，直接访问笔记/元数据。对Obsidian用户来说是熟悉的环境 12。  
  * *缺点:* 仅限于Obsidian用户。依赖于Obsidian的插件架构和安全模型 243。可能需要独立的MCP服务器组件（如obsidian-mcp-tools \- 135）或直接API调用 18。可能对Obsidian性能产生影响。图像处理可能受Obsidian API/Markdown能力的限制 134。  
* **选项B: VS Code / Cursor扩展:**  
  * *优点:* 利用强大的IDE特性，对开发者来说是熟悉的环境。Cursor提供内置的AI/MCP客户端能力 24。可访问更广泛的VS Code扩展生态系统 25。  
  * *缺点:* 与Obsidian库的集成不够直接（可能依赖于Filesystem MCP服务器 \- 151）。可能需要用户同时打开IDE和Obsidian。Cursor本身仍在发展中 29。  
* **选项C: 独立桌面应用程序:**  
  * *优点:* 平台独立，对UI/UX有完全控制，可能更容易进行跨平台开发。可以作为一个通用的MCP客户端。  
  * *缺点:* 需要用户安装另一个应用程序。需要实现自己的编辑器/笔记管理功能，或与文件系统访问（通过MCP）紧密集成。开发工作量更大。  
* **建议:** **Obsidian插件 (选项A)** 似乎最符合用户将AI与其现有知识库深度整合的隐含需求。然而，这需要仔细考虑安全性，并可能需要构建/捆绑MCP服务器。如果目标受众主要是已经在使用Cursor的开发者，那么**选项B**因Cursor内置的MCP客户端而变得非常有吸引力。  
* **分析:** 产品形态的选择严重影响集成策略。Obsidian插件可以直接利用Obsidian API或通过MCP桥接本地REST API插件 300 进行交互 135。而IDE扩展**必须**依赖MCP（如Filesystem服务器 304）来与Obsidian库（本质上只是Markdown文件的文件夹 \- 206）交互，这产生了对MCP服务器可用性和配置的依赖。片段 135 描述了作为或利用MCP服务器的Obsidian插件，通常依赖本地REST API插件 240 进行库交互，证明了插件方法的可行性。片段 171 描述了在Cursor中配置MCP服务器（包括Filesystem），展示了外部应用程序如何访问本地文件。因此，IDE扩展需要这样的MCP服务器来访问Obsidian库。这突显了架构上的差异：直接访问（插件）与中介访问（通过MCP的IDE扩展）。

### **4.2. 高层架构**

* **核心模块:** 处理用户界面、命令处理和工作流编排。  
* **AI交互模块:** 管理与选定LLM API的通信（处理提示、响应、上下文管理）。整合提示工程技术 136。  
* **MCP客户端模块 (如适用):** 管理与MCP服务器的连接、工具发现、调用和响应处理 52。  
* **Obsidian交互层 (若为插件):** 使用Obsidian API或本地REST API（通过MCP或直接）与库交互（读/写笔记、元数据、搜索） 21。  
* **配置模块:** 管理用户设置（API密钥、模型选择、MCP服务器配置） 158。

### **4.3. 关键集成点**

* **LLM APIs:** Anthropic (Claude) 156, OpenAI 235, Google 156。  
* **MCP服务器:**  
  * *核心:* Filesystem (例如 @modelcontextprotocol/server-filesystem)，如果不是直接插件，用于库访问 151。  
  * *内容/研究:* Web Search (例如 Brave Search, DuckDuckGo, Perplexity) 49, Puppeteer/Playwright 用于浏览器自动化/抓取 48。  
  * *开发:* Git, GitHub/GitLab 151。  
  * *生产力/工作流:* Linear 316, Slack 49。  
  * *图像:* Stability AI, Unsplash, Midjourney (通过 Apify) 107。  
  * *Obsidian特定:* obsidian-mcp-tools 135 或 mcp-obsidian 158，如果构建外部客户端（如IDE扩展）。  
* **Obsidian API / 本地REST API (若为插件):** 直接与库数据和插件生态系统交互 300。  
* **架构考量:** 利用MCP提供了显著的架构灵活性。该工具可以从核心AI功能开始，通过集成现有的MCP服务器逐步增加能力，从而减少定制开发的工作量。然而，这也引入了对MCP生态系统成熟度和单个服务器安全性的依赖。MCP的设计目标是标准化和互操作性 48。一个不断增长的服务器生态系统已经存在 48。这支持了增量能力添加的想法。然而，对MCP成熟度、稳定性和安全性的担忧也被提及 58，表明存在依赖风险。

### **4.4. 表格：产品形态对比**

| 特性 | 选项A: Obsidian插件 | 选项B: IDE扩展 (Cursor/VS Code) | 选项C: 独立桌面应用 |
| :---- | :---- | :---- | :---- |
| **Obsidian集成深度** | 高 (直接API访问) 135 | 低 (依赖MCP Filesystem服务器) 171 | 低 (依赖MCP Filesystem服务器) |
| **开发工作量** | 中等 (需熟悉Obsidian API/插件) | 中等 (需熟悉IDE API/扩展，MCP客户端) | 高 (需构建完整应用框架) |
| **用户体验** | 对Obsidian用户无缝 | 对IDE用户无缝，但可能需切换应用 | 独立体验，可能增加用户负担 |
| **对MCP的依赖** | 可选 (可直接调用API或通过MCP) | 高 (库访问必须通过MCP) | 高 (库访问必须通过MCP) |
| **安全性考量** | 插件权限模型 243, 本地API风险 240 | MCP服务器安全 244, IDE扩展安全 | 应用自身安全, MCP服务器安全 244 |
| **推荐场景** | 核心用户为Obsidian重度使用者 | 核心用户为开发者，已使用Cursor/VS Code | 需要跨平台通用客户端 |

## **5\. 内容工作流集成 (如适用)**

### **5.1. 博客文章生成工作流示例**

内容创作是知识工作者的核心活动之一，CogniLink Assistant旨在通过AI辅助显著提升此流程的效率和质量。以下是一个集成本工具的博客文章生成工作流示例：

1. **构思阶段:**  
   * 用户可以在Obsidian中记录零散的想法 15。  
   * 用户可以向CogniLink Assistant提问，例如“基于我关于‘\[\[项目管理\]\]’和‘\[\[敏捷开发\]\]’的笔记，生成5个博客文章主题建议”。  
   * AI利用Obsidian集成（FR2）或Filesystem MCP服务器（FR3）访问相关笔记，结合LLM（FR1）进行分析，并提出主题建议 106。  
2. **大纲生成:**  
   * 用户选择一个主题，例如“使用Obsidian和AI优化内容创作流程”。  
   * 用户请求CogniLink Assistant生成大纲：“为主题‘使用Obsidian和AI优化内容创作流程’生成一个详细的博客大纲，参考我的‘\[\[Obsidian插件\]\]’和‘\[\[AI写作工具\]\]’笔记”。  
   * AI访问指定的笔记或通过语义搜索（FR2）找到相关内容，生成结构化大纲，包含主要章节和子要点 9。大纲可以直接插入当前笔记。  
3. **草稿撰写:**  
   * 用户可以逐段请求AI辅助撰写。例如，选中大纲中的“利用AI进行内容构思”部分，提示：“扩展这一点，讨论如何使用AI工具（如ChatGPT, Claude）进行头脑风暴，并结合Obsidian笔记作为灵感来源，保持专业且信息丰富的风格”。  
   * AI基于提示、上下文（用户笔记）以及可能通过MCP进行的网络搜索（FR4）来生成草稿 16。  
   * 采用如链式思考（Chain-of-Thought）等提示工程技术 136 或角色扮演 302 来引导AI生成符合特定风格或结构的内容 338。  
4. **图像集成:**  
   * 用户撰写到需要配图的部分，例如描述“Obsidian的看板视图”，可以提示：“为这一段内容建议一个合适的配图主题”。  
   * AI分析文本上下文，建议图像主题，例如“Obsidian看板插件截图”或“抽象的任务流程图” 126。  
   * 用户确认主题后，可以进一步提示：“使用Unsplash MCP服务器查找一张关于‘项目管理看板’的高质量图片”或“使用Stability AI MCP服务器生成一张‘未来风格的知识管理界面’的图片”。  
   * CogniLink Assistant通过相应的MCP服务器（FR5）执行搜索或生成 107。  
   * 获取图片URL或数据后，工具辅助用户将图片以Markdown格式 \!\[替代文本\](图片URL或本地路径) 插入笔记中。需要注意MCP客户端/服务器在处理图像响应方面可能存在的限制 134。  
5. **审阅与编辑:**  
   * 用户完成草稿后，可以请求AI进行审阅：“检查这篇文章的语法错误，改进句子流畅性，并确保风格一致”。  
   * AI利用LLM的语言能力进行检查和建议 18。  
   * 用户可以进一步请求原创性检查：“检查这篇文章与我的知识库或已知网络来源是否存在潜在的非原创重叠部分”。工具可以利用RAG的来源信息或集成专门的检测工具（FR6）提供反馈 102。人类的最终判断至关重要。  
6. **发布:**  
   * 用户确认最终稿件后，可以使用Obsidian的发布插件（如WordPress, Hugo, Jekyll插件） 17 或通过脚本触发发布流程。  
   * CogniLink Assistant可以通过与项目管理工具（如Linear）的MCP集成（FR4）来更新内容状态，例如将Linear任务标记为“待发布”或“已发布” 217。

### **5.2. 原创性与署名管理**

在AI辅助内容创作中，确保内容的原创性和进行正确的署名至关重要。

* **原创性定义:** 原创内容应提供独特的见解或视角，而不仅仅是复述现有信息 346。应避免没有增值的简单改写 350。内容应以解决用户问题或提供价值为核心 111。  
* **AI内容检测与RAG影响:**  
  * 虽然存在AI内容检测工具 276，但它们的可靠性有限 276。可以考虑集成这些工具作为辅助参考，或者探索基于语义新颖性的方法（如MMD）来评估内容的独特性 354。  
  * 检索增强生成（RAG）技术通过引用外部知识库来提高AI响应的准确性并减少“幻觉” 224，但如果仅是拼凑检索到的信息而没有进行良好的综合与提炼，可能会影响内容的原创性感知 137。工具应通过提示工程 136 鼓励AI进行**综合**而非简单复述。  
* **署名工作流:**  
  * **来源追踪:** 在研究和生成过程中记录所使用的信息来源 121。RAG本身可以提供来源信息 357。  
  * **图像署名:**  
    * 遵守图像版权最佳实践：默认所有在线图片受版权保护 359，除非明确标明 360。优先使用自己拍摄/创作的图片 350 或来自信誉良好的图库（如Unsplash）并遵守其许可 350。  
    * 理解并遵守Creative Commons (CC) 许可证要求，特别是署名要求 314。  
    * 实现功能以辅助用户正确署名CC授权图片，遵循TASL原则（Title \- 标题, Author \- 作者, Source \- 来源, License \- 许可证） 229。可以通过集成专门的署名构建工具 229 或在MCP流程中加入相关步骤。  
    * 使用反向图片搜索工具（如Google Images, TinEye）帮助追溯图片来源 360。  
  * **AI使用披露:** 根据伦理准则 277 和机构/出版要求，透明地披露AI在内容创作中的使用情况 277。例如，在方法部分或致谢中说明使用了何种AI工具、版本以及具体用途。  
* **平衡AI与原创性:** 平衡AI辅助与作者的原创思考至关重要。工具应定位为**助手** 9，增强而非取代人类作者的批判性思维、创造力和独特声音 7。用户应积极参与内容的构思、编辑和最终确认过程 7。RAG可以增强事实基础，但需要精心设计的提示词来确保输出是新颖的综合，而非检索片段的拼接 303。署名工具 229 的集成应旨在简化合规性，而非完全自动化决策。

## **6\. 开发计划**

### **6.1. 开发阶段**

* **阶段1: MVP (Minimum Viable Product \- 最小可行产品):**  
  * 核心AI交互模块（连接一个LLM API，基础聊天功能）。  
  * 基础Obsidian插件集成（读取当前笔记上下文）。  
  * 实现一个核心MCP客户端连接（例如，用于库读取访问的Filesystem服务器 \- 304）。  
  * 基础内容生成功能（例如，总结选定内容）。  
* **阶段2: Beta发布:**  
  * 支持多种LLM API及配置 18。  
  * 增强的Obsidian集成（搜索、元数据访问、笔记创建/编辑 \- 135）。  
  * 集成额外的关键MCP服务器（例如，Web Search, Git \- 151）。  
  * 实现核心内容创作功能（大纲、草稿）。  
  * 基础的原创性/署名辅助功能。  
* **阶段3: V1.0发布:**  
  * 完整的MCP客户端实现（多服务器，stdio/SSE传输）。  
  * 健壮的Obsidian插件/IDE扩展功能。  
  * 高级内容工作流功能（图像集成、发布辅助）。  
  * 完善的原创性检查和署名管理。  
  * 全面的测试和文档。

### **6.2. 关键里程碑**

* *M1 (阶段1结束):* MVP演示，具备基础AI聊天和通过Filesystem MCP的Obsidian读取访问。  
* *M2 (阶段2中期):* Beta版本，支持多LLM、库搜索和Web搜索集成。  
* *M3 (阶段2结束):* Beta候选版本，具备核心内容生成功能和基础Git集成。  
* *M4 (阶段3中期):* 功能完整版本，包含图像集成和发布辅助功能。  
* *M5 (阶段3结束):* V1.0发布，包含完整测试、文档和优化的用户体验。

### **6.3. 技术栈考量**

* **Obsidian插件:** TypeScript, Obsidian API 300。  
* **IDE扩展:** TypeScript, VS Code/Cursor API 29。  
* **MCP客户端/服务器:** 推荐使用Python或TypeScript SDK 60。可考虑使用fastmcp (Python) 376。  
* **AI模型:** 来自Anthropic 156, OpenAI 235, Google 156 等的API。

### **6.4. 资源考量**

* 需要熟悉TypeScript/Python、AI/LLM API以及潜在的Obsidian/VS Code扩展开发的开发人员。  
* 对MCP概念和开发的理解至关重要 52。  
* 开发和测试期间需要预算AI API使用费用。  
* 需要分配时间来应对不断发展的MCP生态系统和潜在的破坏性变更 271。  
* 开发计划必须考虑到MCP生态系统的成熟度。虽然利用MCP提供了长期利益（标准化、可扩展性），但其当前状态 58 意味着潜在的不稳定性，并需要仔细选择和测试MCP服务器。MCP正在快速发展 377，但仍处于早期阶段 58，存在安全、发现和部署方面的挑战 58。这表明仅仅依赖现有的社区服务器存在风险。使用SDK构建自定义服务器是可行的 60。因此，计划应优先考虑核心功能，尽可能使用稳定/官方的MCP服务器 151，并为潜在的自定义服务器开发或随着生态系统的发展进行调整预留时间和资源。

## **7\. 风险评估与缓解**

### **7.1. 技术风险**

* *风险:* MCP标准不稳定/破坏性变更 271。 *缓解:* 使用官方SDK，监控MCP变更日志 272，固定依赖版本，构建抽象层，参与社区 288。  
* *风险:* 第三方MCP服务器的可靠性/质量 58。 *缓解:* 优先选择官方/维护良好的服务器 151，实施健壮的错误处理和重试机制，考虑内部构建关键集成，使用MCP Inspector进行测试 378。  
* *风险:* 性能瓶颈（MCP通信、AI API延迟） 233。 *缓解:* 优化MCP工具设计，实现缓存 235，使用异步操作，监控性能 381。  
* *风险:* 上下文窗口限制 233。 *缓解:* 高效的上下文管理策略（摘要、选择性包含），使用具有更大上下文窗口的模型，设计工具以最小化上下文传递。

### **7.2. 安全风险**

* *风险:* 不安全的MCP服务器实现（漏洞、权限过大） 244。 *缓解:* 审查服务器，优先选择本地/可信服务器，实施客户端验证，尽可能使用沙箱 247，遵循MCP安全指南 56。  
* *风险:* 不安全的本地文件/资源访问（通过Obsidian插件或Filesystem MCP） 180。 *缓解:* 实施严格的路径验证，遵循最小权限原则，对文件操作要求明确的用户同意 56，对用户进行风险教育。  
* *风险:* API密钥泄露/管理 18。 *缓解:* 使用安全存储（平台凭证管理器 \- 135），环境变量 175，避免硬编码密钥，在MCP支持的情况下实施OAuth 65。  
* *风险:* 通过外部数据/工具进行提示注入 244。 *缓解:* 清理来自外部来源的输入，将工具描述/输出视为潜在不可信 56，实施输出验证。

### **7.3. 采纳与可用性风险**

* *风险:* 非开发人员设置复杂（MCP服务器配置、API密钥） 249。 *缓解:* 提供清晰的文档和教程 249，尽可能自动化设置（例如 obsidian-mcp-tools 的方法 \- 135），提供合理的默认值。  
* *风险:* 用户体验差（界面混乱、AI响应不可靠） 258。 *缓解:* 遵循UX最佳实践 37，实施有效的提示工程 136，提供清晰的反馈机制 267。

### **7.4. 伦理风险**

* *风险:* 生成带偏见或有害的内容 157。 *缓解:* 使用具有安全功能的模型（例如，Constitutional AI \- 156），实施内容过滤器，允许用户报告，提供偏见监控工具 278。  
* *风险:* 抄袭和缺乏原创性 121。 *缓解:* 负责任地实施RAG（侧重于综合），提供来源署名工具 121，教育用户合乎道德地使用AI 277。  
* *风险:* AI使用缺乏透明度 277。 *缓解:* 清晰标示AI生成或辅助的内容，在可行的情况下为AI行为提供解释。  
* **风险管理综合考量:** 安全和伦理是至关重要的，特别是考虑到该工具可能访问敏感的用户数据（Obsidian库）及其内容生成能力。对不断发展的MCP标准和第三方服务器的依赖增加了安全复杂性，必须通过仔细的设计、用户教育以及遵守MCP规范和安全研究中概述的最佳实践来进行主动管理。该工具结合了对个人知识（Obsidian \- 103）的访问、外部工具（MCP \- 48）和AI生成能力 156。每个组成部分都引入了风险：Obsidian访问 243、MCP漏洞 244 和AI伦理问题 277。MCP安全特别强调用户同意、数据隐私和工具安全 56。因此，需要一个多方面的方法来解决本地安全（插件权限、文件访问）、协议安全（MCP标准、服务器审查）和AI伦理（偏见、抄袭、透明度）问题。

### **7.5. 表格：风险评估摘要**

| 风险类别 | 关键风险示例 | 潜在影响 | 主要缓解策略 |
| :---- | :---- | :---- | :---- |
| **技术风险** | MCP标准不稳定/破坏性变更 271 | 功能中断, 增加维护成本 | 监控变更日志, 使用SDK, 构建抽象层 |
|  | 第三方MCP服务器不可靠 58 | 功能失败, 数据不一致 | 优先官方/可信服务器, 健壮错误处理, MCP Inspector测试 378 |
|  | 上下文窗口限制 237 | AI推理能力下降, 信息丢失 | 高效上下文管理, 使用大窗口模型 |
| **安全风险** | 不安全的本地文件访问 240 | 数据泄露, 系统损坏 | 严格路径验证, 最小权限, 用户同意 |
|  | 不安全的MCP服务器 244 | 数据泄露, 未授权操作, 系统受损 | 审查服务器, 优先本地/可信服务器, 沙箱化 247, 遵循MCP安全指南 |
|  | API密钥泄露 135 | 未授权访问外部服务 | 安全存储, 环境变量, 避免硬编码, OAuth 271 |
|  | 提示注入 244 | 执行恶意指令, 数据泄露 | 输入清理, 输出验证, 视工具输出为不可信 56 |
| **可用性风险** | 非开发者设置复杂 249 | 用户采纳率低, 配置错误 | 清晰文档/教程 252, 自动化设置 135, 合理默认值 |
|  | 用户体验差 | 用户流失, 效率低下 | 遵循UX最佳实践 254, 优化提示工程, 清晰反馈 267 |
| **伦理风险** | 生成带偏见/有害内容 276 | 传播错误信息, 造成社会危害 | 使用安全模型 156, 内容过滤, 用户报告, 偏见监控 278 |
|  | 抄袭/缺乏原创性 121 | 学术/职业不端行为, 内容价值低 | 负责任的RAG, 来源署名工具 229, 用户教育 |
|  | AI使用缺乏透明度 277 | 破坏信任, 违反规定 | 清晰标示AI参与, 解释AI行为 |

## **8\. 结论与建议**

### **8.1. 总结**

本报告旨在为开发一款新型AI辅助工具——CogniLink Assistant提供全面的需求、产品形态定义和开发规划。该工具的核心目标是解决知识工作者、内容创作者和开发者在整合个人知识库（特别是Obsidian）与外部工具、数据源时所面临的效率低下和上下文割裂问题。通过深度集成用户的Obsidian库，并利用模型上下文协议（MCP）连接多样化的外部工具（如网页搜索、代码仓库、项目管理、图像生成等）和强大的大型语言模型（如Claude、GPT），CogniLink Assistant旨在提供一个统一、智能且上下文感知的交互体验。  
报告详细阐述了工具的功能性需求（包括核心AI交互、特定平台集成、MCP客户端能力、内容创作辅助以及原创性与署名管理）和非功能性需求（涵盖性能、可扩展性、安全性、可用性、可靠性、可维护性和AI伦理）。在产品形态方面，对比分析了Obsidian插件、IDE扩展和独立桌面应用三种方案，并基于目标用户和集成深度，倾向于推荐Obsidian插件或IDE扩展。高层架构设计强调了模块化，特别是利用MCP实现灵活的工具集成。此外，报告还具体描绘了AI辅助下的内容创作工作流，并强调了在利用AI能力的同时，维护内容原创性和进行正确署名的重要性。最后，提出了分阶段的开发计划，并进行了详尽的风险评估，覆盖了技术、安全、可用性和伦理等多个维度。

### **8.2. 建议与后续步骤**

基于以上分析，为成功启动和推进CogniLink项目，提出以下建议和后续步骤：

1. **用户与市场验证:** 尽快通过原型或用户访谈，验证所选的产品形态（Obsidian插件或IDE扩展）是否符合核心目标用户的实际需求和偏好。明确首要目标用户群体（知识工作者、内容创作者或开发者）以指导MVP的功能优先级。  
2. **MVP范围聚焦:** 严格遵循MVP（最小可行产品）原则，初期集中资源实现核心AI聊天功能，并打通与Obsidian库的基本读取交互。如果选择IDE扩展形态，则优先实现与Filesystem MCP服务器的稳定连接。  
3. **技术设计深化:** 启动AI交互模块和Obsidian交互层/MCP客户端模块的详细技术设计。特别关注如何高效、安全地管理LLM API交互和MCP服务器连接。  
4. **MCP生态系统监控:** 指派专人或团队负责持续跟踪MCP生态系统的发展，包括新服务器的出现、官方SDK的更新、规范的变更以及社区报告的安全问题 272。建立机制以快速响应可能影响项目的变化。  
5. **风险管理计划:** 制定详细的风险缓解计划，特别是针对安全（本地文件访问、API密钥管理、MCP服务器风险）和伦理AI（偏见、抄袭、透明度）方面。将用户同意和数据隐私保护 56 作为设计的核心原则。  
6. **资源规划:** 基于MVP范围和选定的技术栈，进行初步的人员和预算规划。考虑到MCP生态的不确定性，应预留一定的资源用于潜在的自定义服务器开发或集成调试。  
7. **社区参与:** 积极参与MCP 288 和相关社区（如Obsidian 322, Cursor）的讨论，获取最新信息，寻求支持，并为生态系统的发展做出贡献。

通过采取这些步骤，CogniLink项目可以在明确的目标和充分的风险意识下稳步推进，有望开发出一款真正满足用户需求的、强大且负责任的AI辅助工具。

#### **引用的著作**

1. The Key to Content at Scale: AI \+ Strategy \- Skyword, 访问时间为 四月 22, 2025， [https://www.skyword.com/contentstandard/the-key-to-content-at-scale-ai-strategy/](https://www.skyword.com/contentstandard/the-key-to-content-at-scale-ai-strategy/)  
2. The ultimate guide to content factories and modular content. \- Aquent Studios, 访问时间为 四月 22, 2025， [https://aquentstudios.com/blog/the-ultimate-guide-to-content-factories-and-modular-content/](https://aquentstudios.com/blog/the-ultimate-guide-to-content-factories-and-modular-content/)  
3. Original Content | Tendo Communications, 访问时间为 四月 22, 2025， [https://tendocom.com/glossary/original-content/](https://tendocom.com/glossary/original-content/)  
4. How to Scale Content Creation Using AI \- Hushly, 访问时间为 四月 22, 2025， [https://www.hushly.com/blog/how-to-scale-content-creation/](https://www.hushly.com/blog/how-to-scale-content-creation/)  
5. Any solution for Integrating AI to Obsidian? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1jfhkdj/any\_solution\_for\_integrating\_ai\_to\_obsidian/](https://www.reddit.com/r/ObsidianMD/comments/1jfhkdj/any_solution_for_integrating_ai_to_obsidian/)  
6. What AI Tools do you use with Obsidian? How do you use them? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1fhhbnw/what\_ai\_tools\_do\_you\_use\_with\_obsidian\_how\_do\_you/](https://www.reddit.com/r/ObsidianMD/comments/1fhhbnw/what_ai_tools_do_you_use_with_obsidian_how_do_you/)  
7. Some of y'all need to relax on using AI for note taking : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1k0mdbw/some\_of\_yall\_need\_to\_relax\_on\_using\_ai\_for\_note/](https://www.reddit.com/r/ObsidianMD/comments/1k0mdbw/some_of_yall_need_to_relax_on_using_ai_for_note/)  
8. AI / LLMs in your Obsidian \- what's actually been useful for you? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1dedmeu/ai\_llms\_in\_your\_obsidian\_whats\_actually\_been/](https://www.reddit.com/r/ObsidianMD/comments/1dedmeu/ai_llms_in_your_obsidian_whats_actually_been/)  
9. AI-Aided Obsidian? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1iyiu50/aiaided\_obsidian/](https://www.reddit.com/r/ObsidianMD/comments/1iyiu50/aiaided_obsidian/)  
10. Prompting Evolved: Obsidian as a Human to AI-Agent Interface : r/ChatGPTPro \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTPro/comments/1h7kblg/prompting\_evolved\_obsidian\_as\_a\_human\_to\_aiagent/](https://www.reddit.com/r/ChatGPTPro/comments/1h7kblg/prompting_evolved_obsidian_as_a_human_to_aiagent/)  
11. How to use MCP servers to generate docs \- Mintlify, 访问时间为 四月 22, 2025， [https://mintlify.com/blog/how-to-use-mcp-servers-to-generate-docs](https://mintlify.com/blog/how-to-use-mcp-servers-to-generate-docs)  
12. Obsidian Examples for Workflow Automation \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/getpieces/obsidian-examples-for-workflow-automation-57d7](https://dev.to/getpieces/obsidian-examples-for-workflow-automation-57d7)  
13. Supercharge Your Knowledge Capture Workflow with the Obsidian Web Clipper, 访问时间为 四月 22, 2025， [https://www.dsebastien.net/supercharge-your-knowledge-capture-workflow-with-the-obsidian-web-clipper/](https://www.dsebastien.net/supercharge-your-knowledge-capture-workflow-with-the-obsidian-web-clipper/)  
14. agentic-content-creation-openai-guide-case-study \- AIXplore \- Tech Articles \- Obsidian Publish, 访问时间为 四月 22, 2025， [https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agentic-content-creation-openai-guide-case-study](https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agentic-content-creation-openai-guide-case-study)  
15. Obsidian Workflow To Write a Blog Post \- Craft Perfectly, 访问时间为 四月 22, 2025， [https://craft.bearblog.dev/obsidian-workflow/](https://craft.bearblog.dev/obsidian-workflow/)  
16. AI for Content Creation: How to Get Started (& Scale) | Copy.ai, 访问时间为 四月 22, 2025， [https://www.copy.ai/blog/ai-content-creation](https://www.copy.ai/blog/ai-content-creation)  
17. Blogging With Obsidian: Step-By-Step Tutorial \- Matt Giaro, 访问时间为 四月 22, 2025， [https://mattgiaro.com/blogging-obsidian/](https://mattgiaro.com/blogging-obsidian/)  
18. Adding AI to your Obsidian Notes with SmartConnections and CoPilot, 访问时间为 四月 22, 2025， [https://effortlessacademic.com/adding-ai-to-your-obsidian-notes-with-smartconnections-and-copilot/](https://effortlessacademic.com/adding-ai-to-your-obsidian-notes-with-smartconnections-and-copilot/)  
19. ChatGPT in Obsidian (Plugin) \- OpenAI Developer Forum, 访问时间为 四月 22, 2025， [https://community.openai.com/t/chatgpt-in-obsidian-plugin/85323](https://community.openai.com/t/chatgpt-in-obsidian-plugin/85323)  
20. OpenAI's “Assistants” and Obsidian integration : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/19f6p12/openais\_assistants\_and\_obsidian\_integration/](https://www.reddit.com/r/ObsidianMD/comments/19f6p12/openais_assistants_and_obsidian_integration/)  
21. obsidian-mcp-tools/README.md at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/README.md](https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/README.md)  
22. Smart Templates \- Smart Templates is an AI powered templates for generating structured content in Obsidian. Works with Local Models, Anthropic Claude, Gemini, OpenAI and more., 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/smart-templates](https://www.obsidianstats.com/plugins/smart-templates)  
23. Plugins \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=ai](https://obsidian.md/plugins?search=ai)  
24. Cursor – Welcome to Cursor, 访问时间为 四月 22, 2025， [https://docs.cursor.com/get-started/welcome](https://docs.cursor.com/get-started/welcome)  
25. Cursor AI: A Guide With 10 Practical Examples \- DataCamp, 访问时间为 四月 22, 2025， [https://www.datacamp.com/tutorial/cursor-ai-code-editor](https://www.datacamp.com/tutorial/cursor-ai-code-editor)  
26. Cursor might be my VSCode replacement \- Dev Talk \- ProcessWire Support Forums, 访问时间为 四月 22, 2025， [https://processwire.com/talk/topic/29439-cursor-might-be-my-vscode-replacement/](https://processwire.com/talk/topic/29439-cursor-might-be-my-vscode-replacement/)  
27. Complete Guide: How to Install and Use Cursor AI Editor \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/velan/complete-guide-how-to-install-and-use-cursor-ai-editor-5e9i](https://dev.to/velan/complete-guide-how-to-install-and-use-cursor-ai-editor-5e9i)  
28. Enhancing Software Development with AI Tools: A Practical Look at Cursor IDE \- ELEKS, 访问时间为 四月 22, 2025， [https://eleks.com/research/cursor-ide/](https://eleks.com/research/cursor-ide/)  
29. Helixform/CodeCursor: An extension for using Cursor in Visual Studio Code. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/Helixform/CodeCursor](https://github.com/Helixform/CodeCursor)  
30. How to Use Cursor AI in Visual Studio Code: Complete Step-by-Step Guide | GeeksforGeeks, 访问时间为 四月 22, 2025， [https://www.geeksforgeeks.org/how-to-use-cursor-ai-in-visual-studio-code/](https://www.geeksforgeeks.org/how-to-use-cursor-ai-in-visual-studio-code/)  
31. Introducing Claude Crew: Enhancing Claude Desktop's Coding Agent Capabilities, 访问时间为 四月 22, 2025， [https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah](https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah)  
32. How I use Cursor (+ my best tips) \- Builder.io, 访问时间为 四月 22, 2025， [https://www.builder.io/blog/cursor-tips](https://www.builder.io/blog/cursor-tips)  
33. Cursor Agent vs. Claude Code \- haihai.ai, 访问时间为 四月 22, 2025， [https://www.haihai.ai/cursor-vs-claude-code/](https://www.haihai.ai/cursor-vs-claude-code/)  
34. 16\. Mastering Cursor IDE: A Comprehensive Guide for Developers on Installation and Usage \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=gAdYQqJhhnQ](https://www.youtube.com/watch?v=gAdYQqJhhnQ)  
35. Anyone using Cursor AI and barely writing any code? Anything better than Cursor AI ? : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1c1o8wm/anyone\_using\_cursor\_ai\_and\_barely\_writing\_any/](https://www.reddit.com/r/ChatGPTCoding/comments/1c1o8wm/anyone_using_cursor_ai_and_barely_writing_any/)  
36. How To Use Cursor AI For Beginners \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=Rgz6mX93C4Y](https://www.youtube.com/watch?v=Rgz6mX93C4Y)  
37. Cursor IDE: Setup and Workflow in Larger Projects \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/cursor/comments/1ikq9m6/cursor\_ide\_setup\_and\_workflow\_in\_larger\_projects/](https://www.reddit.com/r/cursor/comments/1ikq9m6/cursor_ide_setup_and_workflow_in_larger_projects/)  
38. The VS Code/Cursor Setup to INCREASE Productivity (2025) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=fG6HV3pxtOI](https://www.youtube.com/watch?v=fG6HV3pxtOI)  
39. How to Setup Cursor: A Beginner's Guide \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/cursor-setup-guide](https://apidog.com/blog/cursor-setup-guide)  
40. Cursor IDE or copy+paste into the API? What do you use and why? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1eqjtcv/cursor\_ide\_or\_copypaste\_into\_the\_api\_what\_do\_you/](https://www.reddit.com/r/ChatGPTCoding/comments/1eqjtcv/cursor_ide_or_copypaste_into_the_api_what_do_you/)  
41. Will extensions be able to access the cursor ai features via an API?, 访问时间为 四月 22, 2025， [https://forum.cursor.com/t/will-extensions-be-able-to-access-the-cursor-ai-features-via-an-api/1307](https://forum.cursor.com/t/will-extensions-be-able-to-access-the-cursor-ai-features-via-an-api/1307)  
42. My experience with Github Copilot vs Cursor : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1cft751/my\_experience\_with\_github\_copilot\_vs\_cursor/](https://www.reddit.com/r/ChatGPTCoding/comments/1cft751/my_experience_with_github_copilot_vs_cursor/)  
43. Cursor AI Tutorial for Beginners in 10 minutes\! (VSCode killer?) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=ZOpH-rFq2TE](https://www.youtube.com/watch?v=ZOpH-rFq2TE)  
44. Cursor AI Tutorial for Beginners \[2025 Edition\] \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=3289vhOUdKA](https://www.youtube.com/watch?v=3289vhOUdKA)  
45. Get Started with Cursor \- The AI Code Editor \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=CqkZ-ybl3lg](https://www.youtube.com/watch?v=CqkZ-ybl3lg)  
46. How to use cursor ai and figma in the best way possible?, 访问时间为 四月 22, 2025， [https://forum.cursor.com/t/how-to-use-cursor-ai-and-figma-in-the-best-way-possible/13985](https://forum.cursor.com/t/how-to-use-cursor-ai-and-figma-in-the-best-way-possible/13985)  
47. App completely build using Claude Sonnet and Cursor AI IDE : r/ChatGPTCoding \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1f1es5i/cursor\_ai\_app\_completely\_build\_using\_claude/](https://www.reddit.com/r/ChatGPTCoding/comments/1f1es5i/cursor_ai_app_completely_build_using_claude/)  
48. punkpeye/awesome-mcp-servers: A collection of MCP servers. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)  
49. Model Context Protocol (MCP): 8 MCP Servers Every Developer Should Try\!, 访问时间为 四月 22, 2025， [https://dev.to/pavanbelagatti/model-context-protocol-mcp-8-mcp-servers-every-developer-should-try-5hm2](https://dev.to/pavanbelagatti/model-context-protocol-mcp-8-mcp-servers-every-developer-should-try-5hm2)  
50. Anthropic Publishes Model Context Protocol Specification for LLM App Integration \- InfoQ, 访问时间为 四月 22, 2025， [https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/](https://www.infoq.com/news/2024/12/anthropic-model-context-protocol/)  
51. What is the Model Context Protocol (MCP)? \- Builder.io, 访问时间为 四月 22, 2025， [https://www.builder.io/blog/model-context-protocol](https://www.builder.io/blog/model-context-protocol)  
52. Model Context Protocol (MCP) an overview \- Philschmid, 访问时间为 四月 22, 2025， [https://www.philschmid.de/mcp-introduction](https://www.philschmid.de/mcp-introduction)  
53. This implementation follows the official MCP specification, including proper message framing, transport layer implementation, and complete protocol lifecycle management. It provides a foundation for building federated MCP systems that can scale across multiple servers while maintaining security and standardization requirements. \- GitHub Gist, 访问时间为 四月 22, 2025， [https://gist.github.com/ruvnet/4314d802386ff5092ad056dd3512ee7c](https://gist.github.com/ruvnet/4314d802386ff5092ad056dd3512ee7c)  
54. Model Context Protocol (MCP) \- Anthropic API, 访问时间为 四月 22, 2025， [https://docs.anthropic.com/en/docs/agents-and-tools/mcp](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)  
55. The Model Context Protocol (MCP) by Anthropic: Origins, functionality, and impact \- Wandb, 访问时间为 四月 22, 2025， [https://wandb.ai/onlineinference/mcp/reports/The-Model-Context-Protocol-MCP-by-Anthropic-Origins-functionality-and-impact--VmlldzoxMTY5NDI4MQ](https://wandb.ai/onlineinference/mcp/reports/The-Model-Context-Protocol-MCP-by-Anthropic-Origins-functionality-and-impact--VmlldzoxMTY5NDI4MQ)  
56. Specification \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/specification/2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26)  
57. Introducing the Model Context Protocol \- Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)  
58. Understanding the Model Context Protocol (MCP) | deepset Blog, 访问时间为 四月 22, 2025， [https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp](https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp)  
59. Model Context Protocol (MCP) \- Everything You Need to Know, 访问时间为 四月 22, 2025， [https://zencoder.ai/blog/model-context-protocol](https://zencoder.ai/blog/model-context-protocol)  
60. Model Context Protocol: Introduction, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)  
61. What is MCP? Claude Anthropic's Model Context Protocol \- PromptLayer, 访问时间为 四月 22, 2025， [https://blog.promptlayer.com/mcp/](https://blog.promptlayer.com/mcp/)  
62. Model Context Protocol (MCP) Comprehensive Guide for 2025 \- Dysnix, 访问时间为 四月 22, 2025， [https://dysnix.com/blog/model-context-protocol](https://dysnix.com/blog/model-context-protocol)  
63. Model Context Protocol (MCP): A comprehensive introduction for developers \- Stytch, 访问时间为 四月 22, 2025， [https://stytch.com/blog/model-context-protocol-introduction/](https://stytch.com/blog/model-context-protocol-introduction/)  
64. How to Use Model Context Protocol the Right Way | Boomi, 访问时间为 四月 22, 2025， [https://boomi.com/blog/model-context-protocol-how-to-use/](https://boomi.com/blog/model-context-protocol-how-to-use/)  
65. In-Depth review of the MCP authorization spec (2025-03-26 edition) \- Logto blog, 访问时间为 四月 22, 2025， [https://blog.logto.io/mcp-auth-spec-review-2025-03-26](https://blog.logto.io/mcp-auth-spec-review-2025-03-26)  
66. LLM Function-Calling vs. Model Context Protocol (MCP) \- Gentoro, 访问时间为 四月 22, 2025， [https://www.gentoro.com/blog/function-calling-vs-model-context-protocol-mcp](https://www.gentoro.com/blog/function-calling-vs-model-context-protocol-mcp)  
67. Model Context Protocol vs Function Calling: What's the Big Difference? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h0w1z6/model\_context\_protocol\_vs\_function\_calling\_whats/](https://www.reddit.com/r/ClaudeAI/comments/1h0w1z6/model_context_protocol_vs_function_calling_whats/)  
68. Frequently Asked Questions About Model Context Protocol (MCP) and Integrating with AI for Agentic Applications \- Blog | Tenable®, 访问时间为 四月 22, 2025， [https://www.tenable.com/blog/faq-about-model-context-protocol-mcp-and-integrating-ai-for-agentic-applications](https://www.tenable.com/blog/faq-about-model-context-protocol-mcp-and-integrating-ai-for-agentic-applications)  
69. Anthropic's Model Context Protocol (MCP): A Universal Connector for AI | GPT-trainer Blog, 访问时间为 四月 22, 2025， [https://gpt-trainer.com/blog/anthropic+model+context+protocol+mcp](https://gpt-trainer.com/blog/anthropic+model+context+protocol+mcp)  
70. Leveraging model context protocol to unlock strategic advantage in generative AI deployments \- UST, 访问时间为 四月 22, 2025， [https://www.ust.com/en/insights/leveraging-model-context-protocol-to-unlock-strategic-advantage-in-generative-ai-deployments](https://www.ust.com/en/insights/leveraging-model-context-protocol-to-unlock-strategic-advantage-in-generative-ai-deployments)  
71. AI Model Context Protocol (MCP) and Security \- Cisco Community, 访问时间为 四月 22, 2025， [https://community.cisco.com/t5/security-blogs/ai-model-context-protocol-mcp-and-security/ba-p/5274394](https://community.cisco.com/t5/security-blogs/ai-model-context-protocol-mcp-and-security/ba-p/5274394)  
72. AI Research Assistant \- Prompt Engineering Research Tool for AI APIs \- Obsidian Stats, 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/ai-research-assistant](https://www.obsidianstats.com/plugins/ai-research-assistant)  
73. AI Assistant for Obsidian | Christian B. B. Houmann, 访问时间为 四月 22, 2025， [https://bagerbach.com/blog/obsidian-ai/](https://bagerbach.com/blog/obsidian-ai/)  
74. How I Manage Myself and My Team Using Obsidian Tasks \- Pelayo Arbués, 访问时间为 四月 22, 2025， [https://www.pelayoarbues.com/notes/How-I-Manage-Myself-and-My-Team-Using-Obsidian-Tasks](https://www.pelayoarbues.com/notes/How-I-Manage-Myself-and-My-Team-Using-Obsidian-Tasks)  
75. Writing academic papers in Obsidian, is there a way to do it right away? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1c81ih1/writing\_academic\_papers\_in\_obsidian\_is\_there\_a/](https://www.reddit.com/r/ObsidianMD/comments/1c81ih1/writing_academic_papers_in_obsidian_is_there_a/)  
76. How to write and publish to your blog directly from Obsidian : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1hiigo4/how\_to\_write\_and\_publish\_to\_your\_blog\_directly/](https://www.reddit.com/r/ObsidianMD/comments/1hiigo4/how_to_write_and_publish_to_your_blog_directly/)  
77. My Obsidian Daily Note Template 2022 \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/heymichellemac/my-obsidian-daily-note-template-2022-5ac2](https://dev.to/heymichellemac/my-obsidian-daily-note-template-2022-5ac2)  
78. How I Manage Web Articles and Videos in Obsidian – A Comprehensive Guide, 访问时间为 四月 22, 2025， [https://thebuccaneersbounty.wordpress.com/2023/02/22/how-i-manage-web-articles-and-videos-in-obsidian-a-comprehensive-guide/](https://thebuccaneersbounty.wordpress.com/2023/02/22/how-i-manage-web-articles-and-videos-in-obsidian-a-comprehensive-guide/)  
79. Any plugin to export an entire vault as html pages? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/pf3cw6/any\_plugin\_to\_export\_an\_entire\_vault\_as\_html\_pages/](https://www.reddit.com/r/ObsidianMD/comments/pf3cw6/any_plugin_to_export_an_entire_vault_as_html_pages/)  
80. Webpage HTML Export \- Export html from single files, canvas pages, or whole vaults. Direct access to the exported HTML files allows you to publish your digital garden anywhere. Focuses on flexibility, features, and style parity. \- Obsidian Stats, 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/webpage-html-export](https://www.obsidianstats.com/plugins/webpage-html-export)  
81. A collection of templates? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/11c0t9k/a\_collection\_of\_templates/](https://www.reddit.com/r/ObsidianMD/comments/11c0t9k/a_collection_of_templates/)  
82. Best publishing method? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1e0yjws/best\_publishing\_method/](https://www.reddit.com/r/ObsidianMD/comments/1e0yjws/best_publishing_method/)  
83. From Vault to World \- Plugins that Help You Publish Your Obsidian Notes (Publish Workflow), 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/posts/2025-04-16-publish-plugins](https://www.obsidianstats.com/posts/2025-04-16-publish-plugins)  
84. My Obsidian Note-Taking Workflow | ssp.sh \- Data Engineering Blog, 访问时间为 四月 22, 2025， [https://www.ssp.sh/blog/obsidian-note-taking-workflow/](https://www.ssp.sh/blog/obsidian-note-taking-workflow/)  
85. Obsidian is not just my PKM, it's my content creation hub : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1k4vmz1/obsidian\_is\_not\_just\_my\_pkm\_its\_my\_content/](https://www.reddit.com/r/ObsidianMD/comments/1k4vmz1/obsidian_is_not_just_my_pkm_its_my_content/)  
86. Hugo Publish \- write blog in obsidian, pubulish to hugo site., 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/hugo-publish](https://www.obsidianstats.com/plugins/hugo-publish)  
87. Publishing an Obsidian vault with Hugo \- Jacob Kaplan-Moss, 访问时间为 四月 22, 2025， [https://jacobian.org/til/hugo-obsidian/](https://jacobian.org/til/hugo-obsidian/)  
88. How I Use Obsidian to Publish Posts \- Sirwan Afifi, 访问时间为 四月 22, 2025， [https://sirwan.info/blog/en/how-i-use-obsidian-to-publish-posts/](https://sirwan.info/blog/en/how-i-use-obsidian-to-publish-posts/)  
89. Content Workflow: Breaking Down the 9 Step Process \- Slickplan, 访问时间为 四月 22, 2025， [https://slickplan.com/content/workflow](https://slickplan.com/content/workflow)  
90. Jekyll Blogging with Obsidian \- Alex Oliveira, 访问时间为 四月 22, 2025， [https://alexoliveira.cc/guide/jekyll-with-obsidian](https://alexoliveira.cc/guide/jekyll-with-obsidian)  
91. Using AI Tools to Optimise A Content Creation Workflow | IoA \- Institute of Analytics, 访问时间为 四月 22, 2025， [https://ioaglobal.org/blog/using-ai-tools-to-optimise-a-content-creation-workflow/](https://ioaglobal.org/blog/using-ai-tools-to-optimise-a-content-creation-workflow/)  
92. Using Obsidian for my Newsletter \- Knowledge management, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/using-obsidian-for-my-newsletter/85145](https://forum.obsidian.md/t/using-obsidian-for-my-newsletter/85145)  
93. Writing Workflow \- Sai Tries Blogging, 访问时间为 四月 22, 2025， [https://www.saitriesblogging.com/2023/01/23/writing-workflow.html](https://www.saitriesblogging.com/2023/01/23/writing-workflow.html)  
94. My Obsidian-Based Kanban Writing Workflow \- The Sweet Setup, 访问时间为 四月 22, 2025， [https://thesweetsetup.com/my-obsidian-based-kanban-writing-workflow/](https://thesweetsetup.com/my-obsidian-based-kanban-writing-workflow/)  
95. How to use Obsidian for Blogging \- Official Website for Dustin Miller PolyInnovator \[LLC\], 访问时间为 四月 22, 2025， [https://polyinnovator.space/how-to-use-obsidian-for-blogging/](https://polyinnovator.space/how-to-use-obsidian-for-blogging/)  
96. 6 Best Practices for Using Images on Your Blog in 2024 \- Ryan Robinson, 访问时间为 四月 22, 2025， [https://www.ryrob.com/blog-images/](https://www.ryrob.com/blog-images/)  
97. content management processes \+ plugins in Obsidian : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1j6phwc/content\_management\_processes\_plugins\_in\_obsidian/](https://www.reddit.com/r/ObsidianMD/comments/1j6phwc/content_management_processes_plugins_in_obsidian/)  
98. Content Workflow in 2025: A Step-by-Step Guide with Tips \- Planable, 访问时间为 四月 22, 2025， [https://planable.io/blog/content-workflow/](https://planable.io/blog/content-workflow/)  
99. Workflows How to Manage Tasks in Obsidian \- Morgen, 访问时间为 四月 22, 2025， [https://www.morgen.so/blog-posts/how-to-manage-tasks-in-obsidian](https://www.morgen.so/blog-posts/how-to-manage-tasks-in-obsidian)  
100. Efficient Workflows for Content Creation | Sociamonials Blog, 访问时间为 四月 22, 2025， [https://blog.sociamonials.com/efficient-workflows-for-content-creation/](https://blog.sociamonials.com/efficient-workflows-for-content-creation/)  
101. How to Use Obsidian for Creative Writing \- The Almoner, 访问时间为 四月 22, 2025， [https://thealmoner.com/obsidian-creative-writing/](https://thealmoner.com/obsidian-creative-writing/)  
102. Automate Your Content Creation | Scale Up Content To Stand Out \- Make, 访问时间为 四月 22, 2025， [https://www.make.com/en/automate/content-creation](https://www.make.com/en/automate/content-creation)  
103. Obsidian \- Sharpen your thinking, 访问时间为 四月 22, 2025， [https://obsidian.md/](https://obsidian.md/)  
104. Descript's internal guide for using Linear as your work operating system, 访问时间为 四月 22, 2025， [https://linear.app/blog/descript-internal-guide-for-using-linear](https://linear.app/blog/descript-internal-guide-for-using-linear)  
105. Linear Project Management for Creative Agencies: A Simple Guide \- ManyRequests, 访问时间为 四月 22, 2025， [https://www.manyrequests.com/blog/linear-project-management](https://www.manyrequests.com/blog/linear-project-management)  
106. The content creation workflow: 4-step guide \- Zapier, 访问时间为 四月 22, 2025， [https://zapier.com/blog/content-marketing-workflow/](https://zapier.com/blog/content-marketing-workflow/)  
107. How to Use An AI Blog Post Generator to Write Blogs Faster \- Typeface, 访问时间为 四月 22, 2025， [https://www.typeface.ai/blog/how-to-use-an-ai-blog-post-generator-to-write-blog-posts-in-under-an-hour](https://www.typeface.ai/blog/how-to-use-an-ai-blog-post-generator-to-write-blog-posts-in-under-an-hour)  
108. How to automate AI image generation \- Zapier, 访问时间为 四月 22, 2025， [https://zapier.com/blog/automate-ai-images/](https://zapier.com/blog/automate-ai-images/)  
109. What's your writing workflow for pulling ideas out of your zettelkasten? \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/whats-your-writing-workflow-for-pulling-ideas-out-of-your-zettelkasten/2750](https://forum.obsidian.md/t/whats-your-writing-workflow-for-pulling-ideas-out-of-your-zettelkasten/2750)  
110. Building powerful content workflows that scale | Magnolia Headless CMS, 访问时间为 四月 22, 2025， [https://www.magnolia-cms.com/blog/building-powerful-content-workflows-that-scale.html](https://www.magnolia-cms.com/blog/building-powerful-content-workflows-that-scale.html)  
111. Copywriter Guide \- How to Create the Perfect Blog Post \- Eclincher, 访问时间为 四月 22, 2025， [https://www.eclincher.com/articles/your-guide-to-creating-the-perfect-blog-post](https://www.eclincher.com/articles/your-guide-to-creating-the-perfect-blog-post)  
112. How To Write a Blog Post: A Step-By-Step Guide \- Wix.com, 访问时间为 四月 22, 2025， [https://www.wix.com/blog/how-to-write-a-blog-post-with-examples](https://www.wix.com/blog/how-to-write-a-blog-post-with-examples)  
113. Linear – Plan and build products, 访问时间为 四月 22, 2025， [https://linear.app/](https://linear.app/)  
114. Linear Plan – Set the product direction, 访问时间为 四月 22, 2025， [https://linear.app/plan](https://linear.app/plan)  
115. How to Use AI for Blog Writing: A Step-by-Step Guide \- PageOn.ai, 访问时间为 四月 22, 2025， [https://www.pageon.ai/blog/ai-blog-post-generator](https://www.pageon.ai/blog/ai-blog-post-generator)  
116. Step-by-Step Guide to Writing a Blog Post Using an AI Writing Assistant \- Yomu AI, 访问时间为 四月 22, 2025， [https://www.yomu.ai/resources/step-by-step-guide-to-writing-a-blog-post-using-an-ai-writing-assistant](https://www.yomu.ai/resources/step-by-step-guide-to-writing-a-blog-post-using-an-ai-writing-assistant)  
117. Question for bloggers, journalists, and other short-form writers: How do you organize projects? \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/question-for-bloggers-journalists-and-other-short-form-writers-how-do-you-organize-projects/35842](https://forum.obsidian.md/t/question-for-bloggers-journalists-and-other-short-form-writers-how-do-you-organize-projects/35842)  
118. InterwebAlchemy/obsidian-ai-research-assistant: Prompt Engineering Research Tool for AI APIs \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/InterwebAlchemy/obsidian-ai-research-assistant](https://github.com/InterwebAlchemy/obsidian-ai-research-assistant)  
119. Plugins \- Prompt \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=prompt](https://obsidian.md/plugins?search=prompt)  
120. DataView queries for newbies with AI help (for free) \- Share & showcase \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/dataview-queries-for-newbies-with-ai-help-for-free/77358](https://forum.obsidian.md/t/dataview-queries-for-newbies-with-ai-help-for-free/77358)  
121. Claude AI in Academic Writing and Research: Essential Tips for Optimal Results \- Yomu AI, 访问时间为 四月 22, 2025， [https://www.yomu.ai/blog/claude-ai-in-academic-writing-and-research-essential-tips-for-optimal-results](https://www.yomu.ai/blog/claude-ai-in-academic-writing-and-research-essential-tips-for-optimal-results)  
122. Day 2 – Summarising text \- The 12 Days of AI, 访问时间为 四月 22, 2025， [https://12daysofai.myblog.arts.ac.uk/2023/11/30/day-2-summarising-text/](https://12daysofai.myblog.arts.ac.uk/2023/11/30/day-2-summarising-text/)  
123. Claude AI and Literature Reviews: An Experiment in Utility and Ethical Use \- KnightScholar \- SUNY Geneseo, 访问时间为 四月 22, 2025， [https://knightscholar.geneseo.edu/cgi/viewcontent.cgi?article=1021\&context=library-research](https://knightscholar.geneseo.edu/cgi/viewcontent.cgi?article=1021&context=library-research)  
124. Customizing Academic Writing with Claude AI: The Future of Research Composition, 访问时间为 四月 22, 2025， [https://www.yomu.ai/blog/customizing-academic-writing-with-claude-ai-the-future-of-research-composition](https://www.yomu.ai/blog/customizing-academic-writing-with-claude-ai-the-future-of-research-composition)  
125. How Teachers Can Utilize Claude, the AI Assistant, in the Classroom, 访问时间为 四月 22, 2025， [https://annmichaelsen.com/2024/03/28/how-teachers-can-utilize-claude-the-ai-assistant-in-the-classroom/](https://annmichaelsen.com/2024/03/28/how-teachers-can-utilize-claude-the-ai-assistant-in-the-classroom/)  
126. HyperWrite | AI Writing Assistant, 访问时间为 四月 22, 2025， [https://www.hyperwriteai.com/](https://www.hyperwriteai.com/)  
127. AWS Introduces MCP Servers for AI-Assisted Cloud Development \- InfoQ, 访问时间为 四月 22, 2025， [https://www.infoq.com/news/2025/04/aws-mcp-ai-development/](https://www.infoq.com/news/2025/04/aws-mcp-ai-development/)  
128. AI Art Prompting Guide: Image Prompting | Microsoft Copilot, 访问时间为 四月 22, 2025， [https://www.microsoft.com/en-us/microsoft-copilot/for-individuals/do-more-with-ai/ai-art-prompting-guide/image-prompting-101](https://www.microsoft.com/en-us/microsoft-copilot/for-individuals/do-more-with-ai/ai-art-prompting-guide/image-prompting-101)  
129. The 11 Best AI Copywriting Tools (Free & Paid) | WordStream, 访问时间为 四月 22, 2025， [https://www.wordstream.com/blog/ai-copywriting-tools](https://www.wordstream.com/blog/ai-copywriting-tools)  
130. Seamless AI Image Generation with Nova Canvas & MCP \- Community.aws, 访问时间为 四月 22, 2025， [https://community.aws/content/2w2d61S13rTkNsIBaXB6aBfsDRo/seamless-ai-image-generation-with-nova-canvas-mcp](https://community.aws/content/2w2d61S13rTkNsIBaXB6aBfsDRo/seamless-ai-image-generation-with-nova-canvas-mcp)  
131. TextCortex: The most advanced AI knowledge base platform, 访问时间为 四月 22, 2025， [https://textcortex.com/](https://textcortex.com/)  
132. mokeyish/obsidian-enhancing-export: This is an enhancing export plugin base on Pandoc for Obsidian (https://obsidian.md/ ). It's allow you to export to formats like Markdown、Markdown (Hugo https://gohugo.io/ )、Html、docx、Latex etc. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/mokeyish/obsidian-enhancing-export](https://github.com/mokeyish/obsidian-enhancing-export)  
133. pedramamini/RSSidian: An MCP-capable intelligent RSS feed ingestion and summarization to markdown tool. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/pedramamini/RSSidian](https://github.com/pedramamini/RSSidian)  
134. Plugins \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?id=](https://obsidian.md/plugins?id)  
135. jacksteamdev/obsidian-mcp-tools: Add Obsidian ... \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools](https://github.com/jacksteamdev/obsidian-mcp-tools)  
136. Aman's AI Journal • Primers • Prompt Engineering, 访问时间为 四月 22, 2025， [https://aman.ai/primers/ai/prompt-engineering/](https://aman.ai/primers/ai/prompt-engineering/)  
137. Using RAG to Enrich LLMs \- Synthesis AI, 访问时间为 四月 22, 2025， [https://synthesis.ai/2024/09/18/using-rag-to-enrich-llms/](https://synthesis.ai/2024/09/18/using-rag-to-enrich-llms/)  
138. Advanced Prompt Engineering Techniques \- Mercity AI, 访问时间为 四月 22, 2025， [https://www.mercity.ai/blog-post/advanced-prompt-engineering-techniques](https://www.mercity.ai/blog-post/advanced-prompt-engineering-techniques)  
139. Key Concepts and Considerations in Generative AI | Microsoft Learn, 访问时间为 四月 22, 2025， [https://learn.microsoft.com/en-us/azure/developer/ai/gen-ai-concepts-considerations-developers](https://learn.microsoft.com/en-us/azure/developer/ai/gen-ai-concepts-considerations-developers)  
140. QA-RAG: Exploring LLM Reliance on External Knowledge \- MDPI, 访问时间为 四月 22, 2025， [https://www.mdpi.com/2504-2289/8/9/115](https://www.mdpi.com/2504-2289/8/9/115)  
141. Mastering AI-Powered Research: My Guide to Deep Research, Prompt Engineering, and Multi-Step Workflows : r/ChatGPTPro \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTPro/comments/1in87ic/mastering\_aipowered\_research\_my\_guide\_to\_deep/](https://www.reddit.com/r/ChatGPTPro/comments/1in87ic/mastering_aipowered_research_my_guide_to_deep/)  
142. Prompt Engineering: Techniques, Uses & Advanced Approaches \- Acorn Labs, 访问时间为 四月 22, 2025， [https://www.acorn.io/resources/learning-center/prompt-engineering/](https://www.acorn.io/resources/learning-center/prompt-engineering/)  
143. Prompt Design and Engineering: Introduction and Advanced Methods \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2401.14423v4](https://arxiv.org/html/2401.14423v4)  
144. What is retrieval-augmented generation (RAG)? \- IBM Research, 访问时间为 四月 22, 2025， [https://research.ibm.com/blog/retrieval-augmented-generation-RAG](https://research.ibm.com/blog/retrieval-augmented-generation-RAG)  
145. In what scenario might it be better to rely on the LLM's parametric knowledge rather than retrieving from an external source (e.g., very simple common knowledge questions), and how to detect those? \- Milvus Blog, 访问时间为 四月 22, 2025， [https://blog.milvus.io/ai-quick-reference/in-what-scenario-might-it-be-better-to-rely-on-the-llms-parametric-knowledge-rather-than-retrieving-from-an-external-source-eg-very-simple-common-knowledge-questions-and-how-to-detect-those](https://blog.milvus.io/ai-quick-reference/in-what-scenario-might-it-be-better-to-rely-on-the-llms-parametric-knowledge-rather-than-retrieving-from-an-external-source-eg-very-simple-common-knowledge-questions-and-how-to-detect-those)  
146. Prompt Engineering: Using AI and Large Language Models (LLMs) for Grant Writing, 访问时间为 四月 22, 2025， [https://bouviergrant.com/prompt-engineering-using-ai-and-large-language-models-llms-for-grant-writing/](https://bouviergrant.com/prompt-engineering-using-ai-and-large-language-models-llms-for-grant-writing/)  
147. Using AI in research \- APS111T: Engineering Strategies & Practice, 访问时间为 四月 22, 2025， [https://guides.library.utoronto.ca/c.php?g=719022\&p=5371872](https://guides.library.utoronto.ca/c.php?g=719022&p=5371872)  
148. Mind blown: MCP \+ Obsidian : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1hdl0cl/mind\_blown\_mcp\_obsidian/](https://www.reddit.com/r/ClaudeAI/comments/1hdl0cl/mind_blown_mcp_obsidian/)  
149. Claude Reads My Obsidian Second Brain. I Just Vibe \- mcp \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/mcp/comments/1jnal2u/claude\_reads\_my\_obsidian\_second\_brain\_i\_just\_vibe/](https://www.reddit.com/r/mcp/comments/1jnal2u/claude_reads_my_obsidian_second_brain_i_just_vibe/)  
150. Can Obsidian Be Used for Project Management? \- Dart AI, 访问时间为 四月 22, 2025， [https://www.itsdart.com/blog/obsidian-for-project-management](https://www.itsdart.com/blog/obsidian-for-project-management)  
151. Example Servers \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/examples](https://modelcontextprotocol.io/examples)  
152. modelcontextprotocol/servers: Model Context Protocol Servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)  
153. alezkv/modelcontextprotocol-servers: Model Context Protocol Servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/alezkv/modelcontextprotocol-servers](https://github.com/alezkv/modelcontextprotocol-servers)  
154. riza-io/modelcontextprotocol-servers: Model Context Protocol Servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/riza-io/modelcontextprotocol-servers](https://github.com/riza-io/modelcontextprotocol-servers)  
155. Model Context Protocol Servers (Browserbase Version) \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/browserbase/browserbase-servers](https://github.com/browserbase/browserbase-servers)  
156. Meet Claude \- Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/claude](https://www.anthropic.com/claude)  
157. The Definition of Claude AI | TIME, 访问时间为 四月 22, 2025， [https://time.com/collections/the-ai-dictionary-from-allbusiness-com/7273938/definition-of-claude-ai/](https://time.com/collections/the-ai-dictionary-from-allbusiness-com/7273938/definition-of-claude-ai/)  
158. Model Context Protocol (MCP) server designed for LLMs to interact with Obsidian vaults. Provides secure, token-aware tools for seamless knowledge base management through a standardized interface. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/obsidian-mcp-server](https://github.com/cyanheads/obsidian-mcp-server)  
159. MarkusPfundstein/mcp-obsidian: MCP server that interacts with Obsidian via the Obsidian rest API community plugin \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/MarkusPfundstein/mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian)  
160. marcelmarais/obsidian-mcp-server \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/marcelmarais/obsidian-mcp-server](https://github.com/marcelmarais/obsidian-mcp-server)  
161. StevenStavrakis/obsidian-mcp: A simple MCP server for ... \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/StevenStavrakis/obsidian-mcp](https://github.com/StevenStavrakis/obsidian-mcp)  
162. MCP server for Obsidian \- GenAI Works, 访问时间为 四月 22, 2025， [https://genai.works/mcp-servers/mcp-server-for-obsidian-m99w3cvw](https://genai.works/mcp-servers/mcp-server-for-obsidian-m99w3cvw)  
163. README.md \- StevenStavrakis/obsidian-mcp \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/StevenStavrakis/obsidian-mcp/blob/main/README.md](https://github.com/StevenStavrakis/obsidian-mcp/blob/main/README.md)  
164. My Obsidian People Note Template | Dann Berg: blog, newsletter, shop, and more, 访问时间为 四月 22, 2025， [https://dannb.org/blog/2022/obsidian-people-note-template/](https://dannb.org/blog/2022/obsidian-people-note-template/)  
165. Linear Issue Tracker Template | Notion Marketplace, 访问时间为 四月 22, 2025， [https://www.notion.com/templates/linear-issue-tracker](https://www.notion.com/templates/linear-issue-tracker)  
166. Project templates – Linear Docs, 访问时间为 四月 22, 2025， [https://linear.app/docs/project-templates](https://linear.app/docs/project-templates)  
167. How to Create Issue Templates in Linear: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-create-issue-templates-in-linear](https://www.storylane.io/tutorials/how-to-create-issue-templates-in-linear)  
168. VS Code API | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/references/vscode-api\#workspace](https://code.visualstudio.com/api/references/vscode-api#workspace)  
169. cursor-tools/README.md at main · eastlondoner/cursor-tools · GitHub, 访问时间为 四月 22, 2025， [https://github.com/eastlondoner/cursor-tools/blob/main/README.md](https://github.com/eastlondoner/cursor-tools/blob/main/README.md)  
170. Cursor AI: 5 Advanced Features You're Not Using \- Builder.io, 访问时间为 四月 22, 2025， [https://www.builder.io/blog/cursor-advanced-features](https://www.builder.io/blog/cursor-advanced-features)  
171. Model Context Protocol \- Cursor, 访问时间为 四月 22, 2025， [https://docs.cursor.com/context/model-context-protocol](https://docs.cursor.com/context/model-context-protocol)  
172. 20+ Awesome Cursor Rules You Can Setup for Your Cursor AI IDE Now \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/awesome-cursor-rules/](https://apidog.com/blog/awesome-cursor-rules/)  
173. Cursor – @Docs, 访问时间为 四月 22, 2025， [https://docs.cursor.com/context/@-symbols/@-docs](https://docs.cursor.com/context/@-symbols/@-docs)  
174. How to Use the Obsidian MCP Server \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/obsidian-mcp-server/](https://apidog.com/blog/obsidian-mcp-server/)  
175. Obsidian \- Awesome MCP Servers, 访问时间为 四月 22, 2025， [https://mcpservers.org/servers/MarkusPfundstein/mcp-obsidian](https://mcpservers.org/servers/MarkusPfundstein/mcp-obsidian)  
176. An Introduction to MCP and Authorization | Auth0, 访问时间为 四月 22, 2025， [https://auth0.com/blog/an-introduction-to-mcp-and-authorization/](https://auth0.com/blog/an-introduction-to-mcp-and-authorization/)  
177. How to work with Local Files Directly Using an MCP Server and Claude \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/local-file-mcp-server/](https://apidog.com/blog/local-file-mcp-server/)  
178. MCP and Python MCP Server Development Explained-Chief AI Sharing Circle, 访问时间为 四月 22, 2025， [https://www.aisharenet.com/en/mcp-he-python-mcp-s/](https://www.aisharenet.com/en/mcp-he-python-mcp-s/)  
179. How to use an MCP Server in Claude Desktop, 访问时间为 四月 22, 2025， [https://blog.egmond.dev/mcp-server-claude](https://blog.egmond.dev/mcp-server-claude)  
180. MCP Server \- Agent.ai Documentation, 访问时间为 四月 22, 2025， [https://docs.agent.ai/mcp-server](https://docs.agent.ai/mcp-server)  
181. A Developer's Guide to the MCP \- Zep, 访问时间为 四月 22, 2025， [https://www.getzep.com/ai-agents/developer-guide-to-mcp](https://www.getzep.com/ai-agents/developer-guide-to-mcp)  
182. Model Context Protocol (MCP) Explained \- Humanloop, 访问时间为 四月 22, 2025， [https://humanloop.com/blog/mcp](https://humanloop.com/blog/mcp)  
183. model-context-protocol-resources/guides/mcp-server-development-guide.md at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md)  
184. model-context-protocol-resources/guides/mcp-client-development-guide.md at main, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md)  
185. Get started with Claude Desktop and Neon MCP Server \- Neon Guides, 访问时间为 四月 22, 2025， [https://neon.tech/guides/neon-mcp-server](https://neon.tech/guides/neon-mcp-server)  
186. 30+ MCP Ideas with Complete Source Code \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/copilotkit/30-mcp-ideas-with-complete-source-code-d8e](https://dev.to/copilotkit/30-mcp-ideas-with-complete-source-code-d8e)  
187. AI Image Generator (Text to image) MCP server \[DEPRECATED\] \- Apify, 访问时间为 四月 22, 2025， [https://apify.com/apiforyou/ai-image-generator-text-to-image/api/mcp](https://apify.com/apiforyou/ai-image-generator-text-to-image/api/mcp)  
188. Unsplash Image Scraper MCP server \- Apify, 访问时间为 四月 22, 2025， [https://apify.com/easyapi/unsplash-image-scraper/api/mcp](https://apify.com/easyapi/unsplash-image-scraper/api/mcp)  
189. drumnation/unsplash-smart-mcp-server: AI-powered FastMCP server for intelligent stock photo search, download, and attribution management from Unsplash \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/drumnation/unsplash-smart-mcp-server](https://github.com/drumnation/unsplash-smart-mcp-server)  
190. Stability AI MCP Server \- use the latest & greatest Stable Diffusion models to generate & manipulate images : r/modelcontextprotocol \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/modelcontextprotocol/comments/1hs3d2c/stability\_ai\_mcp\_server\_use\_the\_latest\_greatest/](https://www.reddit.com/r/modelcontextprotocol/comments/1hs3d2c/stability_ai_mcp_server_use_the_latest_greatest/)  
191. MCP Server integrating MCP Clients with Stability AI-powered image manipulation functionalities: generate, edit, upscale, and more. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/tadasant/mcp-server-stability-ai](https://github.com/tadasant/mcp-server-stability-ai)  
192. hellokaton/unsplash-mcp-server: A MCP server for Unsplash image search. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/hellokaton/unsplash-mcp-server](https://github.com/hellokaton/unsplash-mcp-server)  
193. 6 Best Business AI Stock Image & Video Websites \[2025\], 访问时间为 四月 22, 2025， [https://codeconductor.ai/blog/stock-image-video-websites/](https://codeconductor.ai/blog/stock-image-video-websites/)  
194. How to Use MCP with Cursor AI? \- Analytics Vidhya, 访问时间为 四月 22, 2025， [https://www.analyticsvidhya.com/blog/2025/04/mcp-with-cursor-ai/](https://www.analyticsvidhya.com/blog/2025/04/mcp-with-cursor-ai/)  
195. Midjourney Automation \- Apify, 访问时间为 四月 22, 2025， [https://apify.com/igolaizola/midjourney-automation](https://apify.com/igolaizola/midjourney-automation)  
196. Midjourney Automation MCP server \- Apify, 访问时间为 四月 22, 2025， [https://apify.com/igolaizola/midjourney-automation/api/mcp](https://apify.com/igolaizola/midjourney-automation/api/mcp)  
197. Midjourney Automation API \- Apify, 访问时间为 四月 22, 2025， [https://apify.com/igolaizola/midjourney-automation/api](https://apify.com/igolaizola/midjourney-automation/api)  
198. aymec/image\_gen\_mcp: This project provides an HTTP server for image generation using Stable Diffusion, along with a Model Context Protocol (MCP) server that enables AI agents to request image generation. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/aymec/image\_gen\_mcp](https://github.com/aymec/image_gen_mcp)  
199. Midjourney Automation API in Python \- Apify, 访问时间为 四月 22, 2025， [https://apify.com/igolaizola/midjourney-automation/api/python](https://apify.com/igolaizola/midjourney-automation/api/python)  
200. Build a Model Context Protocol (MCP) server in C\# \- .NET Blog, 访问时间为 四月 22, 2025， [https://devblogs.microsoft.com/dotnet/build-a-model-context-protocol-mcp-server-in-csharp/](https://devblogs.microsoft.com/dotnet/build-a-model-context-protocol-mcp-server-in-csharp/)  
201. Pricing \- Stability AI \- Developer Platform, 访问时间为 四月 22, 2025， [https://platform.stability.ai/pricing](https://platform.stability.ai/pricing)  
202. Unsplash MCP Server | Pipedream, 访问时间为 四月 22, 2025， [https://mcp.pipedream.com/app/unsplash](https://mcp.pipedream.com/app/unsplash)  
203. Pricing \- Stable Diffusion And Dreambooth API, 访问时间为 四月 22, 2025， [https://stablediffusionapi.com/pricing](https://stablediffusionapi.com/pricing)  
204. Unsplash \- Ultimate Member, 访问时间为 四月 22, 2025， [https://ultimatemember.com/extensions/unsplash/](https://ultimatemember.com/extensions/unsplash/)  
205. Obsidian markdown export \- This plugin allows to export directory/single markdown to a folder. support output format(html/markdown), 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/plugins/obsidian-markdown-export-plugin](https://www.obsidianstats.com/plugins/obsidian-markdown-export-plugin)  
206. how to transfer to another laptop? : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/yvr69k/how\_to\_transfer\_to\_another\_laptop/](https://www.reddit.com/r/ObsidianMD/comments/yvr69k/how_to_transfer_to_another_laptop/)  
207. All export Obsidian Plugins., 访问时间为 四月 22, 2025， [https://www.obsidianstats.com/tags/export](https://www.obsidianstats.com/tags/export)  
208. obsidian-export/README.md at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/zoni/obsidian-export/blob/main/README.md](https://github.com/zoni/obsidian-export/blob/main/README.md)  
209. How to Create a Social Media Content Creation Workflow \- SocialBee, 访问时间为 四月 22, 2025， [https://socialbee.com/blog/content-creation-workflow/](https://socialbee.com/blog/content-creation-workflow/)  
210. How to Use Linear: A Complete Walkthrough for Beginners \- Everhour, 访问时间为 四月 22, 2025， [https://everhour.com/blog/how-to-use-linear/](https://everhour.com/blog/how-to-use-linear/)  
211. How we run projects at Linear \- Linear Blog, 访问时间为 四月 22, 2025， [https://linear.app/blog/how-we-run-projects-at-linear](https://linear.app/blog/how-we-run-projects-at-linear)  
212. Free Waterfall Project Management Template \[2024\] \- Asana, 访问时间为 四月 22, 2025， [https://asana.com/templates/waterfall-project-management](https://asana.com/templates/waterfall-project-management)  
213. Linear \- Fibery, 访问时间为 四月 22, 2025， [https://fibery.io/templates/linear](https://fibery.io/templates/linear)  
214. My workflow for making videos with Obsidian \- Fork My Brain, 访问时间为 四月 22, 2025， [https://notes.nicolevanderhoeven.com/system/cards/My+workflow+for+making+videos+with+Obsidian](https://notes.nicolevanderhoeven.com/system/cards/My+workflow+for+making+videos+with+Obsidian)  
215. The Best Linear AI Note Taking Workflow \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=w2h3RZVXfqs](https://www.youtube.com/watch?v=w2h3RZVXfqs)  
216. How to use AI workflows \- Loom Support, 访问时间为 四月 22, 2025， [https://support.loom.com/hc/en-us/articles/17975038802717-How-to-use-AI-workflows](https://support.loom.com/hc/en-us/articles/17975038802717-How-to-use-AI-workflows)  
217. Linear Task Management: How to Avoid Bottlenecks in Your Workflow \- Everhour, 访问时间为 四月 22, 2025， [https://everhour.com/blog/linear-task-management/](https://everhour.com/blog/linear-task-management/)  
218. How to Publish Content from Airtable to Linear: A Step-by-Step Guide \- Docswrite Blog, 访问时间为 四月 22, 2025， [https://blog.docswrite.com/how-to-publish-content-from-airtable-to-linear-a-step-by-step-guide](https://blog.docswrite.com/how-to-publish-content-from-airtable-to-linear-a-step-by-step-guide)  
219. Plugins \- Kanban \- Obsidian, 访问时间为 四月 22, 2025， [https://obsidian.md/plugins?search=kanban](https://obsidian.md/plugins?search=kanban)  
220. How to Create Custom Workflows in Linear: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-create-custom-workflows-in-linear](https://www.storylane.io/tutorials/how-to-create-custom-workflows-in-linear)  
221. Unlocking Efficiency: How Obsidian's Kanban Changes Task Management \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=wKPlkp40kYM](https://www.youtube.com/watch?v=wKPlkp40kYM)  
222. How to Create Custom Fields in Linear: 1-Min Guide \- Storylane, 访问时间为 四月 22, 2025， [https://www.storylane.io/tutorials/how-to-create-custom-fields-in-linear](https://www.storylane.io/tutorials/how-to-create-custom-fields-in-linear)  
223. Build a Kanban Board with Obsidian \+ Dataview Plugin \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=rGFb6j9KDh4](https://www.youtube.com/watch?v=rGFb6j9KDh4)  
224. Retrieval-Augmented Generation for Large Language Models: A Survey \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/pdf/2312.10997](https://arxiv.org/pdf/2312.10997)  
225. The Power of Retrieval Augmented Generation (RAG) in GenAI & Global Content, 访问时间为 四月 22, 2025， [https://www.welocalize.com/insights/the-power-of-retrieval-augmented-generation-rag-in-genai-global-content/](https://www.welocalize.com/insights/the-power-of-retrieval-augmented-generation-rag-in-genai-global-content/)  
226. How Retrieval Augmented Generation (RAG) Boosts AI Creativity? \- AiThority, 访问时间为 四月 22, 2025， [https://aithority.com/machine-learning/how-retrieval-augmented-generation-rag-boosts-ai-creativity/](https://aithority.com/machine-learning/how-retrieval-augmented-generation-rag-boosts-ai-creativity/)  
227. Why Retrieval-Augmented Generation (RAG) Matters for Brands \- Idomoo, 访问时间为 四月 22, 2025， [https://www.idomoo.com/blog/the-rise-of-retrieval-augmented-generation-in-ai-what-brands-need-to-know/](https://www.idomoo.com/blog/the-rise-of-retrieval-augmented-generation-in-ai-what-brands-need-to-know/)  
228. Retrieval-Augmented Generation (RAG) Improves AI Content Relevance and Accuracy, 访问时间为 四月 22, 2025， [https://shelf.io/blog/retrieval-augmented-generation-rag-improves-ai-content-relevance-and-accuracy/](https://shelf.io/blog/retrieval-augmented-generation-rag-improves-ai-content-relevance-and-accuracy/)  
229. Creative Commons Attribution Builder | Library \- Deakin University, 访问时间为 四月 22, 2025， [https://www.deakin.edu.au/library/help/attribution-builder](https://www.deakin.edu.au/library/help/attribution-builder)  
230. Recommended practices for attribution \- Creative Commons Wiki, 访问时间为 四月 22, 2025， [https://wiki.creativecommons.org/wiki/Recommended\_practices\_for\_attribution](https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution)  
231. 16 Best Content Workflow Software Reviewed In 2025 \- The CMO, 访问时间为 四月 22, 2025， [https://thecmo.com/tools/best-content-workflow-software/](https://thecmo.com/tools/best-content-workflow-software/)  
232. Mapping a Workflow That Works – Finding Balance, 访问时间为 四月 22, 2025， [https://opentext.ku.edu/findingbalance/chapter/mapping-a-workflow-that-works/](https://opentext.ku.edu/findingbalance/chapter/mapping-a-workflow-that-works/)  
233. agent-architectures-with-mcp \- AIXplore \- Tech Articles \- Obsidian Publish, 访问时间为 四月 22, 2025， [https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agent-architectures-with-mcp](https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/agent-architectures-with-mcp)  
234. Linear.app | Hacker News, 访问时间为 四月 22, 2025， [https://news.ycombinator.com/item?id=33199304](https://news.ycombinator.com/item?id=33199304)  
235. Model context protocol (MCP) \- OpenAI Agents SDK, 访问时间为 四月 22, 2025， [https://openai.github.io/openai-agents-python/mcp/](https://openai.github.io/openai-agents-python/mcp/)  
236. A Deep Dive Into MCP and the Future of AI Tooling | Andreessen ..., 访问时间为 四月 22, 2025， [https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/](https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/)  
237. Beyond the Hype: Understanding the Limitations of Anthropic's Model Context Protocol for Tool Integration \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/ramkey982/beyond-the-hype-understanding-the-limitations-of-anthropics-model-context-protocol-for-tool-48kk](https://dev.to/ramkey982/beyond-the-hype-understanding-the-limitations-of-anthropics-model-context-protocol-for-tool-48kk)  
238. Must-Have MCP Servers for Coding and Beyond : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1k0f3vs/musthave\_mcp\_servers\_for\_coding\_and\_beyond/](https://www.reddit.com/r/ClaudeAI/comments/1k0f3vs/musthave_mcp_servers_for_coding_and_beyond/)  
239. MCP and AI Security: What You Need to Know \- Treblle Blog, 访问时间为 四月 22, 2025， [https://blog.treblle.com/model-context-protocol-ai-security/](https://blog.treblle.com/model-context-protocol-ai-security/)  
240. API Security Risks, Testing and Protection Best Practices | Entro, 访问时间为 四月 22, 2025， [https://entro.security/blog/api-security-and-protection-best-practices/](https://entro.security/blog/api-security-and-protection-best-practices/)  
241. Old Security Rakes In New MCP Yards \- Den Delimarsky, 访问时间为 四月 22, 2025， [https://den.dev/blog/security-rakes-mcp/](https://den.dev/blog/security-rakes-mcp/)  
242. Obsidian MCP REST Server \- UBOS.tech, 访问时间为 四月 22, 2025， [https://ubos.tech/mcp/obsidian-mcp-rest-server/](https://ubos.tech/mcp/obsidian-mcp-rest-server/)  
243. Plugin security \- Obsidian Help, 访问时间为 四月 22, 2025， [https://help.obsidian.md/plugin-security](https://help.obsidian.md/plugin-security)  
244. Unpacking the Security Risks of Model Context Protocol (MCP) Servers \- Upwind, 访问时间为 四月 22, 2025， [https://www.upwind.io/feed/unpacking-the-security-risks-of-model-context-protocol-mcp-servers](https://www.upwind.io/feed/unpacking-the-security-risks-of-model-context-protocol-mcp-servers)  
245. Cato CTRL™ Threat Research: Exploiting Model Context Protocol (MCP) – Demonstrating Risks and Mitigating GenAI Threats \- Cato Networks, 访问时间为 四月 22, 2025， [https://www.catonetworks.com/blog/cato-ctrl-exploiting-model-context-protocol-mcp/](https://www.catonetworks.com/blog/cato-ctrl-exploiting-model-context-protocol-mcp/)  
246. The Security Risks of Model Context Protocol (MCP) \- SECNORA, 访问时间为 四月 22, 2025， [https://secnora.com/blog/the-security-risks-of-model-context-protocol-mcp/](https://secnora.com/blog/the-security-risks-of-model-context-protocol-mcp/)  
247. MCP and LLM Security Research Briefing | Wiz Blog, 访问时间为 四月 22, 2025， [https://www.wiz.io/blog/mcp-security-research-briefing](https://www.wiz.io/blog/mcp-security-research-briefing)  
248. Claude Code tutorials \- Anthropic API, 访问时间为 四月 22, 2025， [https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/tutorials](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/tutorials)  
249. My Claude Workflow Guide: Advanced Setup with MCP External Tools : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1ji8ruv/my\_claude\_workflow\_guide\_advanced\_setup\_with\_mcp/](https://www.reddit.com/r/ClaudeAI/comments/1ji8ruv/my_claude_workflow_guide_advanced_setup_with_mcp/)  
250. TUTORIAL: GET MCP WORKING ON WINDOWS : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h1mmi8/tutorial\_get\_mcp\_working\_on\_windows/](https://www.reddit.com/r/ClaudeAI/comments/1h1mmi8/tutorial_get_mcp_working_on_windows/)  
251. The Easiest Way to Set Up MCP with Claude Desktop and Docker Desktop, 访问时间为 四月 22, 2025， [https://dev.to/suzuki0430/the-easiest-way-to-set-up-mcp-with-claude-desktop-and-docker-desktop-5o](https://dev.to/suzuki0430/the-easiest-way-to-set-up-mcp-with-claude-desktop-and-docker-desktop-5o)  
252. For Claude Desktop Users \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/quickstart/user](https://modelcontextprotocol.io/quickstart/user)  
253. Let's Build TypeScript MCP Server and Connect to Claude Desktop \- Apidog, 访问时间为 四月 22, 2025， [https://apidog.com/blog/mcp-server-connect-claude-desktop/](https://apidog.com/blog/mcp-server-connect-claude-desktop/)  
254. User interface \- Visual Studio Code, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface)  
255. Extensions » Patterns and principles \- vscode-docs, 访问时间为 四月 22, 2025， [https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/](https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/)  
256. UX Guidelines | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/ux-guidelines/overview](https://code.visualstudio.com/api/ux-guidelines/overview)  
257. Extensibility Principles and Patterns \- vscode-docs1 \- Read the Docs, 访问时间为 四月 22, 2025， [https://vscode-docs1.readthedocs.io/en/latest/extensionAPI/patterns-and-principles/](https://vscode-docs1.readthedocs.io/en/latest/extensionAPI/patterns-and-principles/)  
258. SaaS UX Design: 18 Best Practices \- Userpilot, 访问时间为 四月 22, 2025， [https://userpilot.com/blog/saas-ux-design/](https://userpilot.com/blog/saas-ux-design/)  
259. Implement Best Practices for UX Design | Mendix Documentation, 访问时间为 四月 22, 2025， [https://docs.mendix.com/howto/front-end/ux-best-practices/](https://docs.mendix.com/howto/front-end/ux-best-practices/)  
260. Top 10 UX & UI Best Practices for Building Better Frictionless Interfaces \- Mendix, 访问时间为 四月 22, 2025， [https://www.mendix.com/blog/top-10-ux-ui-best-practices-for-building-better-frictionless-interfaces/](https://www.mendix.com/blog/top-10-ux-ui-best-practices-for-building-better-frictionless-interfaces/)  
261. The UX/UI designer's guide to forms \- Formsort, 访问时间为 四月 22, 2025， [https://formsort.com/article/form-design-for-ux-ui-designers/](https://formsort.com/article/form-design-for-ux-ui-designers/)  
262. UX and UI Best Practices \- Wix Developers, 访问时间为 四月 22, 2025， [https://dev.wix.com/docs/build-apps/develop-your-app/design/ux-and-ui-best-practices](https://dev.wix.com/docs/build-apps/develop-your-app/design/ux-and-ui-best-practices)  
263. I spent 10 DAYS redesigning Visual Studio Code... | Speed UI Design \- YouTube, 访问时间为 四月 22, 2025， [https://m.youtube.com/watch?v=m\_d7K28CSXg](https://m.youtube.com/watch?v=m_d7K28CSXg)  
264. microsoft/vscode-extension-samples: Sample code illustrating the VS Code extension API. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/microsoft/vscode-extension-samples](https://github.com/microsoft/vscode-extension-samples)  
265. User experience best practices | Firefox Extension Workshop, 访问时间为 四月 22, 2025， [https://extensionworkshop.com/documentation/develop/user-experience-best-practices/](https://extensionworkshop.com/documentation/develop/user-experience-best-practices/)  
266. Commands | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/extension-guides/command](https://code.visualstudio.com/api/extension-guides/command)  
267. VS Code API | Visual Studio Code Extension API, 访问时间为 四月 22, 2025， [https://code.visualstudio.com/api/references/vscode-api\#window](https://code.visualstudio.com/api/references/vscode-api#window)  
268. For Client Developers \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/quickstart/client](https://modelcontextprotocol.io/quickstart/client)  
269. MCP: Getting Connection timed out error when running setup-users. \- Ciena, 访问时间为 四月 22, 2025， [https://my.ciena.com/CienaPortal/s/article/MCP-Getting-Connection-timed-out-error-when-running-setup-users](https://my.ciena.com/CienaPortal/s/article/MCP-Getting-Connection-timed-out-error-when-running-setup-users)  
270. Configuring MCP Servers \- Cline Documentation, 访问时间为 四月 22, 2025， [https://docs.cline.bot/mcp-servers/configuring-mcp-servers](https://docs.cline.bot/mcp-servers/configuring-mcp-servers)  
271. Everything a Developer Needs to Know About the Model Context Protocol (MCP) \- Neo4j, 访问时间为 四月 22, 2025， [https://neo4j.com/blog/developer/model-context-protocol/](https://neo4j.com/blog/developer/model-context-protocol/)  
272. MCP Changelog: Latest Updates & Release Notes \- BytePlus, 访问时间为 四月 22, 2025， [https://www.byteplus.com/en/topic/541587](https://www.byteplus.com/en/topic/541587)  
273. Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2503.23278](https://arxiv.org/html/2503.23278)  
274. Hermes MCP Roadmap — hermes\_mcp v0.3.11 \- HexDocs, 访问时间为 四月 22, 2025， [https://hexdocs.pm/hermes\_mcp/roadmap.html](https://hexdocs.pm/hermes_mcp/roadmap.html)  
275. obsidian-mcp-tools/.clinerules at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/.clinerules](https://github.com/jacksteamdev/obsidian-mcp-tools/blob/main/.clinerules)  
276. Accuracy and Reliability of AI-Generated Text Detection Tools: A Literature Review, 访问时间为 四月 22, 2025， [https://www.researchgate.net/publication/389114020\_Accuracy\_and\_Reliability\_of\_AI-Generated\_Text\_Detection\_Tools\_A\_Literature\_Review](https://www.researchgate.net/publication/389114020_Accuracy_and_Reliability_of_AI-Generated_Text_Detection_Tools_A_Literature_Review)  
277. The ethics of disclosing the use of artificial intelligence tools in writing scholarly manuscripts, 访问时间为 四月 22, 2025， [https://pmc.ncbi.nlm.nih.gov/articles/PMC11694804/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11694804/)  
278. Ethical Considerations and Best Practices in LLM Development \- Neptune.ai, 访问时间为 四月 22, 2025， [https://neptune.ai/blog/llm-ethical-considerations](https://neptune.ai/blog/llm-ethical-considerations)  
279. AI and the Law: Navigating Legal Risks in Content Creation \- Acrolinx, 访问时间为 四月 22, 2025， [https://www.acrolinx.com/blog/ai-laws-for-content-creation/](https://www.acrolinx.com/blog/ai-laws-for-content-creation/)  
280. Meet Claude: A New Era of AI from Anthropic | US Data Corporation, 访问时间为 四月 22, 2025， [https://www.usdatacorporation.com/blog/meet-claude-a-new-era-of-ai-from-anthropic/](https://www.usdatacorporation.com/blog/meet-claude-a-new-era-of-ai-from-anthropic/)  
281. AI Risk Assessment: Strategies, Tools, and Best Practices \- Securiti, 访问时间为 四月 22, 2025， [https://securiti.ai/ai-risk-assessment/](https://securiti.ai/ai-risk-assessment/)  
282. Implementing risk assessments for high-risk AI systems \- Washington Technology Solutions, 访问时间为 四月 22, 2025， [https://watech.wa.gov/sites/default/files/2025-01/EO%2024-01%20Risk%20Guidance\_Final.pdf](https://watech.wa.gov/sites/default/files/2025-01/EO%2024-01%20Risk%20Guidance_Final.pdf)  
283. Anthropic Launches 'Constitution Classifier': Successfully Prevents 95% of Model Jailbreak Attempts \- AIbase, 访问时间为 四月 22, 2025， [https://www.aibase.com/news/15075](https://www.aibase.com/news/15075)  
284. Anthropic Expands Claude's Capabilities With Research And Google Workspace Integration, 访问时间为 四月 22, 2025， [https://www.techdogs.com/tech-news/td-newsdesk/anthropic-expands-claudes-capabilities-with-research-and-google-workspace-integration](https://www.techdogs.com/tech-news/td-newsdesk/anthropic-expands-claudes-capabilities-with-research-and-google-workspace-integration)  
285. Anthropic's Claude \- Models in Amazon Bedrock \- AWS, 访问时间为 四月 22, 2025， [https://aws.amazon.com/bedrock/claude/](https://aws.amazon.com/bedrock/claude/)  
286. Home \\ Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/](https://www.anthropic.com/)  
287. Collective Constitutional AI: Aligning a Language Model with Public Input \- Anthropic, 访问时间为 四月 22, 2025， [https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input)  
288. Model Context Protocol: What You Need To Know \- Gradient Flow, 访问时间为 四月 22, 2025， [https://gradientflow.com/model-context-protocol-what-you-need-to-know/](https://gradientflow.com/model-context-protocol-what-you-need-to-know/)  
289. How Model Context Protocol Is Changing Enterprise AI Integration \- CMS Wire, 访问时间为 四月 22, 2025， [https://www.cmswire.com/digital-experience/how-model-context-protocol-is-changing-enterprise-ai-integration/](https://www.cmswire.com/digital-experience/how-model-context-protocol-is-changing-enterprise-ai-integration/)  
290. Beyond Zapier: Why MCP is the Real Next Step for Automation (And Your Business), 访问时间为 四月 22, 2025， [https://mindpal.space/blog/beyond-zapier-why-mcp-is-the-real-next-step-for-automation](https://mindpal.space/blog/beyond-zapier-why-mcp-is-the-real-next-step-for-automation)  
291. Content Workflow by Bynder MCP AI \- Zapier, 访问时间为 四月 22, 2025， [https://zapier.com/mcp/content-workflow-by-bynder](https://zapier.com/mcp/content-workflow-by-bynder)  
292. MCP for Workflow Automation: A Complete Guide \- BytePlus, 访问时间为 四月 22, 2025， [https://www.byteplus.com/en/topic/541669](https://www.byteplus.com/en/topic/541669)  
293. Unlock Superpowered Automation: Connecting AI Agents to Make.com with MCP \- MindPal, 访问时间为 四月 22, 2025， [https://mindpal.space/blog/unlock-superpowered-automation-connecting-ai-agents-to-make-com-with-mcp-ghtb2](https://mindpal.space/blog/unlock-superpowered-automation-connecting-ai-agents-to-make-com-with-mcp-ghtb2)  
294. MCP for Content Marketing: AI & Workflow Optimization \- BytePlus, 访问时间为 四月 22, 2025， [https://www.byteplus.com/en/topic/541838](https://www.byteplus.com/en/topic/541838)  
295. Integrate OpenAI into Obsidian \- Data Engineering Blog, 访问时间为 四月 22, 2025， [https://www.ssp.sh/brain/integrate-openai-into-obsidian/](https://www.ssp.sh/brain/integrate-openai-into-obsidian/)  
296. ittuann/obsidian-gpt-liteinquirer-plugin: Experience OpenAI ChatGPT assistance directly within Obsidian, drafting content without interrupting your creative flow. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/ittuann/obsidian-gpt-liteinquirer-plugin](https://github.com/ittuann/obsidian-gpt-liteinquirer-plugin)  
297. can't process the image returned from MCP server · Issue \#1033 · cline/cline \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cline/cline/issues/1033](https://github.com/cline/cline/issues/1033)  
298. How to use Obsidian for image management? \- Help, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/how-to-use-obsidian-for-image-management/71446](https://forum.obsidian.md/t/how-to-use-obsidian-for-image-management/71446)  
299. Cursor and Updated OpenAI API Documentation, 访问时间为 四月 22, 2025， [https://community.openai.com/t/cursor-and-updated-openai-api-documentation/1110926](https://community.openai.com/t/cursor-and-updated-openai-api-documentation/1110926)  
300. Claude MCP for Obsidian using Rest API \- Developers: Plugin & API, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284](https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284)  
301. Prompt engineering techniques \- Azure OpenAI \- Learn Microsoft, 访问时间为 四月 22, 2025， [https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering)  
302. AI Prompt Engineering: The Art of AI Instruction \- K2view, 访问时间为 四月 22, 2025， [https://www.k2view.com/blog/ai-prompt-engineering/](https://www.k2view.com/blog/ai-prompt-engineering/)  
303. Prompt engineering for RAG \- OpenAI Developer Forum, 访问时间为 四月 22, 2025， [https://community.openai.com/t/prompt-engineering-for-rag/621495](https://community.openai.com/t/prompt-engineering-for-rag/621495)  
304. servers/src/filesystem/README.md at main · modelcontextprotocol/servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/README.md](https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/README.md)  
305. bsmi021/mcp-filesystem-server: A Model Context Protocol server for accessing your file system. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/bsmi021/mcp-filesystem-server](https://github.com/bsmi021/mcp-filesystem-server)  
306. @modelcontextprotocol/server-github \- npm, 访问时间为 四月 22, 2025， [https://www.npmjs.com/package/@modelcontextprotocol/server-github?activeTab=dependents](https://www.npmjs.com/package/@modelcontextprotocol/server-github?activeTab=dependents)  
307. 10 Best MCP Servers for Developers to Try in 2025 \- Trickle AI, 访问时间为 四月 22, 2025， [https://www.trickle.so/blog/10-best-mcp-servers-for-developers](https://www.trickle.so/blog/10-best-mcp-servers-for-developers)  
308. Setting Up MCP Servers in Claude Code: A Tech Ritual for the Quietly Desperate \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/Anthropic/comments/1jf4jfr/setting\_up\_mcp\_servers\_in\_claude\_code\_a\_tech/](https://www.reddit.com/r/Anthropic/comments/1jf4jfr/setting_up_mcp_servers_in_claude_code_a_tech/)  
309. Microsoft Playwright MCP \- Claude MCP Servers \- MCP Community, 访问时间为 四月 22, 2025， [https://www.claudemcp.com/servers/playwright](https://www.claudemcp.com/servers/playwright)  
310. How to Set Up and Use MCP in Cursor: A Comprehensive Guide | 1 Dollar VPS, 访问时间为 四月 22, 2025， [https://onedollarvps.com/blogs/how-to-set-up-and-use-mcp-in-cursor](https://onedollarvps.com/blogs/how-to-set-up-and-use-mcp-in-cursor)  
311. Microsoft Playwright MCP: Tutorial for Beginners \- Hugging Face, 访问时间为 四月 22, 2025， [https://huggingface.co/blog/lynn-mikami/microsoft-playwright-mcp](https://huggingface.co/blog/lynn-mikami/microsoft-playwright-mcp)  
312. microsoft/playwright-mcp \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)  
313. MCP — AgentScope Doc documentation, 访问时间为 四月 22, 2025， [http://doc.agentscope.io/build\_tutorial/MCP.html](http://doc.agentscope.io/build_tutorial/MCP.html)  
314. Blog Basics: Copyright and Fair Use \- GCFGlobal, 访问时间为 四月 22, 2025， [https://edu.gcfglobal.org/en/blogbasics/copyright-and-fair-use/1/](https://edu.gcfglobal.org/en/blogbasics/copyright-and-fair-use/1/)  
315. Introducing Goose, the on-machine AI agent \- Marc Nuri, 访问时间为 四月 22, 2025， [https://blog.marcnuri.com/goose-on-machine-ai-agent-cli-introduction](https://blog.marcnuri.com/goose-on-machine-ai-agent-cli-introduction)  
316. Linear MCP Server – Facilitates project management with the Linear API via the Model Context Protocol, allowing users to manage initiatives, projects, issues, and their relationships through features like creation, viewing, updating, and prioritization. \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/mcp/comments/1iq5ttv/linear\_mcp\_server\_facilitates\_project\_management/](https://www.reddit.com/r/mcp/comments/1iq5ttv/linear_mcp_server_facilitates_project_management/)  
317. Linear MCP Server \- GenAI Works, 访问时间为 四月 22, 2025， [https://genai.works/mcp-servers/linear-mcp-server-m9a2ifnx](https://genai.works/mcp-servers/linear-mcp-server-m9a2ifnx)  
318. Linear MCP Server – Enables interaction with Linear resources through an MCP interface, offering functionality for issue management and resource retrieval with rate limiting and error handling support. \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/mcp/comments/1impvnz/linear\_mcp\_server\_enables\_interaction\_with\_linear/](https://www.reddit.com/r/mcp/comments/1impvnz/linear_mcp_server_enables_interaction_with_linear/)  
319. cline/linear-mcp: a private MCP server for accessing Linear \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cline/linear-mcp](https://github.com/cline/linear-mcp)  
320. smithery-ai/mcp-obsidian: A connector for Claude Desktop to read and search an Obsidian vault. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/smithery-ai/mcp-obsidian](https://github.com/smithery-ai/mcp-obsidian)  
321. Can someone explain MCP to me? How are you using it? And what has it allowed you to do that you couldn't do before? : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h55zxd/can\_someone\_explain\_mcp\_to\_me\_how\_are\_you\_using/](https://www.reddit.com/r/ClaudeAI/comments/1h55zxd/can_someone_explain_mcp_to_me_how_are_you_using/)  
322. Developers: Plugin & API \- Obsidian Forum, 访问时间为 四月 22, 2025， [https://forum.obsidian.md/c/developers-api/14](https://forum.obsidian.md/c/developers-api/14)  
323. Breaking Down Model Context Protocol (MCP) \- Botpress, 访问时间为 四月 22, 2025， [https://botpress.com/blog/model-context-protocol](https://botpress.com/blog/model-context-protocol)  
324. Everything you need to get up and running with MCP – Anthropic's USB-C for AI, 访问时间为 四月 22, 2025， [https://www.theregister.com/2025/04/21/mcp\_guide/](https://www.theregister.com/2025/04/21/mcp_guide/)  
325. Everything you need to know about MCP \- Replit Blog, 访问时间为 四月 22, 2025， [https://blog.replit.com/everything-you-need-to-know-about-mcp](https://blog.replit.com/everything-you-need-to-know-about-mcp)  
326. MCP And The Future Of LLMs: A New Standard For Enterprise SaaS Integration \- Verdantix, 访问时间为 四月 22, 2025， [https://www.verdantix.com/insights/blogs/mcp-and-the-future-of-llms-a-new-standard-for-enterprise-saas-integration](https://www.verdantix.com/insights/blogs/mcp-and-the-future-of-llms-a-new-standard-for-enterprise-saas-integration)  
327. MCP (Model Context Protocol): The Future of AI Integration \- Digidop, 访问时间为 四月 22, 2025， [https://www.digidop.com/blog/mcp-ai-revolution](https://www.digidop.com/blog/mcp-ai-revolution)  
328. Create and manage workflows \- Google Cloud, 访问时间为 四月 22, 2025， [https://cloud.google.com/workflows/docs/creating-updating-workflow](https://cloud.google.com/workflows/docs/creating-updating-workflow)  
329. Supercharge your knowledge management \- integrating Obsidian MCP with Claude, 访问时间为 四月 22, 2025， [https://www.qed42.com/insights/supercharge-your-knowledge-management---integrating-obsidian-mcp-with-claude](https://www.qed42.com/insights/supercharge-your-knowledge-management---integrating-obsidian-mcp-with-claude)  
330. How to connect Cursor to 100+ MCP Servers within minutes \- DEV Community, 访问时间为 四月 22, 2025， [https://dev.to/composiodev/how-to-connect-cursor-to-100-mcp-servers-within-minutes-3h74](https://dev.to/composiodev/how-to-connect-cursor-to-100-mcp-servers-within-minutes-3h74)  
331. Obsidian knowledgebase \+ MCP (Claude desktop) : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1jwqxeq/obsidian\_knowledgebase\_mcp\_claude\_desktop/](https://www.reddit.com/r/ObsidianMD/comments/1jwqxeq/obsidian_knowledgebase_mcp_claude_desktop/)  
332. MCP Servers for Cursor \- Cursor Directory, 访问时间为 四月 22, 2025， [https://cursor.directory/mcp](https://cursor.directory/mcp)  
333. wong2/awesome-mcp-servers: A curated list of Model Context Protocol (MCP) servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)  
334. Run MCP desktop client using Amazon Bedrock for AgenticAI \- Community.aws, 访问时间为 四月 22, 2025， [https://community.aws/content/2vPB0cvCY08EWYleQ8vcMCOvQVg/run-local-mcp-desktop-client-using-amazon-bedrock](https://community.aws/content/2vPB0cvCY08EWYleQ8vcMCOvQVg/run-local-mcp-desktop-client-using-amazon-bedrock)  
335. Projects in Awesome Lists tagged with ai \- Ecosyste.ms, 访问时间为 四月 22, 2025， [https://awesome.ecosyste.ms/projects?keyword=ai\&page=15\&per\_page=100](https://awesome.ecosyste.ms/projects?keyword=ai&page=15&per_page=100)  
336. MCP \- Model Context Protocol \- SDK \- Python \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=oq3dkNm51qc](https://www.youtube.com/watch?v=oq3dkNm51qc)  
337. DevDocs: A private tech documentation scraper ready for MCP and Cline. \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ChatGPTCoding/comments/1i1sfya/devdocs\_a\_private\_tech\_documentation\_scraper/](https://www.reddit.com/r/ChatGPTCoding/comments/1i1sfya/devdocs_a_private_tech_documentation_scraper/)  
338. LLMs: Fine-tuning, distillation, and prompt engineering | Machine Learning, 访问时间为 四月 22, 2025， [https://developers.google.com/machine-learning/crash-course/llm/tuning](https://developers.google.com/machine-learning/crash-course/llm/tuning)  
339. Fine-tuning large language models (LLMs) in 2025 \- SuperAnnotate, 访问时间为 四月 22, 2025， [https://www.superannotate.com/blog/llm-fine-tuning](https://www.superannotate.com/blog/llm-fine-tuning)  
340. Guide to Fine Tuning LLMs: Methods & Best Practices \- Ema, 访问时间为 四月 22, 2025， [https://www.ema.co/additional-blogs/addition-blogs/guide-to-fine-tuning-llms-methods-and-best-practices](https://www.ema.co/additional-blogs/addition-blogs/guide-to-fine-tuning-llms-methods-and-best-practices)  
341. Exporting Hell : r/ObsidianMD \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ObsidianMD/comments/1cq8dc3/exporting\_hell/](https://www.reddit.com/r/ObsidianMD/comments/1cq8dc3/exporting_hell/)  
342. Integrations \- Linear, 访问时间为 四月 22, 2025， [https://linear.app/integrations](https://linear.app/integrations)  
343. Linear Integrations | Automated Workflows with Latenode, 访问时间为 四月 22, 2025， [https://latenode.com/integrations/linear](https://latenode.com/integrations/linear)  
344. Linear Trigger integrations | Workflow automation with n8n, 访问时间为 四月 22, 2025， [https://n8n.io/integrations/linear-trigger/](https://n8n.io/integrations/linear-trigger/)  
345. Linear integrations | Workflow automation with n8n, 访问时间为 四月 22, 2025， [https://n8n.io/integrations/linear/](https://n8n.io/integrations/linear/)  
346. Quality and Originality: Ensuring Successful Content Creation \- AOK Marketing, 访问时间为 四月 22, 2025， [https://aokmarketing.com/quality-and-originality-ensuring-a-successful-content-creation/](https://aokmarketing.com/quality-and-originality-ensuring-a-successful-content-creation/)  
347. Tips for Creating Original Content to Grow Your Audience \- Crowd Content, 访问时间为 四月 22, 2025， [https://www.stellarcontent.com/blog/writers-hub/how-to-create-original-content/](https://www.stellarcontent.com/blog/writers-hub/how-to-create-original-content/)  
348. How to create original content: an in-depth guide \- The PickFu blog, 访问时间为 四月 22, 2025， [https://www.pickfu.com/blog/how-to-create-original-content/](https://www.pickfu.com/blog/how-to-create-original-content/)  
349. vanhishikha.com, 访问时间为 四月 22, 2025， [https://vanhishikha.com/why-creating-original-content-is-a-must-for-marketing/\#:\~:text=It's%20fresh%20content%20that%20you,there's%20no%20identical%20content%20online.](https://vanhishikha.com/why-creating-original-content-is-a-must-for-marketing/#:~:text=It's%20fresh%20content%20that%20you,there's%20no%20identical%20content%20online.)  
350. How to Legally Use Images, Videos, and Other Content in Blog Posts \- Copyright Alliance, 访问时间为 四月 22, 2025， [https://copyrightalliance.org/legally-use-images-videos-content-blogs/](https://copyrightalliance.org/legally-use-images-videos-content-blogs/)  
351. LLM-DetectAIve: a Tool for Fine-Grained Machine-Generated Text Detection, 访问时间为 四月 22, 2025， [https://aclanthology.org/2024.emnlp-demo.35/](https://aclanthology.org/2024.emnlp-demo.35/)  
352. A Survey on LLM-Generated Text Detection: Necessity, Methods, and Future Directions, 访问时间为 四月 22, 2025， [https://direct.mit.edu/coli/article/51/1/275/127462/A-Survey-on-LLM-Generated-Text-Detection-Necessity](https://direct.mit.edu/coli/article/51/1/275/127462/A-Survey-on-LLM-Generated-Text-Detection-Necessity)  
353. CS-PaperSum: A Large-Scale Dataset of AI-Generated Summaries for Scientific Papers \- arXiv, 访问时间为 四月 22, 2025， [https://www.arxiv.org/pdf/2502.20582](https://www.arxiv.org/pdf/2502.20582)  
354. \[2504.08446\] Charting the Parrot's Song: A Maximum Mean Discrepancy Approach to Measuring AI Novelty, Originality, and Distinctiveness \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/abs/2504.08446](https://arxiv.org/abs/2504.08446)  
355. Charting the Parrot's Song: A Maximum Mean Discrepancy Approach to Measuring AI Novelty, Originality, and Distinctiveness \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/pdf/2504.08446](https://arxiv.org/pdf/2504.08446)  
356. How Does AI Detection Work? A Complete Guide to Identifying AI-Generated Content, 访问时间为 四月 22, 2025， [https://www.link-assistant.com/rankdots/blog/how-do-ai-detectors-work.html](https://www.link-assistant.com/rankdots/blog/how-do-ai-detectors-work.html)  
357. What is RAG? \- Retrieval-Augmented Generation AI Explained \- AWS, 访问时间为 四月 22, 2025， [https://aws.amazon.com/what-is/retrieval-augmented-generation/](https://aws.amazon.com/what-is/retrieval-augmented-generation/)  
358. Bring Your Own Knowledge: A Survey of Methods for LLM Knowledge Expansion \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2502.12598v1](https://arxiv.org/html/2502.12598v1)  
359. 6 Best Practices for Legally Using Google Images \- Copyrightlaws.com, 访问时间为 四月 22, 2025， [https://www.copyrightlaws.com/copyright-tips-legally-using-google-images/](https://www.copyrightlaws.com/copyright-tips-legally-using-google-images/)  
360. How to Use Images Legally Online for Your Blog? \- Content Whale, 访问时间为 四月 22, 2025， [https://content-whale.com/blog/using-images-legally-online/](https://content-whale.com/blog/using-images-legally-online/)  
361. Photos you can use on your blog without breaking the law… \- IFB, 访问时间为 四月 22, 2025， [https://heartifb.com/blog-photos/](https://heartifb.com/blog-photos/)  
362. Can I Use This Photo on Social Media? Understanding Image Copyright \- Hootsuite Blog, 访问时间为 四月 22, 2025， [https://blog.hootsuite.com/understanding-image-copyright/](https://blog.hootsuite.com/understanding-image-copyright/)  
363. Co-Writing with AI, on Human Terms: Aligning Research with User Demands Across the Writing Process \- arXiv, 访问时间为 四月 22, 2025， [https://arxiv.org/html/2504.12488v1](https://arxiv.org/html/2504.12488v1)  
364. Human-AI Collaboration in Writing: A Multidimensional Framework for Creative and Intellectual Authorship | International Journal of Changes in Education \- BonViewPress, 访问时间为 四月 22, 2025， [https://ojs.bonviewpress.com/index.php/IJCE/article/view/4908](https://ojs.bonviewpress.com/index.php/IJCE/article/view/4908)  
365. Human-AI Collaboration in Writing: A Multidimensional Framework for Creative and Intellectual Authorship \- Digital Commons@Lindenwood University, 访问时间为 四月 22, 2025， [https://digitalcommons.lindenwood.edu/cgi/viewcontent.cgi?article=1727\&context=faculty-research-papers](https://digitalcommons.lindenwood.edu/cgi/viewcontent.cgi?article=1727&context=faculty-research-papers)  
366. A conceptual framework for human-AI collaborative creative writing \- ResearchGate, 访问时间为 四月 22, 2025， [https://www.researchgate.net/figure/A-conceptual-framework-for-human-AI-collaborative-creative-writing\_fig4\_369013951](https://www.researchgate.net/figure/A-conceptual-framework-for-human-AI-collaborative-creative-writing_fig4_369013951)  
367. Download \- PhilArchive, 访问时间为 四月 22, 2025， [https://philarchive.org/archive/ZHAWIWv1](https://philarchive.org/archive/ZHAWIWv1)  
368. Model Context Protocol \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)  
369. Model Context Protocol server \- Speakeasy, 访问时间为 四月 22, 2025， [https://www.speakeasy.com/docs/customize/typescript/model-context-protocol](https://www.speakeasy.com/docs/customize/typescript/model-context-protocol)  
370. cyanheads/model-context-protocol-resources: Exploring the Model Context Protocol (MCP) through practical guides, clients, and servers I've built while learning about this new protocol. \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/cyanheads/model-context-protocol-resources](https://github.com/cyanheads/model-context-protocol-resources)  
371. The official Python SDK for Model Context Protocol servers and clients \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)  
372. Model Context Protocol (MCP): A Guide With Demo Project \- DataCamp, 访问时间为 四月 22, 2025， [https://www.datacamp.com/tutorial/mcp-model-context-protocol](https://www.datacamp.com/tutorial/mcp-model-context-protocol)  
373. The official Typescript SDK for Model Context Protocol servers and clients \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)  
374. smithery-ai/mcp-ts-sdk: The official Typescript SDK for Model Context Protocol servers and clients \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/smithery-ai/mcp-ts-sdk](https://github.com/smithery-ai/mcp-ts-sdk)  
375. python-sdk/examples/servers/simple-tool/mcp\_simple\_tool/server.py at main \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/python-sdk/blob/main/examples/servers/simple-tool/mcp\_simple\_tool/server.py?spm=a2c6h.13046898.publish-article.20.3a756ffaNlDIYc\&file=server.py](https://github.com/modelcontextprotocol/python-sdk/blob/main/examples/servers/simple-tool/mcp_simple_tool/server.py?spm=a2c6h.13046898.publish-article.20.3a756ffaNlDIYc&file=server.py)  
376. jlowin/fastmcp: The fast, Pythonic way to build MCP servers and clients \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/jlowin/fastmcp](https://github.com/jlowin/fastmcp)  
377. Roadmap \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/development/roadmap](https://modelcontextprotocol.io/development/roadmap)  
378. Debugging \- Model Context Protocol, 访问时间为 四月 22, 2025， [https://modelcontextprotocol.io/docs/tools/debugging](https://modelcontextprotocol.io/docs/tools/debugging)  
379. modelcontextprotocol/inspector: Visual testing tool for MCP servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector)  
380. docker/mcp-inspector: Visual testing tool for MCP servers \- GitHub, 访问时间为 四月 22, 2025， [https://github.com/docker/mcp-inspector](https://github.com/docker/mcp-inspector)  
381. Important Content Performance Metrics | Acrolinx, 访问时间为 四月 22, 2025， [https://www.acrolinx.com/blog/content-metrics-what-your-enterprise-needs-to-measure/](https://www.acrolinx.com/blog/content-metrics-what-your-enterprise-needs-to-measure/)  
382. Is there a step by step guide to set up MCP with Claude desktop? \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1h9lau7/is\_there\_a\_step\_by\_step\_guide\_to\_set\_up\_mcp\_with/](https://www.reddit.com/r/ClaudeAI/comments/1h9lau7/is_there_a_step_by_step_guide_to_set_up_mcp_with/)  
383. How to Set Up MCP Servers on Claude Desktop (Mac) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=4QnA8ci--r8](https://www.youtube.com/watch?v=4QnA8ci--r8)  
384. Claude \+ MCPs \- 'Vibe Coding' Without Specialized IDEs Part 1 \- Stephan Miller, 访问时间为 四月 22, 2025， [https://www.stephanmiller.com/using-mcps-with-claude-desktop/](https://www.stephanmiller.com/using-mcps-with-claude-desktop/)  
385. How to Use MCP with Claude Desktop App to do Anything You Want \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=PszckLRtFWI](https://www.youtube.com/watch?v=PszckLRtFWI)  
386. MCP Servers with Claude Desktop \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=UIDsUfmtIqc](https://www.youtube.com/watch?v=UIDsUfmtIqc)  
387. How I Set Up My Claude MCP Ecosystem : r/ClaudeAI \- Reddit, 访问时间为 四月 22, 2025， [https://www.reddit.com/r/ClaudeAI/comments/1hrgb6e/how\_i\_set\_up\_my\_claude\_mcp\_ecosystem/](https://www.reddit.com/r/ClaudeAI/comments/1hrgb6e/how_i_set_up_my_claude_mcp_ecosystem/)  
388. A Developer's Guide to the MCP \- Zep \- AI, 访问时间为 四月 22, 2025， [https://www.getzep.com/ai-agents/developer-guide-to-mcp?ref=blog.getzep.com](https://www.getzep.com/ai-agents/developer-guide-to-mcp?ref=blog.getzep.com)  
389. Turn Claude into a BEAST with MCP For Your Desktop (Insane AI Power\!) \- YouTube, 访问时间为 四月 22, 2025， [https://www.youtube.com/watch?v=ZELurOv4YiQ](https://www.youtube.com/watch?v=ZELurOv4YiQ)  
390. Connecting Claude and Obsidian: A Step-by-Step Guide | Video Summary by LunaNotes, 访问时间为 四月 22, 2025， [https://lunanotes.io/summary/connecting-claude-and-obsidian-a-step-by-step-guide](https://lunanotes.io/summary/connecting-claude-and-obsidian-a-step-by-step-guide)