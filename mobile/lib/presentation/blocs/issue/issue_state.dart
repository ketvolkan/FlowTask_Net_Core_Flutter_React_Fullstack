import 'package:equatable/equatable.dart';
import '../../../domain/entities/issue_entity.dart';

abstract class IssueState extends Equatable {
  const IssueState();

  @override
  List<Object?> get props => [];
}

class IssueInitial extends IssueState {}

class IssueLoading extends IssueState {}

class IssuesLoaded extends IssueState {
  final List<IssueEntity> issues;
  final String? filterStatus;
  final String? searchQuery;

  const IssuesLoaded({
    required this.issues,
    this.filterStatus,
    this.searchQuery,
  });

  @override
  List<Object?> get props => [issues, filterStatus, searchQuery];

  List<IssueEntity> get filteredIssues {
    return issues.where((issue) {
      final matchesStatus = filterStatus == null || issue.status == filterStatus;
      final matchesQuery = searchQuery == null ||
          searchQuery!.isEmpty ||
          issue.title.toLowerCase().contains(searchQuery!.toLowerCase()) ||
          issue.issueKey.toLowerCase().contains(searchQuery!.toLowerCase());
      return matchesStatus && matchesQuery;
    }).toList();
  }

  IssuesLoaded copyWith({
    List<IssueEntity>? issues,
    String? filterStatus,
    String? searchQuery,
  }) {
    return IssuesLoaded(
      issues: issues ?? this.issues,
      filterStatus: filterStatus ?? this.filterStatus,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class IssueError extends IssueState {
  final String message;

  const IssueError({required this.message});

  @override
  List<Object?> get props => [message];
}
