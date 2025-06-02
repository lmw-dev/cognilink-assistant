# TOM-117 核心模板管理系统验证指南

## 📋 验证概述

本指南详细说明如何在 Obsidian 中验证 TOM-117 核心模板管理系统的功能。

### 验收标准
- ✅ 所有核心 CRUD 操作正常工作
- ✅ 分层 Prompt 架构正确实现
- ✅ 类型安全和错误处理完善
- ✅ 性能监控和事件系统有效
- ✅ 与现有系统完全兼容

## 🚀 快速验证

### 1. 构建验证
```bash
# 确保项目可以正常构建
npm run build

# 预期结果：无错误，无警告
# ✅ TypeScript 编译成功
# ✅ ESBuild 打包成功
```

### 2. 服务初始化验证
在 Obsidian 开发者控制台中运行：

```typescript
// 检查服务是否正确初始化
console.log('[Verification] PromptModuleService status:', 
  app.plugins.plugins['cognilink-assistant']?.promptModuleService?.getStatus()
);

// 预期结果：'ready'
```

## 🔍 详细功能验证

### 3. 模板 CRUD 操作

#### 3.1 创建模板
```typescript
const promptService = app.plugins.plugins['cognilink-assistant'].promptModuleService;

// 创建测试模板
const templateData = {
  name: "技术博客模板",
  description: "用于创建技术博客的高级模板",
  platform: "blog",
  category: "technical-blog",
  tags: ["技术", "博客", "教程"],
  
  // 分层 Prompt 结构
  systemPrompt: `你是一个资深的技术博客专家，擅长将复杂的技术概念用通俗易懂的方式解释。
你的写作风格：
- 逻辑清晰，结构分明
- 善用代码示例和图表
- 注重实用性和可操作性`,

  taskPrompt: `请创建一篇关于 {topic} 的技术博客文章。
要求：
1. 标题醒目且准确反映内容
2. 包含完整的技术实现步骤
3. 提供可运行的代码示例
4. 总结实际应用场景`,

  contextPrompt: `技术主题：{topic}
目标读者：{audience}
技术深度：{level}
文章长度：{length}`,

  outputPrompt: `输出格式要求：
- 使用 Markdown 格式
- 代码块必须标注语言类型
- 包含目录结构
- 文章字数控制在 {length} 范围内
- 确保技术准确性和可执行性`,

  variables: [
    {
      name: "topic",
      type: "string",
      required: true,
      description: "技术主题"
    },
    {
      name: "audience", 
      type: "string",
      required: false,
      defaultValue: "中级开发者",
      description: "目标读者群体"
    },
    {
      name: "level",
      type: "string", 
      required: false,
      defaultValue: "中级",
      description: "技术深度级别"
    },
    {
      name: "length",
      type: "string",
      required: false, 
      defaultValue: "2000-3000字",
      description: "文章长度要求"
    }
  ],

  examples: [
    {
      id: "example-1",
      input: {
        topic: "React Hooks 最佳实践",
        audience: "前端开发者",
        level: "中高级", 
        length: "3000字"
      },
      expectedOutput: "# React Hooks 最佳实践指南\n\n## 目录\n1. useState 优化技巧\n2. useEffect 依赖管理...",
      explanation: "演示如何为前端开发者创建 React 技术文章",
      weight: 0.8
    }
  ]
};

// 执行创建
try {
  const templateId = await promptService.createTemplate(templateData);
  console.log('✅ 模板创建成功，ID:', templateId);
  
  // 验证创建结果
  const createdTemplate = await promptService.getTemplate(templateId);
  console.log('✅ 模板数据验证:', {
    name: createdTemplate.name,
    platform: createdTemplate.platform,
    layerCount: [
      createdTemplate.systemPrompt,
      createdTemplate.taskPrompt, 
      createdTemplate.contextPrompt,
      createdTemplate.outputPrompt
    ].filter(Boolean).length,
    variableCount: createdTemplate.variables.length
  });

} catch (error) {
  console.error('❌ 模板创建失败:', error);
}
```

#### 3.2 查询和搜索
```typescript
// 获取所有模板
const allTemplates = await promptService.getTemplates();
console.log('✅ 总模板数:', allTemplates.length);

// 按平台筛选
const blogTemplates = await promptService.getTemplatesByPlatform('blog');
console.log('✅ 博客模板数:', blogTemplates.length);

// 按分类筛选  
const techTemplates = await promptService.getTemplatesByCategory('technical-blog');
console.log('✅ 技术博客模板数:', techTemplates.length);

// 搜索模板
const searchResults = await promptService.searchTemplates('技术');
console.log('✅ 搜索结果数:', searchResults.length);

// 高级搜索（包含内容搜索）
const advancedResults = await promptService.searchTemplates('React', {
  searchFields: ['name', 'description', 'tags', 'content'],
  maxResults: 10
});
console.log('✅ 高级搜索结果:', advancedResults.length);
```

#### 3.3 更新和删除
```typescript
// 更新模板
const templateId = 'your-template-id'; // 使用实际创建的模板ID

await promptService.updateTemplate(templateId, {
  description: "更新后的描述",
  tags: ["技术", "博客", "教程", "更新"]
});
console.log('✅ 模板更新成功');

// 克隆模板
const clonedId = await promptService.cloneTemplate(templateId, "技术博客模板 (副本)");
console.log('✅ 模板克隆成功，新ID:', clonedId);

// 删除克隆的模板
await promptService.deleteTemplate(clonedId);
console.log('✅ 模板删除成功');
```

### 4. 高级功能验证

#### 4.1 性能监控
```typescript
// 获取模板性能报告
const report = await promptService.generateTemplatePerformanceReport(templateId);
console.log('✅ 性能报告:', {
  aiDetectionScore: report.metrics.aiDetectionScore,
  platformFitScore: report.metrics.platformFitScore,
  totalUsages: report.usage.totalUsages
});

// 获取统计信息
const stats = await promptService.getDetailedStatistics();
console.log('✅ 系统统计:', {
  totalTemplates: stats.totalTemplates,
  moduleStatus: stats.moduleInfo.status,
  performanceMetricsCount: stats.moduleInfo.performanceMetricsCount
});
```

#### 4.2 推荐系统
```typescript
// 获取推荐模板
const recommendations = await promptService.getRecommendedTemplates('blog', 'technical-blog', 5);
console.log('✅ 推荐模板数:', recommendations.length);
console.log('推荐列表:', recommendations.map(t => ({
  name: t.name,
  usageCount: t.usageCount,
  category: t.category
})));
```

#### 4.3 批量操作
```typescript
// 批量创建测试模板
const batchTemplates = [
  {
    name: "小红书种草模板",
    platform: "xiaohongshu",
    category: "product-review",
    systemPrompt: "你是小红书种草达人",
    taskPrompt: "写一篇关于{product}的种草笔记",
    contextPrompt: "产品：{product}",
    outputPrompt: "确保真实体验，避免过度营销",
    usageCount: 0
  },
  {
    name: "Twitter 观点分享模板", 
    platform: "twitter",
    category: "opinion-sharing",
    systemPrompt: "你是社交媒体意见领袖",
    taskPrompt: "分享关于{topic}的独特观点",
    contextPrompt: "话题：{topic}",
    outputPrompt: "保持简洁，140字以内",
    usageCount: 0
  }
];

const batchResult = await promptService.batchOperation(
  'create',
  batchTemplates,
  (template) => promptService.createTemplate(template)
);

console.log('✅ 批量创建结果:', {
  成功: batchResult.successful.length,
  失败: batchResult.failed.length
});
```

### 5. 导入导出验证

#### 5.1 导出功能
```typescript
// 导出所有模板
const exportedJson = await promptService.exportTemplates();
console.log('✅ 导出成功，数据长度:', exportedJson.length);

// 导出特定格式
const csvExport = await promptService.exportTemplates(null, {
  format: 'csv',
  includeMetadata: false
});
console.log('✅ CSV 导出成功');
```

#### 5.2 导入功能
```typescript
// 准备导入数据
const importData = JSON.stringify([
  {
    name: "导入测试模板",
    platform: "blog", 
    category: "custom",
    systemPrompt: "测试系统提示",
    taskPrompt: "测试任务提示",
    contextPrompt: "测试上下文",
    outputPrompt: "测试输出要求",
    variables: [],
    examples: [],
    qualityRules: [],
    antiAISettings: {
      languageNaturalization: { enabled: true, sentenceVariation: 0.7, colloquialLevel: 0.5, emotionalNuance: 0.6 },
      personalizationInjection: { enabled: true, userStyleMimicry: true, personalExperience: true, uniquePerspective: true },
      moderateImperfection: { enabled: true, minorInconsistency: 0.03, naturalPauses: true, colloquialErrors: false }
    },
    version: "1.0.0",
    tags: ["导入", "测试"],
    usageCount: 0
  }
]);

// 执行导入
const importedIds = await promptService.importTemplates(importData);
console.log('✅ 导入成功，模板IDs:', importedIds);
```

### 6. 事件系统验证

```typescript
// 添加事件监听器
const eventListener = (event) => {
  console.log('📢 事件触发:', {
    type: event.type,
    timestamp: event.timestamp,
    data: event.data
  });
};

promptService.addEventListener(eventListener);

// 执行一些操作来触发事件
const testId = await promptService.createTemplate({
  name: "事件测试模板",
  platform: "blog",
  category: "custom", 
  systemPrompt: "测试",
  taskPrompt: "测试",
  contextPrompt: "测试",
  outputPrompt: "测试",
  usageCount: 0
});

// 预期看到 'template-created' 事件

// 清理
setTimeout(() => {
  promptService.removeEventListener(eventListener);
  promptService.deleteTemplate(testId);
}, 1000);
```

### 7. 错误处理验证

```typescript
// 测试各种错误情况
try {
  // 无效模板数据
  await promptService.createTemplate({
    name: "", // 空名称应该失败
    platform: "blog",
    category: "custom",
    systemPrompt: "",
    taskPrompt: "",
    contextPrompt: "",
    outputPrompt: "",
    usageCount: 0
  });
} catch (error) {
  console.log('✅ 错误处理正常:', error.message);
}

try {
  // 获取不存在的模板
  await promptService.getTemplate('non-existent-id');
} catch (error) {
  console.log('✅ 不存在模板处理正常');
}

try {
  // 删除不存在的模板
  await promptService.deleteTemplate('non-existent-id');
} catch (error) {
  console.log('✅ 删除错误处理正常:', error.message);
}
```

## 📊 验证检查清单

### 基础功能 ✅
- [ ] 模板创建功能正常
- [ ] 模板读取功能正常  
- [ ] 模板更新功能正常
- [ ] 模板删除功能正常
- [ ] 模板搜索功能正常
- [ ] 模板筛选功能正常

### 高级功能 ✅
- [ ] 分层 Prompt 架构正确实现
- [ ] 性能监控数据准确
- [ ] 推荐系统工作正常
- [ ] 批量操作功能完善
- [ ] 导入导出功能正常
- [ ] 事件系统响应及时

### 质量保证 ✅  
- [ ] TypeScript 类型检查通过
- [ ] 错误处理覆盖完整
- [ ] 内存使用控制合理
- [ ] 缓存机制有效
- [ ] 数据持久化稳定

### 兼容性 ✅
- [ ] 与现有设置系统集成
- [ ] 与质量评估器兼容
- [ ] 支持简单模板迁移
- [ ] Obsidian API 正确使用

## 🔧 故障排除

### 常见问题

1. **模板创建失败**
   - 检查必填字段是否完整
   - 验证 platform 和 category 值是否有效
   - 确认 antiAISettings 结构正确

2. **性能数据不显示**
   - 确认 enablePerformanceMonitoring 设置为 true
   - 检查模板是否有足够的使用历史

3. **搜索结果为空**
   - 确认搜索关键词拼写正确
   - 检查是否有匹配的模板存在
   - 尝试使用更通用的搜索词

4. **导入失败**
   - 验证 JSON 格式是否正确
   - 检查必需字段是否完整
   - 确认数据结构符合 AdvancedPromptTemplate 接口

## 📈 性能基准

期望的性能指标：
- 模板创建：< 100ms
- 模板查询：< 50ms
- 搜索操作：< 200ms
- 批量操作：< 500ms/个
- 导出操作：< 1s (100个模板)

## 🎯 下一步

验证完成后，可以开始：
1. TOM-118 智能质量评估系统的开发
2. 与现有 UI 组件的集成测试
3. 用户体验优化和性能调优

---

**验证完成标志**: 所有检查清单项目都通过 ✅ 