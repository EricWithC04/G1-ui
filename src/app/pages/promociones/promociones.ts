import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PromocionService } from '../../services/promocion.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Promocion } from '../../models/models';

/**
 * Página `promociones`: pantalla Angular (componente + template) del módulo promociones.
 */
@Component({
  selector: 'app-promociones',
  imports: [FormsModule, RouterLink, AdminSearch],
  templateUrl: './promociones.html',
})
export class Promociones implements OnInit {
  items = signal<Promocion[]>([]);
  busqueda = signal('');
  guardando = signal(false);
  error = signal('');
  ok = signal('');

  form: Promocion = {
    titulo: '',
    descripcion: '',
    porcentajeDescuento: 10,
    codigo: '',
    estado: 'BORRADOR',
    segmentoObjetivo: 'TODOS',
  };

  estados = ['BORRADOR', 'ACTIVA', 'FINALIZADA'];
  segmentos = ['TODOS', 'MINORISTA', 'MAYORISTA', 'CON_DEUDA'];

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.items().filter(p =>
      coincideBusqueda(q,
        p.titulo,
        p.descripcion,
        p.codigo,
        p.estado,
        p.segmentoObjetivo,
        p.porcentajeDescuento,
      ),
    );
  });

  constructor(private service: PromocionService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe(list => this.items.set(list));
  }

  guardar(): void {
    this.error.set('');
    this.ok.set('');
    if (!this.form.titulo?.trim()) {
      this.error.set('El título es obligatorio.');
      return;
    }
    this.guardando.set(true);
    this.service.crear({ ...this.form }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.ok.set('Promoción creada. Podés activarla y luego armar una campaña.');
        this.form = {
          titulo: '',
          descripcion: '',
          porcentajeDescuento: 10,
          codigo: '',
          estado: 'BORRADOR',
          segmentoObjetivo: 'TODOS',
        };
        this.cargar();
      },
      error: e => {
        this.guardando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo guardar.');
      },
    });
  }

  activar(item: Promocion): void {
    if (!item.idPromocion) return;
    this.service.activar(item.idPromocion).subscribe(() => this.cargar());
  }

  eliminar(item: Promocion): void {
    if (!item.idPromocion || !confirm('¿Eliminar esta promoción?')) return;
    this.service.eliminar(item.idPromocion).subscribe(() => this.cargar());
  }

  badgeClass(estado?: string): string {
    if (estado === 'ACTIVA') return 'admin-badge admin-badge--activa';
    return 'admin-badge admin-badge--borrador';
  }
}
