import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CampanaService } from '../../services/campana.service';
import { PromocionService } from '../../services/promocion.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Campana, MensajeCliente, Promocion } from '../../models/models';

/**
 * Página `campanas`: pantalla Angular (componente + template) del módulo campanas.
 */
@Component({
  selector: 'app-campanas',
  imports: [FormsModule, DatePipe, AdminSearch],
  templateUrl: './campanas.html',
})
export class Campanas implements OnInit {
  items = signal<Campana[]>([]);
  promociones = signal<Promocion[]>([]);
  mensajes = signal<MensajeCliente[]>([]);
  campanaSeleccionada = signal<number | null>(null);
  busqueda = signal('');
  guardando = signal(false);
  enviando = signal(false);
  error = signal('');
  ok = signal('');

  form: Campana = {
    nombre: '',
    tipo: 'PROMOCION',
    asunto: '',
    cuerpoMensaje: '',
    canal: 'EMAIL',
    estado: 'BORRADOR',
    segmento: 'TODOS',
  };

  tipos = [
    { value: 'PROMOCION', label: 'Promoción comercial' },
    { value: 'RECORDATORIO_PAGO', label: 'Recordatorio de pago' },
    { value: 'CUOTA_VENCIDA', label: 'Cuota vencida' },
    { value: 'NOVEDAD', label: 'Novedad / comunicado' },
  ];
  canales = ['EMAIL', 'SMS', 'AMBOS'];
  segmentos = ['TODOS', 'CLIENTES_ACTIVOS', 'CON_DEUDA', 'MOROSOS', 'MINORISTA', 'MAYORISTA'];
  estados = ['BORRADOR', 'PROGRAMADA'];

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.items().filter(c =>
      coincideBusqueda(q,
        c.nombre,
        c.tipo,
        c.asunto,
        c.segmento,
        c.canal,
        c.estado,
        c.promocion?.titulo,
      ),
    );
  });

  constructor(
    private campanaService: CampanaService,
    private promocionService: PromocionService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.promocionService.listar().subscribe(p => this.promociones.set(p));
  }

  cargar(): void {
    this.campanaService.listar().subscribe(list => this.items.set(list));
  }

  onTipoChange(): void {
    const plantillas: Record<string, string> = {
      PROMOCION: '¡Tenemos una promo especial para vos! Ingresá a la tienda y aprovechá el descuento.',
      RECORDATORIO_PAGO: 'Te recordamos que tenés un pago pendiente en NovaTech. Podés abonar desde Mis pedidos.',
      CUOTA_VENCIDA: 'Tu cuota está vencida. Regularizá tu situación para seguir disfrutando del crédito personal.',
      NOVEDAD: 'NovaTech tiene novedades para vos. Entrá a la tienda y descubrí los últimos lanzamientos.',
    };
    if (!this.form.cuerpoMensaje) {
      this.form.cuerpoMensaje = plantillas[this.form.tipo ?? 'NOVEDAD'] ?? '';
    }
  }

  guardar(): void {
    this.error.set('');
    this.ok.set('');
    if (!this.form.nombre?.trim()) {
      this.error.set('El nombre de la campaña es obligatorio.');
      return;
    }
    this.guardando.set(true);
    const payload = { ...this.form };
    if (payload.promocion?.idPromocion) {
      payload.promocion = { idPromocion: payload.promocion.idPromocion } as Promocion;
    } else {
      payload.promocion = undefined;
    }
    this.campanaService.crear(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.ok.set('Campaña guardada. Revisá la lista y enviá cuando esté lista.');
        this.form = {
          nombre: '',
          tipo: 'PROMOCION',
          asunto: '',
          cuerpoMensaje: '',
          canal: 'EMAIL',
          estado: 'BORRADOR',
          segmento: 'TODOS',
        };
        this.cargar();
      },
      error: e => {
        this.guardando.set(false);
        this.error.set(e.error?.message ?? 'Error al guardar.');
      },
    });
  }

  enviar(item: Campana): void {
    if (!item.idCampana || !confirm('¿Enviar esta campaña ahora a los clientes del segmento?')) return;
    this.enviando.set(true);
    this.campanaService.enviar(item.idCampana).subscribe({
      next: res => {
        this.enviando.set(false);
        this.ok.set(`Campaña enviada a ${res.cantidadEnviados} clientes.`);
        this.cargar();
      },
      error: e => {
        this.enviando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo enviar.');
      },
    });
  }

  verMensajes(item: Campana): void {
    if (!item.idCampana) return;
    this.campanaSeleccionada.set(item.idCampana);
    this.campanaService.listarMensajes(item.idCampana).subscribe(m => this.mensajes.set(m));
  }

  eliminar(item: Campana): void {
    if (!item.idCampana || !confirm('¿Eliminar campaña?')) return;
    this.campanaService.eliminar(item.idCampana).subscribe(() => this.cargar());
  }

  badgeEstado(estado?: string): string {
    if (estado === 'ENVIADA') return 'admin-badge admin-badge--enviada';
    if (estado === 'PROGRAMADA') return 'admin-badge admin-badge--pendiente';
    return 'admin-badge admin-badge--borrador';
  }
}
