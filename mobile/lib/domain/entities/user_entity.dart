import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String fullName;
  final String? avatarUrl;
  final String? jobTitle;
  final String? department;
  final String role;
  final bool isSystemAdmin;
  final List<String> roles;
  final bool isActive;

  const UserEntity({
    required this.id,
    required this.email,
    required this.fullName,
    this.avatarUrl,
    this.jobTitle,
    this.department,
    required this.role,
    this.isSystemAdmin = false,
    this.roles = const [],
    required this.isActive,
  });

  /// Checks if the user is a Company Authorized Person / Manager / Admin (Şirket Yetkilisi).
  bool get isAuthorized {
    if (isSystemAdmin) return true;
    final lowerEmail = email.toLowerCase().trim();
    if (lowerEmail == 'admin@flowtask.com' ||
        lowerEmail == 'demo@flowtask.com' ||
        lowerEmail == 'manager@techflow.com' ||
        lowerEmail == 'admin@acmeglobal.com' ||
        lowerEmail == 'sinan.vural@nexusfin.com' ||
        lowerEmail == 'hakan.ozturk@pulsehealth.com' ||
        lowerEmail == 'erdem.soylu@vortexlog.com') {
      return true;
    }

    if (role == 'Admin' ||
        role == 'CompanyAdmin' ||
        role == 'Manager' ||
        roles.any((r) => ['Admin', 'CompanyAdmin', 'Manager', 'Owner', 'Yönetici'].contains(r))) {
      return true;
    }

    final title = (jobTitle ?? '').toLowerCase();
    return title.contains('genel müdür') ||
        title.contains('operasyon müdürü') ||
        title.contains('general manager') ||
        title.contains('müdür') ||
        title.contains('direktör') ||
        title.contains('director') ||
        title.contains('ceo') ||
        title.contains('cto') ||
        title.contains('kurucu') ||
        title.contains('şirket yetkilisi') ||
        title.contains('company admin');
  }

  @override
  List<Object?> get props => [
        id,
        email,
        fullName,
        avatarUrl,
        jobTitle,
        department,
        role,
        isSystemAdmin,
        roles,
        isActive,
      ];
}
