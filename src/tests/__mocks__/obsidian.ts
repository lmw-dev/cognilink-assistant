export class Scope {
  constructor() {}
}

export class App {
  keymap = {
    pushScope: jest.fn(),
    popScope: jest.fn(),
  };
}

export class Plugin {
  app: App;
  
  constructor() {
    this.app = new App();
  }
  
  loadData = jest.fn().mockResolvedValue({});
  saveData = jest.fn().mockResolvedValue(undefined);
  addCommand = jest.fn();
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  
  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
  }
}

export class Notice {
  constructor(message: string) {}
}

export interface Command {
  id: string;
  name: string;
  callback?: () => any;
  hotkeys?: Hotkey[];
}

export interface Hotkey {
  modifiers: Modifier[];
  key: string;
}

export type Modifier = 'Mod' | 'Ctrl' | 'Meta' | 'Shift' | 'Alt'; 