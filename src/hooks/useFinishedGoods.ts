"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { finishedGoodsApi, FinishedGood, CreateFinishedGoodDto } from "@/lib/services";
import api from "@/lib/api";

// Types for finished goods batches
export interface FinishedGoodBatch {
  id: string;
  itemId: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantityProduced: number;
  quantityAvailable: number;
  qcStatus: "Released" | "Hold" | "Rejected";
  warehouseId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateFinishedGoodBatchDto = Omit<FinishedGoodBatch, "id" | "createdAt" | "updatedAt" | "quantityAvailable">;

// API functions for batches
const finishedGoodsBatchesApi = {
  getAll: async (): Promise<FinishedGoodBatch[]> => {
    const response = await api.get("/finished-goods/batches/all");
    return response.data;
  },
  create: async (data: CreateFinishedGoodBatchDto): Promise<FinishedGoodBatch> => {
    const response = await api.post("/finished-goods/batches", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateFinishedGoodBatchDto>): Promise<FinishedGoodBatch> => {
    const response = await api.patch(`/finished-goods/batches/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/finished-goods/batches/${id}`);
  },
};

// Query keys
export const finishedGoodsKeys = {
  all: ["finished-goods"] as const,
  lists: () => [...finishedGoodsKeys.all, "list"] as const,
  list: (filters: string) => [...finishedGoodsKeys.lists(), { filters }] as const,
  details: () => [...finishedGoodsKeys.all, "detail"] as const,
  detail: (id: string) => [...finishedGoodsKeys.details(), id] as const,
  batches: () => [...finishedGoodsKeys.all, "batches"] as const,
  batchesList: () => [...finishedGoodsKeys.batches(), "list"] as const,
};

// === Items Hooks ===
export function useFinishedGoods() {
  return useQuery({
    queryKey: finishedGoodsKeys.lists(),
    queryFn: finishedGoodsApi.getAll,
    staleTime: 30000,
  });
}

export function useFinishedGood(id: string) {
  return useQuery({
    queryKey: finishedGoodsKeys.detail(id),
    queryFn: () => finishedGoodsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateFinishedGood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFinishedGoodDto) => finishedGoodsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finishedGoodsKeys.all });
    },
  });
}

export function useUpdateFinishedGood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFinishedGoodDto> }) =>
      finishedGoodsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finishedGoodsKeys.all });
    },
  });
}

export function useDeleteFinishedGood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => finishedGoodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finishedGoodsKeys.all });
    },
  });
}

// === Batches Hooks ===
export function useFinishedGoodsBatches() {
  return useQuery({
    queryKey: finishedGoodsKeys.batchesList(),
    queryFn: finishedGoodsBatchesApi.getAll,
    staleTime: 30000,
  });
}

export function useCreateFinishedGoodBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFinishedGoodBatchDto) => finishedGoodsBatchesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finishedGoodsKeys.batches() });
    },
  });
}

export function useUpdateFinishedGoodBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFinishedGoodBatchDto> }) =>
      finishedGoodsBatchesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finishedGoodsKeys.batches() });
    },
  });
}

export function useDeleteFinishedGoodBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => finishedGoodsBatchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finishedGoodsKeys.batches() });
    },
  });
}

// Prefetch hook
export function usePrefetchFinishedGoods() {
  const queryClient = useQueryClient();
  
  return {
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: finishedGoodsKeys.lists(),
        queryFn: finishedGoodsApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: finishedGoodsKeys.batchesList(),
        queryFn: finishedGoodsBatchesApi.getAll,
      });
    },
  };
}
