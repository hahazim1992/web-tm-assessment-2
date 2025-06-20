import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Product {
  id: string;
  productName: string;
  url: string;
}

const STORAGE_KEY = 'product_list';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/data/productList';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getProducts(): Observable<Product[]> {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      return of(JSON.parse(cached));
    } else {
      const token = this.auth.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.http.get<Product[]>(this.apiUrl, { headers }).pipe(
        tap(products => {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        })
      );
    }
  }

  addProduct(product: Omit<Product, 'id'>): void {
    const products = this.getLocalProducts();
    const newProduct: Product = {
      ...product,
      id: this.generateId()
    };
    products.push(newProduct);
    this.save(products);
  }

  updateProduct(id: string, product: Omit<Product, 'id'>): void {
    const products = this.getLocalProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products[idx] = { ...products[idx], ...product };
      this.save(products);
    }
  }

  private getLocalProducts(): Product[] {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  }

  private save(products: Product[]) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  deleteProduct(id: string): void {
    const products = this.getLocalProducts();
    const updated = products.filter(p => p.id !== id);
    this.save(updated);
  }
}