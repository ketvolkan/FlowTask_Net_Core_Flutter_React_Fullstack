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
    String userFullName = 'User';
    String? userAvatarUrl;
    if (json['userFullName'] != null) {
      userFullName = json['userFullName'].toString();
    } else if (json['user'] is Map) {
      final userMap = json['user'] as Map;
      userFullName = userMap['fullName']?.toString() ?? 'User';
      userAvatarUrl = userMap['avatarUrl']?.toString();
    }

    if (json['userAvatarUrl'] != null) {
      userAvatarUrl = json['userAvatarUrl']?.toString();
    }

    return CommentModel(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      issueId: json['issueId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      userFullName: userFullName,
      userAvatarUrl: userAvatarUrl,
      createdAt: json['createdAt'] != null
          ? (DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now())
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
