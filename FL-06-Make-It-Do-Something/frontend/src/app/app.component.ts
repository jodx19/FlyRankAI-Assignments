import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly contactForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(12)]],
  });

  isSubmitting = false;
  status: 'idle' | 'success' | 'error' = 'idle';

  onSubmit(): void {
    if (this.contactForm.invalid || this.isSubmitting) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.status = 'idle';
    this.http.post('/api/contact', this.contactForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.status = 'success';
        this.contactForm.reset();
      },
      error: () => {
        this.isSubmitting = false;
        this.status = 'error';
      },
    });
  }

  showError(controlName: 'name' | 'email' | 'message'): boolean {
    const control = this.contactForm.controls[controlName];
    return control.invalid && control.touched;
  }
}
