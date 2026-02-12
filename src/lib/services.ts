import api from './api';

// Types
export interface Vendor {
  id: string;
  legalName: string;
  vendorType?: string;
  businessCategory?: string;
  registrationNumber?: string;
  ntnVatGst?: string;
  country?: string;
  city?: string;
  address?: string;
  status?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  isGmpCertified?: boolean;
  isBlacklisted?: boolean;
  regulatoryLicense?: string;
  licenseExpiryDate?: string;
  qualityRating?: number;
  auditStatus?: string;
  riskCategory?: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  currency?: string;
  paymentTerms?: string;
  creditLimit?: number;
  taxWithholdingPercent?: number;
  createdAt?: string;
  updatedAt?: string;
  vendor_tags?: { tag: string }[];
}

export interface RmqcInspection {
  id: string;
  grnId: string;
  rawMaterialId?: string;
  inspectionDate: string;
  inspectorName: string;
  description?: string;
  status: string;
  inspectorId?: string;
  images?: string[];
  documents?: string[];
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  // API returns camelCase for relations
  goodsReceiptNotes?: {
    grnNumber: string;
    receivedBy: string;
  };
  rawMaterialBatches?: {
    batchNumber: string;
    rawMaterialInventory?: {
      rawMaterials?: {
        name: string;
        code: string;
      };
    };
  };
}

export interface CreateRmqcDto {
  grn_id: string;
  raw_material_id?: string;
  inspector_name: string;
  description?: string;
  images?: string[];
  documents?: string[];
}

export interface UpdateRmqcDto extends Partial<CreateRmqcDto> {}

export interface CreateVendorDto {
  legalName: string;
  vendorType?: string;
  businessCategory?: string;
  registrationNumber?: string;
  ntnVatGst?: string;
  country?: string;
  city?: string;
  address?: string;
  status?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  isGmpCertified?: boolean;
  isBlacklisted?: boolean;
  regulatoryLicense?: string;
  licenseExpiryDate?: string;
  qualityRating?: number;
  auditStatus?: string;
  riskCategory?: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  currency?: string;
  paymentTerms?: string;
  creditLimit?: number;
  taxWithholdingPercent?: number;
  vendorTags?: string[];
}
export type UpdateVendorDto = Partial<CreateVendorDto>;

// Vendors API
export const vendorsApi = {
  getAll: async (query?: string): Promise<Vendor[]> => {
    const response = await api.get(`/vendors${query || ""}`);
    return response.data;
  },
  
  getById: async (id: string): Promise<Vendor> => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },
  
  create: async (data: CreateVendorDto): Promise<Vendor> => {
    const response = await api.post('/vendors', data);
    return response.data;
  },
  
  update: async (id: string, data: UpdateVendorDto): Promise<Vendor> => {
    const response = await api.patch(`/vendors/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },
};

// Customer Types
export interface Customer {
  id: string;
  customerName: string;
  customerType?: 'Distributor' | 'Hospital' | 'Pharmacy' | 'Retail';
  contactPerson?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  taxId?: string;
  status?: 'Active' | 'Inactive';
  creditLimit?: number;
  paymentTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCustomerDto = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerDto = Partial<CreateCustomerDto>;

// Customers API
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },
  
  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },
  
  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

// Purchase Requisition Item Types
export interface PurchaseRequisitionItem {
  id?: string;
  itemName: string;
  itemCode?: string;
  category?: string;
  uom?: string;
  quantity: number;
  estimatedUnitCost?: number;
  preferredVendorId?: string;
  specification?: string;
}

// Purchase Requisition Types
export interface PurchaseRequisition {
  id: string;
  reqNumber: string;
  requisitionDate: string;
  requestedBy: string;
  department?: string;
  costCenter?: string;
  priority?: 'Normal' | 'Urgent';
  expectedDeliveryDate?: string;
  budgetReference?: string;
  status?: 'Draft' | 'Pending_Approval' | 'Approved' | 'Rejected' | 'Converted';
  totalEstimatedCost?: number;
  items?: PurchaseRequisitionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseRequisitionDto {
  reqNumber: string;
  requisitionDate: string;
  requestedBy: string;
  department?: string;
  costCenter?: string;
  priority?: 'Normal' | 'Urgent';
  expectedDeliveryDate?: string;
  budgetReference?: string;
  items: PurchaseRequisitionItem[];
}

// Purchase Requisitions API
export const purchaseRequisitionsApi = {
  getAll: async (): Promise<PurchaseRequisition[]> => {
    const response = await api.get('/purchase-requisitions');
    return response.data;
  },
  
  getById: async (id: string): Promise<PurchaseRequisition> => {
    const response = await api.get(`/purchase-requisitions/${id}`);
    return response.data;
  },

  // Get PRs available for PO creation (Approved & not linked to any PO)
  getAvailableForPO: async (): Promise<PurchaseRequisition[]> => {
    const response = await api.get('/purchase-requisitions/available');
    return response.data;
  },
  
  create: async (data: CreatePurchaseRequisitionDto): Promise<PurchaseRequisition> => {
    const response = await api.post('/purchase-requisitions', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreatePurchaseRequisitionDto>): Promise<PurchaseRequisition> => {
    const response = await api.patch(`/purchase-requisitions/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/purchase-requisitions/${id}`);
  },
};

// Purchase Order Item Types
export interface PurchaseOrderItem {
  id?: string;
  itemCode?: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  totalAmount?: number;
  isBatchRequired?: boolean;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  vendorId: string;
  referencePrId?: string;
  currency?: string;
  paymentTerms?: string;
  incoterms?: string;
  deliverySchedule?: string;
  deliveryLocation?: string;
  freightCharges?: number;
  insuranceCharges?: number;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  status?: 'Draft' | 'Issued' | 'Partial' | 'Closed' | 'Cancelled';
  items?: PurchaseOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseOrderDto {
  poNumber: string;
  poDate: string;
  vendorId: string;
  referencePrId?: string;
  currency?: string;
  paymentTerms?: string;
  incoterms?: string;
  deliverySchedule?: string;
  deliveryLocation?: string;
  freightCharges?: number;
  insuranceCharges?: number;
  items: PurchaseOrderItem[];
}

// Purchase Orders API
export const purchaseOrdersApi = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchase-orders');
    return response.data;
  },
  
  getById: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  // Get POs available for GRN creation (Issued or Partial status)
  getAvailableForGRN: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchase-orders/available');
    return response.data;
  },

  // Get completed/closed POs (historical view)
  getCompleted: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchase-orders/completed');
    return response.data;
  },
  
  create: async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
    const response = await api.post('/purchase-orders', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> => {
    const response = await api.patch(`/purchase-orders/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },
};

// GRN Item Types
export interface GoodsReceiptItem {
  id?: string;
  itemCode?: string;
  itemName?: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty?: number;
  batchNumber?: string;
  mfgDate?: string;
  expiryDate?: string;
  storageCondition?: string;
}

// Goods Receipt Note Types
export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  grnDate: string;
  poId: string;
  warehouseLocation?: string;
  receivedBy: string;
  qcRequired?: boolean;
  qcStatus?: 'Pending' | 'Passed' | 'Failed' | 'Skipped';
  qcRemarks?: string;
  stockPosted?: boolean;
  inventoryLocation?: string;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  items?: GoodsReceiptItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoodsReceiptNoteDto {
  grnNumber: string;
  grnDate: string;
  poId: string;
  warehouseLocation?: string;
  receivedBy: string;
  qcRequired?: boolean;
  qcStatus?: 'Pending' | 'Passed' | 'Failed' | 'Skipped';
  qcRemarks?: string;
  stockPosted?: boolean;
  inventoryLocation?: string;
  items: GoodsReceiptItem[];
}

// Import Order Types
export interface ImportOrder {
  id: string;
  importNumber: string;
  vendorId: string;
  referencePoId?: string;
  currency: string;
  exchangeRate: number;
  amountUsd: number;
  amountPkr: number;
  billOfLading?: string;
  lcNumber?: string;
  customsRef?: string;
  portOfEntry?: string;
  status: 'Pending' | 'In_Transit' | 'At_Port' | 'Customs_Clearance' | 'Cleared' | 'Received';
  eta?: string;
  arrivalDate?: string;
  clearanceDate?: string;
  createdAt?: string;
  updatedAt?: string;
  vendors?: Vendor;
  purchase_orders?: PurchaseOrder;
  // import_documents?: any[]; // We can define ImportDocument type if needed
}

export interface CreateImportOrderDto {
  importNumber: string;
  vendorId: string;
  referencePoId?: string;
  currency?: string;
  exchangeRate: number;
  amountUsd: number;
  billOfLading?: string;
  lcNumber?: string;
  customsRef?: string;
  portOfEntry?: string;
  status?: string;
  eta?: string;
  arrivalDate?: string;
  clearanceDate?: string;
}

export type UpdateImportOrderDto = Partial<CreateImportOrderDto>;

// Goods Receipt Notes API
export const goodsReceiptNotesApi = {
  getAll: async (): Promise<GoodsReceiptNote[]> => {
    const response = await api.get('/goods-receipt-notes');
    return response.data;
  },
  
  getById: async (id: string): Promise<GoodsReceiptNote> => {
    const response = await api.get(`/goods-receipt-notes/${id}`);
    return response.data;
  },
  
  create: async (data: CreateGoodsReceiptNoteDto): Promise<GoodsReceiptNote> => {
    const response = await api.post('/goods-receipt-notes', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreateGoodsReceiptNoteDto>): Promise<GoodsReceiptNote> => {
    const response = await api.patch(`/goods-receipt-notes/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/goods-receipt-notes/${id}`);
  },

  updateStatus: async (id: string, data: { status?: string; qcStatus?: string }): Promise<GoodsReceiptNote> => {
    const response = await api.patch(`/goods-receipt-notes/${id}/status`, data);
    return response.data;
  },
};

// Imports API
export const importsApi = {
  getAll: async (): Promise<ImportOrder[]> => {
    const response = await api.get('/imports');
    return response.data;
  },

  getById: async (id: string): Promise<ImportOrder> => {
    const response = await api.get(`/imports/${id}`);
    return response.data;
  },

  create: async (data: CreateImportOrderDto): Promise<ImportOrder> => {
    const response = await api.post('/imports', data);
    return response.data;
  },

  update: async (id: string, data: UpdateImportOrderDto): Promise<ImportOrder> => {
    const response = await api.patch(`/imports/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/imports/${id}`);
  },
};

// Raw Material Master Types (matches backend)
export interface RawMaterial {
  id: string;
  name: string;
  code: string;
  description?: string;
  type?: RawMaterialType;
  unitOfMeasure: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RawMaterialType = 'API' | 'Excipient' | 'Packaging' | 'Packing_Material';

export type CreateRawMaterialDto = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>;

// Raw Material Inventory Types
export interface RawMaterialInventory {
  id: string;
  materialId: string;
  storageCondition?: string;
  reorderLevel?: number;
  safetyStock?: number;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
  // Joined data
  material?: RawMaterial;
}

export type CreateRawMaterialInventoryDto = Omit<RawMaterialInventory, 'id' | 'createdAt' | 'updatedAt' | 'material'>;

// Raw Material Batch Types  
export interface RawMaterialBatch {
  id: string;
  inventoryId: string;
  batchNumber: string;
  quantityAvailable: number;
  expiryDate?: string;
  qcStatus?: 'Quarantine' | 'Approved' | 'Rejected';
  warehouseLocation?: string;
  createdAt?: string;
  updatedAt?: string;
  // Joined data
  inventory?: RawMaterialInventory;
}

export type CreateRawMaterialBatchDto = Omit<RawMaterialBatch, 'id' | 'createdAt' | 'updatedAt' | 'inventory'>;

// Raw Materials API
export const rawMaterialsApi = {
  // Material Master
  getAll: async (): Promise<RawMaterial[]> => {
    const response = await api.get('/raw-materials');
    return response.data;
  },
  
  getById: async (id: string): Promise<RawMaterial> => {
    const response = await api.get(`/raw-materials/${id}`);
    return response.data;
  },
  
  create: async (data: CreateRawMaterialDto): Promise<RawMaterial> => {
    const response = await api.post('/raw-materials', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreateRawMaterialDto>): Promise<RawMaterial> => {
    const response = await api.patch(`/raw-materials/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/raw-materials/${id}`);
  },

  // Inventory Config
  getAllInventory: async (): Promise<RawMaterialInventory[]> => {
    const response = await api.get('/raw-materials/inventory/all');
    return response.data;
  },

  createInventory: async (data: CreateRawMaterialInventoryDto): Promise<RawMaterialInventory> => {
    const response = await api.post('/raw-materials/inventory', data);
    return response.data;
  },

  updateInventory: async (id: string, data: Partial<CreateRawMaterialInventoryDto>): Promise<RawMaterialInventory> => {
    const response = await api.patch(`/raw-materials/inventory/${id}`, data);
    return response.data;
  },

  deleteInventory: async (id: string): Promise<void> => {
    await api.delete(`/raw-materials/inventory/${id}`);
  },

  // Batches
  getAllBatches: async (): Promise<RawMaterialBatch[]> => {
    const response = await api.get('/raw-materials/batches/all');
    return response.data;
  },

  getBatches: async (inventoryId: string): Promise<RawMaterialBatch[]> => {
    const response = await api.get(`/raw-materials/inventory/${inventoryId}/batches`);
    return response.data;
  },

  addBatch: async (data: CreateRawMaterialBatchDto): Promise<RawMaterialBatch> => {
    const response = await api.post('/raw-materials/batches', data);
    return response.data;
  },

  updateBatch: async (id: string, data: Partial<CreateRawMaterialBatchDto>): Promise<RawMaterialBatch> => {
    const response = await api.patch(`/raw-materials/batches/${id}`, data);
    return response.data;
  },

  deleteBatch: async (id: string): Promise<void> => {
    await api.delete(`/raw-materials/batches/${id}`);
  },
};

// Finished Goods Types
export interface FinishedGood {
  id: string;
  itemCode: string;
  itemName: string;
  dosageForm?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Other';
  strength?: string;
  packSize?: string;
  storageCondition?: string;
  shelfLife?: number;
  mrp?: number;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export type CreateFinishedGoodDto = Omit<FinishedGood, 'id' | 'createdAt' | 'updatedAt'>;

// Finished Goods API
export const finishedGoodsApi = {
  getAll: async (): Promise<FinishedGood[]> => {
    const response = await api.get('/finished-goods');
    return response.data;
  },
  
  getById: async (id: string): Promise<FinishedGood> => {
    const response = await api.get(`/finished-goods/${id}`);
    return response.data;
  },
  
  create: async (data: CreateFinishedGoodDto): Promise<FinishedGood> => {
    const response = await api.post('/finished-goods', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreateFinishedGoodDto>): Promise<FinishedGood> => {
    const response = await api.patch(`/finished-goods/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/finished-goods/${id}`);
  },
};

// Warehouse Types
export interface Warehouse {
  id: string;
  warehouseName: string;
  warehouseType?: 'Normal' | 'Cold Chain' | 'Hazardous';
  location?: string;
  temperatureRange?: string;
  humidityRange?: string;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export type CreateWarehouseDto = Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>;

// Warehouses API
export const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await api.get('/warehouses');
    return response.data;
  },
  
  getById: async (id: string): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },
  
  create: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    const response = await api.post('/warehouses', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreateWarehouseDto>): Promise<Warehouse> => {
    const response = await api.patch(`/warehouses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};

// Invoice Types (Vendor Invoices for Procurement)
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string;
  poId?: string;
  grnId?: string;
  amount: number;
  dueDate: string;
  status?: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
  currency?: string;
  // Nested relations (populated by findOne)
  vendors?: Vendor;
  purchase_orders?: PurchaseOrder;
  goods_receipt_notes?: GoodsReceiptNote;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string;
  poId?: string;
  grnId?: string;
  amount: number;
  dueDate: string;
  status?: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  currency?: string;
}

// Invoices API
export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get('/invoices');
    return response.data;
  },
  
  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
  
  create: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreateInvoiceDto>): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },
};

// Sales Types
export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  orderDate?: string;
  deliveryDate?: string;
  status?: 'Draft' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  totalAmount?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateSalesOrderDto = Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt'>;

// Sales API
export const salesApi = {
  getAll: async (): Promise<SalesOrder[]> => {
    const response = await api.get('/sales');
    return response.data;
  },
  
  getById: async (id: string): Promise<SalesOrder> => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  
  create: async (data: CreateSalesOrderDto): Promise<SalesOrder> => {
    const response = await api.post('/sales', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreateSalesOrderDto>): Promise<SalesOrder> => {
    const response = await api.patch(`/sales/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sales/${id}`);
  },
};

// Payment Types
export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  paymentMethod?: 'Bank_Transfer' | 'Cheque' | 'Cash' | 'Credit_Card';
  amountPaid: number;
  taxWithheld?: number;
  advanceAdjustments?: number;
  paymentReference?: string;
  status?: 'Pending' | 'Completed' | 'Failed';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentDto {
  invoiceId: string;
  paymentDate: string;
  paymentMethod?: 'Bank_Transfer' | 'Cheque' | 'Cash' | 'Credit_Card';
  amountPaid: number;
  taxWithheld?: number;
  advanceAdjustments?: number;
  paymentReference?: string;
  status?: 'Pending' | 'Completed' | 'Failed';
}

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response = await api.get('/payments');
    return response.data;
  },
  
  getById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post('/payments', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<CreatePaymentDto>): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
};

// Procurement Options (Dynamic Dropdowns)
export interface ProcurementOption {
  id: string;
  type: string;
  label: string;
  value: string;
  isSystem?: boolean;
}

export interface CreateProcurementOptionDto {
  type: string;
  label: string;
  value: string;
  isSystem?: boolean;
}

export const procurementOptionsApi = {
  getAll: async (type?: string): Promise<ProcurementOption[]> => {
    const response = await api.get(`/procurement-options${type ? `?type=${type}` : ''}`);
    return response.data;
  },

  create: async (data: any): Promise<ProcurementOption> => {
    const response = await api.post('/procurement-options', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/procurement-options/${id}`);
  },
};

export const rmqcApi = {
  getAll: async (): Promise<RmqcInspection[]> => {
    const response = await api.get('/rmqc');
    return response.data;
  },
  create: async (data: CreateRmqcDto): Promise<RmqcInspection> => {
    const response = await api.post('/rmqc', data);
    return response.data;
  },
  getById: async (id: string): Promise<RmqcInspection> => {
    const response = await api.get(`/rmqc/${id}`);
    return response.data;
  },
  update: async (id: string, data: Partial<RmqcInspection> & { inspector_id?: string }): Promise<RmqcInspection> => {
    const response = await api.patch(`/rmqc/${id}`, data);
    return response.data;
  },
  pass: async (id: string): Promise<RmqcInspection> => {
    const response = await api.post(`/rmqc/${id}/pass`);
    return response.data;
  },
  fail: async (id: string): Promise<RmqcInspection> => {
    const response = await api.post(`/rmqc/${id}/fail`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/rmqc/${id}`);
  },
};

export interface QcInspector {
  id: string;
  name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const qcInspectorsApi = {
  getAll: async () => {
    const response = await api.get<QcInspector[]>('/qc-inspectors');
    return response.data;
  },
  create: async (data: Omit<QcInspector, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<QcInspector>('/qc-inspectors', data);
    return response.data;
  },
  update: async (id: string, data: Partial<QcInspector>) => {
    const response = await api.patch<QcInspector>(`/qc-inspectors/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/qc-inspectors/${id}`);
    return response.data;
  },
};
