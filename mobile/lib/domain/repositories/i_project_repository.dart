import '../entities/project_entity.dart';
import '../entities/project_member_entity.dart';

abstract class IProjectRepository {
  Future<List<ProjectEntity>> getProjects();
  Future<ProjectEntity> getProjectById(String id);
  Future<ProjectEntity> createProject({required String name, required String key, String? description});
  Future<List<ProjectMemberEntity>> getProjectMembers(String projectId);
  Future<void> addProjectMember({required String projectId, required String userId, required String role});
}
