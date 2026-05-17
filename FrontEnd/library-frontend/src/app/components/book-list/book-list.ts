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
  switchMap((books) => {

    const grouped: { [key: string]: Book[] } = {};

    books.forEach((book: any) => {

      const category =
        book.category || 'General';

      if (!grouped[category]) {

        grouped[category] = [];

      }

      grouped[category].push(book);

    });

    return [grouped];

  })
);

  }

  borrowBook(id: number) {

    this.libraryService.borrowBook(id).subscribe({

      next: () => {

        this.snackBar.open(
          'Book borrowed successfully!',
          'Close',
          { duration: 4000 }
        );

        this.refreshTrigger.next(Date.now());

      },

      error: (err) => {

        const msg =
          err.error?.error ||
          'Cannot borrow this book';

        this.snackBar.open(
          msg,
          'Close',
          { duration: 4000 }
        );

      }

    });

  }

  returnBook(id: number) {

    this.libraryService.returnBook(id).subscribe({

      next: () => {

        this.snackBar.open(
          'Book returned successfully!',
          'Close',
          { duration: 4000 }
        );

        this.refreshTrigger.next(Date.now());

      },

      error: (err) => {

        const msg =
          err.error?.error ||
          'Cannot return this book';

        this.snackBar.open(
          msg,
          'Close',
          { duration: 4000 }
        );

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
      
      const msg =
        err.error?.error ||
        'Error opening PDF';

      this.snackBar.open(
        msg,
        'Close',
        { duration: 4000 }
      );

    }

  });

}

  closeReader() {

  if (this.readingBookUrl) {

    URL.revokeObjectURL(
      this.readingBookUrl
    );

  }

  this.readingBookUrl = null;

}

objectKeys(obj: any): string[] {

  return Object.keys(obj);

}

hasBooks(groupedBooks: any): boolean {

  return Object.keys(groupedBooks).length > 0;

}

  onImageError(event: any) {

    event.target.src =
      'https://via.placeholder.com/120x180?text=No+Cover';

  }

}