import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceTypeLabel } from '../../../shared/models/device.model';
import { Device } from '../../../shared/services/device';
import { User } from '../../../shared/services/user';
import { Toaster } from '../../../core/services/toaster';
import { Auth } from '../../../shared/services/auth';

@Component({
  selector: 'app-device-detail',
  imports: [CommonModule, FormsModule, ConfirmDialog, MatIconModule],
  templateUrl: './device-detail.html',
  styleUrl: './device-detail.scss',
})
export class DeviceDetail implements OnInit {
  protected readonly deviceService = inject(Device);
  protected readonly userService = inject(User);
  protected readonly authService = inject(Auth);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(Toaster);

  protected readonly DeviceTypeLabel = DeviceTypeLabel;
  protected readonly showDeleteDialog = signal(false);
  private readonly currentUserId = computed(() => this.authService.linkedUserId());

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deviceService.getById(id).subscribe();
    this.userService.loadAll().subscribe();
  }

  isAssignedToMe(assignedUserId?: number | null): boolean {
    return (
      assignedUserId !== null &&
      assignedUserId !== undefined &&
      assignedUserId === this.currentUserId()
    );
  }

  selfAssign(deviceId: number): void {
    this.deviceService.selfAssign(deviceId).subscribe({
      next: () => this.toast.success('Device assigned to you.'),
    });
  }
  // used by admin - now unused
  unassign(deviceId: number): void {
    this.deviceService.assignUser(deviceId, { userId: null }).subscribe({
      next: () => this.toast.success('Device unassigned.'),
    });
  }

  selfUnassign(deviceId: number): void {
    this.deviceService.selfUnassign(deviceId).subscribe({
      next: () => this.toast.success('Device returned successfully.'),
    });
  }

  clickIcon() {
    console.log('clicked');
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
