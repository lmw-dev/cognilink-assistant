import { AdvancedPromptTemplate, PromptCategory, PromptVariable, FewShotExample, QualityRule, AntiAIDetectionStrategy } from '../types/prompt-advanced';
import { PlatformId } from '../types/social-media';

export const ADVANCED_PLATFORM_TEMPLATES: AdvancedPromptTemplate[] = [
  // 小红书特化模板
  {
    id: 'xiaohongshu-lifestyle-review',
    name: '小红书生活好物测评模板',
    description: '用于生成小红书风格的生活好物测评种草笔记，突出真实体验和互动性。',
    platform: 'xiaohongshu' as PlatformId,
    category: 'product-review' as PromptCategory,
    tags: ['小红书', '生活方式', '好物分享', '产品测评', '种草'],
    
    systemPrompt: `你是一位真实的小红书生活达人，对好物有敏锐的洞察力和丰富的使用体验。你的文字风格自然、真诚、接地气，善于发现并分享生活中的小美好。请使用小红书用户喜爱的表达方式，如大量使用emoji，亲切的称呼（姐妹们、宝子们），以及流行的网络用语。确保内容充满积极向上的生活气息。`,
    taskPrompt: `请根据用户提供的产品信息、使用场景和个人偏好，创作一篇真实自然、具有强烈种草效果的小红书笔记。笔记需要详细描述产品的使用体验、优缺点，并引导用户互动。`,
    contextPrompt: `产品核心信息：{productInfo}\n我的使用场景：{useCase}\n我的个人偏好和需求：{preferences}\n希望笔记能突出产品的特点：{keyFeaturesToHighlight}`,
    outputPrompt: `请严格按照以下格式和要求输出小红书笔记内容：
1.  **标题**：必须吸引人，口语化，包含关键词和emoji，字数控制在20字以内。
2.  **开头**：使用生动的个人经历或感受引入，快速抓住用户注意力，例如"救命！这个东西也太好用了吧！"或者"不允许还有姐妹不知道这个宝藏！"
3.  **正文**：
    *   详细描述产品的使用过程、具体感受、效果变化。
    *   客观评价产品的优点和缺点，保持真实性。
    *   多使用短句和分段，段落间用空行或emoji分割线隔开。
    *   全文穿插使用至少10-15个符合小红书风格的emoji（如✨💖🎉🛍️💯）。
4.  **结尾**：用一个开放式问题引导评论区互动，例如"姐妹们还有什么好用的XXX推荐吗？"或"你们觉得这款产品怎么样呀？"
5.  **话题标签**：在笔记末尾添加3-5个相关的小红书热门话题标签，例如 #好物分享 #小红书种草 #我的日常 #生活小技巧 #护肤心得 等。
6.  **整体风格**：语言活泼、有趣、接地气，避免官方和生硬的表述。多用感叹号！`,
    
    variables: [
      { name: 'productInfo', type: 'string', required: true, description: '产品基本信息和核心卖点' },
      { name: 'useCase', type: 'string', required: false, description: '用户具体的使用场景和体验背景' },
      { name: 'preferences', type: 'string', required: false, description: '用户的个人偏好、肤质、需求等' },
      { name: 'keyFeaturesToHighlight', type: 'string', required: false, description: '希望笔记重点突出的产品特性' }
    ] as PromptVariable[],
    
    examples: [
      {
        id: 'xiaohongshu-skincare-example-1',
        input: {
          productInfo: 'ABC品牌熬夜精华，主打修复提亮，含有烟酰胺和VC成分',
          useCase: '最近经常熬夜加班，皮肤暗沉粗糙，毛孔也变大了',
          preferences: '我是混油皮，希望精华清爽不油腻，注重美白提亮效果',
          keyFeaturesToHighlight: '快速提亮肤色，改善熬夜脸'
        },
        expectedOutput: `熬夜党进来抄作业‼️这款精华真的把我的脸给救回来了！✨

呜呜呜姐妹们，最近疯狂加班赶项目，每天熬到凌晨两三点😭，皮肤状态差到爆！脸黄黄的，毛孔粗大，摸起来还特粗糙，简直没眼看！

还好闺蜜给我推荐了这款ABC熬夜精华，说是熬夜党的救星！💖 我赶紧入手试试，结果真的有被惊喜到！

它的质地是那种很清爽的精华液，流动性很好，上脸咻一下就吸收了，完全不黏腻，混油皮表示爱了爱了！我一般是晚上用，第二天早上起来就能感觉到皮肤透亮了不少，摸起来也滑嫩嫩的！坚持用了一周，之前的暗沉发黄真的改善好多，毛孔都感觉细腻了！现在就算熬夜，第二天脸蛋看起来也精神饱满，不会垮掉！💯

唯一的缺点可能就是价格对我这个吃土少女来说有点小贵😂，但效果是真滴好！强烈推荐给所有需要熬夜急救的姐妹们！

有没有姐妹用过这款呀？或者你们有什么熬夜必备神器推荐吗？评论区分享一下呗！👇

#熬夜党救星 #精华推荐 #护肤分享 #小红书护肤 #我的护肤日常`,
        explanation: '体现真实使用体验，符合小红书笔记风格，包含emoji和互动引导。',
        weight: 1.0
      }
    ] as FewShotExample[],
    
    qualityRules: [
      { id: 'xiaohongshu-authenticity', name: '真实性检查', type: 'custom', condition: { customValidator: (content: string) => content.includes('个人体验') || content.includes('真实感受') || content.includes('亲自试用') }, weight: 0.3, enabled: true },
      { id: 'xiaohongshu-emoji-usage', name: 'Emoji使用数量检查', type: 'count', condition: { pattern: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, minCount: 10, maxCount: 25 }, weight: 0.2, enabled: true },
      { id: 'xiaohongshu-hashtag-usage', name: '话题标签数量检查', type: 'count', condition: { pattern: /#([^#\s]+)/g, minCount: 3, maxCount: 5 }, weight: 0.15, enabled: true },
      { id: 'xiaohongshu-interaction-prompt', name: '互动引导检查', type: 'custom', condition: { customValidator: (content: string) => content.includes('？') || content.includes('吗') || content.includes('呀') || content.includes('呗') }, weight: 0.2, enabled: true },
      { id: 'xiaohongshu-title-length', name: '标题长度检查', type: 'length', condition: { maxLength: 20 }, weight: 0.15, enabled: true } // Assuming title is first line
    ] as QualityRule[],
    
    antiAISettings: {
      languageNaturalization: {
        enabled: true,
        sentenceVariation: { enabled: true, level: 0.8, patterns: [] }, // patterns can be pre-defined or dynamically generated
        colloquialLevel: { enabled: true, intensity: 0.7, targetExpressions: ['绝绝子', 'yyds', 'YYDS', '家人们', '宝子们', '真的会谢'] },
        emotionalNuance: { enabled: true, depth: 0.9, emotionalMarkers: ['惊喜', '感动', '超爱', '哭了', '巨好用'] }
      },
      personalizationInjection: {
        enabled: true,
        userStyleMimicry: { enabled: true, styleProfile: null, adaptationLevel: 0.7 }, // styleProfile would be dynamically set
        personalExperience: { enabled: true, experienceLevel: 0.8, contextualRelevance: 0.9 },
        uniquePerspective: { enabled: true, originalityLevel: 0.6, viewpointDiversity: 0.5 }
      },
      moderateImperfection: {
        enabled: true,
        minorInconsistency: { enabled: false, frequency: 0.02, types: ['stylistic'] }, // Keep stylistic consistency high for XHS
        naturalPauses: { enabled: true, frequency: 0.1, pauseTypes: ['嗯', '啊', '就是说'] },
        colloquialErrors: { enabled: false, frequency: 0.01, errorTypes: [] } // Avoid grammatical errors for now
      }
    } as AntiAIDetectionStrategy,
    
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    // performanceMetrics will be added by the service if enabled
  },
  // Twitter特化模板
  {
    id: 'twitter-tech-insight',
    name: 'Twitter技术观点Thread模板',
    description: '用于生成Twitter上简洁有力的技术观点Thread，适合分享深度见解并引发讨论。',
    platform: 'twitter' as PlatformId,
    category: 'opinion-sharing' as PromptCategory,
    tags: ['Twitter', '技术分享', '观点', 'Thread', '科技'],

    systemPrompt: `你是一位资深的技术专家或行业观察者，对特定技术领域有深入的洞察和独到的见解。你的表达风格简洁、有力、逻辑清晰，能够用精炼的语言阐述复杂的观点，并善于引发受众的思考和讨论。请严格遵守Twitter的平台特性。`,
    taskPrompt: `请根据用户提供的技术话题、当前趋势和个人经验，创作一个有深度、有观点的Twitter Thread。Thread应该包含多个相互关联的推文，每条推文都应言之有物，并共同构成一个完整的论述。`,
    contextPrompt: `核心技术话题：{topic}\n相关当前趋势：{trends}\n我的个人经验或观察：{experience}\n希望Thread能表达的主要观点：{mainArgument}`,
    outputPrompt: `请严格按照以下格式和要求输出Twitter Thread内容：
1.  **开篇Tweet (1/N)**：必须引人入胜，提出核心观点或问题，激发阅读兴趣。字数严格控制在280字符以内。
2.  **后续Tweets (X/N)**：每条推文都应是前一条的延续或深化，逻辑连贯。同样严格控制在280字符以内。
3.  **编号**：每条推文需在末尾用 (X/N) 格式清晰编号，例如 (1/5), (2/5)。
4.  **话题标签 (#hashtag)**：在关键推文（尤其是开篇和结尾）中加入2-3个高度相关的行业或技术标签，例如 #AI #Web3 #FutureTech。
5.  **互动引导**：在Thread的结尾推文，尝试用一个问题或号召来引导用户评论、转发或参与讨论。
6.  **简洁性**：语言务必精炼，避免冗余。善用缩写和行业常用语（如果合适）。
7.  **专业性**：保持观点的专业度和深度，提供有价值的信息。
8.  **可读性**：适当使用换行来提高短推文的可读性，但不要过度。
9.  **Emoji**：可以少量使用emoji来增强表达力，但要保持专业形象，避免过多或不相关的emoji。`,

    variables: [
      { name: 'topic', type: 'string', required: true, description: '核心技术话题' },
      { name: 'trends', type: 'string', required: false, description: '与话题相关的当前技术趋势或行业动态' },
      { name: 'experience', type: 'string', required: false, description: '分享者的个人相关经验、观察或数据' },
      { name: 'mainArgument', type: 'string', required: true, description: 'Thread希望表达的核心论点或独特观点' }
    ] as PromptVariable[],

    examples: [
      {
        id: 'twitter-ai-ethics-example-1',
        input: {
          topic: 'AI生成内容的伦理挑战',
          trends: 'AIGC技术快速发展，Deepfake和版权问题日益突出',
          experience: '参与过多个AIGC项目的伦理规范制定',
          mainArgument: '我们亟需为AIGC建立更明确的伦理边界和监管框架，以平衡创新与责任。'
        },
        expectedOutput: `1/5 AIGC的爆发式增长带来了无限可能，但也让我们不得不正视其背后的伦理困境。从Deepfake的滥用到原创内容的版权模糊，技术跑得太快，伦理建设有点跟不上了。#AI伦理 #AIGC\n\n2/5 我认为，当前最大的挑战在于如何界定AI生成内容的"所有权"与"责任"。如果AI作品侵权，谁来负责？开发者？使用者？还是AI本身（如果它有法律人格的话）？这需要法律层面的清晰界定。
\n3/5 另一个痛点是"真实性"的瓦解。当眼见不再为实时，信息的可信度将面临空前危机。我们需要更强大的检测工具，也需要提升公众的媒介素养，学会辨别真伪。#Deepfake #信息真实性
\n4/5 我参与过一些AIGC项目的伦理规范讨论，深感其中的复杂性。既要鼓励创新，避免扼杀技术发展的活力，又要防范风险，保护个体权益和社会秩序。平衡太难了！
\n5/5 总之，为AIGC建立明确的伦理边界和有效的监管框架已刻不容缓。你认为在AIGC的伦理治理上，当前最应该关注哪个方面？欢迎评论区讨论！👇 #TechEthics #ResponsibleAI`,
        explanation: '符合Twitter Thread格式，内容简洁有深度，包含编号和标签，结尾引导互动。',
        weight: 1.0
      }
    ] as FewShotExample[],

    qualityRules: [
      { id: 'twitter-char-limit', name: '单条推文字符数检查', type: 'custom', condition: { customValidator: (content: string) => content.split(/\n\d+\/\d+\s/).every(tweet => tweet.length <= 280) }, weight: 0.4, enabled: true }, // Rough check for individual tweets
      { id: 'twitter-thread-numbering', name: 'Thread编号检查', type: 'pattern', condition: { pattern: /\(\d+\/\d+\)/g }, weight: 0.2, enabled: true },
      { id: 'twitter-hashtag-usage', name: '话题标签使用检查', type: 'count', condition: { pattern: /#([^#\s]+)/g, minCount: 2, maxCount: 5 }, weight: 0.15, enabled: true },
      { id: 'twitter-conciseness', name: '简洁性检查', type: 'length', condition: { maxLength: 1500 }, weight: 0.1, enabled: true }, // Overall thread length
      { id: 'twitter-cta', name: '互动引导检查', type: 'custom', condition: { customValidator: (content: string) => content.includes('？') || content.includes('讨论') || content.includes('分享你的看法') }, weight: 0.15, enabled: true }
    ] as QualityRule[],

    antiAISettings: {
      languageNaturalization: {
        enabled: true,
        sentenceVariation: { enabled: true, level: 0.7, patterns: [] },
        colloquialLevel: { enabled: true, intensity: 0.6, targetExpressions: ['imo', 'tbh', 'fwiw', 'FWIW', 'ICYMI'] },
        emotionalNuance: { enabled: true, depth: 0.7, emotionalMarkers: [' crucial', ' essential', ' concerning'] }
      },
      personalizationInjection: {
        enabled: true,
        userStyleMimicry: { enabled: true, styleProfile: null, adaptationLevel: 0.6 },
        personalExperience: { enabled: true, experienceLevel: 0.7, contextualRelevance: 0.8 },
        uniquePerspective: { enabled: true, originalityLevel: 0.8, viewpointDiversity: 0.7 }
      },
      moderateImperfection: {
        enabled: true,
        minorInconsistency: { enabled: false, frequency: 0.01, types: [] }, // Twitter demands conciseness & accuracy
        naturalPauses: { enabled: false, frequency: 0, pauseTypes: [] }, // Not typical for written Twitter threads
        colloquialErrors: { enabled: false, frequency: 0, errorTypes: [] }
      }
    } as AntiAIDetectionStrategy,

    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  // 微信公众号特化模板
  {
    id: 'wechat-deep-analysis',
    name: '微信公众号深度分析模板',
    description: '用于生成微信公众号上逻辑严密、论据充分、见解独到的深度分析文章。',
    platform: 'wechat' as PlatformId,
    category: 'analytical-article' as PromptCategory,
    tags: ['微信公众号', '深度分析', '行业洞察', '专业内容', '长文'],

    systemPrompt: `你是一位资深的行业分析师或领域专家，拥有深厚的专业背景和独到的分析视角。你擅长从多个维度深入剖析复杂问题，用数据、案例和严谨的逻辑来支撑你的观点。你的文章旨在为读者提供有价值的深度见解。`,
    taskPrompt: `请根据用户提供的分析话题、相关数据和行业背景，撰写一篇逻辑严密、论据充分、结构清晰、见解独到的微信公众号深度分析文章。`,
    contextPrompt: `核心分析话题：{topic}\n支撑数据或案例：{data}\n相关行业背景或信息：{background}\n文章希望传达的核心观点或结论：{coreConclusion}`,
    outputPrompt: `请严格按照以下格式和要求输出微信公众号文章内容：
1.  **标题**：必须引人深思，能够概括文章核心内容，同时具有吸引力。可适当采用主副标题形式。
2.  **引言/摘要**：清晰概括文章要讨论的核心问题、主要观点和大致结构，激发阅读兴趣。
3.  **正文**：
    *   使用清晰的小标题（例如 H2, H3 级别，Markdown格式如 ## 小标题）来组织文章结构，确保逻辑层次分明。
    *   每个小标题下的论述应集中、深入，论点明确，论据充分。
    *   恰当引用数据、图表（可用文字描述代替）、案例或权威信息来支持分析。
    *   段落长度适中，便于移动端阅读。
4.  **总结/结论**：对全文的核心观点进行总结，并可提出展望、建议或引人深思的问题。
5.  **语言风格**：专业、严谨但避免过度晦涩，力求通俗易懂。保持客观中立的分析态度。
6.  **排版**：注意段落间距，关键信息可适当加粗。`,

    variables: [
      { name: 'topic', type: 'string', required: true, description: '文章需要深度分析的核心话题' },
      { name: 'data', type: 'string', required: false, description: '用于支撑观点的相关数据、图表描述、案例研究等' },
      { name: 'background', type: 'string', required: false, description: '与话题相关的行业背景、市场趋势、政策环境等信息' },
      { name: 'coreConclusion', type: 'string', required: true, description: '文章希望最终传达的核心观点或分析结论' }
    ] as PromptVariable[],

    examples: [
      {
        id: 'wechat-market-analysis-example-1',
        input: {
          topic: '2024年新能源汽车市场趋势分析',
          data: '引用了中汽协发布的销量数据，某咨询公司的市场预测报告，以及几个头部车企的财报摘要。',
          background: '全球碳中和目标，国内双积分政策，电池技术瓶颈，充电基础设施建设情况。',
          coreConclusion: '2024年新能源汽车市场将持续增长但增速放缓，市场竞争加剧，技术创新和用户体验成为关键差异化因素。'
        },
        expectedOutput: `## 2024新能源车市：冰与火之歌，谁主沉浮？

**摘要**：2024年的新能源汽车市场，注定是不平凡的一年。在经历了前几年的狂飙突进后，行业增速似乎正踩下"点刹"，而"内卷"却愈演愈烈。本文将结合最新数据与行业动态，深度剖析市场新趋势，并探讨车企的破局之道。

### 一、增速放缓，但大盘依旧向上

根据中汽协最新数据，虽然2023年新能源汽车销量再创新高，但同比增长率已较前两年有所回落。展望2024，多家市场研究机构预测，整体销量仍将保持20%-30%的增长，但"翻倍"式增长已难再现。这背后，既有政策补贴退坡的影响，也有市场渗透率达到一定水平后的自然调整。

我们必须认识到，增速放缓不代表市场饱和。从保有量来看，新能源汽车的替代空间依然巨大。关键在于，存量竞争和增量拓展的逻辑正在发生改变。

### 二、技术内卷升级：从"有没有"到"好不好"

如果说前几年是解决"有没有"的问题，那么2024年则是聚焦"好不好"的品质革命。消费者对续航里程的焦虑有所缓解后，对智能化、安全性、驾乘体验、补能效率等方面的要求越来越高。

*   **电池技术**：800V高压平台、快充技术、CTB/CTC电池车身一体化等将加速普及，能量密度与安全性的平衡仍是核心课题。
*   **智能驾驶**：城市NOA的落地竞赛将进入白热化，数据闭环和算法迭代能力成为车企的核心竞争力。
*   **智能座舱**：从堆砌屏幕到场景化智能交互，AI大模型的上车将带来新的想象空间。

### 三、价格战与价值战并行

头部车企的规模效应和供应链整合能力，使其在成本控制上拥有更大话语权，价格战仍将是获取市场份额的手段之一。但与此同时，"价值战"的比重将持续提升。品牌、服务、生态、用户运营，这些软实力将成为企业构筑护城河的关键。

例如，某头部车企近期发布的财报显示，其研发投入持续加大，服务网络也在快速扩张，这正是其应对市场竞争的底气所在。

### 四、总结与展望：创新者胜，体验为王

综上所述，2024年的新能源汽车市场，挑战与机遇并存。增速的理性回归，将促使行业从野蛮生长走向精耕细作。对于车企而言，唯有持续的技术创新、极致的用户体验和高效的成本控制，才能在这场"冰与火之歌"中笑到最后。

未来已来，谁能抓住结构性调整中的新机遇，谁就能在下半场的竞争中占据更有利的位置。您如何看待今年的新能源市场？欢迎在评论区留下您的真知灼见。
`,
        explanation: '符合微信公众号深度分析文章的结构和风格，逻辑清晰，论据合理。',
        weight: 1.0
      }
    ] as FewShotExample[],

    qualityRules: [
      { id: 'wechat-structure-check', name: '文章结构检查（引言、正文、总结）', type: 'custom', condition: { customValidator: (content: string) => content.includes('摘要') && content.includes('###') && (content.includes('总结') || content.includes('展望')) }, weight: 0.3, enabled: true },
      { id: 'wechat-heading-usage', name: '小标题使用检查', type: 'pattern', condition: { pattern: /##\s.+/g }, weight: 0.2, enabled: true },
      { id: 'wechat-word-count', name: '字数检查（800-2500字）', type: 'length', condition: { minLength: 800, maxLength: 3000 }, weight: 0.2, enabled: true }, // Adjusted max length slightly
      { id: 'wechat-data-support', name: '数据/案例支撑检查', type: 'custom', condition: { customValidator: (content: string) => content.includes('数据') || content.includes('报告') || content.includes('研究') || content.includes('案例') }, weight: 0.15, enabled: true },
      { id: 'wechat-professional-tone', name: '专业语调检查', type: 'custom', condition: { customValidator: (content: string) => !content.match(/姐妹们|宝子们|绝绝子|yyds/g) }, weight: 0.15, enabled: true }
    ] as QualityRule[],

    antiAISettings: {
      languageNaturalization: {
        enabled: true,
        sentenceVariation: { enabled: true, level: 0.6, patterns: [] },
        colloquialLevel: { enabled: true, intensity: 0.4, targetExpressions: [] }, // Less colloquial for WeChat official articles
        emotionalNuance: { enabled: true, depth: 0.6, emotionalMarkers: ['值得关注', '引发思考', '不容忽视'] }
      },
      personalizationInjection: {
        enabled: true,
        userStyleMimicry: { enabled: false, styleProfile: null, adaptationLevel: 0 }, // Generally not mimicking individual user style for official articles
        personalExperience: { enabled: true, experienceLevel: 0.5, contextualRelevance: 0.7 }, // Can include expert experience
        uniquePerspective: { enabled: true, originalityLevel: 0.9, viewpointDiversity: 0.8 }
      },
      moderateImperfection: {
        enabled: true,
        minorInconsistency: { enabled: false, frequency: 0.01, types: [] },
        naturalPauses: { enabled: true, frequency: 0.05, pauseTypes: ['首先', '其次', '然而', '因此'] },
        colloquialErrors: { enabled: false, frequency: 0, errorTypes: [] }
      }
    } as AntiAIDetectionStrategy,

    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  // 个人博客特化模板
  {
    id: 'blog-technical-deep-dive',
    name: '个人博客技术深度解析模板',
    description: '用于生成个人博客上结构清晰、内容详实、SEO友好的技术深度解析文章。',
    platform: 'blog' as PlatformId,
    category: 'technical-blog' as PromptCategory,
    tags: ['博客', '技术文章', '深度解析', '教程', 'SEO'],

    systemPrompt: `你是一位经验丰富的技术博主或领域专家，擅长将复杂的技术概念解释得清晰易懂，并能提供可操作的实践指南。你的文章结构严谨，内容详实，注重SEO优化，旨在为技术爱好者和专业人士提供高质量的学习资源。`,
    taskPrompt: `请根据用户提供的技术主题、核心概念和目标读者，撰写一篇结构清晰、内容深入、包含代码示例（如果适用）、SEO友好的技术博客文章。`,
    contextPrompt: `核心技术主题：{topic}\n需要阐释的关键概念或技术点：{coreConcepts}\n目标读者画像（例如：初学者、有经验的开发者）：{targetAudience}\n希望文章达成的目标（例如：解决特定问题、阐明原理、提供教程）：{articleGoal}`,
    outputPrompt: `请严格按照以下格式和要求输出技术博客文章内容：
1.  **标题 (H1)**：清晰、准确地反映文章主题，包含核心关键词，考虑SEO友好性。
2.  **引言/概述**：简要介绍文章将讨论的主题、重要性、主要内容和读者预期收益。
3.  **目录 (可选但推荐)**：对于长文，建议生成一个可点击的目录（例如用Markdown列表）。
4.  **正文 (使用H2, H3等小标题)**：
    *   逻辑清晰地组织内容，每个小标题下集中阐述一个技术点或方面。
    *   对核心概念进行深入浅出的解释。
    *   如果适用，提供清晰、可运行的代码示例（使用Markdown代码块格式，并指明语言）。
    *   适当使用列表、引用、加粗等方式突出重点，增强可读性。
    *   段落不宜过长，保持良好的阅读节奏。
5.  **总结/结论**：回顾文章的主要内容和核心观点，可以重申关键信息或提供进一步学习的建议。
6.  **参考资料 (可选)**：如果引用了外部资料，请列出。
7.  **SEO优化**：自然地在标题、小标题和正文中融入关键词。元描述（如果平台支持）应简洁概括文章内容。
8.  **语言风格**：专业、准确、条理清晰，同时力求易于理解。`,

    variables: [
      { name: 'topic', type: 'string', required: true, description: '博客文章的核心技术主题' },
      { name: 'coreConcepts', type: 'string', required: true, description: '文章需要详细阐述的关键技术概念、原理或步骤' },
      { name: 'targetAudience', type: 'string', required: false, defaultValue: '有一定基础的技术爱好者', description: '文章的目标读者群体' },
      { name: 'articleGoal', type: 'string', required: false, defaultValue: '深入解析核心原理并提供实践指导', description: '文章希望达成的具体目标' }
    ] as PromptVariable[],

    examples: [
      {
        id: 'blog-js-async-example-1',
        input: {
          topic: 'JavaScript异步编程深度指南',
          coreConcepts: 'Callbacks, Promises, Async/Await的原理、用法、优缺点对比以及错误处理机制。',
          targetAudience: '前端开发者，对JS异步有一定了解但希望深入掌握的开发者',
          articleGoal: '帮助读者彻底理解JS异步机制，并能在实际项目中灵活运用。'
        },
        expectedOutput: `# 深入理解JavaScript异步编程：从Callback到Async/Await\\n\\n## 引言\\nJavaScript作为一门单线程语言，异步编程是其核心特性之一，对于构建高性能、无阻塞的Web应用至关重要。本文将带你深入探索JavaScript中异步编程的演进历程，从传统的回调函数（Callbacks），到ES6引入的Promises，再到ES7带来的Async/Await语法糖，力求让你彻底搞懂它们的工作原理、使用场景及最佳实践。\\n\\n## 一、回调函数 (Callbacks)：异步的起点\\n\\n回调函数是最早用于处理异步操作的方式。简单来说，就是将一个函数（回调函数）作为参数传递给另一个函数（异步函数），当异步操作完成后，这个回调函数会被执行。\\n\\n\`\`\`javascript\\nfunction fetchData(url, callback) {\\n  console.log(\`Fetching data from \${url}...\`);\n  setTimeout(() => {\\n    const data = { userId: 1, message: \"Hello from Callback!\" };\\n    console.log(\"Data fetched!\");\\n    callback(null, data); // 第一个参数通常是error\\n  }, 1000);\\n}\\n\\nfetchData(\'/api/user\', (error, data) => {\\n  if (error) {\\n    console.error(\"Error fetching data:\", error);\\n    return;\\n  }\\n  console.log(\"Received data:\", data);\\n});\\n\`\`\`\\n\\n**优点**：简单直观。\\n**缺点**：容易形成\"回调地狱\"（Callback Hell），代码难以阅读和维护；错误处理分散。\\n\\n## 二、Promises：优雅地处理异步\\n\\nES6引入的Promise对象，为异步编程提供了一种更优雅、更强大的解决方案。Promise代表一个异步操作的最终完成（或失败）及其结果值。\\n\\n一个Promise有三种状态：\\n*   **pending**: 初始状态，既不是成功，也不是失败状态。\\n*   **fulfilled (resolved)**: 意味着操作成功完成。\\n*   **rejected**: 意味着操作失败。\\n\\n\`\`\`javascript\\nfunction fetchDataWithPromise(url) {\\n  return new Promise((resolve, reject) => {\\n    console.log(\`Fetching data from \${url} with Promise...\`);\n    setTimeout(() => {\\n      if (Math.random() > 0.2) {\\n        const data = { userId: 2, message: \"Hello from Promise!\" };\\n        console.log(\"Data fetched with Promise!\");\\n        resolve(data);\\n      } else {\\n        reject(new Error(\"Failed to fetch data with Promise\"));\\n      }\\n    }, 1000);\\n  });\\n}\\n\\nfetchDataWithPromise(\'/api/data\')\\n  .then(data => {\\n    console.log(\"Received data (Promise):\", data);\\n  })\\n  .catch(error => {\\n    console.error(\"Error (Promise):\", error.message);\\n  });\\n\`\`\`\\n\\n**优点**：链式调用（.then().catch()）解决了回调地狱问题；统一的错误处理机制。\\n**缺点**：代码理解上仍有一定心智负担，链式调用有时也会显得冗长。\\n\\n## 三、Async/Await：异步编程的终极形态？\\n\\nES7引入的Async/Await是基于Promise的语法糖，它允许我们用同步的方式编写异步代码，极大提升了代码的可读性和可维护性。\\n\\n*   \`async\` 函数：在函数声明前加上 \`async\` 关键字，表示该函数是一个异步函数，它会隐式返回一个Promise。\\n*   \`await\` 操作符：\`await\` 只能用在 \`async\` 函数内部，它会暂停异步函数的执行，等待一个Promise被解决（fulfilled或rejected），然后恢复异步函数的执行并返回Promise的解决值。\\n\\n\`\`\`javascript\\nasync function fetchDataWithAsyncAwait(url) {\\n  console.log(\`Fetching data from \${url} with Async/Await...\`);\n  try {\\n    const responsePromise = new Promise((resolve, reject) => {\\n      setTimeout(() => {\\n        if (Math.random() > 0.2) {\\n          const data = { userId: 3, message: \"Hello from Async/Await!\" };\\n          console.log(\"Data fetched with Async/Await!\");\\n          resolve(data);\\n        } else {\\n          reject(new Error(\"Failed to fetch data with Async/Await\"));\\n        }\\n      }, 1000);\\n    });\\n    const data = await responsePromise;\\n    console.log(\"Received data (Async/Await):\", data);\\n    return data;\\n  } catch (error) {\\n    console.error(\"Error (Async/Await):\", error.message);\n    throw error; // 或者处理后返回特定值\\n  }\\n}\\n\\n(async () => {\\n  await fetchDataWithAsyncAwait(\'/api/info\');\\n  console.log(\"Async/Await flow finished.\");\\n})();\\n\`\`\`\\n\\n**优点**：代码结构清晰，接近同步代码的写法，错误处理（try...catch）直观。\\n**缺点**：\`await\`会阻塞后续代码（在\`async\`函数内部），需要注意不要滥用；错误处理容易被忽略。\\n\\n## 四、总结与最佳实践\\n\\nCallbacks、Promises和Async/Await是JavaScript异步编程不同阶段的产物，各有其特点和适用场景。目前，Async/Await结合Promises是社区推荐的主流方式。\\n\\n**最佳实践**：\\n*   优先使用Async/Await处理异步逻辑，使代码更易读。\\n*   在Async/Await内部，对于不相互依赖的异步操作，可以使用\`Promise.all()\`或\`Promise.allSettled()\`并行执行以提高效率。\\n*   始终记住处理Promise的rejection，无论是通过\`.catch()\`还是\`try...catch\`。\\n\\n希望本文能帮助你更深入地理解JavaScript的异步世界！\\n\\n## 参考资料\\n*   MDN Web Docs: Asynchronous JavaScript\\n*   JavaScript.info: Promises, async/await`,\n        explanation: '符合技术博客的结构，内容深入，包含代码示例和清晰的解释。',\n        weight: 1.0
      }
    ] as FewShotExample[],

    qualityRules: [
      { id: 'blog-structure', name: '文章结构检查（引言、正文、总结）', type: 'custom', condition: { customValidator: (content: string) => content.includes('## 引言') && content.includes('## 一、') && (content.includes('## 总结') || content.includes('## 四、总结')) }, weight: 0.3, enabled: true },
      { id: 'blog-headings', name: '小标题使用检查 (H2, H3)', type: 'pattern', condition: { pattern: /##+\s.+/g }, weight: 0.2, enabled: true },
      { id: 'blog-code-blocks', name: '代码块使用检查', type: 'pattern', condition: { pattern: /```javascript|```python|```typescript|```java|```html|```css/g }, weight: 0.15, enabled: true },
      { id: 'blog-seo-keywords', name: 'SEO关键词密度检查 (粗略)', type: 'custom', condition: { customValidator: (content: string, topic?: string) => topic ? (content.toLowerCase().split(topic.toLowerCase().split(' ')[0]).length -1) > 2 : true }, weight: 0.15, enabled: true },
      { id: 'blog-readability', name: '可读性 (段落长度)', type: 'custom', condition: { customValidator: (content: string) => content.split(/\n\n/).every(p => p.length < 1500) }, weight: 0.2, enabled: true }
    ] as QualityRule[],

    antiAISettings: {
      languageNaturalization: {
        enabled: true,
        sentenceVariation: { enabled: true, level: 0.5, patterns: [] },
        colloquialLevel: { enabled: false, intensity: 0, targetExpressions: [] },
        emotionalNuance: { enabled: true, depth: 0.4, emotionalMarkers: ['值得注意的是', '一个关键点是', '重要的是'] }
      },
      personalizationInjection: {
        enabled: true,
        userStyleMimicry: { enabled: false, styleProfile: null, adaptationLevel: 0 },
        personalExperience: { enabled: true, experienceLevel: 0.6, contextualRelevance: 0.8 },
        uniquePerspective: { enabled: true, originalityLevel: 0.7, viewpointDiversity: 0.6 }
      },
      moderateImperfection: {
        enabled: false,
        minorInconsistency: { enabled: false, frequency: 0, types: [] },
        naturalPauses: { enabled: true, frequency: 0.02, pauseTypes: ['首先，', '其次，', '然而，', '因此，'] },
        colloquialErrors: { enabled: false, frequency: 0, errorTypes: [] }
      }
    } as AntiAIDetectionStrategy,

    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  // More templates for Blog, Toutiao will be added here...
]; 