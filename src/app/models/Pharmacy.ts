export interface Pharmacy {
  id: number;
  medicineId: string;
  medicineName: string;
  category: string;
  manufacturer: string;
  batchNumber?: string;
  quantity: number;
  unitPrice: number;
  purchasePrice?: number;
  sellingPrice?: number;
  lowStockThreshold?: number;
  expiryDate: string;
  supplier: string;
  status: string;
}

export interface PharmacyTransactionItem {
  id?: number;
  pharmacyId: number;
  medicineId: string;
  medicineName: string;
  batchNumber?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PharmacyTransaction {
  id: number;
  invoiceNumber: string;
  supplierName?: string;
  supplierContact?: string;
  customerName?: string;
  customerContact?: string;
  transactionDate: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  items: PharmacyTransactionItem[];
}
