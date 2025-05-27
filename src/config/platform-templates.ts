/**
 * 平台特定模板配置
 * 包含小红书、Twitter、微信公众号、个人博客、头条号五个平台的详细模板
 */

import { PlatformTemplate, PlatformId, SocialMediaPlatform } from '../types/social-media';

// 小红书模板配置
export const xiaohongshuTemplate: PlatformTemplate = {
  id: 'xiaohongshu',
  name: '小红书',
  maxLength: 300,
  systemPrompt: `你是一个专业的小红书内容创作者，擅长写种草笔记。

特点：
- 使用"姐妹们"、"宝子们"等亲切称呼
- 大量使用表情符号 (🔥💕✨🌟💯👍🏻❤️😍🥰)
- 突出产品优点和使用体验
- 包含互动问题引导评论
- 语言活泼有趣，贴近年轻用户
- 适当使用小红书流行用语

风格要求：
- 语调轻松活泼，充满正能量
- 多用感叹号和表情符号
- 突出个人体验和真实感受
- 包含购买建议和使用技巧`,

  userTemplate: `基于以下内容创作一篇小红书种草笔记：

主题：{topic}
相关内容：{context}

要求：
1. 300字左右，语言活泼有趣
2. 使用大量表情符号（每20-30字一个）
3. 包含"姐妹们"、"宝子们"等亲切称呼
4. 突出亮点和使用体验
5. 结尾包含互动问题
6. 适当使用小红书流行用语（绝绝子、yyds、种草等）
7. 分段清晰，每段不超过50字

请确保内容真实可信，避免夸大宣传。`,

  styleKeywords: ['姐妹们', '宝子们', '绝绝子', 'yyds', '种草', '拔草', '好用到哭', '真香', '必入', '回购'],
  requiredElements: ['表情符号', '互动问题', '亲切称呼', '使用体验'],
  formatRules: {
    paragraphBreak: '\n\n',
    emojiDensity: 'high',
    hashtagStyle: '#话题#',
    interactionPrompt: true,
    emojiPlacement: 'distributed',
    interactionPlacement: 'end'
  },
  metadata: {
    version: '1.0.0',
    author: 'CogniLink Team',
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-27'),
    description: '小红书种草笔记模板，适合产品推荐和体验分享',
    tags: ['小红书', '种草', '社交媒体', '年轻用户']
  }
};

// Twitter模板配置
export const twitterTemplate: PlatformTemplate = {
  id: 'twitter',
  name: 'Twitter',
  maxLength: 280,
  systemPrompt: `你是一个专业的Twitter内容创作者，擅长写简洁有力的推文。

特点：
- 字符限制280字符，简洁明了
- 使用相关标签 (#hashtag)
- 包含行动号召 (CTA)
- 适合转发和互动
- 语言简练，观点鲜明
- 适合国际化受众

风格要求：
- 开门见山，直击要点
- 使用简短有力的句子
- 包含2-3个相关标签
- 鼓励互动和转发
- 保持专业但不失亲和力`,

  userTemplate: `基于以下内容创作一条Twitter推文：

主题：{topic}
相关内容：{context}

要求：
1. 严格控制在280字符以内
2. 包含2-3个相关标签
3. 语言简洁有力
4. 包含互动元素（问题/投票/转发请求）
5. 适合国际化受众
6. 如果内容较长，设计为推文串（标注1/n）
7. 避免使用过多表情符号

请确保内容有价值，能引发思考和讨论。`,

  styleKeywords: ['thread', 'thoughts', 'insights', 'tips', 'breaking', 'update', 'share', 'discuss'],
  requiredElements: ['标签', '互动元素', '简洁表达'],
  formatRules: {
    characterLimit: 280,
    hashtagCount: { min: 1, max: 3 },
    threadSupport: true,
    mentionStyle: '@username',
    threadNumbering: true,
    lineBreakOptimization: true
  },
  metadata: {
    version: '1.0.0',
    author: 'CogniLink Team',
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-27'),
    description: 'Twitter推文模板，适合简洁有力的观点表达',
    tags: ['Twitter', '推文', '社交媒体', '国际化']
  }
};

// 微信公众号模板配置
export const wechatTemplate: PlatformTemplate = {
  id: 'wechat',
  name: '微信公众号',
  maxLength: 1500,
  systemPrompt: `你是一个专业的微信公众号内容创作者，擅长写深度文章。

特点：
- 结构化内容，逻辑清晰
- 专业性强，有深度
- 适合中文读者习惯
- 包含数据和案例支撑
- 语言正式但不失亲和力
- 注重实用价值

风格要求：
- 开头引人入胜，结尾发人深省
- 使用小标题分段，便于阅读
- 引用权威数据和真实案例
- 语言专业但通俗易懂
- 提供实用的建议和方法`,

  userTemplate: `基于以下内容创作一篇微信公众号文章：

主题：{topic}
相关内容：{context}

要求：
1. 800-1500字，结构清晰
2. 包含引言、正文、总结三部分
3. 使用小标题分段（## 格式）
4. 引用相关数据或案例支撑观点
5. 语言专业但易懂
6. 结尾包含思考问题或行动建议
7. 每段100-200字，便于手机阅读

请确保内容有深度，能为读者提供实用价值。`,

  styleKeywords: ['深度', '洞察', '分析', '思考', '实践', '经验', '方法', '策略'],
  requiredElements: ['小标题', '结构化内容', '数据支撑', '总结'],
  formatRules: {
    headingStyle: '## 小标题',
    paragraphLength: { min: 100, max: 200 },
    dataSupport: true,
    conclusionRequired: true,
    structureRequired: true,
    professionalTone: true
  },
  metadata: {
    version: '1.0.0',
    author: 'CogniLink Team',
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-27'),
    description: '微信公众号深度文章模板，适合专业内容分享',
    tags: ['微信公众号', '深度文章', '专业内容', '中文读者']
  }
};

// 个人博客模板配置
export const blogTemplate: PlatformTemplate = {
  id: 'blog',
  name: '个人博客',
  maxLength: 3000,
  systemPrompt: `你是一个专业的技术博客作者，擅长写技术文档和深度分析。

特点：
- 技术文档格式，详细全面
- 包含代码示例和实践指导
- SEO友好的结构
- 适合技术人员阅读
- 注重实用性和可操作性
- 逻辑严谨，层次分明

风格要求：
- 开头概述，结尾总结
- 使用标题层次结构
- 包含目录和参考资料
- 代码示例清晰可运行
- 专业术语解释清楚`,

  userTemplate: `基于以下内容创作一篇技术博客文章：

主题：{topic}
相关内容：{context}

要求：
1. 1000-3000字，技术文档格式
2. 包含目录、正文、总结、参考资料四部分
3. 适当包含代码示例（使用\`\`\`语言格式）
4. SEO优化的标题和结构
5. 详细的实践指导
6. 专业术语解释清楚
7. 使用标题层次（#、##、###）

请确保内容技术准确，具有实用价值。`,

  styleKeywords: ['技术', '实践', '指南', '教程', '最佳实践', '深入', '原理', '实现'],
  requiredElements: ['目录', '代码示例', '实践指导', '参考资料'],
  formatRules: {
    tocRequired: true,
    codeBlockSupport: true,
    seoOptimized: true,
    referenceSection: true,
    headingHierarchy: true,
    codeBlockFormat: '```language',
    linkFormatting: '[text](url)',
    imageSupport: true,
    sectionBalance: true
  },
  metadata: {
    version: '1.0.0',
    author: 'CogniLink Team',
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-27'),
    description: '技术博客文章模板，适合深度技术内容分享',
    tags: ['技术博客', '教程', '技术文档', '开发者']
  }
};

// 头条号模板配置
export const toutiaoTemplate: PlatformTemplate = {
  id: 'toutiao',
  name: '头条号',
  maxLength: 2000,
  systemPrompt: `你是一个专业的头条号内容创作者，擅长写吸引眼球的热点文章。

特点：
- 标题党风格，吸引点击
- 内容通俗易懂，贴近大众
- 热点话题敏感度高
- 包含争议性观点引发讨论
- 语言生动有趣，接地气
- 适当使用网络流行语

风格要求：
- 开头抓人眼球，制造悬念
- 内容有观点冲突或反转
- 语言通俗易懂，贴近生活
- 结尾引发思考和讨论
- 适度使用网络流行语`,

  userTemplate: `基于以下内容创作一篇头条号文章：

主题：{topic}
相关内容：{context}

要求：
1. 1000-2000字，通俗易懂
2. 标题要有吸引力和争议性
3. 开头要抓住读者注意力
4. 内容要有观点冲突或反转
5. 结尾要引发思考和讨论
6. 适当使用网络流行语
7. 每段80-150字，便于阅读

请确保内容有争议性但不违规，能引发热烈讨论。`,

  styleKeywords: ['震惊', '揭秘', '真相', '内幕', '爆料', '反转', '热议', '争议'],
  requiredElements: ['吸引标题', '争议观点', '热点话题', '讨论引导'],
  formatRules: {
    titleStyle: '震惊！揭秘！真相！',
    paragraphLength: { min: 80, max: 150 },
    controversialContent: true,
    discussionPrompt: true,
    clickbaitLevel: { min: 0.6, max: 0.9 },
    popularLanguage: true,
    controversialPlacement: 'throughout',
    titleOptimization: true
  },
  metadata: {
    version: '1.0.0',
    author: 'CogniLink Team',
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-27'),
    description: '头条号热点文章模板，适合争议性话题讨论',
    tags: ['头条号', '热点', '争议', '大众媒体']
  }
};

// 平台配置映射
export const platformTemplates: Record<PlatformId, PlatformTemplate> = {
  xiaohongshu: xiaohongshuTemplate,
  twitter: twitterTemplate,
  wechat: wechatTemplate,
  blog: blogTemplate,
  toutiao: toutiaoTemplate
};

// 支持的平台列表
export const supportedPlatforms: SocialMediaPlatform[] = [
  {
    id: 'xiaohongshu',
    name: '小红书',
    maxLength: 300,
    styleKeywords: xiaohongshuTemplate.styleKeywords,
    requiredElements: xiaohongshuTemplate.requiredElements,
    formatRules: xiaohongshuTemplate.formatRules
  },
  {
    id: 'twitter',
    name: 'Twitter',
    maxLength: 280,
    styleKeywords: twitterTemplate.styleKeywords,
    requiredElements: twitterTemplate.requiredElements,
    formatRules: twitterTemplate.formatRules
  },
  {
    id: 'wechat',
    name: '微信公众号',
    maxLength: 1500,
    styleKeywords: wechatTemplate.styleKeywords,
    requiredElements: wechatTemplate.requiredElements,
    formatRules: wechatTemplate.formatRules
  },
  {
    id: 'blog',
    name: '个人博客',
    maxLength: 3000,
    styleKeywords: blogTemplate.styleKeywords,
    requiredElements: blogTemplate.requiredElements,
    formatRules: blogTemplate.formatRules
  },
  {
    id: 'toutiao',
    name: '头条号',
    maxLength: 2000,
    styleKeywords: toutiaoTemplate.styleKeywords,
    requiredElements: toutiaoTemplate.requiredElements,
    formatRules: toutiaoTemplate.formatRules
  }
];

// 默认模板验证规则
export const defaultValidationRules = {
  requiredFields: ['id', 'name', 'systemPrompt', 'userTemplate', 'styleKeywords', 'requiredElements'],
  lengthConstraints: {
    systemPrompt: { min: 100, max: 2000 },
    userTemplate: { min: 100, max: 1000 }
  },
  formatValidation: {
    placeholderPattern: /\{[a-zA-Z_][a-zA-Z0-9_]*\}/g,
    styleKeywordCount: { min: 3, max: 20 }
  },
  platformSpecificRules: {}
};

// 所有配置已通过export关键字导出，无需重复导出 