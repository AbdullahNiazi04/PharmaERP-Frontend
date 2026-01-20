import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vendor, PurchaseRequisition, PurchaseOrder, GoodsReceiptNote } from '@/lib/services';

interface FormDraft {
  data: Record<string, unknown>;
  timestamp: number;
  entityId?: string;
}

interface ProcurementState {
  // Currently editing/viewing record
  currentVendor: Vendor | null;
  currentRequisition: PurchaseRequisition | null;
  currentPurchaseOrder: PurchaseOrder | null;
  currentGRN: GoodsReceiptNote | null;
  
  // Form drafts (persisted to localStorage)
  formDrafts: Record<string, FormDraft>;
  
  // Filters
  filters: Record<string, Record<string, unknown>>;
}

const loadFormDrafts = (): Record<string, FormDraft> => {
  if (typeof window === 'undefined') return {};
  try {
    const drafts = localStorage.getItem('procurementFormDrafts');
    return drafts ? JSON.parse(drafts) : {};
  } catch {
    return {};
  }
};

const saveFormDrafts = (drafts: Record<string, FormDraft>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('procurementFormDrafts', JSON.stringify(drafts));
  }
};

const initialState: ProcurementState = {
  currentVendor: null,
  currentRequisition: null,
  currentPurchaseOrder: null,
  currentGRN: null,
  formDrafts: loadFormDrafts(),
  filters: {},
};

const procurementSlice = createSlice({
  name: 'procurement',
  initialState,
  reducers: {
    setCurrentVendor: (state, action: PayloadAction<Vendor | null>) => {
      state.currentVendor = action.payload;
    },
    
    setCurrentRequisition: (state, action: PayloadAction<PurchaseRequisition | null>) => {
      state.currentRequisition = action.payload;
    },
    
    setCurrentPurchaseOrder: (state, action: PayloadAction<PurchaseOrder | null>) => {
      state.currentPurchaseOrder = action.payload;
    },
    
    setCurrentGRN: (state, action: PayloadAction<GoodsReceiptNote | null>) => {
      state.currentGRN = action.payload;
    },
    
    saveFormDraft: (state, action: PayloadAction<{ formKey: string; data: Record<string, unknown>; entityId?: string }>) => {
      const { formKey, data, entityId } = action.payload;
      state.formDrafts[formKey] = {
        data,
        timestamp: Date.now(),
        entityId,
      };
      saveFormDrafts(state.formDrafts);
    },
    
    clearFormDraft: (state, action: PayloadAction<string>) => {
      delete state.formDrafts[action.payload];
      saveFormDrafts(state.formDrafts);
    },
    
    clearAllFormDrafts: (state) => {
      state.formDrafts = {};
      saveFormDrafts(state.formDrafts);
    },
    
    setFilter: (state, action: PayloadAction<{ entityType: string; filters: Record<string, unknown> }>) => {
      state.filters[action.payload.entityType] = action.payload.filters;
    },
  },
});

export const {
  setCurrentVendor,
  setCurrentRequisition,
  setCurrentPurchaseOrder,
  setCurrentGRN,
  saveFormDraft,
  clearFormDraft,
  clearAllFormDrafts,
  setFilter,
} = procurementSlice.actions;

export default procurementSlice.reducer;
