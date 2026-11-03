import '../../domain/models/letter_model.dart';
import '../services/firebase_backend_service.dart';

class LettersRepository {
  LettersRepository({required FirebaseBackendService backendService}) 
      : _backendService = backendService;

  final FirebaseBackendService _backendService;
  List<LetterModel> _cachedLetters = [];

  Future<List<LetterModel>> getLetters() async {
    final apiModels = await _backendService.fetchLetters();
    _cachedLetters = apiModels.toList();
    // Sort by delivery time (newest arriving first)
    _cachedLetters.sort((a, b) => b.deliveryTime.compareTo(a.deliveryTime));
    return _cachedLetters;
  }

  Future<void> sendLetter(String content) async {
    final newLetter = LetterModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      senderId: 'me',
      content: content,
      createdAt: DateTime.now(),
      // Letters take 24 hours to deliver in this romantic app
      deliveryTime: DateTime.now().add(const Duration(hours: 24)),
      isRead: false,
    );
    await _backendService.sendLetter(newLetter);
    _cachedLetters.add(newLetter);
    _cachedLetters.sort((a, b) => b.deliveryTime.compareTo(a.deliveryTime));
  }
}
