import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PremiumButton extends StatefulWidget {
  const PremiumButton({
    super.key,
    required this.text,
    required this.onTap,
    this.icon,
    this.isFullWidth = false,
  });

  final String text;
  final VoidCallback onTap;
  final IconData? icon;
  final bool isFullWidth;

  @override
  State<PremiumButton> createState() => _PremiumButtonState();
}

class _PremiumButtonState extends State<PremiumButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    Widget buttonContent = Container(
      padding: EdgeInsets.only(
        left: 24,
        right: widget.icon != null ? 8 : 24,
        top: 12,
        bottom: 12,
      ),
      decoration: BoxDecoration(
        color: AppTheme.textPrimary, // Dark luxury button
        borderRadius: BorderRadius.circular(100),
        boxShadow: [
          BoxShadow(
            color: AppTheme.textPrimary.withOpacity(0.2),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: widget.isFullWidth ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: widget.isFullWidth ? MainAxisAlignment.spaceBetween : MainAxisAlignment.center,
        children: [
          Text(
            widget.text,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          if (widget.icon != null) ...[
            if (!widget.isFullWidth) const SizedBox(width: 16),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                widget.icon,
                color: Colors.white,
                size: 20,
              ),
            ),
          ]
        ],
      ),
    );

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOutCubic,
        child: buttonContent,
      ),
    );
  }
}
