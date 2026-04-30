import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Toaster } from '../../../core/services/toaster';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, MatIcon],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  protected readonly toastService = inject(Toaster);
  protected readonly icons = {
    success: 'check',
    error: 'close',
    info: 'info_outline',
    warning: 'warning',
  };
}
