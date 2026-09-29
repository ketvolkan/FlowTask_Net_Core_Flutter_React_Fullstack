import { axiosClient } from './axiosClient';
import { ApiResponse, Attachment } from '../types';

export const attachmentsApi = {
  getIssueAttachments: async (issueId: string): Promise<Attachment[]> => {
    const { data } = await axiosClient.get<ApiResponse<Attachment[]>>(`/issues/${issueId}/attachments`);
    return data.data;
  },

  uploadAttachment: async (issueId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosClient.post<ApiResponse<Attachment>>(
      `/issues/${issueId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await axiosClient.delete(`/attachments/${attachmentId}`);
  },
};
