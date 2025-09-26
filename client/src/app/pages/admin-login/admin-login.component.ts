import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  private readonly adminUser = {
    username: 'admin',
    password: 'admin123',
  };

  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
      if (isLoggedIn === 'true') {
        this.router.navigate(['/admin']);
      }
    }
  }

  onSubmit() {
    if (!this.isBrowser) return;

    const { username, password } = this.loginForm.value;

    if (
      username === this.adminUser.username &&
      password === this.adminUser.password
    ) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      this.router.navigate(['/admin']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
