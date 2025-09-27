import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const AdminAuthGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  // Convert signal to observable
  return toObservable(authService.isLoggedIn).pipe(
    // Wait until it's not undefined (auth check finished)
    filter((status): status is boolean => status !== undefined),
    map((status) => (status ? true : router.parseUrl('/admin-login')))
  );
};
