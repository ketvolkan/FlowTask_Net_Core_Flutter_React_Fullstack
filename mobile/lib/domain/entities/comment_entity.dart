import 'package:equatable/equatable.dart';

class CommentEntity extends Equatable {
  final String id;
  final String content;
  final String issueId;
  final String userId;
  final String userFullName;
  final String? userAvatarUrl;
  final DateTime createdAt;

  const CommentEntity({
    required this.id,
    required this.content,
    required this.issueId,
    required this.userId,
    required this.userFullName,
    this.userAvatarUrl,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        content,
        issueId,
        userId,
        userFullName,
        userAvatarUrl,
        createdAt,
      ];
}
