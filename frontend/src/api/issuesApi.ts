import { axiosClient } from './axiosClient';
import { ApiResponse, Issue, IssuePriority, IssueStatus, IssueType, PagedResponse } from '../types';
import { normalizePagedResponse } from './apiHelpers';

export interface IssueFilterParams {
  projectId?: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const issuesApi = {
  getIssues: async (params: IssueFilterParams): Promise<PagedResponse<Issue>> => {
    const { data } = await axiosClient.get<ApiResponse<any>>('/issues', {
      params,
    });
    return normalizePagedResponse<Issue>(data.data ?? data);
  },

  getIssueById: async (issueId: string): Promise<Issue> => {
    const { data } = await axiosClient.get<ApiResponse<Issue>>(`/issues/${issueId}`);
    return data.data;
  },

  createIssue: async (
    projectId: string,
    issueData: {
      title: string;
      description?: string;
      type?: IssueType;
      priority?: IssuePriority;
      status?: IssueStatus;
      storyPoints?: number;
      dueDate?: string;
      sprintId?: string;
      assigneeId?: string;
    }
  ): Promise<Issue> => {
    const { data } = await axiosClient.post<ApiResponse<Issue>>(`/issues/project/${projectId}`, issueData);
    return data.data;
  },

  updateIssue: async (
    issueId: string,
    issueData: {
      title: string;
      description?: string;
      type: IssueType;
      priority: IssuePriority;
      status: IssueStatus;
      storyPoints?: number;
      order?: number;
      dueDate?: string;
      sprintId?: string;
      assigneeId?: string;
    }
  ): Promise<Issue> => {
    const { data } = await axiosClient.put<ApiResponse<Issue>>(`/issues/${issueId}`, issueData);
    return data.data;
  },

  updateStatus: async (
    issueId: string,
    statusData: {
      status: IssueStatus;
      order?: number;
      sprintId?: string;
    }
  ): Promise<Issue> => {
    const { data } = await axiosClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/status`, statusData);
    return data.data;
  },

  assignIssue: async (issueId: string, assigneeId?: string): Promise<Issue> => {
    const { data } = await axiosClient.patch<ApiResponse<Issue>>(`/issues/${issueId}/assign`, {
      assigneeId,
    });
    return data.data;
  },

  deleteIssue: async (issueId: string): Promise<void> => {
    await axiosClient.delete(`/issues/${issueId}`);
  },
};
