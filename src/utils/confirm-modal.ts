import { App, Modal, Setting } from 'obsidian';

export function confirmModal(
  app: App,
  title: string,
  message: string,
  confirmText: string = '确认',
  cancelText: string = '取消'
): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = new Modal(app);
    modal.contentEl.createEl('h2', { text: title });
    modal.contentEl.createEl('p', { text: message });

    new Setting(modal.contentEl)
      .addButton(button => button
        .setButtonText(confirmText)
        .setWarning() // or .setCta() depending on context
        .onClick(() => {
          resolve(true);
          modal.close();
        }))
      .addButton(button => button
        .setButtonText(cancelText)
        .onClick(() => {
          resolve(false);
          modal.close();
        }));

    modal.open();
  });
} 