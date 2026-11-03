import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../data/repositories/couple_space_repository.dart';
import '../../../../domain/models/couple_space_model.dart';

class HomeViewModel extends ChangeNotifier {
  HomeViewModel({required CoupleSpaceRepository repository}) : _repository = repository {
    _init();
  }

  final CoupleSpaceRepository _repository;
  final String _spaceId = 'default_space_1'; // Hardcoded shared space ID
  
  StreamSubscription<CoupleSpaceModel?>? _subscription;
  CoupleSpaceModel? coupleSpace;

  void _init() {
    _subscription = _repository.streamCoupleSpace(_spaceId).listen((space) {
      coupleSpace = space;
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> updateMyMood(String newMood) async {
    await _repository.updateMood(_spaceId, 'partner1Mood', newMood);
  }
}
