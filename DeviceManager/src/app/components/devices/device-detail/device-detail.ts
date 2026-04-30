import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceTypeLabel } from '../../../shared/models/device.model';
import { Device } from '../../../shared/services/device';
import { User } from '../../../shared/services/user';
import { Toaster } from '../../../core/services/toaster';

@Component({
  selector: 'app-device-detail',
  imports: [CommonModule, FormsModule, ConfirmDialog, MatIcon],
  templateUrl: './device-detail.html',
  styleUrl: './device-detail.scss',
})
export class DeviceDetail implements OnInit {
  protected readonly deviceService = inject(Device);
  protected readonly userService = inject(User);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(Toaster);

  protected readonly DeviceTypeLabel = DeviceTypeLabel;
  protected readonly showDeleteDialog = signal(false);
  protected selectedUserId: number | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deviceService.getById(id).subscribe();
    this.userService.loadAll().subscribe();
  }

  assign(deviceId: number): void {
    if (!this.selectedUserId) return;
    this.deviceService.assignUser(deviceId, { userId: this.selectedUserId }).subscribe({
      next: () => this.toast.success('Device assigned successfully.'),
    });
  }

  unassign(deviceId: number): void {
    this.deviceService.assignUser(deviceId, { userId: null }).subscribe({
      next: () => this.toast.success('Device unassigned.'),
    });
  }

  onDeleteConfirmed(): void {
    const device = this.deviceService.selectedDevice();
    if (!device) return;
    this.deviceService.delete(device.id).subscribe({
      next: () => {
        this.toast.success(`"${device.name}" deleted.`);
        this.router.navigate(['/devices']);
      },
    });
  }
}
