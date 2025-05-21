import { Modal, App, Notice, MarkdownView, setTooltip, Setting } from 'obsidian';
import { RAGService } from '../services/RAGService';
import { assembleContext, ContextPiece } from '../utils/ContextAssembler';
import { countTokens } from '../utils/tokenUtils';

export class RAGResultModal extends Modal {
  private ragService: RAGService;
  private plugin: any;
  private defaultQuery: string;
  private topK: number;
  private threshold: number;
  private dedupThreshold: number;
  private provider: 'openai' | 'anthropic';
  private maxTokens: number;
  private pieces: ContextPiece[] = [];
  private pinnedIds: Set<string> = new Set();

  constructor(app: App, ragService: RAGService, defaultQuery = '', topK = 8, threshold = 0.7, dedupThreshold = 0.98) {
    super(app);
    this.ragService = ragService;
    this.plugin = (window as any).plugin;
    this.defaultQuery = defaultQuery;
    this.topK = topK;
    this.threshold = threshold;
    this.dedupThreshold = dedupThreshold;
    this.provider = this.plugin?.settings?.ai?.provider || 'openai';
    this.maxTokens = this.plugin?.settings?.ai?.maxTokens || 2048;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '智能检索与内容整合' });

    // 参数输入（自定义 textarea 替换 Setting.addText）
    let queryInput: HTMLTextAreaElement;
    const queryDiv = contentEl.createDiv({ cls: 'setting-item' });
    queryDiv.createDiv({ cls: 'setting-item-name', text: '检索主题' });
    queryDiv.createDiv({ cls: 'setting-item-description', text: '请输入检索主题，可包含空格' });
    queryInput = queryDiv.createEl('textarea', {
      cls: 'rag-query-textarea',
      placeholder: '请输入检索主题',
      text: this.defaultQuery
    });
    queryInput.rows = 2;
    queryInput.style.width = '100%';
    queryInput.style.fontSize = '1em';
    queryInput.style.marginTop = '4px';
    queryInput.oninput = (e) => {
      this.defaultQuery = (e.target as HTMLTextAreaElement).value;
    };
    const refreshBtn = contentEl.createEl('button', { text: '刷新结果' });
    refreshBtn.style.marginRight = '8px';
    const tokenStat = contentEl.createEl('span', { text: '' });
    tokenStat.style.marginLeft = '8px';
    contentEl.createEl('br');

    // 结果区
    const resultDiv = contentEl.createDiv();
    resultDiv.style.marginTop = '12px';

    // 内容列表区
    const listDiv = contentEl.createDiv();
    listDiv.style.marginTop = '12px';

    // 组装上下文并渲染
    const renderListAndContext = async () => {
      resultDiv.empty();
      resultDiv.createEl('span', { text: '正在检索相关内容...' });
      // 检索相关内容
      if (this.pieces.length === 0) {
        const notes = await this.plugin.embeddingService.findRelevantNotes(queryInput.value, this.topK, this.threshold);
        this.pieces = notes.map((n: any) => ({ id: n.path, content: n.content, pinned: this.pinnedIds.has(n.path) }));
      } else {
        // 更新 pinned 状态
        this.pieces = this.pieces.map(p => ({ ...p, pinned: this.pinnedIds.has(p.id) }));
      }
      // 组装上下文
      const { context, usedTokens, dropped } = await assembleContext({
        pieces: this.pieces,
        maxTokens: this.maxTokens,
        provider: this.provider,
        summaryFn: async (content) => content.slice(0, 100) + '...'
      });
      // 渲染内容列表
      listDiv.empty();
      this.pieces.forEach((piece, idx) => {
        const row = listDiv.createDiv({ cls: 'rag-piece-row' });
        row.style.display = 'flex';
        row.style.alignItems = 'flex-start';
        row.style.padding = '10px 12px';
        row.style.margin = '8px 0';
        row.style.borderRadius = '8px';
        row.style.background = piece.pinned ? 'var(--background-modifier-active)' : 'var(--background-secondary)';
        row.style.boxShadow = piece.pinned ? '0 2px 8px #eab30833' : '0 1px 4px #0001';

        // pin 按钮
        const pinBtn = row.createEl('button');
        pinBtn.innerHTML = piece.pinned ? '📌' : '📍';
        pinBtn.style.marginRight = '12px';
        pinBtn.style.fontSize = '1.3em';
        pinBtn.style.background = 'none';
        pinBtn.style.border = 'none';
        pinBtn.style.cursor = 'pointer';
        pinBtn.style.transition = 'color 0.2s';
        pinBtn.style.color = piece.pinned ? '#eab308' : '#888';
        pinBtn.onmouseenter = () => pinBtn.style.color = '#facc15';
        pinBtn.onmouseleave = () => pinBtn.style.color = piece.pinned ? '#eab308' : '#888';
        setTooltip(pinBtn, piece.pinned ? '取消钉住' : '钉住此内容');
        pinBtn.onclick = () => {
          if (piece.pinned) this.pinnedIds.delete(piece.id);
          else this.pinnedIds.add(piece.id);
          renderListAndContext();
        };

        // 内容摘要
        const contentSpan = row.createSpan();
        contentSpan.style.flex = '1';
        contentSpan.style.whiteSpace = 'pre-line';
        contentSpan.style.fontSize = '1em';
        contentSpan.style.color = '#222';
        contentSpan.textContent = piece.content.slice(0, 120) + (piece.content.length > 120 ? '...' : '');

        // index/序号
        const idxSpan = row.createSpan();
        idxSpan.textContent = `${idx + 1}. `;
        idxSpan.style.marginRight = '6px';
        idxSpan.style.color = '#aaa';
        idxSpan.style.fontSize = '0.95em';

        row.prepend(pinBtn);
        row.prepend(idxSpan);
      });
      // Token 统计
      tokenStat.textContent = `已用 Token: ${usedTokens} / ${this.maxTokens}`;
      tokenStat.style.fontSize = '0.95em';
      tokenStat.style.color = usedTokens > this.maxTokens * 0.8 ? '#eab308' : '#666';
      tokenStat.style.marginLeft = '12px';
      // 丢弃提示
      if (dropped.length > 0) {
        const dropMsg = listDiv.createDiv({ cls: 'rag-drop-msg' });
        dropMsg.style.background = '#fef3c7';
        dropMsg.style.color = '#b45309';
        dropMsg.style.padding = '4px 10px';
        dropMsg.style.borderRadius = '6px';
        dropMsg.style.margin = '8px 0';
        dropMsg.style.fontSize = '0.95em';
        dropMsg.textContent = `有 ${dropped.length} 条内容因超限被丢弃/摘要`;
        setTooltip(dropMsg, dropped.map(d => d.content.slice(0, 80)).join('\n---\n'));
      }
      // 渲染最终上下文 markdown
      resultDiv.empty();
      const pre = resultDiv.createEl('pre', { text: context });
      pre.style.background = '#f8fafc';
      pre.style.border = '1px solid #e5e7eb';
      pre.style.borderRadius = '8px';
      pre.style.padding = '12px';
      pre.style.marginTop = '10px';
      pre.style.maxHeight = '260px';
      pre.style.overflow = 'auto';
      pre.style.fontSize = '1em';
      // 复制按钮
      const copyBtn = resultDiv.createEl('button', { text: '复制上下文' });
      copyBtn.style.margin = '8px 0 0 0';
      copyBtn.style.float = 'right';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(context);
        new Notice('已复制上下文');
      };
    };

    // 刷新按钮
    refreshBtn.onclick = async () => {
      this.pieces = [];
      await renderListAndContext();
    };

    // 首次渲染
    await renderListAndContext();
  }
} 