import '../entities/sprint_entity.dart';

abstract class ISprintRepository {
  Future<List<SprintEntity>> getSprintsByProject(String projectId);
  Future<SprintEntity> createSprint({
    required String name,
    String? goal,
    required String projectId,
    DateTime? startDate,
    DateTime? endDate,
  });
  Future<void> startSprint(String sprintId);
  Future<void> completeSprint(String sprintId);
}
