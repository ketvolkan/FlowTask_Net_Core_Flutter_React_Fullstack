import '../../domain/entities/project_entity.dart';
import '../../domain/entities/project_member_entity.dart';
import '../../domain/repositories/i_project_repository.dart';
import '../datasources/project_remote_data_source.dart';

class ProjectRepositoryImpl implements IProjectRepository {
  final ProjectRemoteDataSource remoteDataSource;

  ProjectRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<ProjectEntity>> getProjects() async {
    return await remoteDataSource.getProjects();
  }

  @override
  Future<ProjectEntity> getProjectById(String id) async {
    return await remoteDataSource.getProjectById(id);
  }

  @override
  Future<ProjectEntity> createProject({
    required String name,
    required String key,
    String? description,
  }) async {
    return await remoteDataSource.createProject(name: name, key: key, description: description);
  }

  @override
  Future<List<ProjectMemberEntity>> getProjectMembers(String projectId) async {
    return await remoteDataSource.getProjectMembers(projectId);
  }

  @override
  Future<void> addProjectMember({
    required String projectId,
    required String userId,
    required String role,
  }) async {
    await remoteDataSource.addProjectMember(projectId: projectId, userId: userId, role: role);
  }
}
