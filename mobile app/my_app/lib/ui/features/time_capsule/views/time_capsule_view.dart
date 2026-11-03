import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';
import '../view_models/time_capsule_view_model.dart';
import '../../../../domain/models/time_capsule_model.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../widgets/premium_card.dart';
import '../../../widgets/premium_button.dart';

class TimeCapsuleView extends StatelessWidget {
  const TimeCapsuleView({super.key, required this.viewModel});

  final TimeCapsuleViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Time Capsules'),
      ),
      body: ListenableBuilder(
        listenable: viewModel,
        builder: (context, _) {
          if (viewModel.isLoading && viewModel.capsules.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (viewModel.capsules.isEmpty) {
            return const Center(
              child: Text(
                'No Time Capsules yet.\nBury your first memory!',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            ).animate().fade(duration: 800.ms).slideY(begin: 0.1);
          }

          return ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
            itemCount: viewModel.capsules.length,
            itemBuilder: (context, index) {
              final capsule = viewModel.capsules[index];
              return _buildCapsuleCard(context, capsule, index);
            },
          );
        },
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: PremiumButton(
          text: 'Bury a Memory',
          icon: Icons.lock_clock,
          onTap: () => _showCreateDialog(context),
        ).animate().fade(duration: 800.ms, delay: 500.ms).scale(curve: Curves.easeOutBack),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  void _showCreateDialog(BuildContext context) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    DateTime? selectedDate;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: AppTheme.cardInner,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: const Text('Create a Time Capsule', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: titleController,
                      decoration: InputDecoration(
                        hintText: 'Capsule Title (e.g. Our 5th Anniversary)',
                        hintStyle: TextStyle(color: AppTheme.textSecondary.withOpacity(0.5)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                        filled: true,
                        fillColor: AppTheme.background,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: contentController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: 'What do you want to say to your future selves?',
                        hintStyle: TextStyle(color: AppTheme.textSecondary.withOpacity(0.5)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                        filled: true,
                        fillColor: AppTheme.background,
                      ),
                    ),
                    const SizedBox(height: 16),
                    PremiumButton(
                      text: selectedDate == null 
                          ? 'Select Unlock Date' 
                          : 'Unlocks on: ${selectedDate!.month}/${selectedDate!.day}/${selectedDate!.year}',
                      icon: Icons.calendar_month,
                      onTap: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now().add(const Duration(days: 1)),
                          firstDate: DateTime.now().add(const Duration(days: 1)),
                          lastDate: DateTime.now().add(const Duration(days: 3650)),
                        );
                        if (date != null) {
                          setState(() => selectedDate = date);
                        }
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                ),
                PremiumButton(
                  text: 'Bury',
                  onTap: () {
                    if (titleController.text.isNotEmpty && contentController.text.isNotEmpty && selectedDate != null) {
                      viewModel.createCapsule(titleController.text, contentController.text, selectedDate!);
                      Navigator.pop(context);
                    }
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildCapsuleCard(BuildContext context, TimeCapsuleModel capsule, int index) {
    final now = DateTime.now();
    final isLocked = capsule.unlockDate.isAfter(now);
    
    String subtitle;
    if (isLocked) {
      final difference = capsule.unlockDate.difference(now);
      if (difference.inDays > 0) {
        subtitle = 'Unlocks in ${difference.inDays} days';
      } else {
        subtitle = 'Unlocks in ${difference.inHours} hours';
      }
    } else {
      subtitle = 'Unlocked & ready to open!';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: PremiumCard(
        padding: const EdgeInsets.all(20),
        innerColor: isLocked ? AppTheme.background : AppTheme.cardInner,
        onTap: isLocked ? null : () => _showReadDialog(context, capsule),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isLocked ? AppTheme.cardOuter : AppTheme.primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isLocked ? Icons.lock : Icons.lock_open, 
                    color: isLocked ? AppTheme.textSecondary.withOpacity(0.5) : AppTheme.primaryColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        capsule.title,
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: isLocked ? AppTheme.textSecondary : AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(subtitle, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
                if (!isLocked)
                  const Icon(Icons.chevron_right, color: AppTheme.primaryColor)
              ],
            ),
            if (isLocked) ...[
              const SizedBox(height: 16),
              // Pulse effect for locked capsule
              Container(
                width: double.infinity,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ).animate(onPlay: (controller) => controller.repeat())
               .shimmer(duration: 2000.ms, color: AppTheme.primaryColor),
            ]
          ],
        ),
      ).animate().fade(duration: 500.ms, delay: (index * 150).ms).slideY(begin: 0.1),
    );
  }
  
  void _showReadDialog(BuildContext context, TimeCapsuleModel capsule) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.cardInner,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(capsule.title, style: const TextStyle(fontWeight: FontWeight.w800)),
          content: Text(capsule.content, style: const TextStyle(height: 1.6, fontSize: 16)),
          actions: [
            PremiumButton(
              text: 'Close',
              onTap: () => Navigator.pop(context),
            ),
          ],
        );
      },
    );
  }
}
