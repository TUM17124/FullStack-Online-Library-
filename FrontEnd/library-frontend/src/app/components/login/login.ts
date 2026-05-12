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

  private refreshTrigger = new BehaviorSubject<number>(0);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // ── Google Login ─────────────────────────────
  loginWithGoogle() {

    this.snackBar.open(
      'Redirecting to Google login...',
      'Close',
      {
        duration: 2000
      }
    );

    const googleLoginUrl =
      'https://online-library-tum.onrender.com/accounts/google/login/?process=login';

    window.location.href = googleLoginUrl;
  }

  // ── Traditional Login ────────────────────────
  login() {

    if (this.isLoading) return;

    // ✅ validation
    if (!this.loginIdentifier.trim() || !this.password.trim()) {

      this.snackBar.open(
        'Please enter email/username and password',
        'Close',
        {
          duration: 4000,
          panelClass: ['error-snackbar']
        }
      );

      return;
    }

    this.isLoading = true;

    this.authService.login(
      this.loginIdentifier.trim(),
      this.password
    ).subscribe({

      // ✅ SUCCESS LOGIN
      next: () => {

        this.authService.refreshLoginStatus();

        // clear pending email if user finally logs in
        localStorage.removeItem('pendingVerificationEmail');

        this.snackBar.open(
          'Login successful!',
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );

        this.router.navigate(['/books']);

        this.isLoading = false;
      },

      // ❌ LOGIN ERROR
      error: (err) => {

        console.error('LOGIN ERROR:', err);

        // backend may return:
        // { code: 'EMAIL_NOT_VERIFIED', email: 'x@gmail.com' }

        const errorCode =
          err?.error?.code ||
          err?.error?.error;

        // 🔥 EMAIL NOT VERIFIED
        if (
          errorCode === 'EMAIL_NOT_VERIFIED' ||
          errorCode === 'account_not_verified'
        ) {

          // ✅ safely get email
          const email =
            this.loginIdentifier.includes('@')
              ? this.loginIdentifier.trim()
              : err?.error?.email;

          // ✅ save email for verify page
          if (email) {
            localStorage.setItem(
              'pendingVerificationEmail',
              email
            );
          }

          this.snackBar.open(
            'Email not verified. Redirecting...',
            'Close',
            {
              duration: 3000
            }
          );

          this.router.navigate(
            ['/register'],
            {
              queryParams: {
                step: 'verify',
                email: email || ''
              }
            }
          );

          this.isLoading = false;
          return;
        }

        // ❌ invalid credentials
        this.snackBar.open(
          'Invalid username/email or password',
          'Close',
          {
            duration: 4000,
            panelClass: ['error-snackbar']
          }
        );

        this.isLoading = false;
      },

      // ✅ COMPLETE
      complete: () => {
        this.refreshTrigger.next(Date.now());
      }
    });
  }
}