# TOM-108 内容后处理功能使用指南

## 🎯 快速开始

TOM-108 提供了完整的内容后处理和格式化功能，支持5个主流社交媒体平台的内容优化。

## 🚀 在 Obsidian 中测试

### 方法1：控制台直接测试 ⭐ **推荐**

1. **打开 Obsidian 开发者工具**
   - Windows/Linux: `Ctrl + Shift + I`
   - macOS: `Cmd + Option + I`

2. **在控制台中运行测试**
   ```javascript
   // 获取插件实例
   const plugin = window.app.plugins.plugins['cognilink-assistant'];
   
   // 获取内容后处理器
   const processor = plugin.contentPostProcessor;
   
   // 定义测试平台
   const platform = {
     id: 'xiaohongshu',
     name: '小红书',
     maxLength: 300,
     features: ['emoji', 'interaction', 'hashtag']
   };
   
   // 测试内容处理
   const testContent = '今天分享一个超好用的笔记软件Obsidian，真的太棒了！功能强大，界面简洁，支持双向链接，让知识管理变得轻松愉快。强烈推荐给大家试试看！';
   
   processor.processContent(testContent, platform).then(result => {
     console.log('处理结果:', result);
     console.log('原始长度:', result.metadata.originalLength);
     console.log('处理后长度:', result.metadata.formattedLength);
     console.log('质量评分:', result.qualityScore.overall);
     console.log('风格评分:', result.styleAssessment.overallScore);
   });
   ```

3. **查看处理结果**
   - 检查控制台输出的详细处理结果
   - 观察长度验证、风格评估、质量评分等指标
   - 查看警告和改进建议

### 方法2：批量处理测试

```javascript
// 批量处理多个内容
const contents = [
  {
    content: '短内容测试',
    platform: { id: 'xiaohongshu', name: '小红书', maxLength: 300 },
    id: 'test1'
  },
  {
    content: '这是一个比较长的内容，用来测试长度处理和截断功能。我们需要确保内容在处理后能够符合平台的长度要求，同时保持语义的完整性和可读性。',
    platform: { id: 'twitter', name: 'Twitter', maxLength: 280 },
    id: 'test2'
  }
];

processor.batchProcess(contents, {
  concurrency: 2,
  failFast: false,
  retryCount: 1
}).then(result => {
  console.log('批量处理结果:', result);
  console.log('成功处理:', result.successful.length);
  console.log('处理失败:', result.failed.length);
});
```

### 方法3：内容验证测试

```javascript
// 验证内容是否符合平台要求
const validation = processor.validateContent(testContent, platform);

console.log('验证结果:', validation);
console.log('是否有效:', validation.isValid);
console.log('需要审查:', validation.needsReview);
console.log('置信度:', validation.confidence);

if (validation.warnings.length > 0) {
  console.log('警告信息:', validation.warnings);
}

if (validation.suggestions.length > 0) {
  console.log('改进建议:', validation.suggestions);
}
```

## 📱 平台特定测试

### 小红书测试
```javascript
const xiaohongshuPlatform = {
  id: 'xiaohongshu',
  name: '小红书',
  maxLength: 300,
  features: ['emoji', 'interaction', 'hashtag']
};

const xiaohongshuContent = '姐妹们！今天要给大家安利一个超级好用的工具！真的是宝藏发现，用了之后效率提升了好多，强烈推荐给大家试试看！你们觉得怎么样？';

processor.processContent(xiaohongshuContent, xiaohongshuPlatform).then(result => {
  console.log('小红书处理结果:', result);
  // 检查是否包含表情符号、亲切称呼、互动元素
});
```

### Twitter测试
```javascript
const twitterPlatform = {
  id: 'twitter',
  name: 'Twitter',
  maxLength: 280,
  features: ['hashtag', 'mention', 'thread']
};

const twitterContent = '刚刚发现了一个超棒的知识管理工具 Obsidian！支持双向链接、插件扩展，完全改变了我的笔记方式。对于需要整理复杂信息的朋友来说，这绝对是神器级别的存在。#生产力工具 #笔记软件 #知识管理';

processor.processContent(twitterContent, twitterPlatform).then(result => {
  console.log('Twitter处理结果:', result);
  // 检查字符数限制、标签使用
});
```

### 微信公众号测试
```javascript
const wechatPlatform = {
  id: 'wechat',
  name: '微信公众号',
  maxLength: 1500,
  features: ['heading', 'structure', 'professional']
};

const wechatContent = `
## 知识管理的新时代

在信息爆炸的今天，如何有效管理和组织知识成为了每个人都需要面对的挑战。传统的笔记方式已经无法满足现代人的需求。

## Obsidian：重新定义笔记

Obsidian作为新一代知识管理工具，通过双向链接技术，让知识点之间建立有机联系，形成知识网络。

## 核心优势

1. 双向链接技术
2. 插件生态丰富
3. 本地存储安全
4. 可视化知识图谱

这些特性使得Obsidian在众多笔记软件中脱颖而出，成为知识工作者的首选工具。
`;

processor.processContent(wechatContent, wechatPlatform).then(result => {
  console.log('微信公众号处理结果:', result);
  // 检查结构化内容、小标题、专业深度
});
```

## 🔧 配置和自定义

### 自定义处理选项
```javascript
const customOptions = {
  strictMode: true,        // 严格模式
  autoFix: true,          // 自动修复
  preserveOriginal: false, // 不保留原始内容
  customRules: {
    lengthRules: {
      minLength: 50,
      maxLength: 500,
      optimalLength: 300
    },
    styleRules: {
      requiredElements: ['emoji', 'hashtag'],
      toneKeywords: ['专业', '友好']
    }
  }
};

processor.processContent(testContent, platform, customOptions).then(result => {
  console.log('自定义处理结果:', result);
});
```

### 缓存管理
```javascript
// 清理处理缓存
processor.clearCache();
console.log('缓存已清理');

// 更新配置
processor.updateConfiguration({
  enableCache: true,
  cacheTimeout: 300000, // 5分钟
  maxCacheSize: 100
});
console.log('配置已更新');
```

## 📊 结果解读

### 处理结果结构
```javascript
{
  originalContent: "原始内容",
  processedContent: "处理后内容",
  platform: { /* 平台信息 */ },
  
  // 长度验证结果
  lengthValidation: {
    isValid: true,
    currentLength: 150,
    targetLength: 300,
    exceedsLimit: false
  },
  
  // 风格评估结果
  styleAssessment: {
    overallScore: 75,      // 总体风格评分
    platformFit: 80,       // 平台适配度
    toneConsistency: 70,   // 语调一致性
    improvements: ["建议添加表情符号", "增加互动元素"]
  },
  
  // 质量评分结果
  qualityScore: {
    overall: 78,           // 总体质量
    originality: 85,       // 原创性
    readability: 75,       // 可读性
    engagement: 70,        // 参与度预测
    platformOptimization: 80 // 平台优化度
  },
  
  // 元数据
  metadata: {
    processingTime: 45,    // 处理时间(ms)
    appliedRules: ["长度检查", "风格优化", "格式化"],
    originalLength: 120,
    formattedLength: 150
  },
  
  // 状态信息
  isValid: true,           // 是否有效
  needsReview: false,      // 是否需要审查
  confidence: 0.85,        // 置信度
  
  // 警告和建议
  warnings: [],
  suggestions: [
    {
      type: "improvement",
      message: "建议增加表情符号密度",
      impact: 3
    }
  ]
}
```

### 评分标准
- **90-100分**: 优秀，完全符合平台要求
- **80-89分**: 良好，基本符合要求，有小幅改进空间
- **70-79分**: 中等，需要一定优化
- **60-69分**: 及格，需要较多改进
- **60分以下**: 不合格，需要大幅修改

## 🐛 常见问题

### Q1: 处理结果为空或出错
**解决方案**:
```javascript
// 检查插件是否正确加载
if (!plugin || !plugin.contentPostProcessor) {
  console.error('插件未正确加载');
  return;
}

// 检查输入参数
if (!testContent || !platform) {
  console.error('输入参数不完整');
  return;
}
```

### Q2: 质量评分偏低
**可能原因**:
- 内容长度不符合平台要求
- 缺少平台特色元素（如表情符号、标签等）
- 语言风格不匹配平台调性

**优化建议**:
- 根据suggestions中的建议进行调整
- 参考平台特色检查结果
- 调整内容长度到最佳范围

### Q3: 批量处理部分失败
**解决方案**:
```javascript
// 检查失败的项目
result.failed.forEach(item => {
  console.log('失败项目:', item.id);
  console.log('错误信息:', item.error);
});

// 重试失败的项目
const retryItems = result.failed.map(item => item.input);
processor.batchProcess(retryItems, { retryCount: 2 });
```

## 🎯 最佳实践

### 1. 内容优化建议
- **小红书**: 多用表情符号，语言亲切，增加互动问题
- **Twitter**: 控制字符数，合理使用标签，保持简洁
- **微信公众号**: 结构化内容，添加小标题，保持专业性
- **个人博客**: 技术深度，代码示例，完整的参考资料
- **头条号**: 吸引人的标题，通俗易懂，引发讨论

### 2. 性能优化
- 使用批量处理提高效率
- 合理利用缓存机制
- 避免频繁的配置更新

### 3. 错误处理
- 始终检查处理结果的有效性
- 根据警告和建议进行内容优化
- 对失败的处理进行重试

---

## 📞 技术支持

如遇到问题，请：
1. 检查控制台错误信息
2. 确认插件正确加载
3. 验证输入参数完整性
4. 参考本指南的示例代码

**文档版本**: v1.0.0  
**最后更新**: 2024年12月 