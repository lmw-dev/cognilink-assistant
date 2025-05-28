# TOM-112 用户界面扩展 - 社交媒体内容生成UI架构设计

## 🎯 目标 (Objective)
**Linear Issue**: TOM-112 - [Feature] 用户界面扩展 - 社交媒体内容生成UI  
**父Feature**: 社交媒体内容生成系统UI扩展  
**关键验收标准参考**: 
- AC1: 界面设计美观且符合Obsidian风格
- AC2: 用户操作流程简洁直观，学习成本低  
- AC3: 响应速度快，无明显卡顿
- AC4: 支持键盘快捷键操作
- AC5: 移动端适配良好（如果适用）

**核心指令**: 设计并实现社交媒体内容生成的完整UI架构，包括内容生成面板和质量评估展示组件

## 📋 上下文参考 (Context References)

### 主要操作文件
- 架构基础: @src/components/Chat.tsx (现有聊天界面)
- 模态框参考: @src/components/ThemeInputModal.ts (现有模态框实现)
- 设置面板: @src/components/SettingsTab.tsx (现有设置界面)
- 主入口: @src/main.ts (插件主文件)

### 依赖的现有服务 (必须验证接口)
- 内容生成服务: @src/services/social-media-content-generator.ts
- 质量评估服务: @src/services/content-quality-evaluator.ts
- AI服务: @src/services/AIService.ts
- **重要**: 使用前必须通过 `grep_search` 或 `codebase_search` 验证接口方法名和签名

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/001-typescript-standards.mdc
- 通用规范: @.cursor/rules/003-general.mdc
- Obsidian集成: @.cursor/rules/obsidian-integration.mdc

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认社交媒体内容生成器的接口定义
- [ ] 已验证质量评估器的方法名称和参数类型
- [ ] 已检查现有UI组件的props和状态管理
- [ ] 已查看Obsidian UI组件的使用方式

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **UI框架**: React + Obsidian UI组件
- **架构模式**: 组件化设计，状态管理集中化
- **性能要求**: 组件渲染时间 < 100ms，交互响应 < 50ms

### 功能要求
1. **社交媒体内容生成面板 (TOM-113)**:
   - 平台选择器（小红书、Twitter、微信公众号、个人博客、头条号）
   - 主题输入和参数配置
   - 生成进度指示和状态管理
   - 快捷键支持和键盘导航

2. **质量评估结果展示组件 (TOM-114)**:
   - 评分可视化（进度条、雷达图、评分卡片）
   - 原创性检测结果高亮显示
   - 平台适配度详细报告
   - 改进建议的清晰展示

### 设计约束
- **Obsidian风格一致性**: 使用Obsidian的CSS变量和组件样式
- **响应式设计**: 支持不同窗口大小的自适应布局
- **无障碍访问**: 支持键盘导航和屏幕阅读器
- **性能优化**: 使用React.memo和useCallback优化渲染

### 质量标准
- **代码覆盖率**: 组件测试覆盖率 ≥ 80%
- **性能基准**: 组件加载时间 < 200ms
- **用户体验**: 操作流程不超过3步完成主要功能

### 类型安全要求 (🛡️ Type Safety)
- **组件Props完整定义**: 所有组件必须有完整的TypeScript接口
- **状态管理类型化**: 使用严格的状态类型定义
- **事件处理类型安全**: 所有事件处理器必须有正确的类型注解
- **API调用类型检查**: 确保与后端服务的接口类型一致

## 📝 期望输出结构 (Expected Output Structure)

### 1. 组件架构设计
```typescript
// 主容器组件
export interface SocialMediaUIProps {
  plugin: CogniLinkPlugin;
  onClose?: () => void;
}

export const SocialMediaUI: React.FC<SocialMediaUIProps> = ({ plugin, onClose }) => {
  // 状态管理和组件组合
};

// 内容生成面板组件 (TOM-113)
export interface ContentGenerationPanelProps {
  onGenerate: (request: GenerationRequest) => Promise<void>;
  isLoading: boolean;
  platforms: SocialMediaPlatform[];
}

// 质量评估展示组件 (TOM-114)
export interface QualityDisplayProps {
  evaluationResult: QualityEvaluationResult;
  onRefresh?: () => void;
  showDetailedReport?: boolean;
}
```

### 2. 状态管理结构
```typescript
interface SocialMediaUIState {
  // 生成相关状态
  selectedPlatform: SocialMediaPlatform | null;
  generationRequest: GenerationRequest | null;
  generatedContent: string;
  isGenerating: boolean;
  
  // 质量评估相关状态
  qualityResult: QualityEvaluationResult | null;
  isEvaluating: boolean;
  showQualityDetails: boolean;
  
  // UI状态
  activeTab: 'generate' | 'evaluate' | 'history';
  errors: Record<string, string>;
}
```

### 3. 集成接口定义
```typescript
// 与现有服务的集成接口
interface UIServiceIntegration {
  contentGenerator: SocialMediaContentGenerator;
  qualityEvaluator: ContentQualityEvaluator;
  aiService: AIService;
}
```

## 🔄 实现步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高) ⚠️ 必须执行
1. **接口依赖验证**: 
   - 使用 `grep_search` 确认 `SocialMediaContentGenerator` 的接口方法
   - 验证 `ContentQualityEvaluator` 的API签名
   - 检查现有UI组件的props和事件处理方式
2. **类型定义检查**: 
   - 搜索现有的平台类型定义 `SocialMediaPlatform`
   - 确认质量评估结果类型 `QualityEvaluationResult`
   - 验证生成请求类型 `GenerationRequest`
3. **UI架构设计**: 
   - 分析现有组件的状态管理模式
   - 设计组件间的数据流和事件传递
   - 确定组件的层次结构和职责分工

### 第1步: 架构基础搭建 (优先级: 最高)
1. 创建主容器组件 `SocialMediaUI.tsx`
2. 设计组件间的通信接口和状态管理
3. 建立与现有插件架构的集成点
4. 实现基础的错误处理和加载状态管理

### 第2步: 子组件开发协调 (优先级: 高)
1. **TOM-113**: 社交媒体内容生成面板
   - 平台选择和参数配置UI
   - 生成流程控制和状态展示
   - 与内容生成服务的集成
2. **TOM-114**: 质量评估结果展示组件
   - 评分可视化组件开发
   - 原创性和适配度结果展示
   - 改进建议的交互式展示

### 第3步: 集成和优化 (优先级: 中)
1. 组件间的数据流优化
2. 性能优化和渲染优化
3. 键盘快捷键和无障碍访问实现
4. 响应式设计和样式优化

### 第4步: 测试和验证 (优先级: 中)
1. 组件单元测试编写
2. 集成测试和用户交互测试
3. 性能基准测试
4. 用户体验验证

## 🎉 完成检查清单 (Completion Checklist)

### 架构设计检查
- [ ] 组件层次结构清晰合理
- [ ] 状态管理方案完整
- [ ] 与现有系统集成无冲突
- [ ] 错误处理机制完善

### 子任务协调检查
- [ ] TOM-113和TOM-114的接口定义一致
- [ ] 组件间的数据传递方案明确
- [ ] 共享状态和独立状态划分合理
- [ ] 事件处理和回调机制统一

### 质量保障检查 (基于TOM-109经验)
- [ ] **接口调用验证**: 所有服务调用方法名和参数正确
- [ ] **类型一致性检查**: TypeScript类型定义与实现完全匹配
- [ ] **组件渲染优化**: 使用React.memo和useCallback优化性能
- [ ] **编译验证**: `npm run build` 无错误无警告

### 用户体验检查
- [ ] 操作流程简洁直观（≤3步完成主要功能）
- [ ] 界面响应速度快（<100ms渲染时间）
- [ ] 支持键盘快捷键操作
- [ ] 符合Obsidian设计规范

### 文档和流程检查
- [ ] 组件API文档完整
- [ ] 使用示例和集成指南
- [ ] 代码审查通过
- [ ] Linear任务状态更新

## 🚨 重要注意事项 (Important Notes)

### 架构设计风险
- **组件耦合风险**: 避免TOM-113和TOM-114之间的直接依赖
- **状态管理复杂性**: 合理划分全局状态和局部状态
- **性能风险**: 避免不必要的重渲染和状态更新

### 与现有系统集成注意事项
- **聊天界面集成**: 确保与现有Chat组件的兼容性
- **模态框复用**: 参考ThemeInputModal的实现模式
- **设置面板扩展**: 考虑与SettingsTab的集成需求

### 常见Bug预防 (基于项目经验)
#### 1. 组件状态同步错误预防
- ❌ **错误做法**: 子组件直接修改父组件状态
- ✅ **正确做法**: 使用回调函数和受控组件模式

#### 2. 异步操作处理错误预防
- ❌ **错误做法**: 忽略组件卸载时的异步操作清理
- ✅ **正确做法**: 使用useEffect清理函数和AbortController

#### 3. 类型定义不一致预防
- ❌ **错误做法**: 组件props类型与服务接口类型不匹配
- ✅ **正确做法**: 使用统一的类型定义文件

#### 4. 性能优化遗漏预防
- ❌ **错误做法**: 每次渲染都创建新的对象和函数
- ✅ **正确做法**: 使用useMemo、useCallback和React.memo优化

## 📚 子任务开发指导

### TOM-113 开发重点
- **平台选择器设计**: 参考现有的下拉选择组件
- **参数配置界面**: 复用ThemeInputModal的设计模式
- **生成流程控制**: 集成现有的加载状态管理
- **快捷键支持**: 实现键盘导航和快捷操作

### TOM-114 开发重点
- **可视化组件**: 设计评分展示的图表组件
- **结果高亮**: 实现原创性检测的文本高亮
- **报告展示**: 设计可折叠的详细报告界面
- **交互优化**: 实现点击查看详情的交互

### 开发协调要点
1. **共享类型定义**: 确保两个子任务使用相同的类型定义
2. **状态管理协调**: 明确哪些状态需要共享，哪些独立管理
3. **样式一致性**: 使用统一的CSS类名和样式变量
4. **测试策略**: 制定组件级和集成级的测试计划

---

**使用说明**: 
1. 此prompt作为TOM-112的总体架构指导
2. TOM-113和TOM-114的具体实现应参考此架构
3. 开发过程中如有架构调整，需同步更新此文档
4. 所有子任务完成后，进行整体的集成测试和验证 