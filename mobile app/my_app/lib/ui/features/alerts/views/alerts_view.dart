import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';
import '../view_models/alerts_view_model.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../widgets/premium_card.dart';

class AlertsView extends StatelessWidget {
  const AlertsView({super.key, required this.viewModel});

  final AlertsViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Surprises & Alerts'),
      ),
      body: ListenableBuilder(
        listenable: viewModel,
        builder: (context, _) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: GridView.count(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  children: [
                    _buildAlertButton(context, 'Miss You', Icons.favorite, 'Sends a floating heart.', 100).animate().fade(duration: 600.ms, delay: 100.ms).slideY(begin: 0.2),
                    _buildAlertButton(context, 'Thinking of You', Icons.bubble_chart, 'Sends a gentle vibration.', 200).animate().fade(duration: 600.ms, delay: 200.ms).slideY(begin: 0.2),
                    _buildAlertButton(context, 'Virtual Hug', Icons.emoji_people, 'A cozy animation.', 300).animate().fade(duration: 600.ms, delay: 300.ms).slideY(begin: 0.2),
                    _buildAlertButton(context, 'Secret Surprise', Icons.card_giftcard, 'Unlock a hidden photo.', 400).animate().fade(duration: 600.ms, delay: 400.ms).slideY(begin: 0.2),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                child: Text('Recent Alerts', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 24, letterSpacing: -0.5)),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: viewModel.alerts.length,
                  itemBuilder: (context, index) {
                    final alert = viewModel.alerts[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(color: AppTheme.background, shape: BoxShape.circle),
                              child: const Icon(Icons.notifications_active, color: AppTheme.secondaryColor, size: 20),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(alert.type, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                                  Text(alert.sentAt.toString(), style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                ],
                              ),
                            )
                          ],
                        ),
                      ).animate().fade(duration: 500.ms, delay: (index * 100).ms).slideX(begin: -0.1),
                    );
                  },
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Widget _buildAlertButton(BuildContext context, String title, IconData icon, String description, int delayMs) {
    return PremiumCard(
      padding: const EdgeInsets.all(16.0),
      onTap: () {
        viewModel.sendSurpriseAlert(title);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sent "$title" alert!'),
            backgroundColor: AppTheme.textPrimary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          ),
        );
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.background, shape: BoxShape.circle),
            child: Icon(icon, size: 32, color: AppTheme.secondaryColor),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, letterSpacing: -0.5),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
