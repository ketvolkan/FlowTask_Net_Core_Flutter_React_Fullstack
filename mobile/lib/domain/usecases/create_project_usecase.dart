import '../entities/project_entity.dart';
import '../repositories/i_project_repository.dart';

class CreateProjectUseCase {
  final IProjectRepository repository;

  CreateProjectUseCase({required this.repository});

  Future<ProjectEntity> call({
    required String name,
    required String key,
    String? description,
  }) {
    return repository.createProject(name: name, key: key, description: description);
  }
}
