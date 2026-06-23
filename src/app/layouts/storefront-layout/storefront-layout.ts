import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { StoreHeader } from '../../components/store-header/store-header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-storefront-layout',
  imports: [RouterOutlet, RouterLink, StoreHeader],
  templateUrl: './storefront-layout.html',
})
export class StorefrontLayout {

  readonly anio = new Date().getFullYear();

  constructor(public auth: AuthService) {}
}