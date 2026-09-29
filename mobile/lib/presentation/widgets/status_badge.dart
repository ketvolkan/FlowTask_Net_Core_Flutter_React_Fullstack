import 'package:flutter/material.dart';


class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String label = status;

    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        bg = const Color(0xFFECFDF5);
        text = const Color(0xFF047857);
        break;
      case 'inprogress':
      case 'in_progress':
      case 'active':
        bg = const Color(0xFFEEF2FF);
        text = const Color(0xFF4338CA);
        label = 'In Progress';
        break;
      case 'inreview':
      case 'in_review':
        bg = const Color(0xFFFFFBEB);
        text = const Color(0xFFB45309);
        label = 'In Review';
        break;
      case 'todo':
      default:
        bg = const Color(0xFFF1F5F9);
        text = const Color(0xFF475569);
        label = 'To Do';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: text.withAlpha(50)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: text,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
