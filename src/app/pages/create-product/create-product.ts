import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { LucideArrowLeft } from '@lucide/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-product',
  imports: [Header, LucideArrowLeft, RouterLink],
  templateUrl: './create-product.html',
  styleUrl: './create-product.css',
})
export class CreateProduct {}
