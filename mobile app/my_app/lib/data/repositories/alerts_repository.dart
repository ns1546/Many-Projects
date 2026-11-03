import '../../domain/models/alert_model.dart';
import '../services/firebase_backend_service.dart';

class AlertsRepository {
  AlertsRepository({required FirebaseBackendService backendService}) 
      : _backendService = backendService;

  final FirebaseBackendService _backendService;

  Stream<List<AlertModel>> streamAlerts() {
    return _backendService.streamAlerts();
  }

  Future<void> sendAlert(AlertModel alert) {
    return _backendService.sendAlert(alert);
  }
}
