import { Modal, App, Notice, MarkdownView, setTooltip } from 'obsidian';
import { RAGService } from '../services/RAGService';

export class RAGResultModal extends Modal {
  private ragService: RAGService;
  private defaultQuery: string;
  private topK: number;
  private threshold: number;
  private dedupThreshold: number;

  constructor(app: App, ragService: RAGService, defaultQuery = '', topK = 8, threshold = 0.7, dedupThreshold = 0.98) {
    super(app);
    this.ragService = ragService;
    this.defaultQuery = defaultQuery;
    this.topK = topK;
    this.threshold = threshold;
    this.dedupThreshold = dedupThreshold;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '智能检索与内容整合' });

    // 参数输入
    const queryInput = contentEl.createEl('input', { type: 'text', value: this.defaultQuery, placeholder: '请输入检索主题' });
    queryInput.style.marginRight = '8px';
    const topKInput = contentEl.createEl('input', { type: 'number', value: String(this.topK) });
    topKInput.setAttr('min', '1');
    topKInput.setAttr('max', '20');
    topKInput.setAttr('step', '1');
    topKInput.style.width = '60px';
    topKInput.style.marginRight = '8px';
    setTooltip(topKInput, '检索数量 (topK)');
    const thresholdInput = contentEl.createEl('input', { type: 'number', value: String(this.threshold) });
    thresholdInput.setAttr('min', '0');
    thresholdInput.setAttr('max', '1');
    thresholdInput.setAttr('step', '0.01');
    thresholdInput.style.width = '60px';
    thresholdInput.style.marginRight = '8px';
    setTooltip(thresholdInput, '相似度阈值');

    const refreshBtn = contentEl.createEl('button', { text: '刷新结果', cls: 'mod-cta' });
    refreshBtn.style.marginRight = '8px';
    const insertBtn = contentEl.createEl('button', { text: '插入到当前笔记' });

    const resultDiv = contentEl.createDiv({ cls: 'rag-result-view', attr: { style: 'margin-top: 16px;' } });

    const renderResult = async () => {
      resultDiv.empty();
      resultDiv.createEl('span', { text: '加载中...' });
      try {
        const markdown = await this.ragService.runRAGAndSummarize(
          queryInput.value,
          Number(topKInput.value),
          Number(thresholdInput.value),
          this.dedupThreshold
        );
        resultDiv.empty();
        // 先显示原始 markdown 便于调试
        resultDiv.createEl('pre', { text: markdown });
        // @ts-expect-error: Obsidian 插件全局渲染 markdown 结果，类型检查可忽略
        await this.app.plugins.getPlugin('markdown')?.MarkdownRenderer?.renderMarkdown(
          markdown,
          resultDiv,
          '',
          this
        );
      } catch (e) {
        resultDiv.empty();
        resultDiv.createEl('span', { text: '检索失败: ' + (e?.message || e) });
        resultDiv.createEl('pre', { text: JSON.stringify(e, null, 2) });
      }
    };

    refreshBtn.onclick = renderResult;
    insertBtn.onclick = async () => {
      const content = resultDiv.innerText;
      let view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) {
        view.editor.replaceSelection(content);
        new Notice('已插入到当前笔记');
      } else {
        // 自动新建笔记并插入
        const file = await this.app.vault.create(`RAG整合-${Date.now()}.md`, content);
        await this.app.workspace.getLeaf(true).openFile(file);
        new Notice('未找到编辑器，已插入到新建笔记');
      }
    };

    // 参数区
    const paramRow = contentEl.createDiv({ cls: 'rag-param-row', attr: { style: 'margin-bottom: 8px;' } });
    paramRow.appendChild(queryInput);
    paramRow.appendChild(topKInput);
    paramRow.appendChild(thresholdInput);
    paramRow.appendChild(refreshBtn);
    paramRow.appendChild(insertBtn);
    contentEl.appendChild(paramRow);
    contentEl.appendChild(resultDiv);

    // 首次自动渲染
    await renderResult();
  }
} 