/**
 * 平台模板系统验收测试脚本
 * 用于在Obsidian中手动测试TOM-107的功能
 */

import { PlatformTemplateManager } from '../services/platform-template-manager';
import { PlatformId, TemplateContext } from '../types/social-media';

export class TemplateAcceptanceTest {
  private templateManager: PlatformTemplateManager;

  constructor() {
    this.templateManager = new PlatformTemplateManager({
      enableCache: true,
      enableValidation: true,
      enableMetrics: true,
      enableEvents: false
    });
  }

  /**
   * 运行完整的验收测试
   */
  async runAcceptanceTest(): Promise<void> {
    console.log('🚀 开始TOM-107平台模板系统验收测试...\n');

    // 测试数据
    const testContext: TemplateContext = {
      topic: 'TypeScript开发最佳实践',
      context: `TypeScript是一种由微软开发的编程语言，它是JavaScript的超集，添加了静态类型定义。

主要优势：
1. 静态类型检查，减少运行时错误
2. 更好的IDE支持和代码提示
3. 大型项目的可维护性更强
4. 与现有JavaScript代码兼容

最佳实践包括：
- 启用严格模式
- 使用接口定义对象结构
- 避免使用any类型
- 合理使用泛型
- 配置ESLint和Prettier`,
      userPreferences: {
        tone: 'professional',
        length: 'medium',
        style: 'moderate'
      }
    };

    // 测试所有平台
    const platforms: PlatformId[] = ['xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao'];

    for (const platformId of platforms) {
      await this.testPlatform(platformId, testContext);
    }

    // 显示统计信息
    this.showStatistics();

    console.log('\n✅ TOM-107验收测试完成！');
  }

  /**
   * 测试单个平台
   */
  private async testPlatform(platformId: PlatformId, context: TemplateContext): Promise<void> {
    console.log(`\n📱 测试平台: ${platformId.toUpperCase()}`);
    console.log('=' .repeat(50));

    try {
      // 1. 获取模板
      const template = this.templateManager.getTemplate(platformId);
      console.log(`✅ 模板加载成功: ${template.name}`);
      console.log(`   最大长度: ${template.maxLength}字符`);
      console.log(`   风格关键词: ${template.styleKeywords.slice(0, 3).join(', ')}...`);

      // 2. 验证模板
      const validationResult = this.templateManager.validateTemplate(template);
      console.log(`✅ 模板验证: ${validationResult.isValid ? '通过' : '失败'} (评分: ${validationResult.score})`);
      
      if (!validationResult.isValid) {
        console.log(`   错误: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // 3. 渲染模板
      const startTime = Date.now();
      const renderResult = this.templateManager.renderTemplate(template, context);
      const renderTime = Date.now() - startTime;
      
      console.log(`✅ 模板渲染成功 (耗时: ${renderTime}ms)`);
      console.log(`   系统提示长度: ${renderResult.systemPrompt.length}字符`);
      console.log(`   用户提示长度: ${renderResult.userPrompt.length}字符`);

      // 4. 显示渲染结果预览
      console.log('\n📝 渲染结果预览:');
      console.log('--- 系统提示 (前200字符) ---');
      console.log(renderResult.systemPrompt.substring(0, 200) + '...');
      
      console.log('\n--- 用户提示 (前300字符) ---');
      console.log(renderResult.userPrompt.substring(0, 300) + '...');

      // 5. 检查平台特色
      this.checkPlatformFeatures(platformId, renderResult.userPrompt);

    } catch (error) {
      console.error(`❌ 平台 ${platformId} 测试失败:`, error.message);
    }
  }

  /**
   * 检查平台特色是否体现
   */
  private checkPlatformFeatures(platformId: PlatformId, content: string): void {
    console.log('\n🔍 平台特色检查:');

    switch (platformId) {
      case 'xiaohongshu': {
        const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);
        const hasNickname = /姐妹们|宝子们/.test(content);
        const hasInteraction = /评论|互动|分享/.test(content);
        console.log(`   表情符号: ${hasEmoji ? '✅' : '❌'}`);
        console.log(`   亲切称呼: ${hasNickname ? '✅' : '❌'}`);
        console.log(`   互动元素: ${hasInteraction ? '✅' : '❌'}`);
        break;
      }

      case 'twitter': {
        const hasHashtag = /#\w+/.test(content);
        const isShort = content.length <= 280;
        const hasThread = /1\/\d+|thread/i.test(content);
        console.log(`   包含标签: ${hasHashtag ? '✅' : '❌'}`);
        console.log(`   长度控制: ${isShort ? '✅' : '❌'} (${content.length}/280)`);
        console.log(`   推文串格式: ${hasThread ? '✅' : '❌'}`);
        break;
      }

      case 'wechat': {
        const hasHeading = /##\s/.test(content);
        const hasStructure = /\d+\.|一、|二、/.test(content);
        const isProfessional = content.length > 500;
        console.log(`   小标题: ${hasHeading ? '✅' : '❌'}`);
        console.log(`   结构化: ${hasStructure ? '✅' : '❌'}`);
        console.log(`   专业深度: ${isProfessional ? '✅' : '❌'}`);
        break;
      }

      case 'blog': {
        const hasToc = /目录|TOC/i.test(content);
        const hasCode = /```/.test(content);
        const hasReference = /参考|reference/i.test(content);
        console.log(`   目录结构: ${hasToc ? '✅' : '❌'}`);
        console.log(`   代码示例: ${hasCode ? '✅' : '❌'}`);
        console.log(`   参考资料: ${hasReference ? '✅' : '❌'}`);
        break;
      }

      case 'toutiao': {
        const isClickbait = /震惊|揭秘|真相/.test(content);
        const isPopular = /网友|热议|爆料/.test(content);
        const hasControversy = /争议|反转/.test(content);
        console.log(`   吸引标题: ${isClickbait ? '✅' : '❌'}`);
        console.log(`   通俗语言: ${isPopular ? '✅' : '❌'}`);
        console.log(`   争议话题: ${hasControversy ? '✅' : '❌'}`);
        break;
      }
    }
  }

  /**
   * 显示统计信息
   */
  private showStatistics(): void {
    console.log('\n📊 系统统计信息:');
    console.log('=' .repeat(50));

    const stats = this.templateManager.getStatistics();
    console.log(`总模板数: ${stats.totalTemplates}`);
    console.log(`平均加载时间: ${stats.averageLoadTime.toFixed(2)}ms`);
    console.log(`平均渲染时间: ${stats.averageRenderTime.toFixed(2)}ms`);

    const cacheStats = this.templateManager.getCacheStatistics();
    console.log(`缓存大小: ${cacheStats.size}/${cacheStats.maxSize}`);
    console.log(`缓存命中率: ${(cacheStats.hitRate * 100).toFixed(1)}%`);

    console.log('\n各平台模板数量:');
    Object.entries(stats.templatesPerPlatform).forEach(([platform, count]) => {
      console.log(`  ${platform}: ${count}`);
    });
  }

  /**
   * 快速测试单个平台
   */
  async quickTest(platformId: PlatformId, topic: string, context: string): Promise<void> {
    console.log(`🔧 快速测试 ${platformId}: ${topic}`);
    
    const testContext: TemplateContext = { topic, context };
    const template = this.templateManager.getTemplate(platformId);
    const result = this.templateManager.renderTemplate(template, testContext);
    
    console.log('\n渲染结果:');
    console.log(result.userPrompt);
    console.log(`\n长度: ${result.userPrompt.length}字符`);
  }
}

// 导出便于在Obsidian控制台中使用
export const runTemplateTest = async () => {
  const test = new TemplateAcceptanceTest();
  await test.runAcceptanceTest();
};

export const quickTest = async (platformId: PlatformId, topic: string, context: string) => {
  const test = new TemplateAcceptanceTest();
  await test.quickTest(platformId, topic, context);
}; 