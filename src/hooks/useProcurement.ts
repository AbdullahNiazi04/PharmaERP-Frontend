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
  CreatePurchaseRequisitionDto,
  CreatePurchaseOrderDto,
  CreateGoodsReceiptNoteDto,
  CreateInvoiceDto,
  CreatePaymentDto,
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
};

// ============ VENDORS HOOKS ============

export function useVendors() {
  return useQuery({
    queryKey: procurementKeys.vendors.all,
    queryFn: vendorsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

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
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousVendors) {
        queryClient.setQueryData(procurementKeys.vendors.all, context.previousVendors);
      }
      message.error('Failed to create vendor');
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
    onError: () => {
      message.error('Failed to create purchase requisition');
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
    onError: () => {
      message.error('Failed to create purchase order');
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
    onError: () => {
      message.error('Failed to create goods receipt note');
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
      message.error('Failed to create invoice');
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

// ============ PREFETCHING HOOKS ============

export function usePrefetchProcurementData() {
  const queryClient = useQueryClient();

  return {
    prefetchVendors: () => {
      queryClient.prefetchQuery({
        queryKey: procurementKeys.vendors.all,
        queryFn: vendorsApi.getAll,
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
        queryFn: vendorsApi.getAll,
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

