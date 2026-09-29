import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/get_issues_by_project_usecase.dart';
import '../../../domain/usecases/create_issue_usecase.dart';
import '../../../domain/usecases/update_issue_status_usecase.dart';
import 'issue_event.dart';
import 'issue_state.dart';

class IssueBloc extends Bloc<IssueEvent, IssueState> {
  final GetIssuesByProjectUseCase getIssuesByProjectUseCase;
  final CreateIssueUseCase createIssueUseCase;
  final UpdateIssueStatusUseCase updateIssueStatusUseCase;

  IssueBloc({
    required this.getIssuesByProjectUseCase,
    required this.createIssueUseCase,
    required this.updateIssueStatusUseCase,
  }) : super(IssueInitial()) {
    on<LoadIssuesByProjectEvent>(_onLoadIssues);
    on<CreateIssueSubmittedEvent>(_onCreateIssue);
    on<UpdateIssueStatusEvent>(_onUpdateStatus);
  }

  Future<void> _onLoadIssues(
    LoadIssuesByProjectEvent event,
    Emitter<IssueState> emit,
  ) async {
    emit(IssueLoading());
    try {
      final issues = await getIssuesByProjectUseCase(event.projectId);
      emit(IssuesLoaded(issues: issues));
    } catch (e) {
      emit(IssueError(message: e.toString().replaceAll('ServerException: ', '')));
    }
  }

  Future<void> _onCreateIssue(
    CreateIssueSubmittedEvent event,
    Emitter<IssueState> emit,
  ) async {
    try {
      final newIssue = await createIssueUseCase(
        title: event.title,
        description: event.description,
        type: event.type,
        priority: event.priority,
        projectId: event.projectId,
        sprintId: event.sprintId,
        assigneeId: event.assigneeId,
        storyPoints: event.storyPoints,
        dueDate: event.dueDate,
      );
      if (state is IssuesLoaded) {
        final currentState = state as IssuesLoaded;
        emit(currentState.copyWith(issues: [newIssue, ...currentState.issues]));
      } else {
        emit(IssuesLoaded(issues: [newIssue]));
      }
    } catch (e) {
      emit(IssueError(message: e.toString().replaceAll('ServerException: ', '')));
    }
  }

  Future<void> _onUpdateStatus(
    UpdateIssueStatusEvent event,
    Emitter<IssueState> emit,
  ) async {
    if (state is IssuesLoaded) {
      final currentState = state as IssuesLoaded;
      final originalList = List.of(currentState.issues);
      
      final updatedList = currentState.issues.map((i) {
        if (i.id == event.issueId) {
          return i;
        }
        return i;
      }).toList();
      emit(currentState.copyWith(issues: updatedList));

      try {
        await updateIssueStatusUseCase(
          issueId: event.issueId,
          status: event.newStatus,
          orderIndex: event.newOrder,
        );
      } catch (e) {
        emit(currentState.copyWith(issues: originalList));
        emit(const IssueError(message: 'Failed to update issue status'));
      }
    }
  }
}
