好的，下面严格分为三步：**详尽需求描述 → 技术实现方案 → 具体代码实现 → Obsidian 测试方法**。

---

## 1. 详尽需求描述

### 1.1 目标
- 支持多种结构化 Prompt 模板（如“引言-主体-结论”、“分章节”、“摘要+要点”等）。
- 模板可扩展、可自定义，支持变量占位（如 $theme、$context、$pinned）。
- 用户可在设置界面选择、编辑、添加模板。
- 生成内容时，自动用选中模板渲染最终 Prompt。

### 1.2 关键功能点
- **模板存储**：本地 JSON/Markdown 文件，或插件设置中持久化。
- **模板变量**：支持 $theme、$context、$pinned、$date、$user 等。
- **模板渲染**：将变量替换为实际值，生成最终 Prompt 字符串。
- **模板管理 UI**：在设置页可增删改查模板，选择默认模板。
- **与主流程集成**：生成内容时自动应用当前模板。

### 1.3 用户场景
- 用户在设置页选择“分章节”模板，输入主题，插件自动生成分章节结构的 Prompt。
- 用户自定义模板，添加“钉住内容”变量，生成时自动插入关键上下文。
- 用户可一键恢复默认模板，或导入导出模板。

---

## 2. 技术实现方案

### 2.1 目录与结构
- 新增 `src/services/PromptTemplateService.ts`：模板加载、渲染、管理。
- 在 `src/types/settings.ts` 增加模板相关类型和默认模板。
- 在 `SettingsTab.tsx` 增加模板管理 UI。
- 在主流程（如 `ThemeInputModal`）集成模板渲染。

### 2.2 关键技术点
- **模板格式**：建议用 JSON，结构如：
  ```json
  {
    "id": "imrad",
    "name": "引言-方法-结果-讨论",
    "content": "# 引言\n${theme}\n\n# 方法\n${context}\n\n# 结果\n${pinned}\n\n# 讨论\n请基于以上内容生成完整文档。"
  }
  ```
- **变量替换**：用正则或简单字符串替换 `${变量}`。
- **模板持久化**：存储在插件设置（settings.rag.promptTemplates）或单独 JSON 文件。
- **UI 交互**：列表展示、编辑、删除、添加、设为默认。
- **主流程集成**：生成内容时，自动用当前模板渲染 Prompt。

---

## 3. 具体代码实现

### 3.1 类型定义与默认模板（src/types/settings.ts）

```ts
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}

export interface RAGSettings {
  topK?: number;
  threshold?: number;
  dedupThreshold?: number;
  promptTemplates?: PromptTemplate[];
  defaultPromptTemplateId?: string;
}

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default',
    name: '标准结构',
    content: '请根据主题"${theme}"，结合以下内容：\n${context}\n生成结构清晰、内容丰富的原创文档。'
  },
  {
    id: 'imrad',
    name: '引言-方法-结果-讨论',
    content: '# 引言\n${theme}\n\n# 方法\n${context}\n\n# 结果\n${pinned}\n\n# 讨论\n请基于以上内容生成完整文档。'
  }
];
```

### 3.2 PromptTemplateService（src/services/PromptTemplateService.ts）

```ts
import { PromptTemplate } from '../types/settings';

export class PromptTemplateService {
  private templates: PromptTemplate[];
  private defaultId: string;

  constructor(templates: PromptTemplate[], defaultId: string) {
    this.templates = templates;
    this.defaultId = defaultId;
  }

  getAll(): PromptTemplate[] {
    return this.templates;
  }

  getById(id: string): PromptTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getDefault(): PromptTemplate {
    return this.getById(this.defaultId) || this.templates[0];
  }

  setTemplates(templates: PromptTemplate[]) {
    this.templates = templates;
  }

  setDefault(id: string) {
    this.defaultId = id;
  }

  render(template: PromptTemplate, vars: Record<string, string>): string {
    let result = template.content;
    for (const key in vars) {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), vars[key] || '');
    }
    return result;
  }
}
```

### 3.3 设置界面 UI（src/components/SettingsTab.tsx）核心片段

```ts
import { PromptTemplate, DEFAULT_PROMPT_TEMPLATES } from '../types/settings';
import { PromptTemplateService } from '../services/PromptTemplateService';

// 在 SettingsTab 类中
display() {
  // ...已有设置项
  containerEl.createEl('h3', { text: 'Prompt 模板管理' });

  // 模板列表
  (this.settings.rag.promptTemplates || []).forEach((tpl, idx) => {
    new Setting(containerEl)
      .setName(tpl.name)
      .setDesc(tpl.content.slice(0, 60) + '...')
      .addButton(btn => btn
        .setButtonText('编辑')
        .onClick(() => {
          // 弹窗编辑模板
        }))
      .addButton(btn => btn
        .setButtonText('删除')
        .setWarning()
        .onClick(async () => {
          this.settings.rag.promptTemplates.splice(idx, 1);
          await this.plugin.saveSettings();
          this.display();
        }))
      .addExtraButton(btn => {
        btn.setIcon('star');
        btn.setTooltip('设为默认');
        if (this.settings.rag.defaultPromptTemplateId === tpl.id) btn.setCta();
        btn.onClick(async () => {
          this.settings.rag.defaultPromptTemplateId = tpl.id;
          await this.plugin.saveSettings();
          this.display();
        });
      });
  });

  // 新增模板按钮
  new Setting(containerEl)
    .addButton(btn => btn
      .setButtonText('新增模板')
      .onClick(() => {
        // 弹窗新增
      }));

  // 恢复默认模板
  new Setting(containerEl)
    .addButton(btn => btn
      .setButtonText('恢复默认模板')
      .onClick(async () => {
        this.settings.rag.promptTemplates = DEFAULT_PROMPT_TEMPLATES.slice();
        this.settings.rag.defaultPromptTemplateId = 'default';
        await this.plugin.saveSettings();
        this.display();
      }));
}
```

### 3.4 主流程集成（如 ThemeInputModal/onSubmit）

```ts
// 获取当前模板
const promptService = new PromptTemplateService(
  this.plugin.settings.rag.promptTemplates,
  this.plugin.settings.rag.defaultPromptTemplateId
);
const template = promptService.getDefault();
const prompt = promptService.render(template, {
  theme,
  context: finalContext,
  pinned: pinnedContent // 可选
});
// 传递给 LLM
const result = await this.aiService.generateOriginalDoc(theme, prompt);
```

---

## 4. Obsidian 中的测试方法

1. **插件设置页**  
   - 打开“CogniLink Assistant”设置页，找到“Prompt 模板管理”部分。
   - 新增、编辑、删除模板，切换默认模板，尝试恢复默认模板。
2. **生成内容流程**  
   - 在主界面调用“智能生成”或相关入口，输入主题，选择是否包含上下文。
   - 检查生成内容结构是否符合当前模板。
   - 修改模板后再次生成，验证内容结构变化。
3. **变量替换测试**  
   - 在模板中添加自定义变量（如 $date），在主流程传入对应值，检查渲染效果。
4. **异常与边界测试**  
   - 删除所有模板，恢复默认，验证插件健壮性。
   - 模板内容为空、变量未传值时，检查渲染结果。

---

如需 UI 交互弹窗、模板编辑器等更详细代码，可继续细化！
