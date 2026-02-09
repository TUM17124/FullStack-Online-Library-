import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl; // e.g. 'https://mindandmoney.onrender.com'
  private tokenKey = 'access_token';
  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/api/token/`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access);
        this.isLoggedIn$.next(true);
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(userData: { username: string; email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/api/register/`, userData);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn$.next(false);
    this.snackBar.open('Logged out', 'Close', { duration: 3000 });
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getBooks(): Observable<any> {
    const token = this.getToken();
    if (!token) throw new Error('User not authenticated');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/api/books/`, { headers });   // ← added /
  }

  readBook(bookId: number): Observable<Blob> {
    const token = this.getToken();
    if (!token) throw new Error('User not authenticated');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/api/books/${bookId}/read/`, {
      headers,
      responseType: 'blob'
    });
  }

  verifyEmail(data: any) {
    return this.http.post(`${this.baseUrl}/api/verify-email/`, data);
  }

  resendVerificationEmail(data: any) {
    return this.http.post(`${this.baseUrl}/api/resend-verification-email/`, data);
  }
}