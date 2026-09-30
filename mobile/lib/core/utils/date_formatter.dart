import 'package:intl/intl.dart';

class DateFormatter {
  static String formatShort(DateTime? date) {
    if (date == null) return '-';
    return DateFormat('MMM d, yyyy').format(date);
  }

  static String formatWithTime(DateTime? date) {
    if (date == null) return '-';
    return DateFormat('MMM d, yyyy HH:mm').format(date);
  }

  static String formatRelative(DateTime? date, {String locale = 'tr'}) {
    if (date == null) return '-';
    final diff = DateTime.now().difference(date);
    final isTr = locale == 'tr';

    if (diff.inSeconds < 60) return isTr ? 'az önce' : 'just now';
    if (diff.inMinutes < 60) return isTr ? '${diff.inMinutes} dk önce' : '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return isTr ? '${diff.inHours} sa önce' : '${diff.inHours}h ago';
    if (diff.inDays < 7) return isTr ? '${diff.inDays} gün önce' : '${diff.inDays}d ago';
    return formatShort(date);
  }

  static String timeAgo(DateTime? date) => formatRelative(date, locale: 'en');
}
