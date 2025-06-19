import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  productName: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/data/productList';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getProducts(): Observable<Product[]> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<Product[]>(this.apiUrl, { headers });
  }
}