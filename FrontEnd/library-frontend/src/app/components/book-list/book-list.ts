import { Component } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from '../header/header';
import { LibraryService, Book } from '../../services/library';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    MatTableModule,
    MatButtonModule,
    HeaderComponent
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss']
})
export class BookListComponent {
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  books$: Observable<Book[]>;

  constructor(
    private libraryService: LibraryService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    // Automatically refresh books when refreshTrigger emits
    this.books$ = this.refreshTrigger.asObservable().pipe(
      switchMap(() => this.libraryService.getBooks())
    );
  }

  // Borrow a book
  borrowBook(id: number) {
    this.libraryService.borrowBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book borrowed successfully!', 'Close', { duration: 4000 });
        this.refreshTrigger.next(); // trigger refresh immediately
      },
      error: (err) => {
        const msg = err.error?.error || 'Cannot borrow this book';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  // Return a book
  returnBook(id: number) {
    this.libraryService.returnBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 4000 });
        this.refreshTrigger.next(); // trigger refresh immediately
      },
      error: (err) => {
        const msg = err.error?.error || 'Cannot return this book';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  // Read book as PDF in new tab
  readBook(bookId: number) {
    this.libraryService.readBook(bookId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err: any) => console.error('Error reading book:', err)
    });
  }

  // Fallback image
  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/120x180?text=No+Cover';
  }
}