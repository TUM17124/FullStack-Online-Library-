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
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

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

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.emailFormControl.valueChanges.subscribe(value => {
      this.email = value || '';
    });
  }

  // ── Google Login ───────────────────────────────────────────────────────────
  loginWithGoogle() {
    // Redirect to Django Allauth Google login endpoint
    const googleLoginUrl = 'https://online-library-tum.onrender.com/accounts/google/login/?process=login';
    window.location.href = googleLoginUrl;
  }

  // ── Existing Register Method (unchanged) ───────────────────────────────────
  onRegister() {
    // ... your existing code ...
  }

  // ── Existing verifyEmail() and resendVerification() remain the same ───────
  verifyEmail() { /* ... */ }
  resendVerification() { /* ... */ }
}