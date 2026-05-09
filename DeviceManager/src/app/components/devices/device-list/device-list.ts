import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Device as DeviceService } from '../../../shared/services/device';
import { Toaster } from '../../../core/services/toaster';
import { Device, DeviceTypeLabel } from '../../../shared/models/device.model';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Auth } from '../../../shared/services/auth';
import { distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Search } from '../../../shared/services/search';

@Component({
  selector: 'app-device-list',
  imports: [CommonModule, FormsModule, ConfirmDialog, MatIcon],
  templateUrl: './device-list.html',
  styleUrl: './device-list.scss',
})
export class DeviceList implements OnInit {
  protected readonly deviceService = inject(DeviceService);
  protected readonly authService = inject(Auth);
  protected readonly searchService = inject(Search);
  protected readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  private readonly destroyRef = inject(DestroyRef);

  protected readonly showDeleteDialog = signal(false);
  protected readonly deviceToDelete = signal<Device | null>(null);

  protected readonly DeviceType = DeviceTypeLabel;

  protected readonly message = this.authService.isAdmin()
    ? 'This device will be permanently removed from the system.'
    : 'This device will be unassigned from you.';

  readonly currentUserId = computed(() => this.authService.linkedUserId());
  isAssignedToMe(assignedUserId?: number | null): boolean {
    var isAssignedToMe =
      assignedUserId !== null &&
      assignedUserId !== undefined &&
      assignedUserId === this.currentUserId();
    return isAssignedToMe;
  }

  // search bar logic
  protected searchTerm = '';
  protected isSearching = signal(false);
  protected searchResults = signal<Device[] | null>(null);
  protected readonly activeFilter = signal<'all' | 'phone' | 'tablet' | 'unassigned'>('all');
  private readonly searchQuery$ = new Subject<string>();

  protected readonly filteredDevices = computed(() => {
    let list = this.deviceService.devices();
    const filter = this.activeFilter();
    if (this.searchResults() !== null) {
      list = this.searchResults()!;
    }
    if (filter === 'phone') list = list.filter((d) => d.typeLabel === DeviceTypeLabel.Phone);
    if (filter === 'tablet') list = list.filter((d) => d.typeLabel === DeviceTypeLabel.Tablet);
    if (filter === 'unassigned') list = list.filter((d) => !d.assignedUserId);

    return list;
  });

  ngOnInit(): void {
    this.deviceService.loadAll().subscribe();
    this.searchQuery$
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        if (!query.trim()) {
          this.searchResults.set(null);
          this.isSearching.set(false);
          return;
        }
        this.isSearching.set(true);
        this.searchService.searchDevices(query).subscribe({
          next: (results) => {
            this.searchResults.set(results);
            this.isSearching.set(false);
          },
          error: () => this.isSearching.set(false),
        });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchQuery$.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults.set(null);
    this.isSearching.set(false);
  }

  confirmDelete(device: Device): void {
    this.deviceToDelete.set(device);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const device = this.deviceToDelete();
    if (!device) return;
    if (this.authService.isAdmin()) {
      this.deviceService.delete(device.id).subscribe({
        next: () => {
          this.toaster.success(`"${device.name}" deleted successfully.`);
          this.showDeleteDialog.set(false);
        },
      });
    } else {
      this.deviceService.selfUnassign(device.id).subscribe({
        next: () => {
          this.toaster.success(`"${device.name}" returned successfully.`);
          this.showDeleteDialog.set(false);
        },
      });
    }
  }
}
