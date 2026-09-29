import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Attachment } from '../../types';
import { attachmentsApi } from '../../api/attachmentsApi';
import { Button } from '../common/Button';
import { Paperclip, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AttachmentListProps {
  issueId: string;
  attachments: Attachment[];
  onAttachmentChanged: () => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  issueId,
  attachments,
  onAttachmentChanged,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await attachmentsApi.uploadAttachment(issueId, file);
      onAttachmentChanged();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    try {
      await attachmentsApi.deleteAttachment(attachmentId);
      onAttachmentChanged();
    } catch (err) {
      console.error('Delete attachment failed', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('issueDetail.attachments', 'Ekler')} ({attachments.length})
        </h4>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Paperclip className="h-3.5 w-3.5" />}
          >
            {t('issueDetail.uploadFile', 'Dosya Yükle')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((att) => {
          const isImage = att.contentType.startsWith('image/');
          return (
            <div
              key={att.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/70 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate" title={att.fileName}>
                    {att.fileName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(att.fileSize)} • by {att.uploadedByName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={`http://localhost:5000${att.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                {att.uploadedById === user?.id && (
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="rounded p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title={t('common.delete', 'Sil')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
