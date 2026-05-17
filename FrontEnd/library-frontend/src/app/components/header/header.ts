import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  RouterLink,
  Router,
  NavigationEnd,
  RouterLinkActive
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth';

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

  // Authentication state
  isAuthenticated = false;

  @ViewChild('navContainer') navContainer!: ElementRef;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {

    // Check authentication status
    this.checkAuth();

    // Check current route on init
    this.updateLogoutVisibility(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        this.updateLogoutVisibility(event.urlAfterRedirects);

        // Update auth status on navigation
        this.checkAuth();
      });
  }

  // =========================
  // AUTHENTICATION
  // =========================

  checkAuth(): void {

    // OPTION 1:
    // If your auth service has isLoggedIn()

    this.isAuthenticated = this.authService.isLoggedIn();

    /*
    OPTION 2:
    If using token directly

    this.isAuthenticated =
      !!localStorage.getItem('token');
    */
  }

  logout(): void {

    this.authService.logout();

    this.isAuthenticated = false;

    this.closeMenu();

    this.router.navigate(['/login']);
  }

  // =========================
  // NAVIGATION UI
  // =========================

  private updateLogoutVisibility(url: string): void {

    // Hide logout button only on dashboard
    this.showLogout = !url.includes('/dashboard');
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  // =========================
  // CLOSE MENU ON OUTSIDE CLICK
  // =========================

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {

    if (
      this.menuOpen &&
      !this.navContainer.nativeElement.contains(event.target)
    ) {
      this.menuOpen = false;
    }
  }
}