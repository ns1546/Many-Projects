import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/models/letter_model.dart';
import '../../domain/models/alert_model.dart';
import '../../domain/models/couple_space_model.dart';
import '../../domain/models/time_capsule_model.dart';

class FirebaseBackendService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<List<LetterModel>> fetchLetters() async {
    final snapshot = await _firestore.collection('letters').get();
    return snapshot.docs.map((doc) {
      final data = doc.data();
      return LetterModel(
        id: doc.id,
        senderId: data['senderId'] as String? ?? '',
        content: data['content'] as String? ?? '',
        createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
        deliveryTime: (data['deliveryTime'] as Timestamp?)?.toDate() ?? DateTime.now(),
        isRead: data['isRead'] as bool? ?? false,
      );
    }).toList();
  }

  Future<void> sendLetter(LetterModel letter) async {
    await _firestore.collection('letters').doc(letter.id).set({
      'senderId': letter.senderId,
      'content': letter.content,
      'createdAt': Timestamp.fromDate(letter.createdAt),
      'deliveryTime': Timestamp.fromDate(letter.deliveryTime),
      'isRead': letter.isRead,
    });
  }

  // --- Real-time Alerts ---
  Stream<List<AlertModel>> streamAlerts() {
    return _firestore.collection('alerts').orderBy('sentAt', descending: true).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        return AlertModel(
          id: doc.id,
          senderId: data['senderId'] as String? ?? '',
          type: data['type'] as String? ?? '',
          sentAt: (data['sentAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
        );
      }).toList();
    });
  }

  Future<void> sendAlert(AlertModel alert) async {
    await _firestore.collection('alerts').doc(alert.id).set({
      'senderId': alert.senderId,
      'type': alert.type,
      'sentAt': Timestamp.fromDate(alert.sentAt),
    });
  }

  // --- Real-time Couple Space (Love Zone) ---
  Stream<CoupleSpaceModel?> streamCoupleSpace(String spaceId) {
    return _firestore.collection('couple_spaces').doc(spaceId).snapshots().map((doc) {
      if (!doc.exists) return null;
      final data = doc.data()!;
      return CoupleSpaceModel(
        id: doc.id,
        relationshipStartDate: (data['relationshipStartDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
        partner1Mood: data['partner1Mood'] as String? ?? 'Happy',
        partner2Mood: data['partner2Mood'] as String? ?? 'Happy',
      );
    });
  }
  
  Future<void> updateMood(String spaceId, String partnerKey, String mood) async {
    await _firestore.collection('couple_spaces').doc(spaceId).set({
      partnerKey: mood,
    }, SetOptions(merge: true));
  }

  // --- Time Capsules ---
  Stream<List<TimeCapsuleModel>> getTimeCapsulesStream() {
    return _firestore
        .collection('time_capsules')
        .orderBy('unlockDate', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => TimeCapsuleModel.fromMap(doc.data(), doc.id))
            .toList());
  }

  Future<void> addTimeCapsule(TimeCapsuleModel capsule) async {
    final docRef = _firestore.collection('time_capsules').doc();
    await docRef.set(capsule.toMap());
  }
}
