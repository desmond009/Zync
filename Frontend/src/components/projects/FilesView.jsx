import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Avatar, Badge } from '@/components/ui';
import { useProjectWorkspaceStore } from '@/store/projectWorkspaceStore';
import { getInitials, formatDate } from '@/lib/utils';

/**
 * FILES VIEW
 * 
 * File sharing with:
 * - Upload progress tracking
 * - Backend validation
 * - Real-time updates
 * - Download handling
 */

export const FilesView = () => {
  const {
    files,
    uploadProgress,
    uploadFile,
    deleteFile,
  } = useProjectWorkspaceStore();
  
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // ============================================
  // FILE UPLOAD
  // ============================================
  
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await uploadFile(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };
  
  // ============================================
  // FILE DOWNLOAD
  // ============================================
  
  const handleDownload = async (file) => {
    try {
      // If backend provides direct URL
      if (file.url) {
        window.open(file.url, '_blank');
      } else {
        // Or use download API
        const response = await filesAPI.download(file._id || file.id);
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file. Please try again.');
    }
  };
  
  // ============================================
  // FILE DELETE
  // ============================================
  
  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await deleteFile(fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };
  
  // ============================================
  // HELPERS
  // ============================================
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType?.startsWith('video/')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType?.includes('pdf')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Files</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {files.length} {files.length === 1 ? 'file' : 'files'} shared
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Files grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Upload progress indicators */}
        <AnimatePresence>
          {Object.entries(uploadProgress).map(([tempId, progress]) => (
            <motion.div
              key={tempId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="glass p-4 rounded-xl mb-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                  {progress.status === 'uploading' ? (
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : progress.status === 'error' ? (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : null}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    {progress.status === 'uploading' ? 'Uploading...' : 'Upload failed'}
                  </p>
                  {progress.status === 'uploading' && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {progress.progress}%
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Files list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file._id || file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="glass p-4 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                {/* File icon/preview */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                    {getFileIcon(file.mimeType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {/* File metadata */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={file.uploadedBy?.avatar}
                      fallback={getInitials(
                        `${file.uploadedBy?.firstName || ''} ${file.uploadedBy?.lastName || ''}`
                      )}
                      size="xs"
                    />
                    <span className="truncate">{file.uploadedBy?.firstName}</span>
                  </div>
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Empty state */}
        {files.length === 0 && Object.keys(uploadProgress).length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No files yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Upload files to share with your team
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Upload Your First File
            </Button>
          </div>
        )}
      </div>
      
      {/* File detail modal */}
      {selectedFile && (
        <FileDetailModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

// File Detail Modal Component
const FileDetailModal = ({ file, onClose, onDownload, onDelete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass max-w-2xl w-full rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            File Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Name</label>
            <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400">Size</label>
              <p className="font-medium text-slate-900 dark:text-white">
                {formatFileSize(file.size)}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400">Type</label>
              <p className="font-medium text-slate-900 dark:text-white">
                {file.mimeType || 'Unknown'}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Uploaded by</label>
            <div className="flex items-center gap-2 mt-1">
              <Avatar
                src={file.uploadedBy?.avatar}
                fallback={getInitials(
                  `${file.uploadedBy?.firstName || ''} ${file.uploadedBy?.lastName || ''}`
                )}
                size="sm"
              />
              <span className="font-medium text-slate-900 dark:text-white">
                {file.uploadedBy?.firstName} {file.uploadedBy?.lastName}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" className="flex-1" onClick={() => onDownload(file)}>
              Download
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                onDelete(file._id || file.id);
                onClose();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
