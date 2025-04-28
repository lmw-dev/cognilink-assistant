import { App, TFile } from 'obsidian';
import { NoteMetaService } from '../NoteMetaService';

describe('NoteMetaService', () => {
  let app: App;
  let service: NoteMetaService;
  let mockFile: TFile;

  beforeEach(() => {
    app = {
      vault: {
        getMarkdownFiles: jest.fn().mockReturnValue([]),
      },
      metadataCache: {
        getFileCache: jest.fn().mockReturnValue({
          frontmatter: { author: 'liumingwei' },
          tags: [{ tag: '#AI' }, { tag: '#项目' }],
          links: [{ link: '目标笔记' }],
        }),
      },
    } as any;
    service = new NoteMetaService(app);
    mockFile = { path: 'test.md', basename: 'test' } as TFile;
  });

  it('should parse note meta correctly', async () => {
    const meta = await service.getNoteMeta(mockFile);
    expect(meta.path).toBe('test.md');
    expect(meta.title).toBe('test');
    expect(meta.frontmatter.author).toBe('liumingwei');
    expect(meta.tags).toContain('#AI');
    expect(meta.links).toContain('目标笔记');
  });

  it('should search notes by tag', async () => {
    (app.vault.getMarkdownFiles as jest.Mock).mockReturnValue([mockFile]);
    const notes = await service.searchNotesByTag('#AI');
    expect(notes.length).toBe(1);
    expect(notes[0].tags).toContain('#AI');
  });

  it('should search notes by link', async () => {
    (app.vault.getMarkdownFiles as jest.Mock).mockReturnValue([mockFile]);
    const notes = await service.searchNotesByLink('目标笔记');
    expect(notes.length).toBe(1);
    expect(notes[0].links).toContain('目标笔记');
  });
}); 