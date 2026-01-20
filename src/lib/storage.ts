// Local storage utility for form persistence
const FORM_STORAGE_PREFIX = 'pharma_form_';
const EXPIRY_HOURS = 24;

export interface StoredFormData {
  data: Record<string, unknown>;
  timestamp: number;
  entityId?: string;
}

export const formStorage = {
  save: (formKey: string, data: Record<string, unknown>, entityId?: string): void => {
    if (typeof window === 'undefined') return;
    
    const storageData: StoredFormData = {
      data,
      timestamp: Date.now(),
      entityId,
    };
    
    try {
      localStorage.setItem(`${FORM_STORAGE_PREFIX}${formKey}`, JSON.stringify(storageData));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  },

  load: (formKey: string): StoredFormData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(`${FORM_STORAGE_PREFIX}${formKey}`);
      if (!stored) return null;
      
      const parsed: StoredFormData = JSON.parse(stored);
      
      // Check if data has expired
      const hoursOld = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
      if (hoursOld > EXPIRY_HOURS) {
        formStorage.clear(formKey);
        return null;
      }
      
      return parsed;
    } catch {
      return null;
    }
  },

  clear: (formKey: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${FORM_STORAGE_PREFIX}${formKey}`);
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(FORM_STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },

  hasData: (formKey: string): boolean => {
    return formStorage.load(formKey) !== null;
  },

  getAge: (formKey: string): string | null => {
    const stored = formStorage.load(formKey);
    if (!stored) return null;
    
    const minutes = Math.floor((Date.now() - stored.timestamp) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  },
};

// Table preferences storage
const TABLE_PREFS_KEY = 'pharma_table_prefs';

export interface TablePreferences {
  visibleColumns: string[];
  columnWidths: Record<string, number>;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

export const tableStorage = {
  save: (tableKey: string, prefs: Partial<TablePreferences>): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const allPrefs = tableStorage.loadAll();
      allPrefs[tableKey] = { ...allPrefs[tableKey], ...prefs };
      localStorage.setItem(TABLE_PREFS_KEY, JSON.stringify(allPrefs));
    } catch (error) {
      console.warn('Failed to save table preferences:', error);
    }
  },

  load: (tableKey: string): TablePreferences | null => {
    const allPrefs = tableStorage.loadAll();
    return allPrefs[tableKey] || null;
  },

  loadAll: (): Record<string, TablePreferences> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(TABLE_PREFS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  clear: (tableKey: string): void => {
    if (typeof window === 'undefined') return;
    
    const allPrefs = tableStorage.loadAll();
    delete allPrefs[tableKey];
    localStorage.setItem(TABLE_PREFS_KEY, JSON.stringify(allPrefs));
  },
};

export default formStorage;
