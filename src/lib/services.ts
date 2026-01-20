import api from './api';

// Types
export interface Vendor {
  id: string;
  legalName: string;
  vendorType?: 'Raw Material' | 'Packaging' | 'Services' | 'Equipment';
  businessCategory?: string;
  registrationNumber?: string;
  ntnVatGst?: string;
  country?: string;
  city?: string;
  address?: string;
  status?: 'Active' | 'Inactive' | 'Blacklisted';
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  isGmpCertified?: boolean;
  isBlacklisted?: boolean;
  regulatoryLicense?: string;
  licenseExpiryDate?: string;
  qualityRating?: number;
  auditStatus?: 'Pending' | 'Cleared' | 'Failed';
  riskCategory?: 'Low' | 'Medium' | 'High';
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  currency?: string;
  paymentTerms?: 'Net-30' | 'Net-60' | 'Advanced';
  creditLimit?: number;
  taxWithholdingPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateVendorDto = Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorDto = Partial<CreateVendorDto>;

// Vendors API
export const vendorsApi = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await api.get('/vendors');
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
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted';
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
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
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
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Partially Received' | 'Completed' | 'Cancelled';
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
  receivedBy?: string;
  qcRequired?: boolean;
  qcStatus?: 'Pending' | 'Passed' | 'Failed' | 'Skipped';
  qcRemarks?: string;
  stockPosted?: boolean;
  inventoryLocation?: string;
  status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  items?: GoodsReceiptItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoodsReceiptNoteDto {
  grnNumber: string;
  grnDate: string;
  poId: string;
  warehouseLocation?: string;
  receivedBy?: string;
  qcRequired?: boolean;
  qcStatus?: 'Pending' | 'Passed' | 'Failed' | 'Skipped';
  qcRemarks?: string;
  stockPosted?: boolean;
  inventoryLocation?: string;
  items: GoodsReceiptItem[];
}

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
};

// Raw Material Master Types (matches backend)
export interface RawMaterial {
  id: string;
  name: string;
  code: string;
  description?: string;
  type?: 'API' | 'Excipient' | 'Packaging';
  unitOfMeasure: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  paymentMethod?: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Credit Card';
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
  paymentMethod?: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Credit Card';
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
