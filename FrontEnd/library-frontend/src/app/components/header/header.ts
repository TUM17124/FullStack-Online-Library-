import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HostListener, ElementRef, ViewChild } from '@angular/core';

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

   @ViewChild('navContainer') navContainer!: ElementRef;

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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }

  // Detect click outside the menu to close it
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.menuOpen && !this.navContainer.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    } }



}