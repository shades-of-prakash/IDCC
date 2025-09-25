import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  login(username: string, password: string): boolean {
    if (username && password) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('isAdminLoggedIn');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  }
}
