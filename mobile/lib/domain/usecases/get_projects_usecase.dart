import '../entities/project_entity.dart';
import '../repositories/i_project_repository.dart';

class GetProjectsUseCase {
  final IProjectRepository repository;

  GetProjectsUseCase({required this.repository});

  Future<List<ProjectEntity>> call() {
    return repository.getProjects();
  }
}
