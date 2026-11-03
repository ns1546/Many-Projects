import '../../domain/models/time_capsule_model.dart';
import '../services/firebase_backend_service.dart';

class TimeCapsuleRepository {
  final FirebaseBackendService _backendService;

  TimeCapsuleRepository({required FirebaseBackendService backendService})
      : _backendService = backendService;

  Stream<List<TimeCapsuleModel>> getTimeCapsulesStream() {
    return _backendService.getTimeCapsulesStream();
  }

  Future<void> addTimeCapsule(TimeCapsuleModel capsule) {
    return _backendService.addTimeCapsule(capsule);
  }
}
