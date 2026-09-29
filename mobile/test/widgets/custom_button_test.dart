import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flowtask_mobile/presentation/widgets/custom_button.dart';

void main() {
  testWidgets('CustomButton renders text and triggers onPressed', (tester) async {
    bool tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: CustomButton(
            text: 'Save Changes',
            onPressed: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('Save Changes'), findsOneWidget);
    await tester.tap(find.text('Save Changes'));
    expect(tapped, isTrue);
  });

  testWidgets('CustomButton shows progress indicator when isLoading is true', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: CustomButton(
            text: 'Submit',
            isLoading: true,
          ),
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Submit'), findsNothing);
  });
}
