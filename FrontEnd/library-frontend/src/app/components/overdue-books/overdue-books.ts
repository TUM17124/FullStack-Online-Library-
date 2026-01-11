import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { NgIf } from '@angular/common';  // ← Add this
import { LibraryService } from '../../services/library';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-overdue-books',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    NgIf,  // ← Add this
    HeaderComponent
  ],
  templateUrl: './overdue-books.html',
  styleUrl: './overdue-books.scss'
})
export class OverdueBooksComponent implements OnInit {
  overdue: any[] = [];
  displayedColumns = ['title', 'author', 'return_due', 'days_overdue'];

  constructor(private libraryService: LibraryService) {}

  ngOnInit() {
    this.libraryService.getOverdueBooks().subscribe(data => this.overdue = data);
  }
}