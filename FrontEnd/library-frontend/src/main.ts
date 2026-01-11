import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatSnackBarModule,
      MatToolbarModule,
      MatButtonModule,
      MatCardModule,
      MatInputModule,
      MatFormFieldModule,
      MatTableModule,
      MatIconModule,
      FormsModule
    )
  ]
}).catch(err => console.error(err));