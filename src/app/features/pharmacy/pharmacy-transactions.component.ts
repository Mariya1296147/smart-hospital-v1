import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Pharmacy, PharmacyTransaction } from '../../models/Pharmacy';
import { PharmacyService, PurchaseRequest, SaleRequest } from '../../core/services/pharmacy.service';

interface PurchaseLine {
  pharmacyId?: number; medicineId?: string; medicineName: string; category: string; manufacturer: string;
  batchNumber: string; purchasePrice: number; sellingPrice: number; quantity: number; expiryDate: string;
}
interface SaleLine { pharmacyId: number; quantity: number; }

@Component({
  selector: 'app-pharmacy-transactions', standalone: true, imports: [CommonModule, FormsModule],
  template: `
  <div class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><h2 class="fw-bold mb-1">{{isPurchase ? 'Medicine Purchases' : 'Medicine Sales'}}</h2><p class="text-muted mb-0">{{isPurchase ? 'Receive stock and record supplier invoices.' : 'Sell available stock and issue customer receipts.'}}</p></div>
      <button class="btn btn-primary" (click)="showForm=!showForm"><i class="bi bi-plus-lg me-2"></i>{{showForm ? 'Close form' : (isPurchase ? 'Record purchase' : 'New sale')}}</button>
    </div>
    <div *ngIf="error" class="alert alert-danger" role="alert">{{error}}</div>
    <div *ngIf="success" class="alert alert-success" role="status">{{success}}</div>
    <section *ngIf="showForm" class="card border-0 shadow-sm mb-4"><div class="card-body p-4">
      <h5 class="fw-semibold mb-3">{{isPurchase ? 'Purchase details' : 'Sale details'}}</h5>
      <div class="row g-3 mb-3">
        <div class="col-md-4"><label class="form-label">Invoice number (optional)</label><input class="form-control" [(ngModel)]="invoiceNumber" name="invoiceNumber" placeholder="Generated if blank"></div>
        <ng-container *ngIf="isPurchase; else saleParty">
          <div class="col-md-4"><label class="form-label">Supplier *</label><input class="form-control" [(ngModel)]="partyName" name="supplier" required></div>
        </ng-container>
        <ng-template #saleParty><div class="col-md-4"><label class="form-label">Customer</label><input class="form-control" [(ngModel)]="partyName" name="customer" placeholder="Walk-in customer"></div></ng-template>
        <div class="col-md-4"><label class="form-label">Contact</label><input class="form-control" [(ngModel)]="partyContact" name="partyContact"></div>
        <div class="col-md-4"><label class="form-label">{{isPurchase ? 'Purchase' : 'Sale'}} date</label><input type="date" class="form-control" [(ngModel)]="transactionDate" name="transactionDate" required></div>
        <div class="col-md-4"><label class="form-label">Discount</label><input type="number" min="0" step="0.01" class="form-control" [(ngModel)]="discount" name="discount"></div>
      </div>
      <h6 class="fw-semibold mt-4">Medicines</h6>
      <div *ngFor="let line of purchaseLines; let i=index" class="rounded border p-3 mb-3" [hidden]="!isPurchase">
        <div class="row g-2 align-items-end">
          <div class="col-lg-4"><label class="form-label">Existing batch (optional)</label><select class="form-select" [(ngModel)]="line.pharmacyId" [name]="'batch'+i"><option [ngValue]="undefined">Add a new medicine batch</option><option *ngFor="let m of medicines" [ngValue]="m.id">{{m.medicineName}} · {{m.batchNumber || m.medicineId}} (stock {{m.quantity}})</option></select></div>
          <div class="col-lg-4" *ngIf="!line.pharmacyId"><label class="form-label">Medicine name *</label><input class="form-control" [(ngModel)]="line.medicineName" [name]="'name'+i" required></div>
          <div class="col-lg-2"><label class="form-label">Batch</label><input class="form-control" [(ngModel)]="line.batchNumber" [name]="'batchno'+i"></div>
          <div class="col-lg-2"><label class="form-label">Quantity *</label><input type="number" min="1" class="form-control" [(ngModel)]="line.quantity" [name]="'qty'+i"></div>
          <ng-container *ngIf="!line.pharmacyId"><div class="col-md-3"><label class="form-label">Category</label><input class="form-control" [(ngModel)]="line.category" [name]="'cat'+i"></div><div class="col-md-3"><label class="form-label">Manufacturer</label><input class="form-control" [(ngModel)]="line.manufacturer" [name]="'maker'+i"></div><div class="col-md-2"><label class="form-label">Selling price *</label><input type="number" min="0.01" step="0.01" class="form-control" [(ngModel)]="line.sellingPrice" [name]="'sell'+i"></div><div class="col-md-2"><label class="form-label">Expiry</label><input type="date" class="form-control" [(ngModel)]="line.expiryDate" [name]="'expiry'+i"></div></ng-container>
          <div class="col-md-2"><label class="form-label">Purchase price *</label><input type="number" min="0.01" step="0.01" class="form-control" [(ngModel)]="line.purchasePrice" [name]="'price'+i"></div>
          <div class="col-md-1"><button type="button" class="btn btn-outline-danger" (click)="removePurchaseLine(i)" [disabled]="purchaseLines.length===1" aria-label="Remove item"><i class="bi bi-trash"></i></button></div>
        </div>
      </div>
      <div *ngFor="let line of saleLines; let i=index" class="row g-2 align-items-end rounded border p-3 mb-3" [hidden]="isPurchase">
        <div class="col-md-7"><label class="form-label">Medicine batch *</label><select class="form-select" [(ngModel)]="line.pharmacyId" [name]="'saleBatch'+i"><option [ngValue]="0">Select in-stock, unexpired batch</option><option *ngFor="let m of sellableMedicines" [ngValue]="m.id">{{m.medicineName}} · {{m.batchNumber || m.medicineId}} · {{m.quantity}} available · ৳{{m.sellingPrice ?? m.unitPrice}}</option></select></div>
        <div class="col-md-3"><label class="form-label">Quantity *</label><input type="number" min="1" [max]="stockFor(line.pharmacyId)" class="form-control" [(ngModel)]="line.quantity" [name]="'saleQty'+i"></div>
        <div class="col-md-2"><button type="button" class="btn btn-outline-danger" (click)="removeSaleLine(i)" [disabled]="saleLines.length===1"><i class="bi bi-trash me-1"></i>Remove</button></div>
      </div>
      <button type="button" class="btn btn-outline-primary btn-sm" (click)="addLine()"><i class="bi bi-plus me-1"></i>Add medicine</button>
      <div class="d-flex justify-content-end mt-3"><div class="text-end"><div>Subtotal: <strong>৳{{ draftSubtotal | number:'1.2-2' }}</strong></div><div>Discount: <strong>৳{{ discount || 0 | number:'1.2-2' }}</strong></div><div class="fs-5">Total: <strong>৳{{ draftTotal | number:'1.2-2' }}</strong></div></div></div>
      <div class="mt-4 d-flex justify-content-end gap-2"><button class="btn btn-light" (click)="showForm=false">Cancel</button><button class="btn btn-success" [disabled]="saving" (click)="submit()">{{saving ? 'Saving…' : (isPurchase ? 'Save purchase & create invoice' : 'Complete sale & create receipt')}}</button></div>
    </div></section>
    <section class="card border-0 shadow-sm"><div class="card-body p-0 table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>Invoice</th><th>Date</th><th>{{isPurchase ? 'Supplier' : 'Customer'}}</th><th>Items</th><th>Subtotal</th><th>Discount</th><th>Total</th><th>PDF</th></tr></thead><tbody>
      <tr *ngFor="let tx of transactions"><td class="fw-semibold">{{tx.invoiceNumber}}</td><td>{{tx.transactionDate | date:'mediumDate'}}</td><td>{{isPurchase ? tx.supplierName : (tx.customerName || 'Walk-in customer')}}</td><td><div *ngFor="let item of tx.items">{{item.medicineName}} × {{item.quantity}}</div></td><td>৳{{tx.subtotal | number:'1.2-2'}}</td><td>৳{{tx.discount | number:'1.2-2'}}</td><td class="fw-bold">৳{{tx.totalAmount | number:'1.2-2'}}</td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-outline-primary" (click)="openPdf(tx.id,false)" title="Print or preview"><i class="bi bi-printer"></i></button><button class="btn btn-sm btn-outline-secondary" (click)="openPdf(tx.id,true)" title="Download"><i class="bi bi-download"></i></button></div></td></tr>
      <tr *ngIf="!loading && transactions.length===0"><td colspan="8" class="text-center text-muted p-5">No {{isPurchase ? 'purchase' : 'sales'}} records yet.</td></tr>
      <tr *ngIf="loading"><td colspan="8" class="text-center p-5">Loading transactions…</td></tr>
    </tbody></table></div></section>
  </div>`
})
export class PharmacyTransactionsComponent implements OnInit {
  isPurchase = true; loading = false; saving = false; showForm = false; error = ''; success = '';
  medicines: Pharmacy[] = []; transactions: PharmacyTransaction[] = [];
  invoiceNumber = ''; partyName = ''; partyContact = ''; transactionDate = new Date().toISOString().slice(0, 10); discount = 0;
  purchaseLines: PurchaseLine[] = [this.newPurchaseLine()]; saleLines: SaleLine[] = [{ pharmacyId: 0, quantity: 1 }];
  constructor(private route: ActivatedRoute, private pharmacy: PharmacyService) {}
  ngOnInit(): void { this.isPurchase = this.route.snapshot.data['transactionType'] === 'purchase'; this.load(); }
  get sellableMedicines(): Pharmacy[] { return this.medicines.filter(m => m.quantity > 0 && (!m.expiryDate || m.expiryDate >= this.transactionDate)); }
  get draftSubtotal(): number {
    if (this.isPurchase) return this.purchaseLines.reduce((sum, line) => sum + Number(line.purchasePrice || 0) * Number(line.quantity || 0), 0);
    return this.saleLines.reduce((sum, line) => { const m = this.medicines.find(item => item.id === Number(line.pharmacyId)); return sum + Number(m?.sellingPrice ?? m?.unitPrice ?? 0) * Number(line.quantity || 0); }, 0);
  }
  get draftTotal(): number { return Math.max(0, this.draftSubtotal - Number(this.discount || 0)); }
  stockFor(id: number): number { return this.medicines.find(m => m.id === Number(id))?.quantity ?? 0; }
  addLine(): void { if (this.isPurchase) this.purchaseLines.push(this.newPurchaseLine()); else this.saleLines.push({ pharmacyId: 0, quantity: 1 }); }
  removePurchaseLine(index: number): void { this.purchaseLines.splice(index, 1); }
  removeSaleLine(index: number): void { this.saleLines.splice(index, 1); }
  load(): void {
    this.loading = true; this.error = '';
    this.pharmacy.getMedicines().subscribe({ next: rows => this.medicines = rows ?? [], error: () => this.error = 'Could not load medicine stock.' });
    const request = this.isPurchase ? this.pharmacy.getPurchases() : this.pharmacy.getSales();
    request.subscribe({ next: rows => { this.transactions = rows ?? []; this.loading = false; }, error: e => { this.error = e?.error?.message || 'Could not load transaction history.'; this.loading = false; } });
  }
  submit(): void {
    this.error = ''; this.success = '';
    if (this.isPurchase) {
      if (!this.partyName.trim() || this.purchaseLines.some(x => x.quantity < 1 || x.purchasePrice <= 0 || (!x.pharmacyId && (!x.medicineName.trim() || x.sellingPrice <= 0)))) { this.error = 'Enter supplier, medicine, quantity, and valid prices.'; return; }
      const body: PurchaseRequest = { invoiceNumber: this.invoiceNumber || undefined, supplierName: this.partyName.trim(), supplierContact: this.partyContact, purchaseDate: this.transactionDate, discount: Number(this.discount || 0), items: this.purchaseLines.map(x => ({ pharmacyId: x.pharmacyId || undefined, medicineId: x.medicineId || undefined, medicineName: x.medicineName, category: x.category, manufacturer: x.manufacturer, batchNumber: x.batchNumber, purchasePrice: Number(x.purchasePrice), sellingPrice: x.pharmacyId ? undefined : Number(x.sellingPrice), quantity: Number(x.quantity), expiryDate: x.expiryDate || undefined })) };
      this.saving = true; this.pharmacy.createPurchase(body).subscribe({ next: tx => this.completed(tx, true), error: e => this.failed(e) });
    } else {
      if (this.saleLines.some(x => !x.pharmacyId || x.quantity < 1 || x.quantity > this.stockFor(x.pharmacyId))) { this.error = 'Select an available batch and enter a quantity within its stock.'; return; }
      const body: SaleRequest = { invoiceNumber: this.invoiceNumber || undefined, customerName: this.partyName, customerContact: this.partyContact, saleDate: this.transactionDate, discount: Number(this.discount || 0), items: this.saleLines.map(x => ({ pharmacyId: Number(x.pharmacyId), quantity: Number(x.quantity) })) };
      this.saving = true; this.pharmacy.createSale(body).subscribe({ next: tx => this.completed(tx, false), error: e => this.failed(e) });
    }
  }
  openPdf(id: number, download: boolean): void { this.pharmacy.openInvoice(this.isPurchase ? 'purchases' : 'sales', id, download, message => this.error = message); }
  private completed(tx: PharmacyTransaction, purchase: boolean): void { this.saving = false; this.showForm = false; this.success = `${purchase ? 'Purchase' : 'Sale'} ${tx.invoiceNumber} saved. Invoice PDF is ready.`; this.invoiceNumber=''; this.partyName=''; this.partyContact=''; this.discount=0; this.load(); this.pharmacy.openInvoice(purchase ? 'purchases' : 'sales', tx.id, true, message => this.error = message); }
  private failed(e: any): void { this.saving = false; this.error = e?.error?.message || e?.error?.error || 'Could not save this transaction. No stock changes were committed.'; }
  private newPurchaseLine(): PurchaseLine { return { medicineName: '', category: '', manufacturer: '', batchNumber: '', purchasePrice: 0, sellingPrice: 0, quantity: 1, expiryDate: '' }; }
}
