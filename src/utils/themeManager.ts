import { Theme } from '../types/theme';

type ThemeObserver = (theme: Theme) => void;

class ThemeManager {
  private currentTheme: Theme = 'light';
  private observers: ThemeObserver[] = [];

  constructor() {
    this.loadTheme();
    this.listenToSystemThemeChanges();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(this.getSystemTheme());
    }
  }

  private listenToSystemThemeChanges() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  private getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.currentTheme));
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.notifyObservers();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  subscribe(observer: ThemeObserver) {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }
}

export const themeManager = new ThemeManager();
