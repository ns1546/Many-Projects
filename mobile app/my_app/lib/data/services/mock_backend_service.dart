import 'dart:async';
import '../../domain/models/letter_model.dart';

class MockBackendService {
  final List<LetterModel> _letters = [
    LetterModel(
      id: '1',
      senderId: 'partner',
      content: 'I love you more than words can say. This is a vintage letter that takes time to arrive.',
      createdAt: DateTime.now().subtract(const Duration(hours: 48)),
      deliveryTime: DateTime.now().subtract(const Duration(hours: 24)),
      isRead: false,
    ),
    LetterModel(
      id: '2',
      senderId: 'partner',
      content: 'Just thinking about our future together.',
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      deliveryTime: DateTime.now().add(const Duration(hours: 22)),
      isRead: false,
    ),
  ];

  Future<List<LetterModel>> fetchLetters() async {
    await Future.delayed(const Duration(seconds: 1)); // Simulate network latency
    return List.unmodifiable(_letters);
  }

  Future<void> sendLetter(LetterModel letter) async {
    await Future.delayed(const Duration(seconds: 1)); // Simulate network latency
    _letters.add(letter);
  }
}
