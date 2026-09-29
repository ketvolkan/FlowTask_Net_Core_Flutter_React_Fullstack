import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/storage/secure_storage_service.dart';

class LanguageState {
  final String locale; // 'tr' or 'en'
  const LanguageState({required this.locale});

  bool get isTurkish => locale == 'tr';
}

class LanguageCubit extends Cubit<LanguageState> {
  final SecureStorageService storageService;

  LanguageCubit({required this.storageService}) : super(const LanguageState(locale: 'tr')) {
    _loadSavedLanguage();
  }

  Future<void> _loadSavedLanguage() async {
    final saved = await storageService.getString('flowtask_mobile_locale');
    if (saved != null && (saved == 'tr' || saved == 'en')) {
      emit(LanguageState(locale: saved));
    }
  }

  Future<void> setLanguage(String locale) async {
    if (locale == 'tr' || locale == 'en') {
      await storageService.saveString('flowtask_mobile_locale', locale);
      emit(LanguageState(locale: locale));
    }
  }

  void toggleLanguage() {
    final newLocale = state.locale == 'tr' ? 'en' : 'tr';
    setLanguage(newLocale);
  }
}
