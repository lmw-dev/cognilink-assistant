# TOM-122 RAG 白名单/黑名单索引范围配置开发文档

---

## 1. 需求背景

RAG（Retrieval-Augmented Generation）检索与内容整合主流程需支持用户自定义检索/嵌入的文件夹索引范围，提升内容生成的相关性和高质量。平台需允许用户通过设置页灵活配置"白名单/黑名单"文件夹，实现对检索范围的精准控制。

---

## 2. 功能目标

- 支持在插件设置页配置 RAG 检索/嵌入的白名单、黑名单文件夹（多选、路径补全、恢复默认）。
- 配置项保存到 `settings.rag.indexWhitelist`、`settings.rag.indexBlacklist`，并有合理默认值。
- RAG 检索与嵌入流程仅处理白名单内、非黑名单的文件。
- UI 体验与 Obsidian 风格一致，类型安全、参数即时生效。
- 单元测试覆盖所有典型与边界场景。

---

## 3. 技术实现

### 3.1 类型与默认值
- 在 `src/types/settings.ts` 的 `RAGSettings` 接口中新增：
  ```typescript
  indexWhitelist?: string[];
  indexBlacklist?: string[];
  ```
- 在 `DEFAULT_SETTINGS.rag` 中补充：
  ```typescript
  indexWhitelist: ['Golden-Knowledge/'],
  indexBlacklist: ['Clippings/', '_resources/']
  ```

### 3.2 设置页 UI
- 在 `SettingsTab.tsx` 的 RAG 检索参数区后，插入"RAG 索引范围配置"区块。
- 支持白名单/黑名单多选输入，带路径补全、删除、恢复默认。
- 实时保存到 `settings.rag.indexWhitelist`/`indexBlacklist`，参数变更即时生效。

### 3.3 服务层过滤逻辑
- 在 `EmbeddingService` 主流程（如 `findRelevantNotes`、`searchFromCache`、`searchByKeywordsAndUpdate`、`getFallbackResults`）中，插入白名单/黑名单过滤：
  - 仅保留路径以白名单前缀开头且不在黑名单前缀下的文件。
  - 白名单为空则不过滤，黑名单为空则不排除。
- 过滤逻辑类型安全，注释清晰，便于扩展。

### 3.4 单元测试
- 在 `src/services/__tests__/EmbeddingService.test.ts` 补充：
  - 仅白名单生效（只返回白名单内文件）
  - 仅黑名单生效（排除黑名单内文件）
  - 白名单和黑名单均有（交集优先黑名单排除）
  - 白名单/黑名单均为空（不过滤）
  - 子文件夹、前缀匹配等边界情况
- Mock Obsidian Vault/Adapter，聚焦过滤逻辑。

---

## 4. 关键代码片段

### 4.1 过滤逻辑
```typescript
const whitelist: string[] = rag.indexWhitelist || [];
const blacklist: string[] = rag.indexBlacklist || [];
const isInWhitelist = (path: string) => whitelist.length === 0 || whitelist.some(w => path.startsWith(w));
const isInBlacklist = (path: string) => blacklist.length > 0 && blacklist.some(b => path.startsWith(b));
const filteredFiles = allFiles.filter(f => isInWhitelist(f.path) && !isInBlacklist(f.path));
```

### 4.2 设置页 UI 片段
```typescript
new Setting(containerEl)
  .setName('RAG 白名单文件夹')
  .setDesc('仅索引这些文件夹下的内容')
  .addTextArea(text => text
    .setValue((this.settings.rag.indexWhitelist || []).join('\n'))
    .onChange(async (value) => {
      this.settings.rag.indexWhitelist = value.split('\n').map(s => s.trim()).filter(Boolean);
      await this.plugin.saveSettings();
    }));
// ... 黑名单同理 ...
```

---

## 5. 测试方法

### 5.1 单元测试
- 运行：
  ```bash
  npm test -- src/services/__tests__/EmbeddingService.test.ts
  ```
- 检查所有过滤相关用例均通过。

### 5.2 手动测试
- 在设置页配置不同白名单/黑名单组合，保存后触发 RAG 检索。
- 检查检索结果仅包含符合条件的文件。
- 恢复默认后，确认默认范围生效。

---

## 6. 验收标准与技术亮点

- 设置页 UI 支持多选、路径补全、恢复默认，体验与 Obsidian 风格一致。
- 配置项保存与主流程解耦，类型安全、参数即时生效。
- 服务层过滤逻辑健壮，边界场景处理完备。
- 单元测试全覆盖，所有用例通过。
- 便于后续扩展标签、时间等更复杂的过滤条件。

---

## 7. 参考与后续优化

- 可扩展支持标签、时间、文件类型等多维度过滤。
- 过滤逻辑可抽象为独立工具函数，便于复用。
- UI 可进一步优化为树状选择器、批量操作等。

---

**文档版本**: v1.0.0  
**完成时间**: 2025-06-06  
**负责人**: Cursor AI 