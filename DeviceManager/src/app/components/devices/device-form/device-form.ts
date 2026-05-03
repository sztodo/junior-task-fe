import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceType, DeviceTypeLabel } from '../../../shared/models/device.model';
import { Device } from '../../../shared/services/device';
import { User } from '../../../shared/services/user';
import { Toaster } from '../../../core/services/toaster';
import { Ai } from '../../../shared/services/ai';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-device-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
})
export class DeviceForm implements OnInit {
  protected readonly deviceService = inject(Device);
  protected readonly userService = inject(User);
  protected readonly aiService = inject(Ai);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toaster);

  protected readonly DeviceType = DeviceType;
  protected readonly isEdit = signal(false);
  protected readonly duplicateWarning = signal(false);
  private editId: number | null = null;
  protected aiLoading = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    manufacturer: ['', [Validators.required, Validators.maxLength(200)]],
    type: [null as DeviceType | null, Validators.required],
    operatingSystem: ['', [Validators.required, Validators.maxLength(100)]],
    osVersion: ['', [Validators.required, Validators.maxLength(50)]],
    processor: ['', [Validators.required, Validators.maxLength(200)]],
    ramAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    description: [''],
    assignedUserId: [null as number | null],
  });

  ngOnInit(): void {
    this.userService.loadAll().subscribe();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit.set(true);
      this.editId = Number(id);
      this.deviceService.getById(this.editId).subscribe((device) => {
        this.form.patchValue({
          name: device.name,
          manufacturer: device.manufacturer,
          type: device.typeLabel === DeviceTypeLabel.Phone ? DeviceType.Phone : DeviceType.Tablet,
          operatingSystem: device.operatingSystem,
          osVersion: device.osVersion,
          processor: device.processor,
          ramAmount: device.ramAmount,
          description: device.description ?? '',
          assignedUserId: device.assignedUserId ?? null,
        });
      });
    }

    this.form.get('name')!.valueChanges.subscribe((name) => {
      if (!name) {
        this.duplicateWarning.set(false);
        return;
      }
      const isDuplicate = this.deviceService.existsByName(name, this.editId ?? undefined);
      this.duplicateWarning.set(isDuplicate);
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field) as AbstractControl;
    if (ctrl.errors?.['required']) return 'This field is required.';
    if (ctrl.errors?.['maxlength'])
      return `Too long (max ${ctrl.errors['maxlength'].requiredLength} chars).`;
    if (ctrl.errors?.['min']) return 'Must be at least 1.';
    return 'Invalid value.';
  }

  onSubmit(): void {
    if (this.form.invalid || this.duplicateWarning()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request = {
      name: value.name!,
      manufacturer: value.manufacturer!,
      type: value.type!,
      operatingSystem: value.operatingSystem!,
      osVersion: value.osVersion!,
      processor: value.processor!,
      ramAmount: value.ramAmount!,
      description: value.description || undefined,
      assignedUserId: value.assignedUserId ?? undefined,
    };

    if (this.isEdit() && this.editId) {
      this.deviceService.update(this.editId, request).subscribe({
        next: () => {
          this.toast.success('Device updated successfully.');
          this.router.navigate(['/devices', this.editId]);
        },
      });
    } else {
      this.deviceService.create(request).subscribe({
        next: (device) => {
          this.toast.success('Device created successfully.');
          this.router.navigate(['/devices', device.id]);
        },
      });
    }
  }

  getTooltipText(): string | null {
    if (this.duplicateWarning()) {
      return `A device named ${this.form.get('name')?.value} already exists`;
    }
    if (this.form.invalid) {
      return 'Please complete all required fields correctly';
    }
    if (this.deviceService.loading()) {
      return 'Processing...';
    }
    return null;
  }

  goBack(): void {
    if (this.isEdit() && this.editId) {
      this.router.navigate(['/devices', this.editId]);
    } else {
      this.router.navigate(['/devices']);
    }
  }

  canGenerateDescription(): boolean {
    const v = this.form.getRawValue();
    return !!(
      v.name?.trim() &&
      v.manufacturer?.trim() &&
      v.type !== null &&
      v.operatingSystem?.trim() &&
      v.osVersion?.trim() &&
      v.processor?.trim() &&
      v.ramAmount &&
      v.ramAmount > 0
    );
  }

  generateDescription(): void {
    if (!this.canGenerateDescription()) return;

    const v = this.form.getRawValue();
    this.aiLoading.set(true);

    this.aiService
      .getAiDescription({
        name: v.name!,
        manufacturer: v.manufacturer!,
        type: v.type === 1 ? 'Phone' : 'Tablet',
        operatingSystem: v.operatingSystem!,
        osVersion: v.osVersion!,
        processor: v.processor!,
        ramAmount: v.ramAmount!,
      })
      .subscribe({
        next: (res) => {
          this.form.patchValue({ description: res.description });
          this.toast.success('Description generated ✦');
          this.aiLoading.set(false);
        },
        error: (err) => {
          this.toast.error(err);
          this.aiLoading.set(false);
        },
      });
  }
}
