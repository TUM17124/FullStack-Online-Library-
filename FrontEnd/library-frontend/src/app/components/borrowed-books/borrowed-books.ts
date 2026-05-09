import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from '../header/header';
import { LibraryService } from '../../services/library';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

interface BorrowedBook {
  title: string;
  author: string;
  borrow_date: string;
  return_due: string;
}

@Component({
  selector: 'app-borrowed-books',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatTableModule,
    HeaderComponent,
    MatButtonModule
  ],
  templateUrl: './borrowed-books.html',
  styleUrl: './borrowed-books.scss'
})
export class BorrowedBooksComponent implements OnInit{

  borrowed$: BorrowedBook[] = [];
  displayedColumns = ['title', 'author', 'borrow_date', 'return_due'];
  snackBar: any;

  constructor(private libraryService: LibraryService) {}
  ngOnInit() {
    this.libraryService.getBorrowedBooks().subscribe(data => this.borrowed$ = data);
  }
}

   