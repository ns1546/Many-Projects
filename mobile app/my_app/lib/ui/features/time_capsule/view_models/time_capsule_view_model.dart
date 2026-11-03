import 'package:flutter/foundation.dart';
import '../../../../domain/models/time_capsule_model.dart';
import '../../../../data/repositories/time_capsule_repository.dart';

class TimeCapsuleViewModel extends ChangeNotifier {
  final TimeCapsuleRepository _repository;

  List<TimeCapsuleModel> _capsules = [];
  List<TimeCapsuleModel> get capsules => _capsules;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  TimeCapsuleViewModel({required TimeCapsuleRepository repository}) : _repository = repository {
    _listenToCapsules();
  }

  void _listenToCapsules() {
    _repository.getTimeCapsulesStream().listen((capsuleList) {
      _capsules = capsuleList;
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> createCapsule(String title, String content, DateTime unlockDate) async {
    final capsule = TimeCapsuleModel(
      id: '',
      creatorId: 'me', // TODO: update when Auth is integrated
      title: title,
      content: content,
      unlockDate: unlockDate,
      createdAt: DateTime.now(),
    );
    await _repository.addTimeCapsule(capsule);
  }
}
