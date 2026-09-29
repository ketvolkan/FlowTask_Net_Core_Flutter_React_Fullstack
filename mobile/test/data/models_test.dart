import 'package:flutter_test/flutter_test.dart';
import 'package:flowtask_mobile/data/models/user_model.dart';
import 'package:flowtask_mobile/data/models/project_model.dart';
import 'package:flowtask_mobile/data/models/issue_model.dart';

void main() {
  group('Data Models JSON Serialization', () {
    test('UserModel.fromJson parses correctly', () {
      final json = {
        'id': 'u1',
        'email': 'admin@flowtask.local',
        'fullName': 'Admin User',
        'role': 'Admin',
        'isActive': true,
      };

      final model = UserModel.fromJson(json);

      expect(model.id, equals('u1'));
      expect(model.email, equals('admin@flowtask.local'));
      expect(model.fullName, equals('Admin User'));
      expect(model.role, equals('Admin'));
      expect(model.isActive, isTrue);
    });

    test('ProjectModel.fromJson parses correctly', () {
      final json = {
        'id': 'p1',
        'name': 'Flowtask Core',
        'key': 'FLOW',
        'description': 'Main platform project',
        'ownerId': 'u1',
        'memberCount': 5,
        'issueCount': 12,
        'createdAt': '2026-09-29T10:00:00.000Z',
      };

      final model = ProjectModel.fromJson(json);

      expect(model.id, equals('p1'));
      expect(model.name, equals('Flowtask Core'));
      expect(model.key, equals('FLOW'));
      expect(model.memberCount, equals(5));
      expect(model.issueCount, equals(12));
    });

    test('IssueModel.fromJson parses correctly', () {
      final json = {
        'id': 'i1',
        'title': 'Setup CI/CD pipeline',
        'issueKey': 'FLOW-1',
        'status': 'InProgress',
        'priority': 'High',
        'type': 'Task',
        'projectId': 'p1',
        'reporterId': 'u1',
        'storyPoints': 5,
        'createdAt': '2026-09-29T10:00:00.000Z',
      };

      final model = IssueModel.fromJson(json);

      expect(model.id, equals('i1'));
      expect(model.title, equals('Setup CI/CD pipeline'));
      expect(model.issueKey, equals('FLOW-1'));
      expect(model.status, equals('InProgress'));
      expect(model.priority, equals('High'));
      expect(model.storyPoints, equals(5));
    });
  });
}
