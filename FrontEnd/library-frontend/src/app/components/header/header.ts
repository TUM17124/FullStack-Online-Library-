import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']  // ← fixed
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router  // ← add this to check current route
  ) {}

  // Optional helper to check if logout should be shown
  showLogout(): boolean {
    return this.router.url !== '/dashboard';
  }
}