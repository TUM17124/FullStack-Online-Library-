import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { buffer, Observable } from 'rxjs';
import { map } from 'rxjs';

export interface Book {
  id: number;
  title: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private baseUrl = 'http://localhost:8000'; // Django backend base URL

  constructor(private http: HttpClient) {}

  // ---------------- Books ----------------
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/api/books/`);
  }

  borrowBook(bookId: number) {
    return this.http.post(`${this.baseUrl}/api/books/${bookId}/borrow/`, {});
  }

  returnBook(bookId: number) {
    return this.http.post(`${this.baseUrl}/api/books/${bookId}/return/`, {});
  }

  getBorrowedBooks() {
    return this.http.get<any[]>(`${this.baseUrl}/api/borrowed/`);
  }

  readBook(bookId: number): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/api/books/${bookId}/read/`, {
    responseType: 'blob' // directly returns a Blob
  });
}



  getOverdueBooks() {
    return this.http.get<any[]>(`${this.baseUrl}/api/overdue/`);
  }

  // ---------------- Password Reset ----------------
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/password-reset-request/`, { email });
  }

  confirmPasswordReset(email: string, code: string, new_password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/password-reset-confirm/`, {
      email,
      code,
      new_password
    });
  }

  resendPasswordResetCode(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/password-reset-request/`, { email });
  }

  // ---------------- Change Password ----------------
  changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/change-password/`, {
      email,
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}
