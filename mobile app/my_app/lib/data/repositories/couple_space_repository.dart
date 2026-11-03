import '../../domain/models/couple_space_model.dart';
import '../services/firebase_backend_service.dart';

class CoupleSpaceRepository {
  CoupleSpaceRepository({required FirebaseBackendService backendService}) 
      : _backendService = backendService;

  final FirebaseBackendService _backendService;

  Stream<CoupleSpaceModel?> streamCoupleSpace(String spaceId) {
    return _backendService.streamCoupleSpace(spaceId);
  }

  Future<void> updateMood(String spaceId, String partnerKey, String mood) {
    return _backendService.updateMood(spaceId, partnerKey, mood);
  }
}
