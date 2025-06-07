## 🎯 目标 (Objective)
**Linear Issue**: TOM-122 - 支持 RAG 白名单/黑名单文件夹索引范围配置
**关键验收标准参考**: 见 TOM-122 Issue AC 条款

**核心指令**: 实现 CogniLink 插件 RAG 检索的白名单/黑名单文件夹索引范围配置，支持在设置页自定义索引范围，确保只检索高质量内容。

---

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心文件: @src/settings/SettingsTab.tsx
- 相关文件: @src/services/EmbeddingService.ts, @src/services/RAGService.ts
- 类型定义: @src/types/settings.ts
- 默认配置: @src/constants/defaults.ts

### 依赖的现有服务
- Obsidian 插件 API（文件夹遍历、路径、标签元数据）
- 现有 RAGService/EmbeddingService 支持按文件夹、标签过滤

### 需要遵循的内部规则
- 规则: @.cursor/rules/008-effective-cursor-prompting-guide.mdc
- 规则: @.cursor/rules/typescript-standards.mdc

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认 settings.rag.indexWhitelist/indexBlacklist 字段定义
- [ ] 已验证 EmbeddingService/RAGService 支持文件夹过滤
- [ ] 已检查 SettingsTab.tsx 配置项保存/加载逻辑
- [ ] 已查看默认配置实现

---

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: React 组件 + Obsidian 插件 API
- **性能要求**: 配置变更后索引范围实时生效，检索无明显延迟

### 功能要求
- 设置页新增 RAG 索引范围配置区：
  - 白名单文件夹（多选，支持路径补全）
  - 黑名单文件夹（多选，支持路径补全）
  - 可选：支持标签白名单/黑名单
- 配置项保存到 settings.rag.indexWhitelist、settings.rag.indexBlacklist
- RAG 检索/嵌入流程只处理白名单内、非黑名单的文件
- 默认白名单：Golden-Knowledge/
- 默认黑名单：Clippings/、_resources/ 等
- UI 需有良好交互体验，支持路径补全、批量选择、恢复默认

### 质量标准
- 单元测试覆盖主要边界场景
- 主要交互无报错，兼容主流 Obsidian 版本
- 代码风格符合项目 TypeScript/React 规范

### 类型安全要求 (🛡️ Type Safety)
- 类型优先设计，先定义/复用 settings 相关类型
- 配置项、过滤逻辑、UI 交互均有明确类型
- 边界条件（无白名单、无黑名单、路径不存在等）需有良好处理

---

## 📝 期望输出结构 (Expected Output Structure)

### 1. 配置项类型定义
```typescript
export interface RAGIndexSettings {
  indexWhitelist: string[];
  indexBlacklist: string[];
  // 可选: tagWhitelist, tagBlacklist
}
```

### 2. UI 组件结构
```typescript
// SettingsTab.tsx 片段
<RAGIndexConfigSection
  whitelist={settings.rag.indexWhitelist}
  blacklist={settings.rag.indexBlacklist}
  onChange={handleRAGIndexConfigChange}
/>
```

### 3. 主流程过滤逻辑
```typescript
// RAGService/EmbeddingService 片段
const isInWhitelist = (path: string) => whitelist.some(w => path.startsWith(w));
const isInBlacklist = (path: string) => blacklist.some(b => path.startsWith(b));
if (isInWhitelist(path) && !isInBlacklist(path)) {
  // 参与索引/检索
}
```

---

## 🔄 实现步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高)
1. grep_search/codebase_search settings.rag.indexWhitelist/indexBlacklist 字段定义
2. 检查 EmbeddingService/RAGService 现有过滤逻辑
3. 设计测试用例，覆盖白名单、黑名单、边界场景

### 第1步: UI 配置区实现 (优先级: 最高)
1. 在 SettingsTab.tsx 新增 RAG 索引范围配置区
2. 支持白名单/黑名单多选、路径补全、恢复默认
3. 配置项变更后自动保存

### 第2步: 主流程过滤逻辑接入 (优先级: 高)
1. EmbeddingService/RAGService 检索/嵌入流程接入白名单/黑名单过滤
2. 确保默认配置下行为正确

### 第3步: 测试与优化 (优先级: 高)
1. 编写并通过单元测试，覆盖主要交互和边界场景
2. 代码自审，确保类型安全和交互流畅

---

## 🎉 完成检查清单 (Completion Checklist)

### 基础功能检查
- [ ] 设置页可配置 RAG 白名单/黑名单文件夹，支持多选和路径补全
- [ ] 配置项正确保存到 settings.rag.indexWhitelist、settings.rag.indexBlacklist
- [ ] RAG 检索/嵌入流程只处理白名单内、非黑名单的文件
- [ ] 默认配置下，仅 Golden-Knowledge/ 被索引，Clippings/、_resources/ 等被排除

### 质量保障检查
- [ ] 类型定义与实现完全匹配
- [ ] 单元测试覆盖主要边界场景
- [ ] 主要交互无报错
- [ ] 代码风格符合 TypeScript/React 规范

### 文档和流程检查
- [ ] 代码审查通过
- [ ] 文档更新完成
- [ ] Linear任务状态更新 