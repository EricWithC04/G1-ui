import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-config-page-shell',
  imports: [RouterLink],
  template: `
    <div class="config-page-shell">
      <a routerLink="/admin/configuracion" class="config-back-link">← Volver a Configuración</a>
      @if (titulo()) {
        <header class="admin-page-header">
          <h1 class="admin-page-title">{{ titulo() }}</h1>
          @if (subtitulo()) {
            <p class="admin-page-subtitle">{{ subtitulo() }}</p>
          }
        </header>
      }
      <ng-content />
    </div>
  `,
})
export class ConfigPageShell {
  titulo = input<string>('');
  subtitulo = input<string>('');
}
