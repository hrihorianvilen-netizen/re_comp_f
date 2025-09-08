'use client';

interface CommunicationHeaderProps {
  title: string;
}

export default function CommunicationHeader({ title }: CommunicationHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
}