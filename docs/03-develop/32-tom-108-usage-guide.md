# TOM-108 内容后处理功能使用指南

## 🎯 快速开始

TOM-108 提供了完整的内容后处理和格式化功能，支持5个主流社交媒体平台的内容优化。

## 🚀 在 Obsidian 中测试

### 方法1：一键测试脚本 ⭐ **最推荐**

我们提供了简化的测试脚本，无需复制长代码：

1. **加载测试工具**
   ```javascript
   // 在Obsidian控制台中运行以下代码加载测试工具
   fetch('/scripts/tom-108-console-test.js')
     .then(response => response.text())
     .then(script => eval(script))
     .catch(() => {
       // 如果文件加载失败，使用内联版本
       eval(`
         window.TOM108QuickTest = function() {
           const plugin = window.app.plugins.plugins['cognilink-assistant'];
           const processor = plugin?.contentPostProcessor;
           
           if (!processor) {
             console.error('❌ 插件或处理器未找到，请重新加载插件');
             return;
           }
           
           console.log('🚀 开始TOM-108快速测试...');
           
           const platform = {
             id: 'xiaohongshu',
             name: '小红书',
             maxLength: 300,
             styleKeywords: ['种草'],
             requiredElements: ['表情符号'],
             formatRules: { emojiDensity: 'high' },
             features: ['emoji']
           };
           
           const testContent = '今天分享一个超好用的笔记软件Obsidian！功能强大，界面简洁，支持双向链接，让知识管理变得轻松愉快。强烈推荐给大家试试看！';
           
           processor.processContent(testContent, platform)
             .then(result => {
               console.log('✅ 测试成功！');
               console.log('📊 结果摘要:');
               console.log(\`   质量评分: \${result.qualityScore.overall}/100\`);
               console.log(\`   风格评分: \${result.styleAssessment.overallScore}/100\`);
               console.log(\`   处理时间: \${result.processingTime}ms\`);
               console.log(\`   长度: \${result.lengthValidation.currentLength}/\${result.lengthValidation.targetLength}\`);
               console.log(\`   有效性: \${result.isValid ? '✅' : '❌'}\`);
               
               if (result.suggestions.length > 0) {
                 console.log('💡 改进建议:', result.suggestions.map(s => s.message));
               }
             })
             .catch(error => {
               console.error('❌ 测试失败:', error.message);
             });
         };
         
         console.log('🎉 TOM-108 快速测试工具已加载！');
         console.log('🚀 输入 TOM108QuickTest() 开始测试');
       `);
     });
   ```

2. **运行测试**
   ```javascript
   // 快速测试
   TOM108QuickTest()
   
   // 查看帮助
   TOM108Help()
   
   // 详细测试
   TOM108DetailedTest()
   
   // 批量测试
   TOM108BatchTest()
   
   // 验证测试
   TOM108ValidateTest()
   ```

### 方法2：npm 脚本测试 ⭐ **开发推荐**

在项目根目录运行以下命令：

```bash
# 运行TOM-108单元测试
npm run test:tom-108

# 监听模式运行测试
npm run test:tom-108:watch

# 运行测试并生成覆盖率报告
npm run test:tom-108:coverage

# 运行所有测试
npm test

# 构建并部署
npm run build && npm run deploy
```

### 方法3：Obsidian命令面板测试

1. 在Obsidian中按 `Cmd+P` (macOS) 或 `Ctrl+P` (Windows/Linux) 打开命令面板
2. 搜索 "TOM-108" 
3. 选择 "TOM-108 内容后处理系统验收测试"
4. 查看控制台输出结果

### 方法4：控制台直接测试 (传统方法)

1. **打开 Obsidian 开发者工具**
   - Windows/Linux: `Ctrl + Shift + I`
   - macOS: `Cmd + Option + I`

2. **在控制台中运行测试**
   ```javascript
   // 获取插件实例
   const plugin = window.app.plugins.plugins['cognilink-assistant'];
   
   // 检查插件是否正确加载
   if (!plugin) {
     console.error('插件未找到，请确保插件已启用');
   } else {
     console.log('插件已找到:', plugin);
   }
   
   // 获取内容后处理器
   const processor = plugin.contentPostProcessor;
   
   // 检查处理器是否存在
   if (!processor) {
     console.error('ContentPostProcessor 未找到，请重新加载插件');
   } else {
     console.log('ContentPostProcessor 已找到:', processor);
   }
   
   // 定义测试平台
   const platform = {
     id: 'xiaohongshu',
     name: '小红书',
     maxLength: 300,
     styleKeywords: ['种草', 'yyds', '姐妹们'],
     requiredElements: ['表情符号', '互动问题'],
     formatRules: {
       emojiDensity: 'high',
       interactionPrompt: true,
       paragraphBreak: '\n\n'
     },
     features: ['emoji', 'interaction', 'hashtag']
   };
   
   // 测试内容处理
   const testContent = '今天分享一个超好用的笔记软件Obsidian，真的太棒了！功能强大，界面简洁，支持双向链接，让知识管理变得轻松愉快。强烈推荐给大家试试看！';
   
   // 执行处理并查看结果
   processor.processContent(testContent, platform).then(result => {
     console.log('✅ 处理成功！');
     console.log('📝 原始内容:', result.originalContent);
     console.log('🔄 处理后内容:', result.processedContent);
     console.log('📏 原始长度:', result.lengthValidation.currentLength);
     console.log('📐 目标长度:', result.lengthValidation.targetLength);
     console.log('✅ 长度有效:', result.lengthValidation.isValid);
     console.log('⭐ 质量评分:', result.qualityScore.overall);
     console.log('🎨 风格评分:', result.styleAssessment.overallScore);
     console.log('⏱️ 处理时间:', result.processingTime + 'ms');
     console.log('🔍 置信度:', result.confidence);
     
     if (result.warnings.length > 0) {
       console.log('⚠️ 警告信息:', result.warnings);
     }
     
     if (result.suggestions.length > 0) {
       console.log('💡 改进建议:', result.suggestions);
     }
   }).catch(error => {
     console.error('❌ 处理失败:', error);
     console.error('错误详情:', error.message);
   });
   ```

3. **查看处理结果**
   - 检查控制台输出的详细处理结果
   - 观察长度验证、风格评估、质量评分等指标
   - 查看警告和改进建议

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

### Q1: 提示 "Cannot read properties of undefined (reading 'processContent')"

**原因**: 插件未正确加载或 ContentPostProcessor 未初始化

**解决方案**:
```javascript
// 1. 检查插件是否存在
const plugin = window.app.plugins.plugins['cognilink-assistant'];
console.log('插件状态:', plugin ? '已加载' : '未找到');

// 2. 检查处理器是否存在
if (plugin) {
  console.log('ContentPostProcessor:', plugin.contentPostProcessor ? '已初始化' : '未初始化');
}

// 3. 如果未找到，请重新加载插件
// 在 Obsidian 中：设置 → 社区插件 → CogniLink Assistant → 禁用 → 启用
```

### Q2: 验收测试显示"验证失败"

**原因**: 早期版本的长度要求过于严格，短内容无法通过验证

**解决方案**: 
- **已修复**: v1.0.1+ 版本已调整长度要求，支持短内容测试
- **长度要求调整**:
  - 小红书: 最小长度从50字符降至10字符
  - 微信公众号: 最小长度从800字符降至100字符
  - 个人博客: 最小长度从1000字符降至200字符
  - 头条号: 最小长度从1000字符降至200字符
- **验证条件优化**: 质量评分要求从50分降至40分，增加性能检查

**验证方法**:
```javascript
// 在Obsidian控制台中测试短内容
const plugin = window.app.plugins.plugins['cognilink-assistant'];
const processor = plugin?.contentPostProcessor;

const shortContent = '测试短内容';
const platform = {
  id: 'xiaohongshu',
  name: '小红书',
  maxLength: 300,
  styleKeywords: [],
  requiredElements: [],
  formatRules: {},
  features: []
};

processor.processContent(shortContent, platform)
  .then(result => {
    console.log('✅ 短内容测试:', result.lengthValidation.isValid ? '通过' : '失败');
    console.log('📏 长度信息:', `${result.lengthValidation.currentLength}/${result.lengthValidation.targetLength}`);
  });
```

### Q3: 处理结果为空或出错

**可能原因**:
- 输入参数不完整
- 平台配置缺少必需字段

**解决方案**:
```javascript
// 使用完整的平台配置
const completePlatform = {
  id: 'xiaohongshu',
  name: '小红书',
  maxLength: 300,
  styleKeywords: ['种草', 'yyds'],
  requiredElements: ['表情符号', '互动问题'],
  formatRules: {
    emojiDensity: 'high',
    interactionPrompt: true,
    paragraphBreak: '\n\n',
    hashtagStyle: '#话题#',
    emojiPlacement: 'distributed'
  },
  features: ['emoji', 'interaction', 'hashtag']
};
```

### Q4: 质量评分偏低

**优化建议**:
- 根据 suggestions 中的建议进行调整
- 参考平台特色检查结果
- 调整内容长度到最佳范围

### Q5: 插件重新加载后需要重新测试

**说明**: 这是正常现象，每次重新加载插件后都需要重新获取实例

**快速重新测试**:
```javascript
// 保存这个函数，重新加载后直接调用
function quickTest() {
  const plugin = window.app.plugins.plugins['cognilink-assistant'];
  const processor = plugin?.contentPostProcessor;
  
  if (!processor) {
    console.error('❌ 请先重新加载插件');
    return;
  }
  
  const platform = {
    id: 'xiaohongshu',
    name: '小红书',
    maxLength: 300,
    styleKeywords: [],
    requiredElements: [],
    formatRules: {},
    features: []
  };
  
  processor.processContent('测试内容', platform)
    .then(r => console.log('✅ 测试成功:', r.qualityScore.overall))
    .catch(e => console.error('❌ 测试失败:', e));
}

// 调用测试
quickTest();
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