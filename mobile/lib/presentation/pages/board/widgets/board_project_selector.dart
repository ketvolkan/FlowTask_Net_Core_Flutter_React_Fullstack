import 'package:flutter/material.dart';
import '../../../blocs/project/project_state.dart';
import '../../../widgets/app_project_selector.dart';

class BoardProjectSelector extends StatelessWidget {
  final ProjectsLoaded projState;
  final String locale;

  const BoardProjectSelector({
    super.key,
    required this.projState,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    return AppProjectSelector(
      projState: projState,
      locale: locale,
    );
  }
}
