import React from 'react';
import { FileIcon, FileImageIcon, FileIcon as FilePdfIcon, FileTextIcon, FileSpreadsheetIcon, FileTypeIcon as FileTypeIconLucide } from 'lucide-react';

const FileTypeIcon = ({ mimeType }) => {
  switch (mimeType) {
    case 'application/pdf':
      return <FilePdfIcon className="w-6 h-6 text-red-500" />;
    case 'image/jpeg':
    case 'image/png':
      return <FileImageIcon className="w-6 h-6 text-green-500" />;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FileTextIcon className="w-6 h-6 text-blue-500" />;
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return <FileSpreadsheetIcon className="w-6 h-6 text-green-700" />;
    case 'text/plain':
      return <FileTextIcon className="w-6 h-6 text-gray-500" />;
    default:
      return <FileIcon className="w-6 h-6 text-gray-400" />;
  }
};

export default FileTypeIcon;

