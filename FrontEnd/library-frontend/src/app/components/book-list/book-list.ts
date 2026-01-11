import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from '../header/header';
import { LibraryService, Book } from '../../services/library';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatTableModule,
    MatButtonModule,
    HeaderComponent
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss'
})
export class BookListComponent {
  books$: Observable<Book[]>;
  displayedColumns = ['photo', 'title', 'author', 'action'];

  constructor(
    private libraryService: LibraryService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.books$ = this.libraryService.getBooks();
  }

  borrowBook(id: number) {
    this.libraryService.borrowBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book borrowed successfully!', 'Close', { duration: 4000 });
        this.books$ = this.libraryService.getBooks(); // refresh
      },
      error: (err) => {
        const msg = err.error?.error || 'Cannot borrow this book';
        this.snackBar.open(msg, 'Close');
      }
    });
  }

  returnBook(id: number) {
    this.libraryService.returnBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 4000 });
        this.books$ = this.libraryService.getBooks(); // refresh
      },
      error: (err) => {
        const msg = err.error?.error || 'Cannot return this book';
        this.snackBar.open(msg, 'Close');
      }
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/80x120?text=No+Cover';
  }
  readBook(bookId: number) {
  this.libraryService.readBook(bookId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url); // opens PDF in a new tab
    },
    error: (err: any) => console.error('Error reading book:', err)
  });
}


}