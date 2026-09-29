import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flowtask_mobile/presentation/widgets/priority_badge.dart';

void main() {
  testWidgets('PriorityBadge displays Critical and High priorities', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              PriorityBadge(priority: 'Critical'),
              PriorityBadge(priority: 'High'),
            ],
          ),
        ),
      ),
    );

    expect(find.text('Critical'), findsOneWidget);
    expect(find.text('High'), findsOneWidget);
  });
}
