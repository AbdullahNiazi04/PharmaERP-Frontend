import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  rawMaterialsApi,
  RawMaterial,
  RawMaterialInventory,
  RawMaterialBatch,
  CreateRawMaterialDto,
  CreateRawMaterialInventoryDto,
  CreateRawMaterialBatchDto,
} from '@/lib/services';
import { soundManager } from '@/lib/sounds';

// Query Keys
export const rawMaterialKeys = {
  materials: {
    all: ['raw-materials'] as const,
    detail: (id: string) => ['raw-materials', id] as const,
  },
  inventory: {
    all: ['raw-material-inventory'] as const,
    detail: (id: string) => ['raw-material-inventory', id] as const,
  },
  batches: {
    all: ['raw-material-batches'] as const,
    byInventory: (inventoryId: string) => ['raw-material-batches', inventoryId] as const,
  },
};

// ============ RAW MATERIALS MASTER HOOKS ============

// ============ RAW MATERIALS MASTER HOOKS ============

export function useRawMaterials() {
  return useQuery({
    queryKey: rawMaterialKeys.materials.all,
    queryFn: rawMaterialsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRawMaterial(id: string) {
  return useQuery({
    queryKey: rawMaterialKeys.materials.detail(id),
    queryFn: () => rawMaterialsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRawMaterialDto) => rawMaterialsApi.create(data),
    onMutate: async (newMaterial) => {
      await queryClient.cancelQueries({ queryKey: rawMaterialKeys.materials.all });
      const previousMaterials = queryClient.getQueryData<RawMaterial[]>(rawMaterialKeys.materials.all);

      if (previousMaterials) {
        const optimisticMaterial: RawMaterial = {
          ...newMaterial,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<RawMaterial[]>(rawMaterialKeys.materials.all, [
          ...previousMaterials,
          optimisticMaterial,
        ]);
      }

      return { previousMaterials };
    },
    onError: (err, _, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(rawMaterialKeys.materials.all, context.previousMaterials);
      }
    },
    onSuccess: () => {
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.materials.all });
    },
  });
}

export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRawMaterialDto> }) =>
      rawMaterialsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: rawMaterialKeys.materials.all });
      const previousMaterials = queryClient.getQueryData<RawMaterial[]>(rawMaterialKeys.materials.all);

      if (previousMaterials) {
        queryClient.setQueryData<RawMaterial[]>(
          rawMaterialKeys.materials.all,
          previousMaterials.map((material) =>
            material.id === id ? { ...material, ...data, updatedAt: new Date().toISOString() } : material
          )
        );
      }

      return { previousMaterials };
    },
    onError: (err, _, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(rawMaterialKeys.materials.all, context.previousMaterials);
      }
    },
    onSuccess: () => {
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.materials.all });
    },
  });
}

export function useDeleteRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rawMaterialsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: rawMaterialKeys.materials.all });
      const previousMaterials = queryClient.getQueryData<RawMaterial[]>(rawMaterialKeys.materials.all);

      if (previousMaterials) {
        queryClient.setQueryData<RawMaterial[]>(
          rawMaterialKeys.materials.all,
          previousMaterials.filter((material) => material.id !== id)
        );
      }

      return { previousMaterials };
    },
    onError: (err, _, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(rawMaterialKeys.materials.all, context.previousMaterials);
      }
    },
    onSuccess: () => {
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.materials.all });
    },
  });
}

// ============ INVENTORY CONFIG HOOKS ============

export function useRawMaterialInventory() {
  return useQuery({
    queryKey: rawMaterialKeys.inventory.all,
    queryFn: rawMaterialsApi.getAllInventory,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRawMaterialInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRawMaterialInventoryDto) => rawMaterialsApi.createInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.inventory.all });
    },
  });
}

export function useUpdateRawMaterialInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRawMaterialInventoryDto> }) =>
      rawMaterialsApi.updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.inventory.all });
    },
  });
}

export function useDeleteRawMaterialInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rawMaterialsApi.deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.inventory.all });
    },
  });
}

// ============ BATCH HOOKS ============

export function useAllRawMaterialBatches() {
  return useQuery({
    queryKey: rawMaterialKeys.batches.all,
    queryFn: rawMaterialsApi.getAllBatches,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRawMaterialBatches(inventoryId: string) {
  return useQuery({
    queryKey: rawMaterialKeys.batches.byInventory(inventoryId),
    queryFn: () => rawMaterialsApi.getBatches(inventoryId),
    enabled: !!inventoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddRawMaterialBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRawMaterialBatchDto) => rawMaterialsApi.addBatch(data),
    onSuccess: (newBatch) => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.batches.all });
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.batches.byInventory(newBatch.inventoryId) });
    },
  });
}

export function useUpdateRawMaterialBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRawMaterialBatchDto> }) =>
      rawMaterialsApi.updateBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.batches.all });
    },
  });
}

export function useDeleteRawMaterialBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rawMaterialsApi.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rawMaterialKeys.batches.all });
    },
  });
}

// ============ PREFETCH HOOKS ============

export function usePrefetchRawMaterials() {
  const queryClient = useQueryClient();

  return {
    prefetchMaterials: () => {
      queryClient.prefetchQuery({
        queryKey: rawMaterialKeys.materials.all,
        queryFn: rawMaterialsApi.getAll,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchInventory: () => {
      queryClient.prefetchQuery({
        queryKey: rawMaterialKeys.inventory.all,
        queryFn: rawMaterialsApi.getAllInventory,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchBatches: () => {
      queryClient.prefetchQuery({
        queryKey: rawMaterialKeys.batches.all,
        queryFn: rawMaterialsApi.getAllBatches,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: rawMaterialKeys.materials.all,
        queryFn: rawMaterialsApi.getAll,
      });
      queryClient.prefetchQuery({
        queryKey: rawMaterialKeys.inventory.all,
        queryFn: rawMaterialsApi.getAllInventory,
      });
      queryClient.prefetchQuery({
        queryKey: rawMaterialKeys.batches.all,
        queryFn: rawMaterialsApi.getAllBatches,
      });
    },
  };
}

