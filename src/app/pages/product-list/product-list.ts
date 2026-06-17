import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-product-list',
  imports: [Header, Sidebar],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {}
