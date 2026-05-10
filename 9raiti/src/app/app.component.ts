import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet />
    <!-- Toast global — rendu au niveau racine, position fixed correcte -->
    <app-toast></app-toast>
  `
})
export class AppComponent {
  constructor(private themeService: ThemeService) {}
}