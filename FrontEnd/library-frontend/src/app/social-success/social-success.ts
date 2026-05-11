import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-social-success',
  template: `
    <div class="loading-container">
      <h2>Signing you in...</h2>
    </div>
  `,
})
export class SocialSuccessComponent implements OnInit {

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

        this.router.navigate(['/books']);

      } else {

        this.router.navigate(['/login']);
      }
    });
  }
}