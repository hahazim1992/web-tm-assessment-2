import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://intermediate-test-v-2-web-test.apps.ocp.tmrnd.com.my/api/auth';
  private tokenKey = 'auth_token';
  private expiryKey = 'auth_token_expiry';
  isAuthenticated$ = new BehaviorSubject<boolean>(this.hasValidToken());

  private logoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.autoLogout();
  }

  login(username: string, password: string) {
    return this.http.post<any>(this.apiUrl, { username, password }).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.expiryKey, res.tokenExpiry);
          this.isAuthenticated$.next(true);
          this.autoLogout();
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
    this.isAuthenticated$.next(false);
    clearTimeout(this.logoutTimer);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.expiryKey);
    return !!token && !!expiry && new Date(expiry) > new Date();
  }

  autoLogout() {
    clearTimeout(this.logoutTimer);
    const expiry = localStorage.getItem(this.expiryKey);
    if (expiry) {
      const expiresIn = new Date(expiry).getTime() - new Date().getTime();
      if (expiresIn > 0) {
        this.logoutTimer = setTimeout(() => this.logout(), expiresIn);
      } else {
        this.logout();
      }
    }
  }
}