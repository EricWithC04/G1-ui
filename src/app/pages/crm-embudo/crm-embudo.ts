import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
// import { EmbudoService } from '../../services/conversacion.service';
// import { OportunidadCrm } from '../../models/models';

const ETAPAS = ['PROSPECTO', 'CALIFICADO', 'PROPUESTA', 'GANADO', 'PERDIDO'] as const;

// @Component({
//   selector: 'app-crm-embudo',
//   imports: [FormsModule, DecimalPipe],
//   templateUrl: './crm-embudo.html',
//   styleUrl: './crm-embudo.css',
// })
// export class CrmEmbudo implements OnInit {
//   oportunidades = signal<OportunidadCrm[]>([]);
//   etapas = ETAPAS;
//   mostrarForm = signal(false);
//   guardando = signal(false);

//   nueva: OportunidadCrm = {
//     titulo: '',
//     etapa: 'PROSPECTO',
//     montoEstimado: 0,
//     notas: '',
//   };

//   constructor(private embudoService: EmbudoService) {}

//   ngOnInit(): void {
//     this.cargar();
//   }

//   cargar(): void {
//     this.embudoService.listar().subscribe(o => this.oportunidades.set(o));
//   }

//   porEtapa(etapa: string): OportunidadCrm[] {
//     return this.oportunidades().filter(o => o.etapa === etapa);
//   }

//   mover(op: OportunidadCrm, etapa: string): void {
//     if (!op.idOportunidad) return;
//     this.embudoService.actualizar(op.idOportunidad, { etapa }).subscribe(() => this.cargar());
//   }

//   crear(): void {
//     if (!this.nueva.titulo?.trim()) return;
//     this.guardando.set(true);
//     this.embudoService.crear(this.nueva).subscribe({
//       next: () => {
//         this.nueva = { titulo: '', etapa: 'PROSPECTO', montoEstimado: 0, notas: '' };
//         this.mostrarForm.set(false);
//         this.guardando.set(false);
//         this.cargar();
//       },
//       error: () => this.guardando.set(false),
//     });
//   }

//   labelEtapa(e: string): string {
//     const map: Record<string, string> = {
//       PROSPECTO: 'Prospecto',
//       CALIFICADO: 'Calificado',
//       PROPUESTA: 'Propuesta',
//       GANADO: 'Ganado',
//       PERDIDO: 'Perdido',
//     };
//     return map[e] ?? e;
//   }
// }
