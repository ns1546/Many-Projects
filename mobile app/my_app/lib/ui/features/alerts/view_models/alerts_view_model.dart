import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../data/repositories/alerts_repository.dart';
import '../../../../domain/models/alert_model.dart';
import 'package:uuid/uuid.dart';

class AlertsViewModel extends ChangeNotifier {
  AlertsViewModel({required AlertsRepository repository}) : _repository = repository {
    _init();
  }

  final AlertsRepository _repository;
  StreamSubscription<List<AlertModel>>? _subscription;
  List<AlertModel> alerts = [];

  void _init() {
    _subscription = _repository.streamAlerts().listen((newAlerts) {
      alerts = newAlerts;
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> sendSurpriseAlert(String type) async {
    final alert = AlertModel(
      id: Uuid().v4(),
      senderId: 'user1', // For testing
      type: type, // e.g., 'Miss You', 'Thinking of You'
      sentAt: DateTime.now(),
    );
    await _repository.sendAlert(alert);
  }
}
