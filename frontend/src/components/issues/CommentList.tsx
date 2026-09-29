import React, { useState } from 'react';
import { Comment } from '../../types';
import { commentsApi } from '../../api/commentsApi';
import { UserAvatar } from '../common/UserAvatar';
import { Button } from '../common/Button';
import { formatDistanceToNow } from 'date-fns';
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
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await commentsApi.addComment(issueId, content.trim());
      setContent('');
      onCommentChanged();
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.deleteComment(commentId);
      onCommentChanged();
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Comments ({comments.length})
      </h4>

      {/* Comment Form */}
      <form onSubmit={handleAddComment} className="flex items-start gap-3">
        <UserAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="sm" />
        <div className="flex-1">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment... (markdown supported)"
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
              Post Comment
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3 pt-2">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="group rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-start gap-3"
          >
            <UserAvatar name={comment.userFullName} avatarUrl={comment.userAvatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">{comment.userFullName}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {comment.userId === user?.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
