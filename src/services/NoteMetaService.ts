import { App, TFile } from 'obsidian';

export interface NoteMeta {
  path: string;
  title: string;
  frontmatter: Record<string, any>;
  tags: string[];
  links: string[];
}

export class NoteMetaService {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async getNoteMeta(file: TFile): Promise<NoteMeta> {
    const cache = this.app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter ?? {};
    const tags = (cache?.tags ?? []).map(t => t.tag);
    const links = (cache?.links ?? []).map(l => l.link);
    return {
      path: file.path,
      title: file.basename,
      frontmatter,
      tags,
      links,
    };
  }

  async getAllNotesMeta(): Promise<NoteMeta[]> {
    const files = this.app.vault.getMarkdownFiles();
    return Promise.all(files.map(file => this.getNoteMeta(file)));
  }

  async searchNotesByTag(tag: string): Promise<NoteMeta[]> {
    const notes = await this.getAllNotesMeta();
    return notes.filter(note => note.tags.includes(tag));
  }

  async searchNotesByLink(target: string): Promise<NoteMeta[]> {
    const notes = await this.getAllNotesMeta();
    return notes.filter(note => note.links.includes(target));
  }
} 