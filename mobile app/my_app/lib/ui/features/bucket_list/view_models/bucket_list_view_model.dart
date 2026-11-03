import 'dart:async';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../../../data/repositories/bucket_list_repository.dart';
import '../../../../domain/models/bucket_list_item_model.dart';

class BucketListViewModel extends ChangeNotifier {
  final BucketListRepository _repository;
  StreamSubscription<List<BucketListItemModel>>? _subscription;
  List<BucketListItemModel> items = [];

  BucketListViewModel({required BucketListRepository repository}) : _repository = repository {
    _init();
  }

  void _init() {
    _subscription = _repository.streamBucketList().listen((newItems) {
      items = newItems;
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> addItem(String title, String description) async {
    if (title.isEmpty) return;
    
    final item = BucketListItemModel(
      id: Uuid().v4(),
      creatorId: 'user1', // For testing
      title: title,
      description: description,
      isCompleted: false,
      createdAt: DateTime.now(),
    );
    await _repository.addItem(item);
  }

  Future<void> completeItem(String itemId, String memoryPhotoUrl) async {
    await _repository.completeItem(itemId, memoryPhotoUrl);
  }
}
