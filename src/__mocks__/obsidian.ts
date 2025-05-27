export class Notice {
  noticeEl: {
    createEl: jest.Mock;
  };
  hide: jest.Mock;

  constructor(message: string, timeout?: number) {
    this.noticeEl = {
      createEl: jest.fn().mockReturnValue({
        style: {},
        onclick: null,
      }),
    };
    this.hide = jest.fn();
    console.log('Notice:', message);
  }
}

export class TFile {
  path: string;
  basename: string;

  constructor(path: string) {
    this.path = path;
    this.basename = path.split('/').pop() || '';
  }
}

export class Vault {
  async read(file: TFile): Promise<string> {
    return `Mock content for ${file.path}`;
  }

  getMarkdownFiles(): TFile[] {
    return [
      new TFile('test1.md'),
      new TFile('test2.md'),
    ];
  }

  getName(): string {
    return 'test-vault';
  }
}

export class App {
  vault: Vault;

  constructor() {
    this.vault = new Vault();
  }
}

export class Plugin {
  app: App;
  manifest: any;

  constructor(app: App, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }

  async loadData(): Promise<any> {
    return {};
  }

  async saveData(data: any): Promise<void> {
    // Mock implementation
  }

  addSettingTab(settingTab: any): void {
    // Mock implementation
  }

  onload(): void {
    // Mock implementation
  }

  onunload(): void {
    // Mock implementation
  }
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement & {
    empty: () => void;
    createEl: (tag: string, attrs?: any) => HTMLElement;
  };

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    const element = document.createElement('div') as any;
    element.empty = jest.fn();
    element.createEl = jest.fn().mockReturnValue(document.createElement('div'));
    this.containerEl = element;
  }

  display(): void {
    // Mock implementation
  }

  hide(): void {
    // Mock implementation
  }
}

export class Modal {
  app: App;
  contentEl: HTMLElement;
  modalEl: HTMLElement;

  constructor(app: App) {
    this.app = app;
    this.contentEl = document.createElement('div');
    this.modalEl = document.createElement('div');
  }

  open(): void {
    // Mock implementation
  }

  close(): void {
    // Mock implementation
  }

  onOpen(): void {
    // Mock implementation
  }

  onClose(): void {
    // Mock implementation
  }
}

export class Setting {
  settingEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.settingEl = document.createElement('div');
    containerEl.appendChild(this.settingEl);
  }

  setName(name: string): Setting {
    return this;
  }

  setDesc(desc: string): Setting {
    return this;
  }

  addText(cb: (text: any) => any): Setting {
    const textComponent = {
      setPlaceholder: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    };
    cb(textComponent);
    return this;
  }

  addDropdown(cb: (dropdown: any) => any): Setting {
    const dropdownComponent = {
      addOption: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    };
    cb(dropdownComponent);
    return this;
  }

  addToggle(cb: (toggle: any) => any): Setting {
    const toggleComponent = {
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    };
    cb(toggleComponent);
    return this;
  }

  addButton(cb: (button: any) => any): Setting {
    const buttonComponent = {
      setButtonText: jest.fn().mockReturnThis(),
      setCta: jest.fn().mockReturnThis(),
      onClick: jest.fn().mockReturnThis(),
    };
    cb(buttonComponent);
    return this;
  }
}

// Mock for requestUrl function
export const requestUrl = jest.fn().mockResolvedValue({
  status: 200,
  text: 'mock response',
  json: { mock: 'data' },
});

// Mock for normalizePath function
export const normalizePath = jest.fn((path: string) => path);

// Mock for moment function
export const moment = jest.fn(() => ({
  format: jest.fn(() => '2024-01-01'),
})); 