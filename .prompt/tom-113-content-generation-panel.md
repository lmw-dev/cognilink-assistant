# TOM-113 社交媒体内容生成面板实现

## 🎯 目标 (Objective)
**Linear Issue**: TOM-113 - [Task: TOM-112] 社交媒体内容生成面板  
**父Feature**: TOM-112 - 用户界面扩展 - 社交媒体内容生成UI  
**关键验收标准参考**: 
- 完成社交媒体内容生成面板的UI实现
- 平台选择功能正常工作
- 生成参数配置界面完整
- 界面符合Obsidian设计规范
- 支持键盘快捷键操作

**核心指令**: 实现社交媒体内容生成的主要操作面板，包括平台选择、主题输入、生成控制等功能

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心文件: @src/components/ContentGenerationPanel.tsx (待创建)
- 架构参考: @.prompt/tom-112-ui-extension-architecture.md
- 模态框参考: @src/components/ThemeInputModal.ts (现有实现模式)
- 聊天界面: @src/components/Chat.tsx (集成目标)

### 依赖的现有服务 (必须验证接口)
- 内容生成服务: @src/services/social-media-content-generator.ts
- 平台模板系统: @src/services/platform-template-system.ts
- AI服务: @src/services/AIService.ts
- **重要**: 使用前必须通过 `grep_search` 或 `codebase_search` 验证接口方法名和签名

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/001-typescript-standards.mdc
- 通用规范: @.cursor/rules/003-general.mdc
- Obsidian集成: @.cursor/rules/obsidian-integration.mdc

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认 `SocialMediaContentGenerator` 的生成方法接口
- [ ] 已验证 `PlatformTemplateSystem` 的平台获取方法
- [ ] 已检查现有生成请求类型 `GenerationRequest` 的定义
- [ ] 已查看平台类型 `SocialMediaPlatform` 的结构

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **UI框架**: React + Obsidian UI组件
- **架构模式**: 受控组件模式，状态提升到父组件
- **性能要求**: 组件渲染时间 < 100ms，交互响应 < 50ms

### 功能要求
1. **平台选择器**:
   - 支持小红书、Twitter、微信公众号、个人博客、头条号
   - 显示平台特定的限制信息（字符数、特性支持）
   - 平台切换时自动调整参数配置

2. **主题输入区域**:
   - 多行文本输入，支持换行
   - 字符计数和实时验证
   - 支持从当前笔记获取上下文

3. **生成参数配置**:
   - 内容长度选择（短、中、长）
   - 写作风格选择（正式、轻松、专业、幽默）
   - 关键词标签输入
   - 是否包含当前笔记内容的开关

4. **生成控制**:
   - 生成按钮和进度指示器
   - 取消生成功能
   - 错误状态显示和重试机制

5. **快捷键支持**:
   - `Ctrl+Enter` 快速生成
   - `Esc` 取消操作
   - `Tab` 键盘导航

### 设计约束
- **Obsidian风格一致性**: 使用 `setting-item` 类和CSS变量
- **响应式设计**: 适配不同面板宽度
- **无障碍访问**: 支持屏幕阅读器和键盘导航
- **性能优化**: 使用React.memo和useCallback

### 质量标准
- **组件测试覆盖率**: ≥ 80%
- **交互响应时间**: < 50ms
- **表单验证**: 实时验证和错误提示
- **状态管理**: 清晰的状态流转和错误处理

### 类型安全要求 (🛡️ Type Safety)
- **完整的Props接口**: 所有props必须有明确的TypeScript类型
- **状态类型定义**: 使用严格的状态接口定义
- **事件处理类型**: 所有事件处理器必须有正确的类型注解
- **表单数据类型**: 表单字段和验证规则的类型安全

## 📝 期望输出结构 (Expected Output Structure)

### 1. 主组件接口
```typescript
export interface ContentGenerationPanelProps {
  // 生成控制
  onGenerate: (request: GenerationRequest) => Promise<void>;
  onCancel?: () => void;
  
  // 状态管理
  isLoading: boolean;
  error?: string;
  
  // 配置数据
  platforms: SocialMediaPlatform[];
  defaultPlatform?: string;
  
  // 上下文数据
  currentNoteContent?: string;
  availableKeywords?: string[];
  
  // UI控制
  className?: string;
  onClose?: () => void;
}

export const ContentGenerationPanel: React.FC<ContentGenerationPanelProps> = (props) => {
  // 组件实现
};
```

### 2. 内部状态管理
```typescript
interface GenerationFormState {
  // 基础配置
  selectedPlatform: SocialMediaPlatform | null;
  theme: string;
  
  // 生成参数
  contentLength: 'short' | 'medium' | 'long';
  writingStyle: 'formal' | 'casual' | 'professional' | 'humorous';
  keywords: string[];
  includeCurrentNote: boolean;
  
  // 表单验证
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}
```

### 3. 生成请求类型
```typescript
interface GenerationRequest {
  platform: SocialMediaPlatform;
  theme: string;
  parameters: {
    contentLength: string;
    writingStyle: string;
    keywords: string[];
    includeCurrentNote: boolean;
    currentNoteContent?: string;
  };
  options?: {
    maxRetries?: number;
    timeout?: number;
  };
}
```

## 🔄 实现步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高) ⚠️ 必须执行
1. **接口依赖验证**: 
   ```bash
   # 搜索内容生成器接口
   grep_search "class SocialMediaContentGenerator" --include="*.ts"
   grep_search "generateContent" --include="*.ts"
   
   # 搜索平台类型定义
   grep_search "interface SocialMediaPlatform" --include="*.ts"
   grep_search "type.*Platform" --include="*.ts"
   ```

2. **类型定义检查**: 
   - 确认 `GenerationRequest` 类型的完整定义
   - 验证平台配置的数据结构
   - 检查现有的错误处理类型

3. **UI组件模式分析**: 
   - 研究 `ThemeInputModal.ts` 的表单处理模式
   - 分析现有组件的状态管理方式
   - 确定与父组件的通信接口

### 第1步: 组件基础结构 (优先级: 最高)
1. 创建 `ContentGenerationPanel.tsx` 组件文件
2. 定义完整的Props接口和内部状态类型
3. 实现基础的组件结构和布局
4. 建立与父组件的通信机制

### 第2步: 平台选择器实现 (优先级: 高)
1. 实现平台下拉选择组件
2. 显示平台特定的限制信息
3. 处理平台切换时的参数调整
4. 添加平台图标和描述信息

### 第3步: 表单输入区域 (优先级: 高)
1. 实现主题输入的多行文本框
2. 添加字符计数和实时验证
3. 实现参数配置的各种输入控件
4. 建立表单验证和错误提示机制

### 第4步: 生成控制逻辑 (优先级: 高)
1. 实现生成按钮和进度指示器
2. 添加取消生成的功能
3. 处理生成过程中的错误状态
4. 实现重试机制和错误恢复

### 第5步: 交互优化 (优先级: 中)
1. 添加键盘快捷键支持
2. 实现无障碍访问功能
3. 优化组件渲染性能
4. 添加动画和过渡效果

### 第6步: 集成和测试 (优先级: 中)
1. 与父组件进行集成测试
2. 编写组件单元测试
3. 进行用户交互测试
4. 性能基准测试和优化

## 🎉 完成检查清单 (Completion Checklist)

### 基础功能检查
- [ ] 平台选择器正常工作
- [ ] 主题输入支持多行和验证
- [ ] 生成参数配置完整
- [ ] 生成按钮和进度指示正常
- [ ] 错误处理和重试机制完善

### 用户体验检查
- [ ] 界面符合Obsidian设计规范
- [ ] 支持键盘快捷键操作
- [ ] 响应速度满足要求（<100ms）
- [ ] 表单验证实时且友好
- [ ] 无障碍访问功能完整

### 质量保障检查 (基于TOM-109经验)
- [ ] **接口调用验证**: 所有服务调用方法名和参数正确
- [ ] **类型一致性检查**: TypeScript类型定义与实现完全匹配
- [ ] **组件渲染优化**: 使用React.memo和useCallback优化性能
- [ ] **编译验证**: `npm run build` 无错误无警告

### 集成检查
- [ ] 与父组件 `SocialMediaUI` 正确集成
- [ ] 与内容生成服务的API调用正常
- [ ] 与平台模板系统的数据获取正常
- [ ] 状态管理和事件传递机制正确

### 测试检查
- [ ] 组件单元测试覆盖率 ≥ 80%
- [ ] 用户交互测试通过
- [ ] 边界条件测试完整
- [ ] 性能基准测试达标

## 🚨 重要注意事项 (Important Notes)

### 技术实现风险
- **表单状态管理复杂性**: 合理使用受控组件和状态提升
- **异步操作处理**: 正确处理生成过程中的取消和错误
- **性能优化**: 避免不必要的重渲染和状态更新

### 与现有系统集成注意事项
- **模态框模式复用**: 参考 `ThemeInputModal` 的实现模式
- **聊天界面集成**: 确保生成结果能正确显示在聊天界面
- **设置面板协调**: 考虑与全局设置的协调和同步

### 常见Bug预防 (基于项目经验)
#### 1. 表单验证错误预防
- ❌ **错误做法**: 只在提交时验证，用户体验差
- ✅ **正确做法**: 实时验证 + 提交验证，提供即时反馈

#### 2. 异步操作竞态条件预防
- ❌ **错误做法**: 忽略组件卸载时的异步操作清理
- ✅ **正确做法**: 使用 AbortController 和 useEffect 清理

#### 3. 平台切换状态不一致预防
- ❌ **错误做法**: 平台切换时不重置相关参数
- ✅ **正确做法**: 平台切换时智能调整和重置参数

#### 4. 键盘导航遗漏预防
- ❌ **错误做法**: 只考虑鼠标操作，忽略键盘用户
- ✅ **正确做法**: 完整的键盘导航和快捷键支持

## 📚 实现细节指导

### 1. 平台选择器设计
```typescript
const PlatformSelector: React.FC<{
  platforms: SocialMediaPlatform[];
  selected: SocialMediaPlatform | null;
  onChange: (platform: SocialMediaPlatform) => void;
}> = ({ platforms, selected, onChange }) => {
  return (
    <div className="setting-item">
      <div className="setting-item-name">目标平台</div>
      <select 
        value={selected?.id || ''} 
        onChange={(e) => {
          const platform = platforms.find(p => p.id === e.target.value);
          if (platform) onChange(platform);
        }}
      >
        <option value="">请选择平台</option>
        {platforms.map(platform => (
          <option key={platform.id} value={platform.id}>
            {platform.name} (最大{platform.maxLength}字符)
          </option>
        ))}
      </select>
    </div>
  );
};
```

### 2. 主题输入区域
```typescript
const ThemeInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}> = ({ value, onChange, error, maxLength = 500 }) => {
  return (
    <div className="setting-item">
      <div className="setting-item-name">内容主题</div>
      <div className="setting-item-description">
        描述您想要生成的内容主题和要点
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：介绍人工智能在教育领域的应用前景..."
        rows={4}
        maxLength={maxLength}
        className={error ? 'has-error' : ''}
      />
      <div className="input-meta">
        <span className={`char-count ${value.length > maxLength * 0.9 ? 'warning' : ''}`}>
          {value.length}/{maxLength}
        </span>
        {error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
};
```

### 3. 生成参数配置
```typescript
const GenerationParameters: React.FC<{
  contentLength: string;
  writingStyle: string;
  keywords: string[];
  includeCurrentNote: boolean;
  onParameterChange: (key: string, value: any) => void;
}> = (props) => {
  return (
    <div className="generation-parameters">
      {/* 内容长度选择 */}
      <div className="setting-item">
        <div className="setting-item-name">内容长度</div>
        <select 
          value={props.contentLength} 
          onChange={(e) => props.onParameterChange('contentLength', e.target.value)}
        >
          <option value="short">短文 (100-200字)</option>
          <option value="medium">中等 (200-500字)</option>
          <option value="long">长文 (500-1000字)</option>
        </select>
      </div>
      
      {/* 写作风格选择 */}
      <div className="setting-item">
        <div className="setting-item-name">写作风格</div>
        <select 
          value={props.writingStyle} 
          onChange={(e) => props.onParameterChange('writingStyle', e.target.value)}
        >
          <option value="formal">正式</option>
          <option value="casual">轻松</option>
          <option value="professional">专业</option>
          <option value="humorous">幽默</option>
        </select>
      </div>
      
      {/* 其他参数... */}
    </div>
  );
};
```

### 4. 生成控制按钮
```typescript
const GenerationControls: React.FC<{
  onGenerate: () => void;
  onCancel: () => void;
  isLoading: boolean;
  canGenerate: boolean;
}> = ({ onGenerate, onCancel, isLoading, canGenerate }) => {
  return (
    <div className="generation-controls">
      <button 
        className="mod-cta"
        onClick={onGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? '生成中...' : '生成内容'}
      </button>
      
      {isLoading && (
        <button onClick={onCancel}>
          取消
        </button>
      )}
      
      {isLoading && (
        <div className="progress-indicator">
          <div className="progress-bar"></div>
          <span>正在生成内容，请稍候...</span>
        </div>
      )}
    </div>
  );
};
```

---

**使用说明**: 
1. 此prompt专注于TOM-113的具体实现
2. 需要与TOM-112架构prompt和TOM-114组件协调
3. 实现过程中注意与现有UI组件的一致性
4. 完成后需要进行完整的集成测试 