import 'package:flutter/material.dart';

class TypeBadge extends StatelessWidget {
  final String type;

  const TypeBadge({super.key, required this.type});

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;

    switch (type.toLowerCase()) {
      case 'bug':
        color = const Color(0xFFEF4444);
        icon = Icons.bug_report_outlined;
        break;
      case 'story':
        color = const Color(0xFF10B981);
        icon = Icons.bookmark_border;
        break;
      case 'epic':
        color = const Color(0xFF8B5CF6);
        icon = Icons.bolt;
        break;
      case 'task':
      default:
        color = const Color(0xFF3B82F6);
        icon = Icons.check_circle_outline;
        break;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          type,
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
