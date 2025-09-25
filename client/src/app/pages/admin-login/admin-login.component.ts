import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

  private readonly adminUser = {
    username: 'admin',
    password: 'admin123',
  };
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn === 'true') {
      this.router.navigate(['/admin']);
    }
  }

  onSubmit() {
    const { username, password } = this.loginForm.value;
    if (
      username === this.adminUser.username &&
      password === this.adminUser.password
    ) {
      // store login status in localStorage or a static variable
      localStorage.setItem('isAdminLoggedIn', 'true');

      // navigate to admin home
      this.router.navigate(['/admin']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
