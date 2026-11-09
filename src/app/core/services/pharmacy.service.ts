import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Pharmacy, PharmacyTransaction } from '../../models/Pharmacy';
import { environment } from '../../../environment/environment';

export interface PurchaseRequest {
  invoiceNumber?: string; supplierName: string; supplierContact?: string; purchaseDate: string; discount: number;
  items: Array<{ pharmacyId?: number; medicineId?: string; medicineName: string; category?: string; manufacturer?: string; batchNumber?: string; purchasePrice: number; sellingPrice?: number; quantity: number; expiryDate?: string }>;
}
export interface SaleRequest {
  invoiceNumber?: string; customerName?: string; customerContact?: string; saleDate: string; discount: number;
  items: Array<{ pharmacyId: number; quantity: number }>;
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {

  private readonly resource = 'pharmacy';

  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacy`;
  constructor(private readonly api: ApiService, private readonly http: HttpClient) { }

  getMedicines(): Observable<Pharmacy[]> {
    return this.api.getAll<Pharmacy>
      (this.resource);
  }
  getMedicineById(id: number): Observable<Pharmacy> {
    return this.api.getById<Pharmacy>
      (this.resource, id);
  }
  addMedicine(value: Partial<Pharmacy>): Observable<Pharmacy> {
    return this.api.create<Pharmacy>
      (this.resource, value);
  }
  updateMedicine(id: number, value: Partial<Pharmacy>): Observable<Pharmacy> {
    return this.api.update<Pharmacy>
      (this.resource, id, value);
  }
  deleteMedicine(id: number): Observable<void> {
    return this.api.remove
      (this.resource, id);
  }

  getPurchases(): Observable<PharmacyTransaction[]> { return this.http.get<PharmacyTransaction[]>(`${this.baseUrl}/purchases`); }
  createPurchase(body: PurchaseRequest): Observable<PharmacyTransaction> { return this.http.post<PharmacyTransaction>(`${this.baseUrl}/purchases`, body); }
  getSales(): Observable<PharmacyTransaction[]> { return this.http.get<PharmacyTransaction[]>(`${this.baseUrl}/sales`); }
  createSale(body: SaleRequest): Observable<PharmacyTransaction> { return this.http.post<PharmacyTransaction>(`${this.baseUrl}/sales`, body); }
  openInvoice(type: 'purchases' | 'sales', id: number, download = false, onError?: (message: string) => void): void {
    const previewWindow = download ? null : window.open('about:blank', '_blank');
    this.http.get(`${this.baseUrl}/${type}/${id}/invoice.pdf`, { responseType: 'blob' }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        if (download) { const link = document.createElement('a'); link.href = url; link.download = `${type === 'purchases' ? 'purchase' : 'sale'}-${id}.pdf`; link.click(); }
        else if (previewWindow) { previewWindow.opener = null; previewWindow.location.href = url; }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: error => { previewWindow?.close(); onError?.(error?.error?.message || 'Invoice PDF could not be opened.'); }
    });
  }
}
