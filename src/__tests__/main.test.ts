import { App, Plugin } from 'obsidian';

// Mock the main plugin class
class MockCogniLinkPlugin extends Plugin {
  constructor(app: App, manifest: any) {
    super(app, manifest);
  }

  async onload(): Promise<void> {
    console.log('Loading CogniLink Assistant plugin');
  }

  onunload(): void {
    console.log('Unloading CogniLink Assistant plugin');
  }
}

describe('CogniLink Plugin', () => {
  let app: App;
  let plugin: MockCogniLinkPlugin;
  const manifest = {
    id: 'cognilink-assistant',
    name: 'CogniLink Assistant',
    version: '1.0.0',
    minAppVersion: '0.15.0',
    description: 'AI-powered assistant for Obsidian',
    author: 'CogniLink Team',
  };

  beforeEach(() => {
    app = new App();
    plugin = new MockCogniLinkPlugin(app, manifest);
  });

  it('should create plugin instance', () => {
    expect(plugin).toBeInstanceOf(Plugin);
    expect(plugin.app).toBe(app);
    expect(plugin.manifest).toBe(manifest);
  });

  it('should have onload method', () => {
    expect(typeof plugin.onload).toBe('function');
  });

  it('should have onunload method', () => {
    expect(typeof plugin.onunload).toBe('function');
  });

  it('should load successfully', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await plugin.onload();
    expect(consoleSpy).toHaveBeenCalledWith('Loading CogniLink Assistant plugin');
    consoleSpy.mockRestore();
  });

  it('should unload successfully', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    plugin.onunload();
    expect(consoleSpy).toHaveBeenCalledWith('Unloading CogniLink Assistant plugin');
    consoleSpy.mockRestore();
  });
}); 