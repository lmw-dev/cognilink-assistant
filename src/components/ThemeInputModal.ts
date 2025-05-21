import { App, Modal, Notice, Setting, TFile } from 'obsidian';

interface ThemeInputModalOptions {
  app: App;
  initialTheme?: string;
  onSubmit: (theme: string, includeContext: boolean, close: () => void, setLoading: (b: boolean) => void, setError: (msg: string) => void) => void;
}

export class ThemeInputModal extends Modal {
  private theme: string;
  private includeContext: boolean = true;
  private isLoading: boolean = false;
  private errorMsg: string = '';
  private options: ThemeInputModalOptions;
  private inputEl: HTMLInputElement;
  private checkboxEl: HTMLElement;
  private errorEl: HTMLElement;
  private generateBtn: HTMLButtonElement;

  constructor(options: ThemeInputModalOptions) {
    super(options.app);
    this.options = options;
    this.theme = options.initialTheme || '';
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '主题驱动原创文档生成' });
    // 主题输入（自定义 textarea 替换 Setting.addText）
    const themeLabel = contentEl.createDiv({ cls: 'setting-item' });
    themeLabel.createDiv({ cls: 'setting-item-name', text: '主题' });
    themeLabel.createDiv({ cls: 'setting-item-description', text: '请输入要生成原创文档的主题，可包含空格' });
    const textarea = themeLabel.createEl('textarea', {
      cls: 'theme-input-textarea',
      placeholder: '如：人工智能伦理',
      text: this.theme
    });
    textarea.rows = 2;
    textarea.style.width = '100%';
    textarea.style.fontSize = '1em';
    textarea.style.marginTop = '4px';
    textarea.oninput = (e) => {
      this.theme = (e.target as HTMLTextAreaElement).value;
    };
    this.inputEl = textarea as unknown as HTMLInputElement;
    // 是否包含当前笔记内容
    new Setting(contentEl)
      .setName('包含当前笔记内容')
      .setDesc('将当前笔记内容作为上下文参与生成')
      .addToggle((toggle) => {
        toggle.setValue(this.includeContext)
          .onChange((v) => {
            this.includeContext = v;
          });
        this.checkboxEl = toggle.toggleEl;
      });
    // 错误提示
    this.errorEl = contentEl.createEl('div', { cls: 'theme-modal-error' });
    this.errorEl.style.color = 'var(--color-red, #d97706)';
    this.errorEl.style.margin = '8px 0';
    this.errorEl.style.display = 'none';
    // 按钮区
    const btnRow = contentEl.createDiv({ cls: 'theme-modal-btn-row' });
    this.generateBtn = btnRow.createEl('button', { text: '生成', cls: 'mod-cta' });
    this.generateBtn.onclick = () => this.handleSubmit();
    const cancelBtn = btnRow.createEl('button', { text: '取消' });
    cancelBtn.onclick = () => this.close();
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
    this.inputEl.disabled = loading;
    if (this.checkboxEl) this.checkboxEl.setAttr('disabled', loading ? 'true' : null);
    this.generateBtn.disabled = loading;
    this.generateBtn.textContent = loading ? '生成中...' : '生成';
  }

  setError(msg: string) {
    this.errorMsg = msg;
    this.errorEl.textContent = msg;
    this.errorEl.style.display = msg ? '' : 'none';
  }

  handleSubmit() {
    if (!this.theme.trim()) {
      this.setError('主题不能为空');
      return;
    }
    this.setError('');
    this.setLoading(true);
    this.options.onSubmit(
      this.theme.trim(),
      this.includeContext,
      () => this.close(),
      (b) => this.setLoading(b),
      (msg) => this.setError(msg)
    );
  }
} 