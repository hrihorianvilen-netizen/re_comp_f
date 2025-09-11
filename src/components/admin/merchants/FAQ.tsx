'use client';

import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQProps {
  onFAQChange?: (faqs: FAQItem[]) => void;
}

export default function FAQ({ onFAQChange }: FAQProps = {}) {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: '',
      answer: ''
    }
  ]);

  const handleQuestionChange = (id: string, question: string) => {
    const updatedFaqs = faqs.map(faq => 
      faq.id === id ? { ...faq, question } : faq
    );
    setFaqs(updatedFaqs);
    onFAQChange?.(updatedFaqs);
  };

  const handleAnswerChange = (id: string, answer: string) => {
    const updatedFaqs = faqs.map(faq => 
      faq.id === id ? { ...faq, answer } : faq
    );
    setFaqs(updatedFaqs);
    onFAQChange?.(updatedFaqs);
  };

  const addNewFAQ = () => {
    const newId = (faqs.length + 1).toString();
    const newFAQ: FAQItem = {
      id: newId,
      question: '',
      answer: ''
    };
    const updatedFaqs = [...faqs, newFAQ];
    setFaqs(updatedFaqs);
    onFAQChange?.(updatedFaqs);
  };

  const removeFAQ = (id: string) => {
    if (faqs.length <= 1) {
      // Don't remove if it's the last FAQ, just clear it
      const updatedFaqs = faqs.map(faq => 
        faq.id === id ? { ...faq, question: '', answer: '' } : faq
      );
      setFaqs(updatedFaqs);
      onFAQChange?.(updatedFaqs);
      return;
    }

    const updatedFaqs = faqs.filter(faq => faq.id !== id);
    // Renumber the remaining FAQs
    const renumberedFaqs = updatedFaqs.map((faq, index) => ({
      ...faq,
      id: (index + 1).toString()
    }));
    setFaqs(renumberedFaqs);
    onFAQChange?.(renumberedFaqs);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">FAQ</h3>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        {faqs.map((faq) => (
          <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                FAQ #{faq.id}
              </h4>
              {faqs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFAQ(faq.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Question */}
              <div>
                <label 
                  htmlFor={`question-${faq.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Question #{faq.id}
                </label>
                <input
                  type="text"
                  id={`question-${faq.id}`}
                  value={faq.question}
                  onChange={(e) => handleQuestionChange(faq.id, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                  placeholder={`Enter question ${faq.id}`}
                />
              </div>

              {/* Answer */}
              <div>
                <label 
                  htmlFor={`answer-${faq.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Answer #{faq.id}
                </label>
                <textarea
                  id={`answer-${faq.id}`}
                  rows={4}
                  value={faq.answer}
                  onChange={(e) => handleAnswerChange(faq.id, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                  placeholder={`Enter answer ${faq.id}`}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add FAQ Button (alternative placement) */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={addNewFAQ}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another FAQ
          </button>
        </div>
      </div>
    </div>
  );
}