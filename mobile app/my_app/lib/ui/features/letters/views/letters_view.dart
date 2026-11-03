import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';
import '../view_models/letters_view_model.dart';
import '../../../../domain/models/letter_model.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../widgets/premium_card.dart';
import '../../../widgets/premium_button.dart';

class LettersView extends StatelessWidget {
  const LettersView({super.key, required this.viewModel});

  final LettersViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vintage Letters'),
      ),
      body: ListenableBuilder(
        listenable: viewModel,
        builder: (context, _) {
          if (viewModel.isLoading && viewModel.letters.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (viewModel.letters.isEmpty) {
            return const Center(
              child: Text(
                'No letters yet.\nWrite the first one!',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            ).animate().fade(duration: 800.ms).slideY(begin: 0.1);
          }

          return ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
            itemCount: viewModel.letters.length,
            itemBuilder: (context, index) {
              final letter = viewModel.letters[index];
              return _buildLetterCard(context, letter, index);
            },
          );
        },
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: PremiumButton(
          text: 'Write a Letter',
          icon: Icons.edit,
          onTap: () => _showWriteDialog(context),
        ).animate().fade(duration: 800.ms, delay: 500.ms).scale(curve: Curves.easeOutBack),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  void _showWriteDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.cardInner,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Write a Vintage Letter', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          content: TextField(
            controller: controller,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Pour your heart out...',
              hintStyle: TextStyle(color: AppTheme.textSecondary.withOpacity(0.5)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              filled: true,
              fillColor: AppTheme.background,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
            ),
            PremiumButton(
              text: 'Seal & Send (24h)',
              onTap: () {
                if (controller.text.isNotEmpty) {
                  viewModel.sendLetter(controller.text);
                  Navigator.pop(context);
                }
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildLetterCard(BuildContext context, LetterModel letter, int index) {
    final now = DateTime.now();
    final isLocked = letter.deliveryTime.isAfter(now);
    
    String subtitle;
    if (isLocked) {
      final difference = letter.deliveryTime.difference(now);
      subtitle = 'Arriving in ${difference.inHours}h ${difference.inMinutes % 60}m';
    } else {
      subtitle = 'Ready to read';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: PremiumCard(
        padding: const EdgeInsets.all(20),
        innerColor: isLocked ? AppTheme.background : AppTheme.cardInner,
        onTap: isLocked ? null : () => _showReadDialog(context, letter),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isLocked ? AppTheme.cardOuter : AppTheme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isLocked ? Icons.lock_clock : Icons.drafts, 
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
                    'From: ${letter.senderId == 'me' ? 'You' : 'Your Love'}',
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
            if (isLocked)
              const Icon(Icons.lock, color: AppTheme.cardOuter)
            else
              const Icon(Icons.chevron_right, color: AppTheme.primaryColor)
          ],
        ),
      ).animate().fade(duration: 500.ms, delay: (index * 150).ms).slideY(begin: 0.1),
    );
  }
  
  void _showReadDialog(BuildContext context, LetterModel letter) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.cardInner,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text('Letter from ${letter.senderId == 'me' ? 'You' : 'Your Love'}', style: const TextStyle(fontWeight: FontWeight.w800)),
          content: Text(letter.content, style: const TextStyle(height: 1.6, fontSize: 16)),
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
