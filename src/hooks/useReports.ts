import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { MaintenanceReport, ReportFilterParams } from '../api/types';
import { reportsApi } from '../api/api';

interface UseReportsProps {
  initialFilters?: ReportFilterParams;
  autoFetch?: boolean;
}

export const useReports = ({ initialFilters = {}, autoFetch = true }: UseReportsProps = {}) => {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilterParams>({
    page: 1,
    per_page: 20,
    ...initialFilters,
  });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const fetchReports = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      const response = await reportsApi.getReports(filters);
      
      setReports(prev => isRefreshing ? response.data : [...prev, ...response.data]);
      setTotal(response.meta.total);
      setHasMore(response.meta.current_page < response.meta.last_page);
      
      return response.data;
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      Alert.alert('Error', err.message || 'Failed to fetch reports');
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  const refreshReports = useCallback(() => {
    return fetchReports(true);
  }, [fetchReports]);

  const loadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore) {
      setFilters(prev => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [loading, refreshing, hasMore]);

  const updateFilters = useCallback((newFilters: Partial<ReportFilterParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const getReport = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const report = await reportsApi.getReport(id);
      return report;
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Failed to fetch report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (data: FormData) => {
    try {
      setLoading(true);
      const newReport = await reportsApi.createReport(data);
      
      // Refresh the list to include the new report
      await refreshReports();
      
      return newReport;
    } catch (err: any) {
      console.error('Error creating report:', err);
      setError(err.message || 'Failed to create report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshReports]);

  const updateReport = useCallback(async (id: number, data: Partial<MaintenanceReport>) => {
    try {
      setLoading(true);
      const updatedReport = await reportsApi.updateReport(id, data);
      
      // Update the report in the list
      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, ...updatedReport } : report
      ));
      
      return updatedReport;
    } catch (err: any) {
      console.error('Error updating report:', err);
      setError(err.message || 'Failed to update report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await reportsApi.deleteReport(id);
      
      // Remove the report from the list
      setReports(prev => prev.filter(report => report.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting report:', err);
      setError(err.message || 'Failed to delete report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when filters change if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchReports();
    }
  }, [filters, autoFetch, fetchReports]);

  return {
    reports,
    loading,
    refreshing,
    error,
    filters,
    hasMore,
    total,
    fetchReports,
    refreshReports,
    loadMore,
    updateFilters,
    getReport,
    createReport,
    updateReport,
    deleteReport,
  };
};

export default useReports;
