import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flowtask_mobile/presentation/widgets/type_badge.dart';

void main() {
  testWidgets('TypeBadge displays Bug, Story, Task', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              TypeBadge(type: 'Bug'),
              TypeBadge(type: 'Story'),
              TypeBadge(type: 'Task'),
            ],
          ),
        ),
      ),
    );

    expect(find.text('Bug'), findsOneWidget);
    expect(find.text('Story'), findsOneWidget);
    expect(find.text('Task'), findsOneWidget);
  });
}
