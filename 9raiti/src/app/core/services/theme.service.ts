import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly STORAGE_KEY = 'raiti_theme';
  private _theme$ = new BehaviorSubject<Theme>(this.loadTheme());
  theme$ = this._theme$.asObservable();

  constructor() {
    // Apply on startup
    this.applyTheme(this._theme$.getValue());
  }

  get current(): Theme {
    return this._theme$.getValue();
  }

  get isDark(): boolean {
    return this._theme$.getValue() === 'dark';
  }

  toggle(): void {
    const next: Theme = this._theme$.getValue() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this._theme$.next(theme);
    this.applyTheme(theme);
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
    // Respect system preference by default
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    html.setAttribute('data-theme', theme);
  }
}
