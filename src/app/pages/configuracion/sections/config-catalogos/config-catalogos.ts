import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { AdminSearch } from '../../../../components/admin-search/admin-search';
import { ConfigModuloService, CatalogosResponse } from '../../../../services/config-modulo.service';
import { ConfiguracionService } from '../../../../services/configuracion.service';
import { CategoriaService } from '../../../../services/categoria.service';
import { ActivatedRoute } from '@angular/router';
import { CatalogoMaestro, Categoria } from '../../../../models/models';
import { coincideBusqueda } from '../../../../utils/busqueda-admin';
import { validarNombreCategoria } from '../../../../utils/categoria-nombre';

type Tab = 'categorias' | 'depositos' | 'condiciones' | 'etiquetas';

@Component({
  selector: 'app-config-catalogos',
  imports: [ConfigPageShell, FormsModule, AdminSearch],
  templateUrl: './config-catalogos.html',
})
export class ConfigCatalogos implements OnInit {
  tab = signal<Tab>('categorias');
  data = signal<CatalogosResponse | null>(null);
  categoriasTienda = signal<Categoria[]>([]);
  busquedaCategorias = signal('');
  mensaje = signal('');
  error = signal('');
  guardando = signal(false);
  formNuevo: CatalogoMaestro = { activo: true, orden: 0 };
  formCategoria: Categoria = { nombre: '', descripcion: '' };
  etiquetasCrm = signal('');

  categoriasFiltradas = computed(() => {
    const q = this.busquedaCategorias();
    return this.categoriasTienda().filter(c =>
      coincideBusqueda(q, c.idCategoria, c.nombre, c.descripcion),
    );
  });

  constructor(
    private configModulo: ConfigModuloService,
    private categoriaService: CategoriaService,
    private configService: ConfiguracionService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'etiquetas') this.tab.set('etiquetas');
    this.cargar();
  }

  cargar(): void {
    this.configModulo.listarCatalogos().subscribe(d => this.data.set(d));
    this.categoriaService.listar().subscribe(d => this.categoriasTienda.set(d));
    this.configService.mapaGrupo('crm').subscribe(mapa => {
      this.etiquetasCrm.set(mapa['etiquetas_conversacion'] ?? '');
    });
  }

  itemsMaestro(): CatalogoMaestro[] {
    const d = this.data();
    if (!d) return [];
    if (this.tab() === 'depositos') return d.depositos;
    return d.condicionesPago;
  }

  tipoApi(): string {
    return this.tab() === 'depositos' ? 'DEPOSITO' : 'CONDICION_PAGO';
  }

  crearMaestro(): void {
    const n = this.formNuevo;
    if (!n.codigo || !n.nombre) return;
    this.configModulo.crearCatalogo(this.tipoApi(), n).subscribe({
      next: () => {
        this.mensaje.set('Ítem creado');
        this.formNuevo = { activo: true, orden: 0 };
        this.cargar();
      },
    });
  }

  toggleActivo(item: CatalogoMaestro): void {
    if (!item.idCatalogo) return;
    this.configModulo.actualizarCatalogo(item.idCatalogo, { activo: !item.activo }).subscribe({
      next: () => this.cargar(),
    });
  }

  guardarCategoria(f: NgForm): void {
    const nombre = this.formCategoria.nombre?.trim() ?? '';
    const err = validarNombreCategoria(nombre);
    if (f.invalid || err) {
      this.error.set(err ?? 'Completá el nombre de la categoría');
      return;
    }
    this.error.set('');
    this.guardando.set(true);
    this.categoriaService.crear({ ...this.formCategoria, nombre, descripcion: this.formCategoria.descripcion?.trim() }).subscribe({
      next: () => {
        this.mensaje.set('Categoría de tienda creada');
        this.formCategoria = { nombre: '', descripcion: '' };
        this.guardando.set(false);
        this.cargar();
      },
      error: () => {
        this.error.set('No se pudo crear la categoría');
        this.guardando.set(false);
      },
    });
  }

  borrarCategoria(id?: number): void {
    if (id == null) return;
    this.categoriaService.eliminar(id).subscribe({
      next: () => {
        this.mensaje.set('Categoría eliminada');
        this.cargar();
      },
      error: () => this.error.set('No se pudo eliminar'),
    });
  }

  guardarEtiquetasCrm(): void {
    const valor = this.etiquetasCrm().split(',').map(t => t.trim()).filter(Boolean).join(',');
    this.guardando.set(true);
    this.configService.guardarGrupo('crm', { etiquetas_conversacion: valor }).subscribe({
      next: () => {
        this.mensaje.set('Etiquetas CRM guardadas');
        this.etiquetasCrm.set(valor);
        this.guardando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron guardar las etiquetas');
        this.guardando.set(false);
      },
    });
  }
}
