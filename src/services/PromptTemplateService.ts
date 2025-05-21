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