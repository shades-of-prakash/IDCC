import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrl = 'http://localhost:4000/api/admin/auth';

  private authState = new BehaviorSubject<boolean>(false);

  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {
    this.getAdminMe().subscribe({
      next: () => this.authState.next(true),
      error: () => this.authState.next(false),
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(tap(() => this.authState.next(true)));
  }

  getAdminMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(() => this.authState.next(true)),
      catchError((err) => {
        this.authState.next(false);
        throw err;
      })
    );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.authState.next(false)));
  }

  isLoggedIn(): boolean {
    return this.authState.value;
  }
}
