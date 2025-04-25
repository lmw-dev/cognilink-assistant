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