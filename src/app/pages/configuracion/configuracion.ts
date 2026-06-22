import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideUsers, LucideSettings, LucideBuilding2, LucideFileText,
  LucidePlug, LucideBoxes, LucideBell, LucideShield, LucideHistory, LucideTerminal,
} from '@lucide/angular';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { CONFIG_HUB_ITEMS } from '../../config/config-rbac';
import { PermisoService } from '../../services/permiso.service';

@Component({
  selector: 'app-configuracion',
  imports: [
    RouterLink, AdminSearch,
    LucideUsers, LucideSettings, LucideBuilding2, LucideFileText,
    LucidePlug, LucideBoxes, LucideBell, LucideShield, LucideHistory, LucideTerminal,
  ],
  templateUrl: './configuracion.html',
})
export class Configuracion {
  busqueda = signal('');
  items = CONFIG_HUB_ITEMS;

  cardsVisibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.items.filter(item => {
      if (!this.permisos.puede(item.permiso)) return false;
      if (!q) return true;
      return item.titulo.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    });
  });

  constructor(public permisos: PermisoService) {}
}
