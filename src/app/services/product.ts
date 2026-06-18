import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '@angular/core'
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    
    private apiUrl = 'http://localhost:8080/productos';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    } 
}
