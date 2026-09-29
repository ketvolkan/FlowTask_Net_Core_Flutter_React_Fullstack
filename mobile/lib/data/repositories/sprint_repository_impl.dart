import '../../domain/entities/sprint_entity.dart';
import '../../domain/repositories/i_sprint_repository.dart';
import '../datasources/sprint_remote_data_source.dart';

class SprintRepositoryImpl implements ISprintRepository {
  final SprintRemoteDataSource remoteDataSource;

  SprintRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<SprintEntity>> getSprintsByProject(String projectId) async {
    return await remoteDataSource.getSprintsByProject(projectId);
  }

  @override
  Future<SprintEntity> createSprint({
    required String name,
    String? goal,
    required String projectId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    return await remoteDataSource.createSprint(
      name: name,
      goal: goal,
      projectId: projectId,
      startDate: startDate,
      endDate: endDate,
    );
  }

  @override
  Future<void> startSprint(String sprintId) async {
    await remoteDataSource.startSprint(sprintId);
  }

  @override
  Future<void> completeSprint(String sprintId) async {
    await remoteDataSource.completeSprint(sprintId);
  }
}
