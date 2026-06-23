import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClienteCrmService } from '../../services/cliente-crm.service';
import { PedidoService } from '../../services/pedido.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { PerfilCliente, Pedido } from '../../models/models';
import { labelTipoCliente, TIPOS_CLIENTE } from '../../models/tipos-cliente';

interface ClienteVista extends PerfilCliente {
  pedidosCount?: number;
}

@Component({
  selector: 'app-crm-clientes',
  imports: [FormsModule, RouterLink, AdminSearch],
  templateUrl: './crm-clientes.html',
})
export class CrmClientes implements OnInit {
  clientes = signal<ClienteVista[]>([]);
  busqueda = signal('');
  filtroTipo = signal('');
  tipos = TIPOS_CLIENTE;
  labelTipo = labelTipoCliente;

  clientesFiltrados = computed(() => this.clientes());

  constructor(
    private clienteCrm: ClienteCrmService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const q = this.busqueda().trim() || undefined;
    const tipo = this.filtroTipo() || undefined;
    this.pedidoService.listar().subscribe(pedidos => {
      this.clienteCrm.listar(q, tipo).subscribe(lista => {
        this.clientes.set(lista.map(p => ({
          ...p,
          pedidosCount: this.contarPedidos(p, pedidos),
        })));
      });
    });
  }

  private contarPedidos(p: PerfilCliente, pedidos: Pedido[]): number {
    const uid = p.usuario?.idUsuario;
    if (!uid) return 0;
    return pedidos.filter(x => x.usuario?.idUsuario === uid).length;
  }
}
