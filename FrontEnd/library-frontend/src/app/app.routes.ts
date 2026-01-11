import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { DashboardComponent } from './components/dashboard/dashboard';
import { BookListComponent } from './components/book-list/book-list';
import { BorrowedBooksComponent } from './components/borrowed-books/borrowed-books';
import { OverdueBooksComponent } from './components/overdue-books/overdue-books';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // ← Start at login
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPassword },

  // Protected routes (require login)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'books', component: BookListComponent, canActivate: [authGuard] },
  { path: 'borrowed', component: BorrowedBooksComponent, canActivate: [authGuard] },
  { path: 'overdue', component: OverdueBooksComponent, canActivate: [authGuard] },

  // Wildcard: redirect unknown paths to dashboard (only if logged in, otherwise guard handles it)
  { path: '**', redirectTo: '/dashboard' }
];