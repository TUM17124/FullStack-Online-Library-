import { Component } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from '../header/header';
import { LibraryService, Book } from '../../services/library';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth';
import { PdfReaderComponent } from '../pdf-reader/pdf-reader.component';


@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    MatTableModule,
    MatButtonModule,
    HeaderComponent,
    PdfReaderComponent
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss']
})
export class BookListComponent {
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  books$: Observable<Book[]>;
  readingBookUrl: string | null = null;

  constructor(
    private libraryService: LibraryService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.books$ = this.refreshTrigger.asObservable().pipe(
      switchMap(() => this.libraryService.getBooks())
    );
  }

  borrowBook(id: number) {
    this.libraryService.borrowBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book borrowed successfully!', 'Close', { duration: 4000 });
        this.refreshTrigger.next();
      },
      error: (err) => {
        const msg = err.error?.error || 'Cannot borrow this book';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  returnBook(id: number) {
    this.libraryService.returnBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 4000 });
        this.refreshTrigger.next();
      },
      error: (err) => {
        const msg = err.error?.error || 'Cannot return this book';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  // Open PDF in embedded viewer
  readBook(bookId: number) {
    this.libraryService.readBook(bookId).subscribe({
      next: (res: any) => this.readingBookUrl = res.url,
      error: (err: any) => this.snackBar.open('Error opening book', 'Close', { duration: 4000 })
    });
  }

  closeReader() {
    this.readingBookUrl = null;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/120x180?text=No+Cover';
  }
}