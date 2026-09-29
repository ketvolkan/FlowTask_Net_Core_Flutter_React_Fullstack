import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/get_projects_usecase.dart';
import '../../../domain/usecases/create_project_usecase.dart';
import 'project_event.dart';
import 'project_state.dart';

class ProjectBloc extends Bloc<ProjectEvent, ProjectState> {
  final GetProjectsUseCase getProjectsUseCase;
  final CreateProjectUseCase createProjectUseCase;

  ProjectBloc({
    required this.getProjectsUseCase,
    required this.createProjectUseCase,
  }) : super(ProjectInitial()) {
    on<LoadProjectsEvent>(_onLoadProjects);
    on<SelectProjectEvent>(_onSelectProject);
    on<CreateProjectSubmittedEvent>(_onCreateProject);
  }

  Future<void> _onLoadProjects(
    LoadProjectsEvent event,
    Emitter<ProjectState> emit,
  ) async {
    emit(ProjectLoading());
    try {
      final projects = await getProjectsUseCase();
      emit(ProjectsLoaded(
        projects: projects,
        selectedProject: projects.isNotEmpty ? projects.first : null,
      ));
    } catch (e) {
      emit(ProjectError(message: e.toString().replaceAll('ServerException: ', '')));
    }
  }

  void _onSelectProject(
    SelectProjectEvent event,
    Emitter<ProjectState> emit,
  ) {
    if (state is ProjectsLoaded) {
      final currentState = state as ProjectsLoaded;
      final selected = currentState.projects.firstWhere(
        (p) => p.id == event.projectId,
        orElse: () => currentState.projects.first,
      );
      emit(currentState.copyWith(selectedProject: selected));
    }
  }

  Future<void> _onCreateProject(
    CreateProjectSubmittedEvent event,
    Emitter<ProjectState> emit,
  ) async {
    try {
      final newProject = await createProjectUseCase(
        name: event.name,
        key: event.key,
        description: event.description,
      );
      if (state is ProjectsLoaded) {
        final currentState = state as ProjectsLoaded;
        final updatedList = [newProject, ...currentState.projects];
        emit(currentState.copyWith(
          projects: updatedList,
          selectedProject: newProject,
        ));
      } else {
        emit(ProjectsLoaded(projects: [newProject], selectedProject: newProject));
      }
    } catch (e) {
      emit(ProjectError(message: e.toString().replaceAll('ServerException: ', '')));
    }
  }
}
