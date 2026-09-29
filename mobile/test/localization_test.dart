import 'package:flutter_test/flutter_test.dart';
import 'package:flowtask_mobile/core/localization/app_translations.dart';

void main() {
  group('AppTranslations Tests', () {
    test('returns Turkish translations correctly', () {
      expect(AppTranslations.get('app_name', locale: 'tr'), equals('Flowtask'));
      expect(AppTranslations.get('total_tasks', locale: 'tr'), equals('Toplam Görev'));
      expect(AppTranslations.get('logout', locale: 'tr'), equals('Çıkış Yap'));
      expect(AppTranslations.get('delete_account', locale: 'tr'), equals('Hesabımı Sil'));
    });

    test('returns English translations correctly', () {
      expect(AppTranslations.get('app_name', locale: 'en'), equals('Flowtask'));
      expect(AppTranslations.get('total_tasks', locale: 'en'), equals('Total Tasks'));
      expect(AppTranslations.get('logout', locale: 'en'), equals('Log Out'));
      expect(AppTranslations.get('delete_account', locale: 'en'), equals('Delete My Account'));
    });

    test('interpolates params correctly in dashboard greeting', () {
      final trGreeting = AppTranslations.get(
        'dashboard_greeting',
        locale: 'tr',
        params: {'name': 'Zeynep'},
      );
      expect(trGreeting, contains('Zeynep'));

      final enGreeting = AppTranslations.get(
        'dashboard_greeting',
        locale: 'en',
        params: {'name': 'John'},
      );
      expect(enGreeting, contains('John'));
    });
  });
}
