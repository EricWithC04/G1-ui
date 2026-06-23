import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuotaService } from '../../services/cuota.service';
import { CampanaService } from '../../services/campana.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Cuota } from '../../models/models';

@Component({
  selector: 'app-creditos',
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink, AdminSearch],
  templateUrl: './creditos.html',
})
export class Creditos implements OnInit {
  todas = signal<Cuota[]>([]);
  vencidas = signal<Cuota[]>([]);
  porVencer = signal<Cuota[]>([]);
  filtro = signal<'TODAS' | 'VENCIDAS' | 'PROXIMAS'>('TODAS');
  busqueda = signal('');
  ok = signal('');

  listaVisible = computed(() => {
    let base: Cuota[];
    if (this.filtro() === 'VENCIDAS') base = this.vencidas();
    else if (this.filtro() === 'PROXIMAS') base = this.porVencer();
    else base = this.todas();

    const q = this.busqueda();
    return base.filter(c =>
      coincideBusqueda(q,
        c.idCuota,
        c.numeroCuota,
        c.monto,
        c.estado,
        c.fechaVencimiento,
        c.plan?.idPlan,
        c.plan?.pedido?.idPedido,
        c.plan?.cliente?.usuario?.nombre,
        c.plan?.cliente?.usuario?.email,
      ),
    );
  });

  constructor(
    private cuotaService: CuotaService,
    private campanaService: CampanaService,
  ) {}

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cuotaService.listar().subscribe(c => this.todas.set(c));
    this.cuotaService.vencidas().subscribe(c => this.vencidas.set(c));
    this.cuotaService.porVencer(7).subscribe(c => this.porVencer.set(c));
  }

  totalEnFiltro = computed(() => {
    if (this.filtro() === 'VENCIDAS') return this.vencidas().length;
    if (this.filtro() === 'PROXIMAS') return this.porVencer().length;
    return this.todas().length;
  });

  pagar(c: Cuota): void {
    if (!c.idCuota || !confirm('¿Registrar pago de esta cuota?')) return;
    this.cuotaService.pagar(c.idCuota).subscribe(() => {
      this.ok.set('Cuota marcada como pagada.');
      this.recargar();
    });
  }

  enviarRecordatorioVencidas(): void {
    if (this.vencidas().length === 0) {
      alert('No hay cuotas vencidas.');
      return;
    }
    this.campanaService.crear({
      nombre: 'Recordatorio cuotas vencidas — ' + new Date().toLocaleDateString(),
      tipo: 'CUOTA_VENCIDA',
      asunto: 'NovaTech — Cuota vencida',
      cuerpoMensaje: 'Tenés una cuota vencida. Contactanos o aboná desde Mis pedidos para regularizar tu crédito.',
      canal: 'EMAIL',
      estado: 'BORRADOR',
      segmento: 'MOROSOS',
    }).subscribe({
      next: camp => {
        if (camp.idCampana && confirm('Campaña creada. ¿Enviar ahora a clientes morosos?')) {
          this.campanaService.enviar(camp.idCampana).subscribe(res => {
            this.ok.set(`Recordatorio enviado a ${res.cantidadEnviados} clientes.`);
          });
        }
      },
    });
  }

  badgeEstado(estado?: string): string {
    if (estado === 'VENCIDA') return 'admin-badge admin-badge--vencida';
    if (estado === 'PAGADA') return 'admin-badge admin-badge--activa';
    return 'admin-badge admin-badge--pendiente';
  }

  nombreCliente(c: Cuota): string {
    return c.plan?.cliente?.usuario?.nombre ?? '—';
  }
}
