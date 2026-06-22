import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { Conversacion } from '../../models/models';
import { ConversacionService } from '../../services/conversacion.service';

const CANAL_ICON: Record<string, string> = {
  EMAIL: '✉️',
  FACEBOOK: 'f',
  INSTAGRAM: '📷',
  WHATSAPP: '💬',
};

@Component({
  selector: 'app-header-crm-inbox',
  imports: [RouterLink, DatePipe],
  templateUrl: './header-crm-inbox.html',
  styleUrl: './header-crm-inbox.css',
})
export class HeaderCrmInbox implements OnInit, OnDestroy {
  abierto = signal(false);
  items = signal<Conversacion[]>([]);
  cargando = signal(false);

  private destroy$ = new Subject<void>();

  constructor(
    private conversaciones: ConversacionService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    interval(60_000).pipe(
      startWith(0),
      switchMap(() => {
        this.cargando.set(true);
        return this.conversaciones.listarPendientes();
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

  iconoCanal(canal?: string): string {
    return CANAL_ICON[canal ?? ''] ?? '•';
  }

  preview(c: Conversacion): string {
    return (c.asunto || c.vistaPrevia || '').trim() || 'Sin vista previa';
  }

  fechaActividad(c: Conversacion): string | undefined {
    return c.ultimaActividad ?? c.fechaCreacion;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.cerrar();
    }
  }
}
