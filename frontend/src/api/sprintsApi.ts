import { axiosClient } from './axiosClient';
import { ApiResponse, Sprint, SprintDetail, SprintStatus } from '../types';

export const sprintsApi = {
  getProjectSprints: async (projectId: string): Promise<Sprint[]> => {
    const { data } = await axiosClient.get<ApiResponse<Sprint[]>>(`/projects/${projectId}/sprints`);
    return data.data;
  },

  getSprintById: async (sprintId: string): Promise<SprintDetail> => {
    const { data } = await axiosClient.get<ApiResponse<SprintDetail>>(`/sprints/${sprintId}`);
    return data.data;
  },

  createSprint: async (
    projectId: string,
    sprintData: {
      name: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Sprint> => {
    const { data } = await axiosClient.post<ApiResponse<Sprint>>(`/projects/${projectId}/sprints`, sprintData);
    return data.data;
  },

  updateSprint: async (
    sprintId: string,
    sprintData: {
      name: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
      status?: SprintStatus;
    }
  ): Promise<Sprint> => {
    const { data } = await axiosClient.put<ApiResponse<Sprint>>(`/sprints/${sprintId}`, sprintData);
    return data.data;
  },

  startSprint: async (sprintId: string): Promise<Sprint> => {
    const { data } = await axiosClient.post<ApiResponse<Sprint>>(`/sprints/${sprintId}/start`);
    return data.data;
  },

  completeSprint: async (sprintId: string): Promise<Sprint> => {
    const { data } = await axiosClient.post<ApiResponse<Sprint>>(`/sprints/${sprintId}/complete`);
    return data.data;
  },

  deleteSprint: async (sprintId: string): Promise<void> => {
    await axiosClient.delete(`/sprints/${sprintId}`);
  },
};
