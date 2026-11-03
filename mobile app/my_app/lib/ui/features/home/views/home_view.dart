import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';
import '../view_models/home_view_model.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../widgets/premium_card.dart';
import '../../../widgets/premium_button.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key, required this.viewModel});

  final HomeViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Love Zone'),
      ),
      body: ListenableBuilder(
        listenable: viewModel,
        builder: (context, _) {
          final space = viewModel.coupleSpace;
          if (space == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final daysTogether = DateTime.now().difference(space.relationshipStartDate).inDays;

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 32.0), // Macro whitespace
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Eyebrow Tag
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: const Text(
                      'YOUR SPACE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ).animate().fade(duration: 600.ms).slideY(begin: 0.5, end: 0, curve: Curves.easeOutCubic),
                ),
                const SizedBox(height: 24),
                
                // Status Card
                PremiumCard(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.background,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.favorite, color: AppTheme.primaryColor, size: 40)
                            .animate(onPlay: (controller) => controller.repeat(reverse: true))
                            .scaleXY(begin: 1.0, end: 1.1, duration: 1000.ms, curve: Curves.easeInOut),
                      ),
                      const SizedBox(height: 24),
                      const Text('Together for', style: TextStyle(fontSize: 14, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      Text('$daysTogether Days', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w800, color: AppTheme.textPrimary, letterSpacing: -1.5)),
                      const SizedBox(height: 32),
                      
                      Row(
                        children: [
                          Expanded(
                            child: PremiumButton(
                              text: space.partner1Mood,
                              icon: Icons.edit_outlined,
                              isFullWidth: true,
                              onTap: () => _showMoodDialog(context),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text('Partner\'s Mood: ${space.partner2Mood}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ).animate().fade(duration: 800.ms, delay: 100.ms).slideY(begin: 0.1, end: 0, curve: Curves.easeOutBack),
                
                const SizedBox(height: 48),
                // Quick Actions
                const Text('Quick Actions', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.textPrimary, letterSpacing: -0.5))
                    .animate().fade(duration: 800.ms, delay: 200.ms),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: _buildQuickActionCard(context, Icons.movie_filter, 'Movie Date', 'Plan tonight').animate().fade(duration: 800.ms, delay: 300.ms).slideY(begin: 0.1)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildQuickActionCard(context, Icons.music_note, 'Our Song', 'Play now').animate().fade(duration: 800.ms, delay: 400.ms).slideY(begin: 0.1)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showMoodDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.cardInner,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Update Mood', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(title: const Text('Happy 😊'), onTap: () { viewModel.updateMyMood('Happy 😊'); Navigator.pop(context); }),
              ListTile(title: const Text('Missing You 🥺'), onTap: () { viewModel.updateMyMood('Missing You 🥺'); Navigator.pop(context); }),
              ListTile(title: const Text('Sleepy 😴'), onTap: () { viewModel.updateMyMood('Sleepy 😴'); Navigator.pop(context); }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuickActionCard(BuildContext context, IconData icon, String title, String subtitle) {
    return PremiumCard(
      padding: const EdgeInsets.all(20),
      onTap: () {},
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.background, borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: AppTheme.primaryColor, size: 28),
          ),
          const SizedBox(height: 24),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18, letterSpacing: -0.5)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
