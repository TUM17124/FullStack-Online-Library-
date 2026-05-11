import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-social-success',
  standalone: true,
  templateUrl: './social-success.html',
  styleUrls: ['./social-success.scss']
})
export class SocialSuccessComponent implements OnInit {

  message = 'Signing you in...';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const access = params['access'];
      const refresh = params['refresh'];

      if (access && refresh) {

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Show success message first
        this.message = 'Login successful! Redirecting...';

        // Delay redirect (2–3 seconds is enough)
        setTimeout(() => {
          this.router.navigate(['/books']);
        }, 2500);

      } else {

        this.message = 'Login failed. Redirecting...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }
}