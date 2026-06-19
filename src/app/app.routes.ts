import { Routes } from '@angular/router';
import { ProductList } from './pages/product-list/product-list'
import { CreateProduct } from './pages/create-product/create-product';

export const routes: Routes = [
    {
        path: '',
        component: ProductList
    },
    {
        path: 'new-product',
        component: CreateProduct
    }
];
