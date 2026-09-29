import 'package:equatable/equatable.dart';
import '../../../domain/entities/sprint_entity.dart';

abstract class SprintState extends Equatable {
  const SprintState();

  @override
  List<Object?> get props => [];
}

class SprintInitial extends SprintState {}

class SprintLoading extends SprintState {}

class SprintsLoaded extends SprintState {
  final List<SprintEntity> sprints;

  const SprintsLoaded({required this.sprints});

  @override
  List<Object?> get props => [sprints];

  SprintsLoaded copyWith({List<SprintEntity>? sprints}) {
    return SprintsLoaded(sprints: sprints ?? this.sprints);
  }
}

class SprintError extends SprintState {
  final String message;

  const SprintError({required this.message});

  @override
  List<Object?> get props => [message];
}
