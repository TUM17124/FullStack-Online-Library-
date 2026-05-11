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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  username = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // ── Google Login ───────────────────────────────────────────────────────────
  loginWithGoogle() {
    this.isLoading = true;
    this.snackBar.open('Redirecting to Google login...', 'Close', {
    duration: 2000
  });
    const googleLoginUrl = 'https://online-library-tum.onrender.com/accounts/google/login/?process=login';
    window.location.href = googleLoginUrl;
  }

  // ── Traditional Login ──────────────────────────────────────────────────────
  login() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.authService.refreshLoginStatus();
        this.snackBar.open('Login successful!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
        this.router.navigate(['/books']);   // or '/dashboard'
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Invalid username or password', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}