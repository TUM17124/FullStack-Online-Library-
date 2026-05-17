import { Component } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from '../header/header';
import { LibraryService, Book } from '../../services/library';
import { Observable, BehaviorSubject, switchMap, map } from 'rxjs';
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

  private refreshTrigger = new BehaviorSubject<number>(0);

  books$: Observable<{ [key: string]: Book[] }>;

  readingBookUrl: string | null = null;

  constructor(
    private libraryService: LibraryService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {

    this.books$ = this.refreshTrigger.asObservable().pipe(

      switchMap(() => this.libraryService.getBooks()),

      map((books: Book[]) => {

        const grouped: { [key: string]: Book[] } = {};

        books.forEach((book) => {

          const key = this.extractKey(book);

          if (!grouped[key]) {
            grouped[key] = [];
          }

          grouped[key].push(book);

        });

        return grouped;

      })

    );

  }

  borrowBook(id: number) {
    this.libraryService.borrowBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book borrowed successfully!', 'Close', { duration: 4000 });
        this.refreshTrigger.next(Date.now());
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Cannot borrow this book', 'Close', { duration: 4000 });
      }
    });
  }

  returnBook(id: number) {
    this.libraryService.returnBook(id).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 4000 });
        this.refreshTrigger.next(Date.now());
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Cannot return this book', 'Close', { duration: 4000 });
      }
    });
  }

  readBook(bookId: number) {

    this.readingBookUrl = null;

    this.libraryService.readBook(bookId).subscribe({

      next: (res: { url: string }) => {
        this.readingBookUrl = res.url;
        this.refreshTrigger.next(Date.now());
      },

      error: (err) => {
        this.readingBookUrl = null;
        this.snackBar.open(err.error?.error || 'Error opening PDF', 'Close', { duration: 4000 });
      }

    });

  }

  closeReader() {
    if (this.readingBookUrl) {
      URL.revokeObjectURL(this.readingBookUrl);
    }
    this.readingBookUrl = null;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  hasBooks(groupedBooks: any): boolean {
    return Object.keys(groupedBooks).length > 0;
  }

  extractKey(book: any): string {

  const text = `${book.title} ${book.description || ''}`.toLowerCase();

  const keywords = [
    'angular', 'react', 'vue',
    'django', 'python', 'java',
    'javascript', 'typescript',
    'node', 'spring', 'html', 'css',
    'flutter', 'dart',
    'flask',
    'machine learning',
    'data science',
    'artificial intelligence',
    'deep learning',
    'retrieval augmented generation',
    'natural language processing',
    'computer vision',
    'cybersecurity',
    'blockchain',
    'cloud computing',
    'devops',
    'microservices',
    'kubernetes',
    'docker'
  ];

  for (const key of keywords) {
    if (text.includes(key)) {
      return key.toUpperCase();
    }
  }

  return 'GENERAL';
}

  scrollToCategory(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/120x180?text=No+Cover';
  }
  
  scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

}