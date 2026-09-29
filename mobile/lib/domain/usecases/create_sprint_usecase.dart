import '../entities/sprint_entity.dart';
import '../repositories/i_sprint_repository.dart';

class CreateSprintUseCase {
  final ISprintRepository repository;

  CreateSprintUseCase({required this.repository});

  Future<SprintEntity> call({
    required String name,
    String? goal,
    required String projectId,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    return repository.createSprint(
      name: name,
      goal: goal,
      projectId: projectId,
      startDate: startDate,
      endDate: endDate,
    );
  }
}
