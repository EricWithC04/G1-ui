import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container" aria-live="polite">
      @for (m of toast.mensajes(); track m.id) {
        <div class="toast toast--{{ m.tipo }}" role="alert">
          <span>{{ m.texto }}</span>
          <button type="button" class="toast-close" (click)="toast.quitar(m.id)" aria-label="Cerrar">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: min(24rem, calc(100vw - 2rem));
    }
    .toast {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .toast--error { background: rgb(127 29 29); color: rgb(254 226 226); }
    .toast--success { background: rgb(20 83 45); color: rgb(220 252 231); }
    .toast--info { background: rgb(30 58 138); color: rgb(219 234 254); }
    .toast-close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.7;
      cursor: pointer;
      font-size: 1.125rem;
      line-height: 1;
    }
    .toast-close:hover { opacity: 1; }
  `,
})
/**
 * Componente reutilizable `toast-container`: UI compartida entre varias pantallas.
 */
export class ToastContainer {
  constructor(public toast: ToastService) {}
}
