import '../../domain/entities/comment_entity.dart';

class CommentModel extends CommentEntity {
  const CommentModel({
    required super.id,
    required super.content,
    required super.issueId,
    required super.userId,
    required super.userFullName,
    super.userAvatarUrl,
    required super.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'] as String? ?? '',
      content: json['content'] as String? ?? '',
      issueId: json['issueId'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      userFullName: json['userFullName'] as String? ?? (json['user'] != null ? json['user']['fullName'] : 'User'),
      userAvatarUrl: json['userAvatarUrl'] as String? ?? (json['user'] != null ? json['user']['avatarUrl'] : null),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'issueId': issueId,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
