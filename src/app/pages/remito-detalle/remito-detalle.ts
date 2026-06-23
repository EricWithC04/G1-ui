import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RemitoService } from '../../services/remito.service';
import { PlantillaPrintService } from '../../services/plantilla-print.service';
import { Remito } from '../../models/models';

@Component({
  selector: 'app-remito-detalle',
  imports: [DatePipe, RouterLink],
  templateUrl: './remito-detalle.html',
})
export class RemitoDetalle implements OnInit {
  remito = signal<Remito | null>(null);
  accionando = signal(false);

  constructor(
    private route: ActivatedRoute,
    private service: RemitoService,
    private plantillaPrint: PlantillaPrintService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.service.obtener(+id).subscribe(r => this.remito.set(r));
    });
  }

  cambiarEstado(estado: string): void {
    const r = this.remito();
    if (!r?.idRemito) return;
    this.accionando.set(true);
    this.service.cambiarEstado(r.idRemito, estado).subscribe({
      next: actualizado => {
        this.accionando.set(false);
        this.remito.set(actualizado);
      },
      error: () => this.accionando.set(false),
    });
  }

  imprimir(): void {
    const r = this.remito();
    if (!r?.idRemito) return;
    this.plantillaPrint.printWithFallback(
      this.plantillaPrint.renderRemito(r.idRemito),
      () => window.print(),
    );
  }
}
