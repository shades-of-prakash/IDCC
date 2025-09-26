import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AdminAuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.isLoading = false;
  }
  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Invalid username or password';
        this.isLoading = false;
      },
    });
  }
}
