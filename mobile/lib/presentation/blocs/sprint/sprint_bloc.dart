import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/get_sprints_usecase.dart';
import '../../../domain/usecases/create_sprint_usecase.dart';
import 'sprint_event.dart';
import 'sprint_state.dart';

class SprintBloc extends Bloc<SprintEvent, SprintState> {
  final GetSprintsUseCase getSprintsUseCase;
  final CreateSprintUseCase createSprintUseCase;

  SprintBloc({
    required this.getSprintsUseCase,
    required this.createSprintUseCase,
  }) : super(SprintInitial()) {
    on<LoadSprintsByProjectEvent>(_onLoadSprints);
    on<CreateSprintSubmittedEvent>(_onCreateSprint);
  }

  Future<void> _onLoadSprints(
    LoadSprintsByProjectEvent event,
    Emitter<SprintState> emit,
  ) async {
    emit(SprintLoading());
    try {
      final sprints = await getSprintsUseCase(event.projectId);
      emit(SprintsLoaded(sprints: sprints));
    } catch (e) {
      emit(SprintError(message: e.toString().replaceAll('ServerException: ', '')));
    }
  }

  Future<void> _onCreateSprint(
    CreateSprintSubmittedEvent event,
    Emitter<SprintState> emit,
  ) async {
    try {
      final newSprint = await createSprintUseCase(
        name: event.name,
        goal: event.goal,
        projectId: event.projectId,
        startDate: event.startDate,
        endDate: event.endDate,
      );
      if (state is SprintsLoaded) {
        final currentState = state as SprintsLoaded;
        emit(currentState.copyWith(sprints: [newSprint, ...currentState.sprints]));
      } else {
        emit(SprintsLoaded(sprints: [newSprint]));
      }
    } catch (e) {
      emit(SprintError(message: e.toString().replaceAll('ServerException: ', '')));
    }
  }
}
