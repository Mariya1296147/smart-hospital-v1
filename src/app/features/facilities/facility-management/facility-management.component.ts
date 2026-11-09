import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FacilityService, WardOption, BedOption } from '../../../core/services/facility.service';

@Component({
  selector: 'app-facility-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facility-management.component.html'
})
export class FacilityManagementComponent implements OnInit {
  wards: WardOption[] = [];
  beds: BedOption[] = [];
  loading = false;
  error = '';
  wardForm: { id?: number; wardName: string; wardNumber: string; wardType: string; capacity?: number } = this.newWard();
  bedForm: { id?: number; bedNumber: string; bedType: string; wardId?: number; status: string } = this.newBed();

  constructor(private readonly facilities: FacilityService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.facilities.getWards().subscribe({
      next: wards => {
        this.wards = wards ?? [];
        this.facilities.getBeds().subscribe({
          next: beds => { this.beds = beds ?? []; this.loading = false; },
          error: error => { this.error = this.message(error); this.loading = false; }
        });
      },
      error: error => { this.error = this.message(error); this.loading = false; }
    });
  }

  editWard(ward: WardOption): void {
    this.wardForm = { id: ward.id, wardName: ward.wardName, wardNumber: (ward as any).wardNumber ?? '', wardType: (ward as any).wardType ?? '', capacity: ward.capacity };
  }

  saveWard(): void {
    const payload = { wardName: this.wardForm.wardName.trim(), wardNumber: this.wardForm.wardNumber.trim() || null, wardType: this.wardForm.wardType.trim() || null, capacity: this.wardForm.capacity ?? null };
    this.loading = true;
    const request = this.wardForm.id ? this.facilities.updateWard(this.wardForm.id, payload) : this.facilities.createWard(payload);
    request.subscribe({ next: () => { this.wardForm = this.newWard(); this.load(); }, error: error => { this.error = this.message(error); this.loading = false; } });
  }

  editBed(bed: BedOption): void {
    const wardId = typeof bed.ward === 'number' ? bed.ward : bed.ward?.id ?? bed.wardId;
    this.bedForm = { id: bed.id, bedNumber: bed.bedNumber, bedType: bed.bedType ?? 'BED', wardId: wardId == null ? undefined : Number(wardId), status: bed.status };
  }

  wardNameForBed(bed: BedOption): string {
    const wardId = typeof bed.ward === 'number' ? bed.ward : bed.ward?.id ?? bed.wardId;
    if (typeof bed.ward === 'object' && bed.ward?.wardName) return bed.ward.wardName;
    return this.wards.find(ward => Number(ward.id) === Number(wardId))?.wardName ?? '—';
  }

  saveBed(): void {
    if (!this.bedForm.wardId) { this.error = 'Choose a ward for this bed or cabin.'; return; }
    const payload = { bedNumber: this.bedForm.bedNumber.trim(), bedType: this.bedForm.bedType, status: this.bedForm.status, ward: { id: Number(this.bedForm.wardId) } };
    this.loading = true;
    const request = this.bedForm.id ? this.facilities.updateBed(this.bedForm.id, payload) : this.facilities.createBed(payload);
    request.subscribe({ next: () => { this.bedForm = this.newBed(); this.load(); }, error: error => { this.error = this.message(error); this.loading = false; } });
  }

  deleteWard(ward: WardOption): void {
    if (!confirm(`Delete ward ${ward.wardName}?`)) return;
    this.facilities.deleteWard(ward.id).subscribe({ next: () => this.load(), error: error => this.error = this.message(error) });
  }

  deleteBed(bed: BedOption): void {
    if (!confirm(`Delete ${bed.bedType || 'bed'} ${bed.bedNumber}?`)) return;
    this.facilities.deleteBed(bed.id).subscribe({ next: () => this.load(), error: error => this.error = this.message(error) });
  }

  private newWard() { return { wardName: '', wardNumber: '', wardType: '', capacity: undefined as number | undefined }; }
  private newBed() { return { bedNumber: '', bedType: 'BED', wardId: undefined as number | undefined, status: 'AVAILABLE' }; }
  private message(error: any): string { return error?.error?.message || error?.error?.error || error?.message || 'Unable to save facility information.'; }
}
