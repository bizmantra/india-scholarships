'use client';

import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface StatusItem {
  status: string;
  type: 'pending' | 'rejected' | 'success';
  meaning: string;
  solution: string;
}

const UP_SCHOLARSHIP_STATUS_DATA: StatusItem[] = [
  {
    status: 'Pending at District Scholarship Committee',
    type: 'pending',
    meaning: 'Your application has been verified at the college level and is now waiting for the final approval from the District Welfare Officer (DWO).',
    solution: 'No action is needed from your side. This is a standard verification step. Check back weekly to see if it updates to "Verified".'
  },
  {
    status: 'Rejected by District Scholarship Committee',
    type: 'rejected',
    meaning: 'The District Welfare Officer has rejected your application due to a discrepancy in eligibility, duplicate registration, or incorrect documentation.',
    solution: 'You must check the specific reason cited next to the rejection. Visit your college administrative office or the District Welfare (Samaj Kalyan) office with original documents to file a rectification query.'
  },
  {
    status: 'Blocked due to less than 75% attendance / Attendance percentage less than 75%',
    type: 'rejected',
    meaning: 'Your college has reported your attendance as below the mandatory 75% threshold required by the UP Government rules.',
    solution: 'This cannot be fixed online. Go to your college department head or administrative clerk immediately to check if there was a typo in the attendance upload sheet.'
  },
  {
    status: 'Verified/Recommended by District Scholarship Committee',
    type: 'success',
    meaning: 'Congratulations! Your form is successfully verified by the Samaj Kalyan DWO. Your application is marked safe for disbursement.',
    solution: 'Wait for the state fund release cycle. Once funds are disbursed, your payment status will show on the PFMS portal.'
  },
  {
    status: 'Rejected due to mismatch in marks / Enrollment number mismatch',
    type: 'rejected',
    meaning: 'The marks, roll number, or enrollment number entered in your form does not match the database provided by your university/board.',
    solution: 'During the correction window (Correction Portal), log in, modify the marks/enrollment number to match your marksheets exactly, upload the marksheet, and submit the hard copy again to your college.'
  },
  {
    status: 'Response pending from PFMS',
    type: 'pending',
    meaning: 'The Public Financial Management System is checking if your Aadhaar-linked bank account is active and mapped for Direct Benefit Transfer (DBT).',
    solution: 'Ensure your Aadhaar is linked to your bank account and NPCI mapping is active. You can check NPCI status on the UIDAI website.'
  },
  {
    status: 'Aadhaar Demographic Authentication Failed',
    type: 'rejected',
    meaning: 'Your name, gender, or date of birth on your scholarship application does not match the details on your Aadhaar card.',
    solution: 'Update your Aadhaar card details to match your matriculation marksheet exactly, or complete your Biometric/OTP authentication again.'
  }
];

export default function UpStatusDecoder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredItems = UP_SCHOLARSHIP_STATUS_DATA.filter(item => 
    item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 my-8 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-5 h-5 text-google-blue" />
        <h3 className="text-base font-bold text-gray-900">UP Scholarship Status Decoder</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Select or search your current status message from the portal to understand what it means and how to fix it.
      </p>

      {/* Search input */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </span>
        <input
          type="text"
          placeholder="Type status message (e.g. Pending, Rejected, PFMS...)"
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue bg-gray-50/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Status list */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30 hover:bg-gray-50/70 transition-colors"
              >
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'rejected' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                    {item.type === 'pending' && <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {item.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <span className="text-sm font-bold text-gray-800 line-clamp-1">{item.status}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs border-t border-gray-100 bg-white space-y-2.5">
                    <div>
                      <p className="font-bold text-gray-500 uppercase tracking-wide text-[9px] mb-0.5">What it means</p>
                      <p className="text-gray-700 leading-relaxed">{item.meaning}</p>
                    </div>
                    <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-50/60">
                      <p className="font-bold text-google-blue uppercase tracking-wide text-[9px] mb-0.5">Action Plan / Solution</p>
                      <p className="text-gray-800 leading-relaxed font-medium">{item.solution}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-sm text-gray-400">
            No matching status message found. Try searching for "pending" or "rejected".
          </div>
        )}
      </div>
    </div>
  );
}
