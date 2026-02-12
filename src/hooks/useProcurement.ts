import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import {
  vendorsApi,
  purchaseRequisitionsApi,
  purchaseOrdersApi,
  goodsReceiptNotesApi,
  invoicesApi,
  paymentsApi,
  Vendor,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceiptNote,
  Invoice,
  Payment,
  CreateVendorDto,
  UpdateVendorDto,
  CreatePurchaseRequisitionDto,
  CreatePurchaseOrderDto,
  CreateGoodsReceiptNoteDto,
  CreateInvoiceDto,
  CreatePaymentDto,
  procurementOptionsApi,
  CreateProcurementOptionDto,
  rmqcApi,
  CreateRmqcDto,
  UpdateRmqcDto,
  importsApi,
  ImportOrder,
  CreateImportOrderDto,
  UpdateImportOrderDto,

} from '@/lib/services';
import { soundManager } from '@/lib/sounds';

// Query Keys
export const procurementKeys = {
  vendors: {
    all: ['vendors'] as const,
    detail: (id: string) => ['vendors', id] as const,
  },
  requisitions: {
    all: ['purchase-requisitions'] as const,
    detail: (id: string) => ['purchase-requisitions', id] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    detail: (id: string) => ['purchase-orders', id] as const,
  },
  grns: {
    all: ['goods-receipt-notes'] as const,
    detail: (id: string) => ['goods-receipt-notes', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    detail: (id: string) => ['invoices', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    detail: (id: string) => ['payments', id] as const,
  },
  imports: {
    all: ['imports'] as const,
    detail: (id: string) => ['imports', id] as const,
  },

};

// ============ COMPLETED PROCUREMENTS HOOKS ============


// ============ VENDORS HOOKS ============

export const useVendors = (tags?: string) => {
  return useQuery({
    queryKey: ["vendors", tags],
    queryFn: async () => {
        const query = tags ? `?tags=${tags}` : "";
        return vendorsApi.getAll(query);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export function useVendor(id: string) {
  return useQuery({
    queryKey: procurementKeys.vendors.detail(id),
    queryFn: () => vendorsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorDto) => vendorsApi.create(data),
    onMutate: async (newVendor) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: procurementKeys.vendors.all });

      // Snapshot previous value
      const previousVendors = queryClient.getQueryData<Vendor[]>(procurementKeys.vendors.all);

      // Optimistically update
      if (previousVendors) {
        const optimisticVendor: Vendor = {
          ...newVendor,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Vendor[]>(procurementKeys.vendors.all, [
          ...previousVendors,
          optimisticVendor,
        ]);
      }

      return { previousVendors };
    },
    onError: (err: any, _, context) => {
      // Rollback on error
      if (context?.previousVendors) {
        queryClient.setQueryData(procurementKeys.vendors.all, context.previousVendors);
      }
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to create vendor';
      message.error(`Failed to create vendor: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Vendor created successfully');
      soundManager.playSuccess();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.all });
    },
  });
}

export function useUpdateVendor() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVendorDto> }) =>
      vendorsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.vendors.all });

      const previousVendors = queryClient.getQueryData<Vendor[]>(procurementKeys.vendors.all);

      if (previousVendors) {
        queryClient.setQueryData<Vendor[]>(
          procurementKeys.vendors.all,
          previousVendors.map((vendor) =>
            vendor.id === id ? { ...vendor, ...data, updatedAt: new Date().toISOString() } : vendor
          )
        );
      }

      return { previousVendors };
    },
    onError: (err, _, context) => {
      if (context?.previousVendors) {
        queryClient.setQueryData(procurementKeys.vendors.all, context.previousVendors);
      }
      message.error('Failed to update vendor');
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Vendor updated successfully');
      soundManager.playSuccess();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.all });
    },
  });
}

export function useDeleteVendor() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.vendors.all });

      const previousVendors = queryClient.getQueryData<Vendor[]>(procurementKeys.vendors.all);

      if (previousVendors) {
        queryClient.setQueryData<Vendor[]>(
          procurementKeys.vendors.all,
          previousVendors.filter((vendor) => vendor.id !== id)
        );
      }

      return { previousVendors };
    },
    onError: (err, _, context) => {
      if (context?.previousVendors) {
        queryClient.setQueryData(procurementKeys.vendors.all, context.previousVendors);
      }
      message.error('Failed to delete vendor');
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Vendor deleted successfully');
      soundManager.playDelete();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.all });
    },
  });
}

// ============ PURCHASE REQUISITIONS HOOKS ============

export function usePurchaseRequisitions() {
  return useQuery({
    queryKey: procurementKeys.requisitions.all,
    queryFn: purchaseRequisitionsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseRequisition(id: string) {
  return useQuery({
    queryKey: procurementKeys.requisitions.detail(id),
    queryFn: () => purchaseRequisitionsApi.getById(id),
    enabled: !!id,
  });
}

// PRs available for PO creation (Approved & not linked to any PO)
export function usePurchaseRequisitionsAvailable() {
  return useQuery({
    queryKey: ['purchase-requisitions', 'available'] as const,
    queryFn: purchaseRequisitionsApi.getAvailableForPO,
    staleTime: 2 * 60 * 1000, // 2 minutes - refresh more often for dropdowns
  });
}

export function useCreatePurchaseRequisition() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseRequisitionDto) => purchaseRequisitionsApi.create(data),
    onSuccess: () => {
      message.success('Purchase requisition created successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.requisitions.all });
    },
    onError: (err: any) => {
      console.error('Create PR Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create purchase requisition';
      message.error(`Failed to create purchase requisition: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
  });
}

export function useUpdatePurchaseRequisition() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePurchaseRequisitionDto> }) =>
      purchaseRequisitionsApi.update(id, data),
    onSuccess: () => {
      message.success('Purchase requisition updated successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.requisitions.all });
    },
    onError: () => {
      message.error('Failed to update purchase requisition');
      soundManager.playError();
    },
  });
}

export function useDeletePurchaseRequisition() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequisitionsApi.delete(id),
    onSuccess: () => {
      message.success('Purchase requisition deleted successfully');
      soundManager.playDelete();
      queryClient.invalidateQueries({ queryKey: procurementKeys.requisitions.all });
    },
    onError: () => {
      message.error('Failed to delete purchase requisition');
      soundManager.playError();
    },
  });
}

// ============ PURCHASE ORDERS HOOKS ============

export function usePurchaseOrders() {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.all,
    queryFn: purchaseOrdersApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.detail(id),
    queryFn: () => purchaseOrdersApi.getById(id),
    enabled: !!id,
  });
}

// POs available for GRN creation (Issued or Partial status)
export function useAvailablePurchaseOrdersForGRN() {
  return useQuery({
    queryKey: ['purchase-orders', 'available'] as const,
    queryFn: purchaseOrdersApi.getAvailableForGRN,
    staleTime: 2 * 60 * 1000,
  });
}

// Completed/closed POs (historical view)
export function useCompletedPurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders', 'completed'] as const,
    queryFn: purchaseOrdersApi.getCompleted,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDto) => purchaseOrdersApi.create(data),
    onSuccess: () => {
      message.success('Purchase order created successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.all });
    },
    onError: (err: any) => {
      console.error('Create PO Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create purchase order';
      message.error(`Failed to create purchase order: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
  });
}

export function useUpdatePurchaseOrder() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePurchaseOrderDto> }) =>
      purchaseOrdersApi.update(id, data),
    onSuccess: () => {
      message.success('Purchase order updated successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.all });
    },
    onError: () => {
      message.error('Failed to update purchase order');
      soundManager.playError();
    },
  });
}

export function useDeletePurchaseOrder() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      message.success('Purchase order deleted successfully');
      soundManager.playDelete();
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.all });
    },
    onError: () => {
      message.error('Failed to delete purchase order');
      soundManager.playError();
    },
  });
}

// ============ GOODS RECEIPT NOTES HOOKS ============

export function useGoodsReceiptNotes() {
  return useQuery({
    queryKey: procurementKeys.grns.all,
    queryFn: goodsReceiptNotesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoodsReceiptNote(id: string) {
  return useQuery({
    queryKey: procurementKeys.grns.detail(id),
    queryFn: () => goodsReceiptNotesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateGoodsReceiptNote() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoodsReceiptNoteDto) => goodsReceiptNotesApi.create(data),
    onSuccess: () => {
      message.success('Goods receipt note created successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.grns.all });
    },
    onError: (err: any) => {
      console.error('Create GRN Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create goods receipt note';
      message.error(`Failed to create GRN: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
  });
}

export function useUpdateGoodsReceiptNote() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoodsReceiptNoteDto> }) =>
      goodsReceiptNotesApi.update(id, data),
    onSuccess: () => {
      message.success('Goods receipt note updated successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.grns.all });
    },
    onError: () => {
      message.error('Failed to update goods receipt note');
      soundManager.playError();
    },
  });
}

export function useDeleteGoodsReceiptNote() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptNotesApi.delete(id),
    onSuccess: () => {
      message.success('Goods receipt note deleted successfully');
      soundManager.playDelete();
      queryClient.invalidateQueries({ queryKey: procurementKeys.grns.all });
    },
    onError: () => {
      message.error('Failed to delete goods receipt note');
      soundManager.playError();
    },
  });
}

export function useUpdateGRNStatus() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; qcStatus?: string } }) =>
      goodsReceiptNotesApi.updateStatus(id, data),
    onSuccess: () => {
      message.success('GRN status updated successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.grns.all });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update GRN status';
      message.error(`Failed to update status: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
  });
}

// ============ INVOICES HOOKS ============

export function useInvoices() {
  return useQuery({
    queryKey: procurementKeys.invoices.all,
    queryFn: invoicesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: procurementKeys.invoices.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => invoicesApi.create(data),
    onMutate: async (newInvoice) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.invoices.all });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(procurementKeys.invoices.all);

      if (previousInvoices) {
        const optimisticInvoice: Invoice = {
          ...newInvoice,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Invoice[]>(procurementKeys.invoices.all, [
          ...previousInvoices,
          optimisticInvoice,
        ]);
      }

      return { previousInvoices };
    },
    onError: (err, _, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(procurementKeys.invoices.all, context.previousInvoices);
      }
      message.error(`Failed to create invoice: ${Array.isArray((err as any).response?.data?.message) ? (err as any).response.data.message.join(', ') : (err as any).response?.data?.message || (err as any).message || 'Unknown error'}`);
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Invoice created successfully');
      soundManager.playSuccess();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.invoices.all });
    },
  });
}

export function useUpdateInvoice() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvoiceDto> }) =>
      invoicesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.invoices.all });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(procurementKeys.invoices.all);

      if (previousInvoices) {
        queryClient.setQueryData<Invoice[]>(
          procurementKeys.invoices.all,
          previousInvoices.map((invoice) =>
            invoice.id === id ? { ...invoice, ...data, updatedAt: new Date().toISOString() } : invoice
          )
        );
      }

      return { previousInvoices };
    },
    onError: (err, _, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(procurementKeys.invoices.all, context.previousInvoices);
      }
      message.error('Failed to update invoice');
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Invoice updated successfully');
      soundManager.playSuccess();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.invoices.all });
    },
  });
}

export function useDeleteInvoice() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.invoices.all });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(procurementKeys.invoices.all);

      if (previousInvoices) {
        queryClient.setQueryData<Invoice[]>(
          procurementKeys.invoices.all,
          previousInvoices.filter((invoice) => invoice.id !== id)
        );
      }

      return { previousInvoices };
    },
    onError: (err, _, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(procurementKeys.invoices.all, context.previousInvoices);
      }
      message.error('Failed to delete invoice');
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Invoice deleted successfully');
      soundManager.playDelete();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.invoices.all });
    },
  });
}

// ============ PAYMENTS HOOKS ============

export function usePayments() {
  return useQuery({
    queryKey: procurementKeys.payments.all,
    queryFn: paymentsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: procurementKeys.payments.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentsApi.create(data),
    onMutate: async (newPayment) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.payments.all });
      const previousPayments = queryClient.getQueryData<Payment[]>(procurementKeys.payments.all);

      if (previousPayments) {
        const optimisticPayment: Payment = {
          ...newPayment,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Payment[]>(procurementKeys.payments.all, [
          ...previousPayments,
          optimisticPayment,
        ]);
      }

      return { previousPayments };
    },
    onError: (err: any, _, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(procurementKeys.payments.all, context.previousPayments);
      }
      const errorMessage = err.response?.data?.message 
        ? (Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message)
        : err.message || 'Failed to create payment';
      
      message.error(`Failed to create payment: ${errorMessage}`);
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Payment recorded successfully');
      soundManager.playSuccess();
      // Also invalidate invoices as payment status may change
      queryClient.invalidateQueries({ queryKey: procurementKeys.invoices.all });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.payments.all });
    },
  });
}

export function useUpdatePayment() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentDto> }) =>
      paymentsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.payments.all });
      const previousPayments = queryClient.getQueryData<Payment[]>(procurementKeys.payments.all);

      if (previousPayments) {
        queryClient.setQueryData<Payment[]>(
          procurementKeys.payments.all,
          previousPayments.map((payment) =>
            payment.id === id ? { ...payment, ...data, updatedAt: new Date().toISOString() } : payment
          )
        );
      }

      return { previousPayments };
    },
    onError: (err, _, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(procurementKeys.payments.all, context.previousPayments);
      }
      message.error('Failed to update payment');
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Payment updated successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementKeys.invoices.all });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.payments.all });
    },
  });
}

export function useDeletePayment() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: procurementKeys.payments.all });
      const previousPayments = queryClient.getQueryData<Payment[]>(procurementKeys.payments.all);

      if (previousPayments) {
        queryClient.setQueryData<Payment[]>(
          procurementKeys.payments.all,
          previousPayments.filter((payment) => payment.id !== id)
        );
      }

      return { previousPayments };
    },
    onError: (err, _, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(procurementKeys.payments.all, context.previousPayments);
      }
      message.error('Failed to delete payment');
      soundManager.playError();
    },
    onSuccess: () => {
      message.success('Payment deleted successfully');
      soundManager.playDelete();
      queryClient.invalidateQueries({ queryKey: procurementKeys.invoices.all });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.payments.all });
    },
  });
}

// ============ PROCUREMENT OPTIONS HOOKS ============

export const procurementOptionsKeys = {
  all: ['procurement-options'] as const,
  byType: (type: string) => ['procurement-options', type] as const,
};

export function useProcurementOptions(type?: string) {
  return useQuery({
    queryKey: type ? procurementOptionsKeys.byType(type) : procurementOptionsKeys.all,
    queryFn: () => procurementOptionsApi.getAll(type),
    enabled: true,
  });
}

export function useCreateProcurementOption() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => procurementOptionsApi.create(data),
    onSuccess: (_, variables) => {
      message.success('Option created successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: procurementOptionsKeys.all });
      queryClient.invalidateQueries({ queryKey: procurementOptionsKeys.byType(variables.type) });
    },
    onError: (err: any) => {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to create option';
      message.error(`Failed to create option: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
  });
}

export function useDeleteProcurementOption() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => procurementOptionsApi.delete(id),
    onSuccess: () => {
      message.success('Option deleted successfully');
      soundManager.playDelete();
      queryClient.invalidateQueries({ queryKey: procurementOptionsKeys.all });
    },
    onError: () => {
      message.error('Failed to delete option');
      soundManager.playError();
    },
  });
}

// ============ PREFETCHING HOOKS ============

export function usePrefetchProcurementData() {
  const queryClient = useQueryClient();

  return {
    prefetchVendors: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.vendors.all,
        queryFn: () => vendorsApi.getAll(),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchRequisitions: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.requisitions.all,
        queryFn: purchaseRequisitionsApi.getAll,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchPurchaseOrders: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.purchaseOrders.all,
        queryFn: purchaseOrdersApi.getAll,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchGRNs: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.grns.all,
        queryFn: goodsReceiptNotesApi.getAll,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchInvoices: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.invoices.all,
        queryFn: invoicesApi.getAll,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchPayments: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.payments.all,
        queryFn: paymentsApi.getAll,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.vendors.all,
        queryFn: () => vendorsApi.getAll(),
      });
      queryClient.prefetchQuery({
        queryKey: procurementKeys.requisitions.all,
        queryFn: purchaseRequisitionsApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: procurementKeys.purchaseOrders.all,
        queryFn: purchaseOrdersApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: procurementKeys.grns.all,
        queryFn: goodsReceiptNotesApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: procurementKeys.invoices.all,
        queryFn: invoicesApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: procurementKeys.payments.all,
        queryFn: paymentsApi.getAll,
      });
    },
  };
}


// ============ IMPORTS HOOKS ============

export function useImportOrders() {
  return useQuery({
    queryKey: procurementKeys.imports.all,
    queryFn: importsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useImportOrder(id: string) {
  return useQuery({
    queryKey: procurementKeys.imports.detail(id),
    queryFn: () => importsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateImportOrder() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateImportOrderDto) => importsApi.create(data),
    onSuccess: (newItem) => {
      message.success(`Import Order ${newItem.importNumber} created successfully`);
      queryClient.invalidateQueries({ queryKey: procurementKeys.imports.all });
    },
    onError: (err) => {
      message.error('Failed to create import order');
      console.error(err);
    },
  });
}

export function useUpdateImportOrder() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImportOrderDto }) => 
      importsApi.update(id, data),
    onSuccess: (updatedItem) => {
      message.success(`Import Order ${updatedItem.importNumber} updated successfully`);
      queryClient.invalidateQueries({ queryKey: procurementKeys.imports.all });
      queryClient.invalidateQueries({ queryKey: procurementKeys.imports.detail(updatedItem.id) });
    },
    onError: (err) => {
      message.error('Failed to update import order');
      console.error(err);
    },
  });
}

export function useDeleteImportOrder() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => importsApi.delete(id),
    onSuccess: () => {
      message.success('Import order deleted successfully');
      queryClient.invalidateQueries({ queryKey: procurementKeys.imports.all });
    },
    onError: (err) => {
      message.error('Failed to delete import order');
      console.error(err);
    },
  });
}

// ============ RMQC HOOKS ============

export const rmqcKeys = {
  all: ['rmqc'] as const,
  detail: (id: string) => ['rmqc', id] as const,
};

export function useRmqcInspections() {
  return useQuery({
    queryKey: rmqcKeys.all,
    queryFn: rmqcApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRmqcInspection(id: string) {
  return useQuery({
    queryKey: rmqcKeys.detail(id),
    queryFn: () => rmqcApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRmqc() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRmqcDto) => rmqcApi.create(data),
    onSuccess: () => {
      message.success('Inspection created successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: rmqcKeys.all });
    },
    onError: (err: any) => {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to create vendor';
      message.error(`Failed to create vendor: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      soundManager.playError();
    },
  });
}

export function useUpdateRmqc() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRmqcDto }) =>
      rmqcApi.update(id, data),
    onSuccess: () => {
      message.success('Inspection updated successfully');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: rmqcKeys.all });
    },
    onError: () => {
      message.error('Failed to update inspection');
      soundManager.playError();
    },
  });
}

export function usePassRmqc() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rmqcApi.pass(id),
    onSuccess: () => {
      message.success('Inspection passed');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: rmqcKeys.all });
    },
    onError: () => {
      message.error('Failed to pass inspection');
      soundManager.playError();
    },
  });
}

export function useFailRmqc() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rmqcApi.fail(id),
    onSuccess: () => {
      message.success('Inspection marked as failed');
      soundManager.playSuccess();
      queryClient.invalidateQueries({ queryKey: rmqcKeys.all });
    },
    onError: () => {
      message.error('Failed to mark inspection as failure');
      soundManager.playError();
    },
  });
}
