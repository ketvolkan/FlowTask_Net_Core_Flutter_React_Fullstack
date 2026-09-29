import 'package:flutter/material.dart';

class PriorityBadge extends StatelessWidget {
  final String priority;

  const PriorityBadge({super.key, required this.priority});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    IconData icon;

    switch (priority.toLowerCase()) {
      case 'critical':
        bg = const Color(0xFFFEF2F2);
        text = const Color(0xFFB91C1C);
        icon = Icons.error_outline;
        break;
      case 'high':
        bg = const Color(0xFFFFF1F2);
        text = const Color(0xFFE11D48);
        icon = Icons.keyboard_double_arrow_up;
        break;
      case 'medium':
        bg = const Color(0xFFFFFBEB);
        text = const Color(0xFFD97706);
        icon = Icons.drag_handle;
        break;
      case 'low':
      default:
        bg = const Color(0xFFF1F5F9);
        text = const Color(0xFF64748B);
        icon = Icons.keyboard_arrow_down;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: text.withAlpha(50)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: text),
          const SizedBox(width: 4),
          Text(
            priority,
            style: TextStyle(
              color: text,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
