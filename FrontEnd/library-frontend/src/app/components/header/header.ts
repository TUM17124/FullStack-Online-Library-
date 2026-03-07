import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {
  showLogout = true;
  menuOpen = false;

  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    // Check current route on init
    this.updateLogoutVisibility(this.router.url);

    // Listen to navigation events
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLogoutVisibility(event.urlAfterRedirects);
      });
  }

  private updateLogoutVisibility(url: string): void {
    // Hide logout button only on dashboard
    this.showLogout = !url.includes('/dashboard');
  }
}