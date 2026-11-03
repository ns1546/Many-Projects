import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PremiumCard extends StatelessWidget {
  const PremiumCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(24.0),
    this.outerColor,
    this.innerColor,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? outerColor;
  final Color? innerColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    Widget core = Container(
      padding: const EdgeInsets.all(6), // Outer shell padding
      decoration: BoxDecoration(
        color: outerColor ?? AppTheme.cardOuter,
        borderRadius: BorderRadius.circular(32), // Outer squircle
      ),
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          color: innerColor ?? AppTheme.cardInner,
          borderRadius: BorderRadius.circular(26), // Inner core radius = 32 - 6
          boxShadow: [
            // Inner highlight for glass effect
            BoxShadow(
              color: Colors.white.withOpacity(0.8),
              offset: const Offset(0, 1),
              blurRadius: 1,
              spreadRadius: 0,
            ),
            // Soft ambient drop shadow
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              offset: const Offset(0, 8),
              blurRadius: 24,
              spreadRadius: 0,
            ),
          ],
        ),
        child: child,
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: core,
      );
    }
    return core;
  }
}
