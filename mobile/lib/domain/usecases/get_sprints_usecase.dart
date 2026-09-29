import '../entities/sprint_entity.dart';
import '../repositories/i_sprint_repository.dart';

class GetSprintsUseCase {
  final ISprintRepository repository;

  GetSprintsUseCase({required this.repository});

  Future<List<SprintEntity>> call(String projectId) {
    return repository.getSprintsByProject(projectId);
  }
}
