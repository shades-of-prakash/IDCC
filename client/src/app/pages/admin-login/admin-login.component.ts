import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AdminAuthService);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage = signal<string | null>(null);
  formLoading = signal(false);

  onSubmit() {
    if (this.loginForm.invalid) return;
    const { username, password } = this.loginForm.value;

    this.formLoading.set(true);
    this.loginForm.disable();

    this.authService.login(username!, password!).subscribe({
      next: (res) => {
        if ((res as any)?.error) {
          this.errorMessage.set('Invalid username or password');
        }
        this.formLoading.set(false);
        this.loginForm.enable();
      },
      error: () => {
        this.errorMessage.set('Login failed');
        this.formLoading.set(false);
        this.loginForm.enable();
      },
    });
  }
}
