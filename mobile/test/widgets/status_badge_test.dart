import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flowtask_mobile/presentation/widgets/status_badge.dart';

void main() {
  testWidgets('StatusBadge displays correct text for InProgress', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: StatusBadge(status: 'InProgress'),
        ),
      ),
    );

    expect(find.text('In Progress'), findsOneWidget);
  });

  testWidgets('StatusBadge displays correct text for Done', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: StatusBadge(status: 'Done'),
        ),
      ),
    );

    expect(find.text('Done'), findsOneWidget);
  });
}
