# TOM-118: PlatformContentAnalyzer - 开发与验证指南

## 1. 模块定位与作用

`PlatformContentAnalyzer`（`src/services/prompt/PlatformContentAnalyzer.ts`）是 CogniLink 插件的智能内容分析与优化核心模块。它面向不同社交媒体平台，提供：
- **平台特性适配度分析**
- **受众与风格匹配度分析**
- **内容优化建议与变更点**
- **跨平台适配建议**
- **热门内容趋势分析**
- **合规性与综合报告**

其分析结果直接影响内容生成质量、优化建议的智能性，以及最终用户体验。

## 2. 集成与调用方式（开发重点）

### 2.1 自动优化集成场景

**推荐集成点：内容生成后自动调用优化分析**

- 在内容生成主流程（如 `SocialMediaGenerationModal.tsx` 的 `handleGenerateContent`）中，内容生成后立即调用：

```ts
// 内容生成后自动分析优化
if (this.plugin.platformAnalyzer) {
  result.optimization = await this.plugin.platformAnalyzer.optimizeContentForPlatform(result.content, platform);
}
```

- 并将优化结果（`optimization` 字段）附加到 `GeneratedContent`，供 UI 展示。

### 2.2 UI 展示优化分析结果

- 在内容展示区（如 `SocialMediaContentUI.tsx`），检测 `generatedContent.optimization`，若存在则在原内容下方插入"平台内容优化分析"区块，展示优化摘要、前后分数、信心、主要建议等：

```tsx
{generatedContent.optimization && (
  <div className="sm-optimization-analysis-wrapper">
    <div className="sm-section-header">
      <h3>平台内容优化分析</h3>
    </div>
    <div className="sm-optimization-summary">
      <strong>优化摘要：</strong> {generatedContent.optimization.optimizationSummary || '无'}<br/>
      <strong>优化前分数：</strong> {generatedContent.optimization.scoreBefore ?? '-'} / <strong>优化后分数：</strong> {generatedContent.optimization.scoreAfter ?? '-'}<br/>
      <strong>优化信心：</strong> {typeof generatedContent.optimization.confidence === 'number' ? (generatedContent.optimization.confidence * 100).toFixed(0) + '%' : '-'}
    </div>
    <div className="sm-optimization-changes">
      <strong>主要优化建议：</strong>
      <ul>
        {generatedContent.optimization.changes.slice(0, 3).map((change, idx) => (
          <li key={idx}>
            <span>[{change.type}]</span> {change.description}
            {change.impactScore !== undefined && (
              <span style={{marginLeft: 8, color: '#888'}}>影响分: {change.impactScore}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
```

### 2.3 类型扩展

- 在 `GeneratedContent` 类型中增加 `optimization?: OptimizedContent` 字段，确保类型安全和后续扩展性。

## 3. 单元测试与验证

- 单元测试位于 `src/services/prompt/__tests__/PlatformContentAnalyzer.test.ts`，覆盖核心分析方法、评分逻辑、边界条件。
- 运行：

```bash
npm test src/services/prompt/__tests__/PlatformContentAnalyzer.test.ts
```

- 主要测试点：
  - 各分析方法准确性
  - 评分与建议合理性
  - 错误与边界处理
  - 性能（合理响应时间）
- 复杂边界测试如有临时注释，建议后续补全。

## 4. 调试与开发建议

- **控制台调试**：可在 Obsidian 控制台获取插件实例，手动调用分析方法，快速验证分析逻辑。
- **Mock 数据**：建议用 mock 平台和内容数据进行本地调试，避免频繁真实 AI 调用。
- **集成测试**：建议在内容生成主流程集成后，手动验证 UI 展示与分析结果一致性。
- **常见问题**：
  - 优化分析未显示：检查 `platformAnalyzer` 实例是否挂载、内容生成后是否正确调用分析方法。
  - 分析结果异常：检查输入内容格式、平台参数、AI 服务可用性。

## 5. 最佳实践与后续优化

- 建议将优化分析作为内容生成的默认后处理步骤，便于持续提升内容质量。
- 分析结果建议结构化，便于 UI 灵活展示和后续扩展。
- 持续完善单元测试，提升复杂场景覆盖率。

## 6. 总结

- `PlatformContentAnalyzer` 是内容生成与优化的核心环节，推荐在内容生成后自动调用并在 UI 层直观展示。
- 单元测试为主、控制台调试为辅，保障分析逻辑的正确性和健壮性。
- 集成后建议重点关注分析结果的可用性和用户体验。 