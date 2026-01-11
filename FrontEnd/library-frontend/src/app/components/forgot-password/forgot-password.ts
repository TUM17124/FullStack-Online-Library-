import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LibraryService } from '../../services/library';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  step: 'request' | 'confirm' = 'request';

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  resendDisabled = false;

  constructor(private libraryService: LibraryService, private snackBar: MatSnackBar, private cd: ChangeDetectorRef) {}

  /** Step 1: Request reset code */
  requestReset() {
    if (!this.email.trim()) {
      this.snackBar.open('Please enter your email', 'Close', { duration: 4000 });
      return;
    }

    this.isLoading = true;
    this.libraryService.requestPasswordReset(this.email.trim()).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.step = 'confirm';
        this.cd.detectChanges();
        this.snackBar.open(res.message || 'Check your email for the reset code', 'Close', {
          duration: 6000,
          panelClass: 'success-snack'
        });
      },
      error: () => {
        this.isLoading = false;
        this.step = 'confirm'; // move forward for security
        this.cd.detectChanges();
        this.snackBar.open('If the email exists, a code was sent.', 'Close', { duration: 6000 });
      }
    });
  }

  /** Step 2: Confirm code + new password */
  confirmReset() {
    if (this.code.length !== 6) {
      this.snackBar.open('Enter the 6-digit code', 'Close', { duration: 4000 });
      return;
    }
    if (!this.newPassword || !this.confirmPassword) {
      this.snackBar.open('Please fill in both password fields', 'Close', { duration: 4000 });
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 4000 });
      return;
    }
    if (this.newPassword.length < 8) {
      this.snackBar.open('Password must be at least 8 characters', 'Close', { duration: 4000 });
      return;
    }

    this.isLoading = true;
    this.libraryService.confirmPasswordReset(this.email.trim(), this.code, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 'confirm';
        this.cd.detectChanges();
        this.snackBar.open('Password reset successfully! You can now log in.', 'Close', {
          duration: 8000,
          panelClass: 'success-snack'
        });
        this.backToEmail(); // optional: go back to email step
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.error || 'Invalid or expired code';
        this.snackBar.open(msg, 'Close', { duration: 6000, panelClass: 'error-snack' });
      }
    });
  }

  /** Resend code with 30s cooldown */
  resendCode() {
    if (!this.email.trim()) {
      this.snackBar.open('Email is required to resend code', 'Close', { duration: 4000 });
      return;
    }

    this.isLoading = true;
    this.libraryService.resendPasswordResetCode(this.email.trim()).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.resendDisabled = true;
        this.step = 'confirm';
        this.cd.detectChanges();
        this.snackBar.open(res.message || 'A new code was sent!', 'Close', { duration: 6000 });

        setTimeout(() => (this.resendDisabled = false), 30000); // enable after 30s
      },
      error: (err) => {
        this.isLoading = false;
        this.cd.detectChanges();
        this.snackBar.open(err.error?.error || 'Could not resend code', 'Close', { duration: 6000 });
      }
    });
  }

  /** Go back to email entry */
  backToEmail() {
    this.step = 'request';
    this.code = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
