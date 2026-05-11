import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-social-success',
  standalone: true,
  templateUrl: './social-success.html',
  styleUrls: ['./social-success.scss']
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

        // Redirect to books page
        this.router.navigate(['/books']);

      } else {

        // Failed login
        this.router.navigate(['/login']);
      }
    });
  }
}