import React from 'react';

interface NoteCardProps {
  title: string;
  content: string;
  date: string;
  tags?: string[];
}

export function NoteCard({ title, content, date, tags = [] }: NoteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{content}</p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">{date}</div>
          <div className="flex gap-1">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 