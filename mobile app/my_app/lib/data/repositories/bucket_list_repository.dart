import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/models/bucket_list_item_model.dart';

class BucketListRepository {
  final FirebaseFirestore _firestore;
  final String _collectionPath = 'bucket_list';

  BucketListRepository({FirebaseFirestore? firestore}) : _firestore = firestore ?? FirebaseFirestore.instance;

  Stream<List<BucketListItemModel>> streamBucketList() {
    return _firestore.collection(_collectionPath).orderBy('createdAt', descending: true).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return BucketListItemModel.fromJson({...doc.data(), 'id': doc.id});
      }).toList();
    });
  }

  Future<void> addItem(BucketListItemModel item) async {
    await _firestore.collection(_collectionPath).doc(item.id).set(item.toJson());
  }

  Future<void> updateItem(BucketListItemModel item) async {
    await _firestore.collection(_collectionPath).doc(item.id).update(item.toJson());
  }

  Future<void> completeItem(String itemId, String memoryPhotoUrl) async {
    await _firestore.collection(_collectionPath).doc(itemId).update({
      'isCompleted': true,
      'completedAt': DateTime.now().toIso8601String(),
      'memoryPhotoUrl': memoryPhotoUrl,
    });
  }
}
