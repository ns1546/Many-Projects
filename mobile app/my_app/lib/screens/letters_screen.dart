import 'package:flutter/material.dart';
import 'package:my_app/theme/app_theme.dart';

class LettersScreen extends StatelessWidget {
  const LettersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vintage Letters'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'In a world of instant messaging, take time to write a thoughtful letter. Letters take 24 hours to deliver.',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 14, fontStyle: FontStyle.italic),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          _buildLetterCard(
            context,
            'From: Your Love',
            'Arriving in 12h 45m',
            Icons.lock_clock,
            isLocked: true,
          ),
          const SizedBox(height: 16),
          _buildLetterCard(
            context,
            'From: Your Love',
            'Opened yesterday',
            Icons.drafts,
            isLocked: false,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Open write letter dialog
        },
        icon: const Icon(Icons.edit),
        label: const Text('Write a Letter'),
        backgroundColor: AppTheme.primaryColor,
      ),
    );
  }

  Widget _buildLetterCard(BuildContext context, String title, String subtitle, IconData icon, {required bool isLocked}) {
    return Card(
      color: isLocked ? Colors.grey.shade100 : AppTheme.surfaceColor,
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          backgroundColor: isLocked ? Colors.grey.shade300 : AppTheme.primaryColor.withOpacity(0.1),
          child: Icon(icon, color: isLocked ? Colors.grey : AppTheme.primaryColor),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isLocked ? AppTheme.textSecondary : AppTheme.textPrimary,
          ),
        ),
        subtitle: Text(subtitle),
        trailing: isLocked
            ? const Icon(Icons.lock, color: Colors.grey)
            : const Icon(Icons.chevron_right, color: AppTheme.primaryColor),
        onTap: isLocked
            ? null
            : () {
                // View letter
              },
      ),
    );
  }
}
