import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, MatIcon],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  visible = input(false);
  title = input('Confirm Delete');
  message = input('Are you sure you want to delete this item? This action cannot be undone.');

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }
  onCancel(): void {
    this.cancelled.emit();
  }
}
