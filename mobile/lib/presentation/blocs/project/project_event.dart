import 'package:equatable/equatable.dart';

abstract class ProjectEvent extends Equatable {
  const ProjectEvent();

  @override
  List<Object?> get props => [];
}

class LoadProjectsEvent extends ProjectEvent {}

class SelectProjectEvent extends ProjectEvent {
  final String projectId;

  const SelectProjectEvent({required this.projectId});

  @override
  List<Object?> get props => [projectId];
}

class CreateProjectSubmittedEvent extends ProjectEvent {
  final String name;
  final String key;
  final String? description;

  const CreateProjectSubmittedEvent({
    required this.name,
    required this.key,
    this.description,
  });

  @override
  List<Object?> get props => [name, key, description];
}
