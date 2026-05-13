import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

import { HeaderComponent } from '../header/header';
import { LibraryService } from '../../services/library';

import { Observable } from 'rxjs';

interface OverdueBook {
  id: number;
  title: string;
  author: string;
  return_due: string;
  days_overdue: number;
}

@Component({
  selector: 'app-overdue-books',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatTableModule,
    HeaderComponent
  ],
  templateUrl: './overdue-books.html',
  styleUrl: './overdue-books.scss'
})
export class OverdueBooksComponent {

  overdue$: Observable<OverdueBook[]>;

  displayedColumns = [
    'title',
    'author',
    'return_due',
    'days_overdue'
  ];

  constructor(private libraryService: LibraryService) {

    this.overdue$ = this.libraryService.getOverdueBooks() as Observable<OverdueBook[]>;

  }

}