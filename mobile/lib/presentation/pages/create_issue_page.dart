import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class CreateIssuePage extends StatefulWidget {
  final String projectId;

  const CreateIssuePage({super.key, required this.projectId});

  @override
  State<CreateIssuePage> createState() => _CreateIssuePageState();
}

class _CreateIssuePageState extends State<CreateIssuePage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _storyPointsController = TextEditingController();
  
  String _selectedType = 'Task';
  String _selectedPriority = 'Medium';
  final List<String> _types = ['Task', 'Bug', 'Story', 'Epic'];
  final List<String> _priorities = ['Low', 'Medium', 'High', 'Critical'];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _storyPointsController.dispose();
    super.dispose();
  }

  void _onCreatePressed() {
    if (_formKey.currentState?.validate() ?? false) {
      final points = int.tryParse(_storyPointsController.text.trim());
      context.read<IssueBloc>().add(
            CreateIssueSubmittedEvent(
              title: _titleController.text.trim(),
              description: _descController.text.trim(),
              type: _selectedType,
              priority: _selectedPriority,
              projectId: widget.projectId,
              storyPoints: points,
            ),
          );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Create Issue'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CustomTextField(
                controller: _titleController,
                label: 'Issue Title',
                hintText: 'e.g. Implement OAuth2 login flow',
                validator: (val) => (val == null || val.isEmpty) ? 'Title is required' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Type',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedType,
                          items: _types
                              .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedType = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Priority',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedPriority,
                          items: _priorities
                              .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedPriority = val);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _storyPointsController,
                label: 'Story Points',
                hintText: 'e.g. 5',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _descController,
                label: 'Description',
                hintText: 'Detailed requirements, acceptance criteria...',
                maxLines: 4,
              ),
              const SizedBox(height: 28),
              CustomButton(
                text: 'Create Issue',
                onPressed: _onCreatePressed,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
