import { ApiResponse } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== REPORTS API ====================

export interface Reporter {
  id: string;
  displayName?: string;
  email: string;
}

export interface ReportedContent {
  id: string;
  title?: string;
  content?: string;
  reaction?: string;
  context?: string;
  merchant?: {
    name: string;
    slug?: string;
  };
  user?: {
    displayName?: string;
    email: string;
  };
}

export interface Report {
  id: string;
  reporter: Reporter;
  reporterIp?: string;
  reason?: string;
  createdAt: string;
}

export interface ReportGroup {
  contentId: string;
  contentType: 'review' | 'comment' | 'post';
  content: ReportedContent | null;
  reports: Report[];
  reportCount: number;
  lastReportDate: string;
}

export interface ReportsResponse {
  reports: ReportGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  reportsByType: {
    review: number;
    comment: number;
    post: number;
  };
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

// Reports API
export const reportsApi = {
  // Get all reports with filters
  async getReports(params?: {
    page?: number;
    limit?: number;
    contentType?: 'review' | 'comment' | 'post';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<ReportsResponse>> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/admin/reports?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch reports' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { error: 'Failed to fetch reports' };
    }
  },

  // Accept a report (mark content as spam)
  async acceptReport(contentId: string, contentType: 'review' | 'comment' | 'post'): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${contentId}/accept?contentType=${contentType}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to accept report' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error accepting report:', error);
      return { error: 'Failed to accept report' };
    }
  },

  // Reject a report (keep content, dismiss report)
  async rejectReport(contentId: string, contentType: 'review' | 'comment' | 'post'): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${contentId}/reject?contentType=${contentType}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to reject report' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error rejecting report:', error);
      return { error: 'Failed to reject report' };
    }
  },

  // Get report statistics
  async getStats(): Promise<ApiResponse<ReportStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch report stats' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching report stats:', error);
      return { error: 'Failed to fetch report stats' };
    }
  },
};