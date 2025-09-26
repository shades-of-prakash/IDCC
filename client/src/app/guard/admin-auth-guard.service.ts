import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(private authService: AdminAuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.getAdminMe().pipe(
      map(() => true),
      catchError(() => of(this.router.parseUrl('/admin-login')))
    );
  }
}
