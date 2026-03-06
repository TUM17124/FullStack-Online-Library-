import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { LibraryService } from '../../services/library';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';  

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  login$: Observable<any>;
  username = '';
  password = '';

  constructor(private authService: AuthService, private libraryService: LibraryService, private router: Router) {
    // Automatically refresh books when refreshTrigger emits
    this.login$ = this.refreshTrigger.asObservable().pipe(
      switchMap(() => this.libraryService.getBooks())
    );
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        // Refresh login status immediately
        this.authService.refreshLoginStatus();
        
        // Trigger data refresh
        this.refreshTrigger.next();
        
        // Redirect to books page fast
        this.router.navigate(['/books']);
      },
      error: () => alert('Invalid username or password')
    });
  }
}