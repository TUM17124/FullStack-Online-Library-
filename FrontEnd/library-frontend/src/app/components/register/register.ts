import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  // Reactive email control with validation
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  step: 'register' | 'verify' = 'register';

  first_name = '';
  last_name = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  code = '';

  isLoading = false;
  resendDisabled = false;
  resendTimer = 30;

  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    // Sync string value with reactive control (optional but useful)
    this.emailFormControl.valueChanges.subscribe(value => {
      this.email = value || '';
    });
  }

  // ── Register Step ───────────────────────────────────────────────────────────
  onRegister() {
    this.isLoading = true;
    this.errorMessage = '';

    // Mark email field as touched to show errors immediately
    this.emailFormControl.markAsTouched();

    // Full client-side validation including reactive email
    if (
      !this.first_name.trim() ||
      !this.last_name.trim() ||
      !this.username.trim() ||
      this.emailFormControl.invalid ||   // ← checks required + valid email
      !this.password ||
      !this.confirmPassword
    ) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 4000 });
      this.isLoading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 4000 });
      this.isLoading = false;
      return;
    }

    const userData = {
      first_name: this.first_name.trim(),
      last_name: this.last_name.trim(),
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      password2: this.confirmPassword
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 'verify';
        this.cd.detectChanges();
        this.snackBar.open('Verification code sent to your email!', 'Close', { duration: 5000 });
      },
      error: (err) => {
        this.isLoading = false;
        let message = 'Registration failed. Please try again.';

        if (err.status === 400 && err.error) {
          const errorObj = err.error;

          if (errorObj.error) {
            message = errorObj.error;
          } else if (errorObj.username) {
            message = errorObj.username[0] || 'Username is invalid';
          } else if (errorObj.email) {
            message = errorObj.email[0] || 'Email is invalid';
            this.emailFormControl.setErrors({ backendError: true }); // highlight field
          } else if (errorObj.password) {
            message = errorObj.password.join(' • ') || 'Password is too weak';
          } else if (Array.isArray(errorObj)) {
            message = errorObj.join(' • ');
          }
        }

        this.snackBar.open(message, 'Close', {
          duration: 7000,
          panelClass: ['error-snackbar']
        });

        this.cd.detectChanges();
      }
    });
  }

  // ── Verify Email Step ──────────────────────────────────────────────────────
  verifyEmail() {
    this.isLoading = true;

    this.authService.verifyEmail({ email: this.email.trim(), code: this.code.trim() }).subscribe({
      next: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        this.snackBar.open('Email verified successfully!', 'Close', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Invalid or expired verification code', 'Close', { duration: 5000 });
        this.cd.detectChanges();
      }
    });
  }

  // ── Resend Verification Code ───────────────────────────────────────────────
  resendVerification() {
    if (this.resendDisabled) return;

    this.resendDisabled = true;
    this.resendTimer = 30;
    this.cd.detectChanges();

    this.authService.resendVerificationEmail({ email: this.email.trim() }).subscribe({
      next: () => {
        this.snackBar.open('Verification code resent!', 'Close', { duration: 4000 });
      },
      error: () => {
        this.snackBar.open('Failed to resend code', 'Close', { duration: 4000 });
      }
    });

    const interval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(interval);
        this.resendDisabled = false;
        this.cd.detectChanges();
      }
    }, 1000);
  }
}