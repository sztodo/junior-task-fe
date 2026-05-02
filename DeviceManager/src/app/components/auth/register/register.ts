import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../shared/services/auth';
import { Toaster } from '../../../core/services/toaster';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly authService = inject(Auth);
  private readonly toast = inject(Toaster);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      role: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
    },
    { validators: passwordMatchValidator },
  );

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  strengthClass(pw: string): string {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong';
    if (pw.length >= 8) return 'medium';
    return 'weak';
  }

  strengthWidth(pw: string): string {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return '100%';
    if (pw.length >= 8) return '60%';
    return '30%';
  }

  strengthLabel(pw: string): string {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'Strong';
    if (pw.length >= 8) return 'Medium';
    return 'Weak';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const v = this.form.getRawValue();

    this.authService
      .register({
        email: v.email!,
        password: v.password!,
        name: v.name!,
        role: v.role!,
        location: v.location!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Account created! Welcome to DevTrack.');
          this.router.navigate(['/devices']);
        },
        error: () => this.loading.set(false),
      });
  }
}
