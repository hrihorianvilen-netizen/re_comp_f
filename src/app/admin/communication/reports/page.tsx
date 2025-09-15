'use client';

import { useState, useEffect } from 'react';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import CommunicationHeader from '@/components/admin/communication/CommunicationHeader';
import ReportsSearchFilter from '@/components/admin/communication/ReportsSearchFilter';
import ActionFilter from '@/components/admin/communication/ActionFilter';
import CommunicationPagination from '@/components/admin/communication/CommunicationPagination';
import { reportsApi, ReportGroup } from '@/lib/api/reports';

export default function CommunicationReportsPage() {
  const [reports, setReports] = useState<ReportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 20;

  // Fetch reports from API
  useEffect(() => {
    fetchReports();
  }, [currentPage, typeFilter, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage
      };

      // Add type filter
      if (typeFilter) {
        params.contentType = typeFilter as 'review' | 'comment' | 'post';
      }

      // Add date filters
      if (startDate) {
        params.dateFrom = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.dateTo = new Date(endDate).toISOString();
      }

      const response = await reportsApi.getReports(params);

      if (response.data) {
        setReports(response.data.reports);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      } else {
        console.error('Failed to fetch reports:', response.error);
        toast.error(response.error || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports locally based on search query
  const filteredReports = reports.filter(report => {
    if (searchQuery === '') return true;

    const searchLower = searchQuery.toLowerCase();

    // Search in reporter info
    const reporterMatch = report.reports.some(r =>
      r.reporter?.displayName?.toLowerCase().includes(searchLower) ||
      r.reporter?.email?.toLowerCase().includes(searchLower)
    );

    // Search in content
    const contentMatch = report.content && (
      report.content.title?.toLowerCase().includes(searchLower) ||
      report.content.content?.toLowerCase().includes(searchLower) ||
      report.content.context?.toLowerCase().includes(searchLower)
    );

    // Search in reported user info
    const reportedUserMatch = report.content?.user && (
      report.content.user.displayName?.toLowerCase().includes(searchLower) ||
      report.content.user.email.toLowerCase().includes(searchLower)
    );

    return reporterMatch || contentMatch || reportedUserMatch;
  });

  const formatDateTime = (date: string) => {
    return moment(date).format('HH:mm:ss DD/MM/YYYY');
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.contentId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };

  const handleAcceptReport = async (contentId: string, contentType: 'review' | 'comment' | 'post') => {
    try {
      const response = await reportsApi.acceptReport(contentId, contentType);
      if (response.data) {
        toast.success('Report accepted - content marked as spam');
        fetchReports(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to accept report');
      }
    } catch (error) {
      console.error('Error accepting report:', error);
      toast.error('Failed to accept report');
    }
  };

  const handleRejectReport = async (contentId: string, contentType: 'review' | 'comment' | 'post') => {
    try {
      const response = await reportsApi.rejectReport(contentId, contentType);
      if (response.data) {
        toast.success('Report rejected - content kept');
        fetchReports(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to reject report');
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Failed to reject report');
    }
  };

  const getReportTypeLabel = (reason?: string) => {
    if (!reason) return 'other';
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('spam')) return 'spam';
    if (lowerReason.includes('inappropriate') || lowerReason.includes('offensive')) return 'inappropriate';
    if (lowerReason.includes('fraud') || lowerReason.includes('fake')) return 'fraud';
    if (lowerReason.includes('misleading') || lowerReason.includes('false')) return 'misleading';
    if (lowerReason.includes('harassment') || lowerReason.includes('abuse')) return 'harassment';
    return 'other';
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'spam': return 'bg-red-100 text-red-800';
      case 'inappropriate': return 'bg-orange-100 text-orange-800';
      case 'fraud': return 'bg-purple-100 text-purple-800';
      case 'misleading': return 'bg-yellow-100 text-yellow-800';
      case 'harassment': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommunicationHeader title="Reports" />
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
            <div className="text-gray-500">Loading reports...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommunicationHeader title="Reports" />

        <ReportsSearchFilter
          totalCount={totalItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ActionFilter
          actionFilter={actionFilter}
          onActionChange={setActionFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          filteredCount={filteredReports.length}
          showTypeFilter={true}
        />

        {/* Reports List Section */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-8 flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="w-40 text-sm font-medium text-gray-700 flex items-center">Reporter</div>
              <div className="w-32 text-sm font-medium text-gray-700 flex items-center">Date</div>
              <div className="w-40 text-sm font-medium text-gray-700 flex items-center">Reported</div>
              <div className="w-24 text-sm font-medium text-gray-700 flex items-center">Type</div>
              <div className="flex-1 text-sm font-medium text-gray-700 flex items-center">Context</div>
              <div className="w-16 text-sm font-medium text-gray-700 flex items-center">Qty</div>
              <div className="w-32 text-sm font-medium text-gray-700 flex items-center">Actions</div>
            </div>
          </div>

          {/* Reports List */}
          <div className="divide-y divide-gray-200">
            {filteredReports.map((reportGroup) => {
              // Get the first reporter as representative (most recent)
              const firstReport = reportGroup.reports[0];
              const reportType = getReportTypeLabel(firstReport?.reason);

              return (
                <div key={reportGroup.contentId} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="w-8 flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(reportGroup.contentId)}
                        onChange={() => handleSelectReport(reportGroup.contentId)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                    </div>

                    {/* Reporter */}
                    <div className="w-40">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {firstReport?.reporter?.displayName || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">{firstReport?.reporter?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{firstReport?.reporterIp || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="w-32">
                      <p className="text-xs text-gray-600">{formatDateTime(reportGroup.lastReportDate)}</p>
                    </div>

                    {/* Reported */}
                    <div className="w-40">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {reportGroup.content?.user?.displayName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reportGroup.content?.user?.email || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {reportGroup.contentType}
                        </p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="w-24">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(reportType)}`}>
                        {reportType}
                      </span>
                    </div>

                    {/* Context */}
                    <div className="flex-1">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {reportGroup.content?.title || reportGroup.content?.context || 'No title'}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {reportGroup.content?.content || reportGroup.content?.reaction || 'No content available'}
                        </p>
                        {reportGroup.content?.merchant && (
                          <p className="text-xs text-gray-500">
                            Merchant: {reportGroup.content.merchant.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Qty */}
                    <div className="w-16 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                        {reportGroup.reportCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="w-32 flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptReport(reportGroup.contentId, reportGroup.contentType)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        title="Accept Report (Mark as Spam)"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRejectReport(reportGroup.contentId, reportGroup.contentType)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Reject Report (Keep Content)"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Loading...' : 'Try adjusting your search criteria or filters.'}
            </p>
          </div>
        )}

        <CommunicationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}