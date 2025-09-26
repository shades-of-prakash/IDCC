import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(username: string, password: string): boolean {
    if (username && password && this.isBrowser) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('isAdminLoggedIn');
    }
  }

  isLoggedIn(): boolean {
    return this.isBrowser && localStorage.getItem('isAdminLoggedIn') === 'true';
  }
}
