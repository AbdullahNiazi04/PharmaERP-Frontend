"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// Types for customers
export interface Customer {
  id: string;
  name: string;
  type: "Distributor" | "Hospital" | "Pharmacy";
  contactPerson?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  taxId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCustomerDto = Omit<Customer, "id" | "createdAt" | "updatedAt" | "status">;

// Types for sales orders
export interface SalesOrder {
  id: string;
  customerId: string;
  orderDate: string;
  deliveryDate?: string;
  status?: "Draft" | "Confirmed" | "Dispatched" | "Delivered" | "Cancelled";
  totalAmount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrderItem {
  itemId: string;
  batchNumber?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface CreateSalesOrderDto {
  customerId: string;
  orderDate: string;
  deliveryDate?: string;
  items: SalesOrderItem[];
}

// API functions for customers
const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get("/customers");
    return response.data;
  },
  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post("/customers", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateCustomerDto>): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

// API functions for sales orders
const salesApi = {
  getAll: async (): Promise<SalesOrder[]> => {
    const response = await api.get("/sales");
    return response.data;
  },
  getById: async (id: string): Promise<SalesOrder> => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  create: async (data: CreateSalesOrderDto): Promise<SalesOrder> => {
    const response = await api.post("/sales", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateSalesOrderDto>): Promise<SalesOrder> => {
    const response = await api.patch(`/sales/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sales/${id}`);
  },
  dispatch: async (id: string, warehouseId: string, transporter: string): Promise<void> => {
    await api.post(`/sales/${id}/dispatch`, { warehouseId, transporter });
  },
};

// Query keys
export const customersKeys = {
  all: ["customers"] as const,
  lists: () => [...customersKeys.all, "list"] as const,
  detail: (id: string) => [...customersKeys.all, "detail", id] as const,
};

export const salesKeys = {
  all: ["sales"] as const,
  lists: () => [...salesKeys.all, "list"] as const,
  detail: (id: string) => [...salesKeys.all, "detail", id] as const,
};

// === Customers Hooks ===
export function useCustomers() {
  return useQuery({
    queryKey: customersKeys.lists(),
    queryFn: customersApi.getAll,
    staleTime: 30000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerDto> }) =>
      customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
    },
  });
}

// === Sales Orders Hooks ===
export function useSalesOrders() {
  return useQuery({
    queryKey: salesKeys.lists(),
    queryFn: salesApi.getAll,
    staleTime: 30000,
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSalesOrderDto) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSalesOrderDto> }) =>
      salesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => salesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useDispatchSalesOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, warehouseId, transporter }: { id: string; warehouseId: string; transporter: string }) =>
      salesApi.dispatch(id, warehouseId, transporter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

// Prefetch hook
export function usePrefetchSales() {
  const queryClient = useQueryClient();
  
  return {
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: customersKeys.lists(),
        queryFn: customersApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: salesKeys.lists(),
        queryFn: salesApi.getAll,
      });
    },
  };
}
