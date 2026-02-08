import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Book {
  id: number;
  title: string;
  author: string;
}

interface PaginatedResponse<T> {
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private baseUrl = 'https://mindandmoney.onrender.com';
  private tokenKey = 'access_token';

  constructor(private http: HttpClient) {}

  // ---------------- AUTH HEADER ----------------
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ---------------- BOOKS ----------------
  getBooks(): Observable<Book[]> {
    return this.http.get<PaginatedResponse<Book> | Book[]>(
      `${this.baseUrl}/api/books/`,
      { headers: this.getHeaders() }
    ).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }

  borrowBook(bookId: number) {
    return this.http.post(
      `${this.baseUrl}/api/books/${bookId}/borrow/`,
      {},
      { headers: this.getHeaders() }
    );
  }

  returnBook(bookId: number) {
    return this.http.post(
      `${this.baseUrl}/api/books/${bookId}/return/`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getBorrowedBooks(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/api/borrowed/`,
      { headers: this.getHeaders() }
    );
  }

  readBook(bookId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/api/books/${bookId}/read/`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  getOverdueBooks(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/api/overdue/`,
      { headers: this.getHeaders() }
    );
  }

  // ---------------- PASSWORD RESET ----------------
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/password-reset-request/`,
      { email }
    );
  }

  confirmPasswordReset(email: string, code: string, new_password: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/password-reset-confirm/`,
      { email, code, new_password }
    );
  }

  resendPasswordResetCode(email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/password-reset-request/`,
      { email }
    );
  }

  // ---------------- CHANGE PASSWORD ----------------
  changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/change-password/`,
      {
        email,
        old_password: oldPassword,
        new_password: newPassword
      },
      { headers: this.getHeaders() }
    );
  }
}
