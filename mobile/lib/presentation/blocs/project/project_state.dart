import 'package:equatable/equatable.dart';
import '../../../domain/entities/project_entity.dart';

abstract class ProjectState extends Equatable {
  const ProjectState();

  @override
  List<Object?> get props => [];
}

class ProjectInitial extends ProjectState {}

class ProjectLoading extends ProjectState {}

class ProjectsLoaded extends ProjectState {
  final List<ProjectEntity> projects;
  final ProjectEntity? selectedProject;

  const ProjectsLoaded({
    required this.projects,
    this.selectedProject,
  });

  @override
  List<Object?> get props => [projects, selectedProject];

  ProjectsLoaded copyWith({
    List<ProjectEntity>? projects,
    ProjectEntity? selectedProject,
  }) {
    return ProjectsLoaded(
      projects: projects ?? this.projects,
      selectedProject: selectedProject ?? this.selectedProject,
    );
  }
}

class ProjectError extends ProjectState {
  final String message;

  const ProjectError({required this.message});

  @override
  List<Object?> get props => [message];
}
