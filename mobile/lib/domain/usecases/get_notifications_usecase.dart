import '../entities/notification_entity.dart';
import '../repositories/i_notification_repository.dart';

class GetNotificationsUseCase {
  final INotificationRepository repository;

  GetNotificationsUseCase({required this.repository});

  Future<List<NotificationEntity>> call() {
    return repository.getNotifications();
  }
}
