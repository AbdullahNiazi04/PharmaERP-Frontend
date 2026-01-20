import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TablePreferences {
  visibleColumns: string[];
  columnOrder: string[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize: number;
}

interface UIState {
  // Sound settings
  soundEnabled: boolean;
  
  // Drawer states
  drawerOpen: boolean;
  drawerMode: 'create' | 'edit' | 'view' | null;
  drawerEntityType: string | null;
  
  // Table preferences per entity type
  tablePreferences: Record<string, TablePreferences>;
  
  // Selected rows per entity type
  selectedRows: Record<string, string[]>;
  
  // Zoom level for dashboard (90 = 90%)
  dashboardZoom: number;
}

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const initialState: UIState = {
  soundEnabled: loadFromLocalStorage('soundEnabled', false),
  drawerOpen: false,
  drawerMode: null,
  drawerEntityType: null,
  tablePreferences: loadFromLocalStorage('tablePreferences', {}),
  selectedRows: {},
  dashboardZoom: loadFromLocalStorage('dashboardZoom', 90),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('soundEnabled', JSON.stringify(state.soundEnabled));
      }
    },
    
    openDrawer: (state, action: PayloadAction<{ mode: 'create' | 'edit' | 'view'; entityType: string }>) => {
      state.drawerOpen = true;
      state.drawerMode = action.payload.mode;
      state.drawerEntityType = action.payload.entityType;
    },
    
    closeDrawer: (state) => {
      state.drawerOpen = false;
      state.drawerMode = null;
      state.drawerEntityType = null;
    },
    
    setTablePreferences: (state, action: PayloadAction<{ entityType: string; preferences: Partial<TablePreferences> }>) => {
      const { entityType, preferences } = action.payload;
      state.tablePreferences[entityType] = {
        ...state.tablePreferences[entityType],
        ...preferences,
      } as TablePreferences;
      if (typeof window !== 'undefined') {
        localStorage.setItem('tablePreferences', JSON.stringify(state.tablePreferences));
      }
    },
    
    setSelectedRows: (state, action: PayloadAction<{ entityType: string; rows: string[] }>) => {
      state.selectedRows[action.payload.entityType] = action.payload.rows;
    },
    
    clearSelectedRows: (state, action: PayloadAction<string>) => {
      state.selectedRows[action.payload] = [];
    },
    
    setDashboardZoom: (state, action: PayloadAction<number>) => {
      state.dashboardZoom = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboardZoom', JSON.stringify(action.payload));
      }
    },
  },
});

export const {
  toggleSound,
  openDrawer,
  closeDrawer,
  setTablePreferences,
  setSelectedRows,
  clearSelectedRows,
  setDashboardZoom,
} = uiSlice.actions;

export default uiSlice.reducer;
