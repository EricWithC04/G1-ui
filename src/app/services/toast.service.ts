import { Injectable, signal } from '@angular/core';

/**
 * Servicio Angular `toast.service`: llama API `/ toast` y expone Observables al UI.
 */
export interface ToastMensaje {
  id: number;
  texto: string;
  tipo: 'error' | 'success' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  mensajes = signal<ToastMensaje[]>([]);

  mostrar(texto: string, tipo: ToastMensaje['tipo'] = 'info', duracionMs = 5000): void {
    const id = ++this.contador;
    this.mensajes.update(list => [...list, { id, texto, tipo }]);
    if (duracionMs > 0) {
      setTimeout(() => this.quitar(id), duracionMs);
    }
  }

  error(texto: string): void {
    this.mostrar(texto, 'error', 7000);
  }

  exito(texto: string): void {
    this.mostrar(texto, 'success');
  }

  quitar(id: number): void {
    this.mensajes.update(list => list.filter(m => m.id !== id));
  }
}
