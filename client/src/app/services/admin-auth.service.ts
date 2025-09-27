import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private isLoggedInSignal = signal(false);
  private isCheckingAuthSignal = signal(true);

  constructor(private http: HttpClient) {
    this.checkAuth(); // run on service init
  }

  // expose as getters
  isLoggedIn = this.isLoggedInSignal.asReadonly();
  isCheckingAuth = this.isCheckingAuthSignal.asReadonly();

  checkAuth() {
    this.isCheckingAuthSignal.set(true);
    this.http.get<{ loggedIn: boolean }>('http://localhost:4000/api/admin/auth/me')
      .pipe(
        tap((res) => {
          this.isLoggedInSignal.set(res.loggedIn);
          this.isCheckingAuthSignal.set(false);
        }),
        catchError(() => {
          this.isLoggedInSignal.set(false);
          this.isCheckingAuthSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  login(username: string, password: string) {
    this.isCheckingAuthSignal.set(true);
    return this.http.post<{ token: string }>('http://localhost:4000/api/admin/auth/login', { username, password }).pipe(
      tap(() => {
        this.isLoggedInSignal.set(true);
        this.isCheckingAuthSignal.set(false);
      }),
      catchError((err) => {
        this.isLoggedInSignal.set(false);
        this.isCheckingAuthSignal.set(false);
        return of(err);
      })
    );
  }

  logout() {
    this.isLoggedInSignal.set(false);
  }
}
