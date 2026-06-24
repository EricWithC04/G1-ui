import { Component, ElementRef, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { AdminNotificacion, AdminService } from '../../services/admin.service';

/**
 * Componente reutilizable `header-notifications`: UI compartida entre varias pantallas.
 */
@Component({
  selector: 'app-header-notifications',
  imports: [RouterLink],
  templateUrl: './header-notifications.html',
  styleUrl: './header-notifications.css',
})
export class HeaderNotifications implements OnInit, OnDestroy {
  abierto = signal(false);
  items = signal<AdminNotificacion[]>([]);
  cargando = signal(false);

  private destroy$ = new Subject<void>();

  constructor(
    private admin: AdminService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    interval(60_000).pipe(
      startWith(0),
      switchMap(() => {
        this.cargando.set(true);
        return this.admin.notificaciones();
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: list => {
        this.items.set(list ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.items.set([]);
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.abierto.update(v => !v);
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  cantidad(): number {
    return this.items().length;
  }

  iconoTipo(tipo: string): string {
    switch (tipo) {
      case 'VENTA_ECOMMERCE': return '🛒';
      case 'PAGO_PENDIENTE': return '💳';
      case 'COBRO_PENDIENTE': return '💰';
      case 'CUOTA_VENCIDA': return '⚠️';
      case 'CRM_MENSAJE': return '💬';
      default: return '🔔';
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.cerrar();
    }
  }
}
