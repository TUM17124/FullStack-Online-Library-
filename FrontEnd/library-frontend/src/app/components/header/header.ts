import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';
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
export class HeaderComponent {
  constructor(public authService: AuthService) {}
}