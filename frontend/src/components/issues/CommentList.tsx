import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Comment } from '../../types';
import { commentsApi } from '../../api/commentsApi';
import { UserAvatar } from '../common/UserAvatar';
import { Button } from '../common/Button';
import { formatDistanceToNow } from 'date-fns';
import { tr as dateFnsTr, enUS as dateFnsEn } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Send } from 'lucide-react';

interface CommentListProps {
  issueId: string;
  comments: Comment[];
  onCommentChanged: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  issueId,
  comments,
  onCommentChanged,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await commentsApi.addComment(issueId, content.trim());
      setContent('');
      onCommentChanged();
    } catch (err: unknown) {
      console.error('Failed to post comment', err);
      const e = err as { response?: { data?: { message?: string } } };
      setErrorMessage(e.response?.data?.message || t('common.error', 'Yorum eklenemedi. Lütfen tekrar deneyin.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm(t('common.confirmDelete', 'Bu yorumu silmek istediğinize emin misiniz?'))) return;
    try {
      await commentsApi.deleteComment(commentId);
      onCommentChanged();
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const dateLocale = language === 'tr' ? dateFnsTr : dateFnsEn;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {t('issueDetail.comments', 'Yorumlar')} ({comments.length})
      </h4>

      {/* Comment Form */}
      <form onSubmit={handleAddComment} className="flex items-start gap-3">
        <UserAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="sm" />
        <div className="flex-1">
          {errorMessage && (
            <div className="mb-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 border border-rose-200">
              {errorMessage}
            </div>
          )}
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('issueDetail.commentPlaceholder', 'Bir yorum yazın...')}
            className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={!content.trim()}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              {t('issueDetail.sendComment', 'Yorum Yap')}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3 pt-2">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">
            {t('issueDetail.noComments', 'Henüz yorum yapılmamış.')}
          </p>
        ) : (
          comments.map((comment) => {
            const authorName =
              comment.userFullName ||
              comment.userName ||
              (comment.userId === user?.id ? user?.fullName : 'Kullanıcı');
            const authorAvatar =
              comment.userAvatarUrl ||
              (comment.userId === user?.id ? user?.avatarUrl : undefined);

            return (
              <div
                key={comment.id}
                className="group rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-start gap-3"
              >
                <UserAvatar name={authorName} avatarUrl={authorAvatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{authorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {comment.createdAt ? (
                          formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })
                        ) : (
                          'Az önce'
                        )}
                      </span>
                    </div>
                    {comment.userId === user?.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                        title={t('common.delete', 'Sil')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
