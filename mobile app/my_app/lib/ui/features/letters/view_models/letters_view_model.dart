import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../../domain/models/letter_model.dart';
import '../../../../data/repositories/letters_repository.dart';

class LettersViewModel extends ChangeNotifier {
  LettersViewModel({required LettersRepository repository}) 
      : _repository = repository {
    _startTimer();
    loadLetters();
  }

  final LettersRepository _repository;
  Timer? _timer;

  List<LetterModel> _letters = [];
  List<LetterModel> get letters => _letters;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> loadLetters() async {
    _isLoading = true;
    notifyListeners();

    try {
      _letters = await _repository.getLetters();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendLetter(String content) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await _repository.sendLetter(content);
      _letters = await _repository.getLetters(); // Refresh list
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _startTimer() {
    // Tick every minute to force UI updates for countdown timers
    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
