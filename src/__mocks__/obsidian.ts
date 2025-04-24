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
  }
} 