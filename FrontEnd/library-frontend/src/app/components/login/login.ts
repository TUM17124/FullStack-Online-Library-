import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

import { AuthService } from '../../services/auth';

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

  loginIdentifier = '';
  password = '';
  isLoading = false;

  // ✅ define it properly here (NOT in constructor)
  private refreshTrigger = new BehaviorSubject<number>(0);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // ── Google Login ─────────────────────────────
  loginWithGoogle() {
    this.snackBar.open('Redirecting to Google login...', 'Close', {
      duration: 2000
    });

    const googleLoginUrl =
      'https://online-library-tum.onrender.com/accounts/google/login/?process=login';

    window.location.href = googleLoginUrl;
  }

  // ── Traditional Login ────────────────────────
  login() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.authService.login(this.loginIdentifier, this.password).subscribe({
      next: () => {
        this.authService.refreshLoginStatus();

        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.router.navigate(['/books']);
      },

      error: (err) => {
  console.error(err);

  const code = err.error?.code;

  // 🔥 EMAIL NOT VERIFIED → SEND TO REGISTER VERIFY STEP
  if (code === 'EMAIL_NOT_VERIFIED') {

  // ✅ try to extract real email safely
  const email = this.loginIdentifier.includes('@')
    ? this.loginIdentifier
    : err.error?.email; // backend fallback

  if (email) {
    localStorage.setItem('pendingVerificationEmail', email);
  }

  this.snackBar.open(
    'Email not verified. Redirecting to activation...',
    'Close',
    { duration: 3000 }
  );

  this.router.navigate(['/register'], {
    queryParams: {
      step: 'verify',
      email: email || ''
    }
  });

  this.isLoading = false;
  return;
}
  // ❌ NORMAL LOGIN ERROR
  this.snackBar.open(
    'Login failed. Please check credentials.',
    'Close',
    {
      duration: 4000,
      panelClass: ['error-snackbar']
    }
  );

  this.isLoading = false;
      }
    }); 
  }
}