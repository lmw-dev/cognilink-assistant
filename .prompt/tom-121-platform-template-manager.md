## 🎯 目标 (Objective)
**Linear Issue**: TOM-121 - 平台模板管理 UI（Platform Template Manager）
**关键验收标准参考**: 见 TOM-121 Issue AC 条款

**核心指令**: 实现一个可视化的“平台模板管理 UI”，支持多平台（如小红书、头条号、公众号、博客等）Prompt 模板的增删改查、预览、测试和导入导出，提升内容团队灵活性和内容生成质量。

---

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心文件: @src/components/PlatformTemplateManager.tsx (待创建)
- 相关文件: @src/components/SettingsTab.tsx, @src/config/advanced-platform-templates.ts

### 依赖的现有服务
- Prompt 类型定义: @src/types/prompt-advanced.ts
- 平台ID类型: @src/types/social-media.ts
- 现有模板数据: @src/config/advanced-platform-templates.ts
- 参考文档: @docs/06-tmp/02-优化中文提示词 自媒体爆款文章.md

### 需要遵循的内部规则
- 规则: @.cursor/rules/008-effective-cursor-prompting-guide.mdc
- 规则: @.cursor/rules/typescript-standards.mdc

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认 AdvancedPromptTemplate 类型定义
- [ ] 已验证模板增删改查相关方法签名
- [ ] 已检查变量、few-shot 示例、质量规则等结构
- [ ] 已查看 SettingsTab.tsx 现有模板管理实现

---

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: React 组件 + 本地/云端持久化
- **性能要求**: UI 响应流畅，模板切换/编辑无明显卡顿

### 功能要求
- 支持平台选择（小红书、头条号、公众号、博客等），切换后展示该平台下所有模板
- 支持模板的增删改查（CRUD）：
  - 新建、编辑、删除模板
  - 编辑 systemPrompt、taskPrompt、contextPrompt、outputPrompt、变量、few-shot 示例、质量规则等
  - 设为默认模板、恢复官方模板
- 支持模板预览和一键测试生成（输入变量后实时预览完整 prompt）
- 支持模板导入/导出（JSON），便于团队协作
- 支持模板分组/标签、历史版本回滚（可选）
- 右侧/底部集成各平台 prompt 优化建议（参考 02-优化中文提示词 自媒体爆款文章.md）
- 数据持久化（本地/云端），兼容旧版模板导入

### 质量标准
- 单元测试覆盖率≥80%
- 主要交互无报错，兼容主流 Obsidian 版本
- 代码风格符合项目 TypeScript/React 规范

### 类型安全要求 (🛡️ Type Safety)
- 类型优先设计，先定义/复用 AdvancedPromptTemplate 类型
- 所有模板字段、变量、few-shot 示例、质量规则等均有明确类型
- 边界条件（如无模板、无变量、无示例等）需有良好处理

---

## 📝 期望输出结构 (Expected Output Structure)

### 1. 主要组件结构
```typescript
// PlatformTemplateManager.tsx
export function PlatformTemplateManager() {
  // ...平台选择、模板列表、模板编辑、预览、导入导出等UI
}
```

### 2. 类型定义
```typescript
// 复用/扩展 AdvancedPromptTemplate 类型
export interface AdvancedPromptTemplate {
  id: string;
  name: string;
  platform: PlatformId;
  // ...其余字段
}
```

---

## 🔄 实现步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高)
1. grep_search/codebase_search AdvancedPromptTemplate 类型定义和相关方法
2. 检查 SettingsTab.tsx 现有模板管理逻辑
3. 设计测试用例，明确各平台模板的增删改查、预览、导入导出等场景

### 第1步: 组件搭建 (优先级: 最高)
1. 新建 PlatformTemplateManager.tsx，完成平台选择与模板列表 UI
2. 实现模板增删改查、设为默认、恢复官方模板等功能
3. 支持模板字段、变量、few-shot 示例、质量规则等的可视化编辑

### 第2步: 交互与持久化 (优先级: 高)
1. 实现模板预览
2. 支持模板导入/导出（JSON）


### 第3步: 优化与测试 (优先级: 高)
1. 集成各平台 prompt 优化建议（右侧/底部参考区）
2. 编写并通过单元测试，覆盖主要交互和边界场景
3. 代码自审，确保类型安全和交互流畅

---

## 🎉 完成检查清单 (Completion Checklist)

### 基础功能检查
- [ ] 支持多平台模板的增删改查
- [ ] 支持模板预览和一键测试生成
- [ ] 支持模板导入/导出
- [ ] 支持恢复官方推荐模板
- [ ] 右侧/底部有各平台 prompt 优化建议参考区
- [ ] 数据变更后自动持久化，重启插件后模板自动加载
- [ ] 兼容旧版硬编码模板的导入

### 质量保障检查
- [ ] 类型定义与实现完全匹配
- [ ] 单元测试覆盖率≥80%
- [ ] 主要交互无报错
- [ ] 代码风格符合 TypeScript/React 规范

### 文档和流程检查
- [ ] 代码审查通过
- [ ] 文档更新完成
- [ ] Linear任务状态更新

---

## 🧪 测试策略 (Testing Strategy)
- 单元测试覆盖所有主要交互（增删改查、预览、导入导出、恢复默认等）
- 测试边界条件（无模板、无变量、无示例、导入异常等）
- 兼容性测试（不同平台、不同模板结构）

---

## 🚨 重要注意事项 (Important Notes)
- 先定义/复用类型，后实现功能，确保类型安全
- 交互区分只读模板与自定义模板，防止误删官方模板
- 参考 02-优化中文提示词 自媒体爆款文章.md，持续优化各平台 prompt 建议
- 组件拆分合理，便于后续维护和扩展
