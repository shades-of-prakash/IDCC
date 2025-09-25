import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-userlogin',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './userlogin.component.html',
})
export class UserloginComponent {
  userFrom: FormGroup;
  constructor(private fb: FormBuilder) {
    this.userFrom = this.fb.group({
      participant1: this.fb.group({
        name: ['', Validators.required],
        regno: ['', Validators.required],
      }),

      participant2: this.fb.group({
        name: ['', Validators.required],
        regno: ['', Validators.required],
      }),
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    });
  }

  onSubmit() {
    if (this.userFrom.valid) {
      console.log(this.userFrom.value);
    } else {
      console.log('Form is invalid');
      this.userFrom.markAllAsTouched();
    }
  }
}
