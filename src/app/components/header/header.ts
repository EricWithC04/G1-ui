import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderGlobalSearch } from '../header-global-search/header-global-search';
import { HeaderNotifications } from '../header-notifications/header-notifications';
import { HeaderCrmInbox } from '../header-crm-inbox/header-crm-inbox';

/**
 * Componente reutilizable `header`: UI compartida entre varias pantallas.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, HeaderGlobalSearch, HeaderNotifications, HeaderCrmInbox],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(public auth: AuthService, private router: Router) {}

  async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
