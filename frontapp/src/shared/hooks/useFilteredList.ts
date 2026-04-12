'use client';

import { useState, useMemo, useCallback } from 'react';

export interface FilterFieldConfig {
  type: 'search' | 'select' | 'date-range';
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface FilterConfig<T, F extends Record<string, any>> {
  fields: {
    [key in keyof F]?: FilterFieldConfig;
  };
  search?: {
    enabled: boolean;
    placeholder?: string;
    fields: (keyof T | ((item: T) => string))[];
  };
  dateRange?: {
    enabled: boolean;
    startField: keyof T;
    endField?: keyof T;
    label?: string;
  };
}

export interface UseFilteredListOptions<T, F extends Record<string, any>> {
  data: T[];
  config: FilterConfig<T, F>;
  initialFilters?: Partial<F>;
}

export interface UseFilteredListReturn<T, F extends Record<string, any>> {
  filteredData: T[];
  filters: Partial<F>;
  setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
  setSearch: (value: string) => void;
  setDateRange: (start: string | null, end: string | null) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useFilteredList<T, F extends Record<string, any> = Record<string, any>>(
  options: UseFilteredListOptions<T, F>
): UseFilteredListReturn<T, F> {
  const { data, config, initialFilters = {} as F } = options;

  const [filters, setFilters] = useState<Partial<F>>(initialFilters);

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value as F[keyof F]
    }));
  }, []);

  const setDateRange = useCallback((start: string | null, end: string | null) => {
    setFilters(prev => ({
      ...prev,
      dateStart: (start || '') as F[keyof F],
      dateEnd: (end || '') as F[keyof F]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({} as Partial<F>);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== undefined && v !== '' && v !== 'all');
  }, [filters]);

  const filteredData = useMemo(() => {
    if (!hasActiveFilters) {
      return data;
    }

    return data.filter(item => {
      const itemRecord = item as Record<string, unknown>;

      // Search filter
      if (config.search?.enabled && filters.search) {
        const searchFields = config.search.fields;
        const searchValue = String(filters.search);
        const searchMatch = searchFields.some(field => {
          if (typeof field === 'function') {
            return field(item).toLowerCase().includes(searchValue.toLowerCase());
          }
          const value = itemRecord[String(field)];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchValue.toLowerCase());
        });
        if (!searchMatch) return false;
      }

      // Date range filter
      if (config.dateRange?.enabled) {
        const { startField, endField } = config.dateRange;
        const startValue = filters.dateStart;
        const endValue = filters.dateEnd;

        if (startValue || endValue) {
          const itemStartDate = new Date(String(itemRecord[String(startField)]));
          
          if (startValue) {
            const startDate = new Date(String(startValue));
            if (itemStartDate < startDate) return false;
          }
          
          if (endValue) {
            const endDate = new Date(String(endValue));
            const itemEndDate = endField 
              ? new Date(String(itemRecord[String(endField)]))
              : itemStartDate;
            if (itemEndDate > endDate) return false;
          }
        }
      }

      // Field-specific filters
      for (const key of Object.keys(config.fields) as (keyof F)[]) {
        const fieldConfig = config.fields[key];
        const filterValue = filters[key];
        
        if (filterValue === undefined || filterValue === '' || filterValue === 'all') {
          continue;
        }

        if (fieldConfig?.type === 'select') {
          const itemValue = itemRecord[String(key)];
          if (String(itemValue) !== String(filterValue)) return false;
        }
      }

      return true;
    });
  }, [data, filters, config, hasActiveFilters]);

  return {
    filteredData,
    filters,
    setFilter,
    setSearch,
    setDateRange,
    clearFilters,
    hasActiveFilters
  };
}
