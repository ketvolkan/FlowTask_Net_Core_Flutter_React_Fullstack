import { axiosClient } from './axiosClient';
import { ApiResponse, PagedResponse, Project, ProjectDetail, ProjectMember, ProjectRole } from '../types';
import { normalizePagedResponse } from './apiHelpers';

export const projectsApi = {
  getProjects: async (page = 1, pageSize = 20): Promise<PagedResponse<Project>> => {
    const { data } = await axiosClient.get<ApiResponse<any>>('/projects', {
      params: { page, pageSize },
    });
    return normalizePagedResponse<Project>(data.data ?? data);
  },

  getProjectById: async (projectId: string): Promise<ProjectDetail> => {
    const { data } = await axiosClient.get<ApiResponse<ProjectDetail>>(`/projects/${projectId}`);
    return data.data;
  },

  createProject: async (projectData: {
    name: string;
    key: string;
    description?: string;
    avatarUrl?: string;
  }): Promise<Project> => {
    const { data } = await axiosClient.post<ApiResponse<Project>>('/projects', projectData);
    return data.data;
  },

  updateProject: async (
    projectId: string,
    projectData: {
      name: string;
      description?: string;
      avatarUrl?: string;
      ownerId: string;
      isArchived?: boolean;
    }
  ): Promise<Project> => {
    const { data } = await axiosClient.put<ApiResponse<Project>>(`/projects/${projectId}`, projectData);
    return data.data;
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await axiosClient.delete(`/projects/${projectId}`);
  },

  getMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const { data } = await axiosClient.get<ApiResponse<any>>(`/projects/${projectId}/members`);
    const raw = data.data ?? data;
    return Array.isArray(raw) ? raw : (raw.items ?? []);
  },

  addMember: async (
    projectId: string,
    memberData: { userId: string; role: ProjectRole }
  ): Promise<ProjectMember> => {
    const { data } = await axiosClient.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, memberData);
    return data.data;
  },

  updateMemberRole: async (
    projectId: string,
    userId: string,
    role: ProjectRole
  ): Promise<ProjectMember> => {
    const { data } = await axiosClient.put<ApiResponse<ProjectMember>>(
      `/projects/${projectId}/members/${userId}`,
      { role }
    );
    return data.data;
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await axiosClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};
