import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PresupuestoService } from '../../services/presupuesto.service';
import { RemitoService } from '../../services/remito.service';
import { PlantillaPrintService } from '../../services/plantilla-print.service';
import { Presupuesto } from '../../models/models';

@Component({
  selector: 'app-presupuesto-detalle',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './presupuesto-detalle.html',
})
export class PresupuestoDetalle implements OnInit {
  presupuesto = signal<Presupuesto | null>(null);
  accionando = signal(false);
  error = signal('');
  ok = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private presupuestoService: PresupuestoService,
    private remitoService: RemitoService,
    private plantillaPrint: PlantillaPrintService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.cargar(+id);
    });
  }

  cargar(id: number): void {
    this.presupuestoService.obtener(id).subscribe(p => this.presupuesto.set(p));
  }

  cambiarEstado(estado: string): void {
    const p = this.presupuesto();
    if (!p?.idPresupuesto) return;
    this.accionando.set(true);
    this.error.set('');
    this.presupuestoService.cambiarEstado(p.idPresupuesto, estado).subscribe({
      next: actualizado => {
        this.accionando.set(false);
        this.presupuesto.set(actualizado);
        this.ok.set('Estado actualizado a ' + estado);
      },
      error: e => {
        this.accionando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo cambiar el estado.');
      },
    });
  }

  facturar(): void {
    const p = this.presupuesto();
    if (!p?.idPresupuesto) return;
    this.router.navigate(['/admin/facturacion/nueva'], {
      queryParams: { presupuestoId: p.idPresupuesto },
    });
  }

  generarRemito(): void {
    const p = this.presupuesto();
    if (!p?.idPresupuesto) return;
    this.accionando.set(true);
    this.remitoService.generarDesdePresupuesto(p.idPresupuesto).subscribe({
      next: r => {
        this.accionando.set(false);
        this.router.navigate(['/admin/remitos', r.idRemito]);
      },
      error: e => {
        this.accionando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo generar el remito.');
      },
    });
  }

  puedeFacturar(): boolean {
    const e = this.presupuesto()?.estado;
    return e === 'APROBADO' || e === 'ENVIADO';
  }

  badgeEstado(estado?: string): string {
    if (estado === 'APROBADO') return 'admin-badge admin-badge--emitida';
    if (estado === 'FACTURADO') return 'admin-badge admin-badge--pagado';
    if (estado === 'VENCIDO') return 'admin-badge admin-badge--vencida';
    if (estado === 'ENVIADO') return 'admin-badge admin-badge--parcial';
    return 'admin-badge admin-badge--borrador';
  }

  imprimir(): void {
    const p = this.presupuesto();
    if (!p?.idPresupuesto) return;
    this.plantillaPrint.printWithFallback(
      this.plantillaPrint.renderPresupuesto(p.idPresupuesto),
      () => window.print(),
    );
  }
}
