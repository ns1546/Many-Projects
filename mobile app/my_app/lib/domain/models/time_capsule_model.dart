import 'package:cloud_firestore/cloud_firestore.dart';

class TimeCapsuleModel {
  final String id;
  final String creatorId;
  final String title;
  final String content;
  final String? photoUrl;
  final DateTime unlockDate;
  final DateTime createdAt;

  TimeCapsuleModel({
    required this.id,
    required this.creatorId,
    required this.title,
    required this.content,
    this.photoUrl,
    required this.unlockDate,
    required this.createdAt,
  });

  factory TimeCapsuleModel.fromMap(Map<String, dynamic> data, String id) {
    return TimeCapsuleModel(
      id: id,
      creatorId: data['creatorId'] ?? '',
      title: data['title'] ?? '',
      content: data['content'] ?? '',
      photoUrl: data['photoUrl'],
      unlockDate: (data['unlockDate'] as Timestamp).toDate(),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'creatorId': creatorId,
      'title': title,
      'content': content,
      'photoUrl': photoUrl,
      'unlockDate': Timestamp.fromDate(unlockDate),
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
