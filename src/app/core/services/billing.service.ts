import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BillablePrescriptionTest, Billing, BillingPayment, BillingPaymentRequest } from '../../models/billing';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly resource = 'billings';
  constructor(private readonly api: ApiService, private readonly http: HttpClient) {}
  getBills(): Observable<Billing[]> { return this.api.getAll<Billing>(this.resource); }
  getBillById(id: number): Observable<Billing> { return this.api.getById<Billing>(this.resource, id); }
  addBill(value: Partial<Billing>): Observable<Billing> {
    const payload = { ...value };
    delete payload.id;
    return this.api.create<Billing>(this.resource, payload);
  }
  updateBill(id: number, value: Partial<Billing>): Observable<Billing> { return this.api.update<Billing>(this.resource, id, value); }
  deleteBill(id: number): Observable<void> { return this.api.remove(this.resource, id); }

  getUnbilledPrescriptionTests(): Observable<BillablePrescriptionTest[]> {
    return this.api.getResource<BillablePrescriptionTest[]>(`${this.resource}/prescribed-tests`);
  }

  getPayments(id: number): Observable<BillingPayment[]> {
    return this.api.getResource<BillingPayment[]>(`${this.resource}/${id}/payments`);
  }

  addPayment(id: number, payment: BillingPaymentRequest): Observable<BillingPayment> {
    return this.http.post<BillingPayment>(`${environment.apiBaseUrl}/${this.resource}/${id}/payments`, payment);
  }

  getInvoicePdf(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/${this.resource}/${id}/invoice.pdf`, { responseType: 'blob' });
  }

  getPaymentReceiptPdf(id: number, paymentId: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/${this.resource}/${id}/payments/${paymentId}/receipt.pdf`, { responseType: 'blob' });
  }
}
