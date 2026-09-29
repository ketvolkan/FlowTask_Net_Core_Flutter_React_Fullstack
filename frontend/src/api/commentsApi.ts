import { axiosClient } from './axiosClient';
import { ApiResponse, Comment } from '../types';

export const commentsApi = {
  getIssueComments: async (issueId: string): Promise<Comment[]> => {
    const { data } = await axiosClient.get<ApiResponse<Comment[]>>(`/comments/issue/${issueId}`);
    return data.data;
  },

  addComment: async (issueId: string, content: string): Promise<Comment> => {
    const { data } = await axiosClient.post<ApiResponse<Comment>>(`/comments/issue/${issueId}`, { content });
    return data.data;
  },

  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    const { data } = await axiosClient.put<ApiResponse<Comment>>(`/comments/${commentId}`, { content });
    return data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await axiosClient.delete(`/comments/${commentId}`);
  },
};
