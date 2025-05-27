/**
 * TOM-108 内容后处理系统 - 简化控制台测试脚本
 * 
 * 使用方法：
 * 1. 在Obsidian中打开开发者工具 (Cmd+Option+I 或 Ctrl+Shift+I)
 * 2. 复制粘贴以下代码到控制台
 * 3. 运行测试
 */

// 快速测试函数
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
      console.log(`   质量评分: ${result.qualityScore.overall}/100`);
      console.log(`   风格评分: ${result.styleAssessment.overallScore}/100`);
      console.log(`   处理时间: ${result.processingTime}ms`);
      console.log(`   长度: ${result.lengthValidation.currentLength}/${result.lengthValidation.targetLength}`);
      console.log(`   有效性: ${result.isValid ? '✅' : '❌'}`);
      
      if (result.suggestions.length > 0) {
        console.log('💡 改进建议:', result.suggestions.map(s => s.message));
      }
    })
    .catch(error => {
      console.error('❌ 测试失败:', error.message);
    });
};

// 详细测试函数
window.TOM108DetailedTest = function() {
  const plugin = window.app.plugins.plugins['cognilink-assistant'];
  const processor = plugin?.contentPostProcessor;
  
  if (!processor) {
    console.error('❌ 插件或处理器未找到，请重新加载插件');
    return;
  }
  
  console.log('🔬 开始TOM-108详细测试...');
  
  const platforms = [
    {
      id: 'xiaohongshu',
      name: '小红书',
      maxLength: 300,
      styleKeywords: ['种草', 'yyds'],
      requiredElements: ['表情符号'],
      formatRules: { emojiDensity: 'high' },
      features: ['emoji', 'interaction']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      maxLength: 280,
      styleKeywords: ['简洁'],
      requiredElements: ['标签'],
      formatRules: { hashtagStyle: '#话题' },
      features: ['hashtag']
    }
  ];
  
  const testContents = [
    '短内容测试',
    '这是一个中等长度的内容，用来测试处理器的基本功能。包含了一些基本的文本内容，可以验证长度处理、风格评估等功能是否正常工作。',
    '这是一个非常长的内容，'.repeat(20) + '用来测试智能截断功能。'
  ];
  
  let testCount = 0;
  let successCount = 0;
  
  platforms.forEach((platform, pIndex) => {
    testContents.forEach((content, cIndex) => {
      testCount++;
      const testName = `${platform.name}-测试${cIndex + 1}`;
      
      processor.processContent(content, platform)
        .then(result => {
          successCount++;
          console.log(`✅ ${testName}: 质量${result.qualityScore.overall}/100, 风格${result.styleAssessment.overallScore}/100, ${result.processingTime}ms`);
        })
        .catch(error => {
          console.error(`❌ ${testName}: ${error.message}`);
        })
        .finally(() => {
          if (testCount === platforms.length * testContents.length) {
            setTimeout(() => {
              console.log(`\n📊 测试完成: ${successCount}/${testCount} 成功`);
            }, 1000);
          }
        });
    });
  });
};

// 批量测试函数
window.TOM108BatchTest = function() {
  const plugin = window.app.plugins.plugins['cognilink-assistant'];
  const processor = plugin?.contentPostProcessor;
  
  if (!processor) {
    console.error('❌ 插件或处理器未找到，请重新加载插件');
    return;
  }
  
  console.log('📦 开始TOM-108批量测试...');
  
  const batchContents = [
    {
      content: '批量测试内容1',
      platform: {
        id: 'xiaohongshu',
        name: '小红书',
        maxLength: 300,
        styleKeywords: [],
        requiredElements: [],
        formatRules: {},
        features: []
      },
      id: 'batch-1'
    },
    {
      content: '批量测试内容2，这是一个稍微长一点的内容，用来测试批量处理的效果。',
      platform: {
        id: 'twitter',
        name: 'Twitter',
        maxLength: 280,
        styleKeywords: [],
        requiredElements: [],
        formatRules: {},
        features: []
      },
      id: 'batch-2'
    }
  ];
  
  processor.batchProcess(batchContents, {
    concurrency: 2,
    failFast: false,
    retryFailures: true
  }).then(result => {
    console.log('✅ 批量测试完成！');
    console.log(`📊 结果: ${result.successful}/${result.totalProcessed} 成功`);
    console.log(`⏱️ 耗时: ${result.processingTime}ms`);
    
    if (result.errors.length > 0) {
      console.log('❌ 错误:', result.errors);
    }
  }).catch(error => {
    console.error('❌ 批量测试失败:', error.message);
  });
};

// 验证测试函数
window.TOM108ValidateTest = function() {
  const plugin = window.app.plugins.plugins['cognilink-assistant'];
  const processor = plugin?.contentPostProcessor;
  
  if (!processor) {
    console.error('❌ 插件或处理器未找到，请重新加载插件');
    return;
  }
  
  console.log('🔍 开始TOM-108验证测试...');
  
  const platform = {
    id: 'xiaohongshu',
    name: '小红书',
    maxLength: 300,
    styleKeywords: ['种草'],
    requiredElements: ['表情符号'],
    formatRules: { emojiDensity: 'high' },
    features: ['emoji']
  };
  
  const testContent = '今天分享一个超好用的工具！';
  
  const validation = processor.validateContent(testContent, platform);
  
  console.log('🔍 验证结果:');
  console.log(`✅ 是否有效: ${validation.isValid}`);
  console.log(`⭐ 评分: ${validation.score}/100`);
  
  if (validation.warnings.length > 0) {
    console.log('⚠️ 警告:', validation.warnings.map(w => w.message));
  }
  
  if (validation.recommendations.length > 0) {
    console.log('💡 建议:', validation.recommendations);
  }
};

// 显示帮助信息
window.TOM108Help = function() {
  console.log(`
🎯 TOM-108 内容后处理系统测试工具

📋 可用命令:
• TOM108QuickTest()     - 快速测试 (推荐新手)
• TOM108DetailedTest()  - 详细测试 (多平台多内容)
• TOM108BatchTest()     - 批量处理测试
• TOM108ValidateTest()  - 内容验证测试
• TOM108Help()          - 显示此帮助信息

🚀 快速开始:
1. 确保插件已加载: TOM108QuickTest()
2. 查看详细结果: TOM108DetailedTest()
3. 测试批量功能: TOM108BatchTest()

💡 提示:
- 如果提示插件未找到，请重新加载插件
- 所有测试结果会在控制台显示
- 可以多次运行测试验证稳定性
  `);
};

// 自动显示帮助
console.log('🎉 TOM-108 测试工具已加载！');
console.log('📖 输入 TOM108Help() 查看使用说明');
console.log('🚀 输入 TOM108QuickTest() 开始快速测试'); 