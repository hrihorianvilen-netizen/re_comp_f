'use client';

import { useState } from 'react';
import moment from 'moment';
import CommunicationHeader from '@/components/admin/communication/CommunicationHeader';
import ReportsSearchFilter from '@/components/admin/communication/ReportsSearchFilter';
import ActionFilter from '@/components/admin/communication/ActionFilter';
import CommunicationPagination from '@/components/admin/communication/CommunicationPagination';

// Mock data for reports
const mockReports = [
  {
    id: '1',
    reporter: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      ipAddress: '192.168.1.105'
    },
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    reported: {
      name: 'John Spammer',
      email: 'john.spammer@fake.com',
      ipAddress: '123.45.67.100'
    },
    type: 'spam',
    context: {
      title: 'Fake Review with Malicious Links',
      content: 'This review contains spam content and suspicious links trying to redirect users to malicious websites.'
    },
    qty: 5
  },
  {
    id: '2',
    reporter: {
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      ipAddress: '10.0.0.45'
    },
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    reported: {
      name: 'Angry User',
      email: 'angry.user@email.com',
      ipAddress: '172.16.0.25'
    },
    type: 'inappropriate',
    context: {
      title: 'Inappropriate Language in Comment',
      content: 'User posted comment with offensive language and personal attacks against other reviewers.'
    },
    qty: 3
  },
  {
    id: '3',
    reporter: {
      name: 'Emma Davis',
      email: 'emma.davis@gmail.com',
      ipAddress: '203.0.113.75'
    },
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    reported: {
      name: 'Fake Account',
      email: 'fake.account@bot.com',
      ipAddress: '185.220.100.50'
    },
    type: 'fraud',
    context: {
      title: 'Fraudulent Merchant Review',
      content: 'This appears to be a fake review posted by a bot account to artificially inflate ratings.'
    },
    qty: 8
  },
  {
    id: '4',
    reporter: {
      name: 'David Brown',
      email: 'david.brown@service.com',
      ipAddress: '198.51.100.30'
    },
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    reported: {
      name: 'Competitor User',
      email: 'competitor@rival.com',
      ipAddress: '104.28.15.75'
    },
    type: 'misleading',
    context: {
      title: 'Misleading Information in Post',
      content: 'User is spreading false information about merchant policies to damage reputation.'
    },
    qty: 2
  },
  {
    id: '5',
    reporter: {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@user.com',
      ipAddress: '216.58.194.100'
    },
    date: new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000), // 1 week ago
    reported: {
      name: 'Harassment User',
      email: 'harass@trouble.com',
      ipAddress: '151.101.193.140'
    },
    type: 'harassment',
    context: {
      title: 'User Harassment in Comments',
      content: 'User has been repeatedly harassing other community members with threatening messages.'
    },
    qty: 12
  }
];

export default function CommunicationReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 20;

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reported.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.context.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const formatDateTime = (date: Date) => {
    return moment(date).format('HH:mm:ss DD/MM/YYYY');
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(paginatedReports.map(report => report.id));
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommunicationHeader title="Reports" />

        <ReportsSearchFilter
          totalCount={mockReports.length}
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
            {paginatedReports.map((report) => (
              <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="w-8 flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>
                  
                  {/* Reporter */}
                  <div className="w-40">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{report.reporter.name}</p>
                      <p className="text-xs text-gray-500">{report.reporter.email}</p>
                      <p className="text-xs text-gray-400">{report.reporter.ipAddress}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="w-32">
                    <p className="text-xs text-gray-600">{formatDateTime(report.date)}</p>
                  </div>

                  {/* Reported */}
                  <div className="w-40">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{report.reported.name}</p>
                      <p className="text-xs text-gray-500">{report.reported.email}</p>
                      <p className="text-xs text-gray-400">{report.reported.ipAddress}</p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="w-24">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      report.type === 'spam' ? 'bg-red-100 text-red-800' :
                      report.type === 'inappropriate' ? 'bg-orange-100 text-orange-800' :
                      report.type === 'fraud' ? 'bg-purple-100 text-purple-800' :
                      report.type === 'misleading' ? 'bg-yellow-100 text-yellow-800' :
                      report.type === 'harassment' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.type}
                    </span>
                  </div>

                  {/* Context */}
                  <div className="flex-1">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{report.context.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{report.context.content}</p>
                    </div>
                  </div>

                  {/* Qty */}
                  <div className="w-16 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      {report.qty}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="w-32 flex items-center gap-2">
                    <button
                      onClick={() => console.log('Agree report:', report.id)}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      title="Agree"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => console.log('Cancel report:', report.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        <CommunicationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredReports.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}