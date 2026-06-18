import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [Header, Sidebar, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  products: any[] = [1, 2, 3, 4];
}
