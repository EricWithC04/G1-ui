import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ClienteCrmService } from '../../services/cliente-crm.service';
import { PedidoService } from '../../services/pedido.service';
import { ClienteMetricas, Pedido, PerfilCliente } from '../../models/models';
import {
  CONDICIONES_IVA,
  labelCondicionIva,
  normalizarCondicionIva,
} from '../../models/condiciones-iva';
import { labelTipoCliente, TIPOS_CLIENTE, displayTipoCliente } from '../../models/tipos-cliente';

/**
 * Página `crm-cliente-ficha`: pantalla Angular (componente + template) del módulo crm-cliente-ficha.
 */
@Component({
  selector: 'app-crm-cliente-ficha',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './crm-cliente-ficha.html',
})
export class CrmClienteFicha implements OnInit {
  tab = signal<'comportamiento' | 'datos' | 'pedidos' | 'facturas'>('comportamiento');
  cliente = signal<PerfilCliente | null>(null);
  metricas = signal<ClienteMetricas | null>(null);
  pedidos = signal<Pedido[]>([]);
  guardando = signal(false);
  ok = signal('');
  tipos = TIPOS_CLIENTE;
  condicionesIva = CONDICIONES_IVA;
  labelTipo = labelTipoCliente;
  displayTipo = displayTipoCliente;
  labelIva = labelCondicionIva;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteCrm: ClienteCrmService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/admin/crm/clientes']);
      return;
    }
    this.clienteCrm.obtener(id).subscribe({
      next: c => {
        const iva = normalizarCondicionIva(c.condicionIva);
        if (iva) c.condicionIva = iva;
        this.cliente.set(c);
        this.clienteCrm.metricas(id).subscribe(m => this.metricas.set(m));
        this.pedidoService.listar().subscribe(all => {
          const uid = c.usuario?.idUsuario;
          this.pedidos.set(uid ? all.filter(p => p.usuario?.idUsuario === uid) : []);
        });
      },
      error: () => this.router.navigate(['/admin/crm/clientes']),
    });
  }

  guardarDatos(): void {
    const c = this.cliente();
    if (!c?.idCliente) return;
    this.guardando.set(true);
    this.clienteCrm.actualizar(c.idCliente, c).subscribe({
      next: updated => {
        this.cliente.set(updated);
        this.guardando.set(false);
        this.ok.set('Datos guardados.');
      },
      error: () => this.guardando.set(false),
    });
  }

  setTab(t: 'comportamiento' | 'datos' | 'pedidos' | 'facturas'): void {
    this.tab.set(t);
  }
}
