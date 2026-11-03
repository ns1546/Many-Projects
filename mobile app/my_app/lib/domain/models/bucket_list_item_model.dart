class BucketListItemModel {
  final String id;
  final String creatorId;
  final String title;
  final String description;
  final bool isCompleted;
  final DateTime createdAt;
  final DateTime? completedAt;
  final String? memoryPhotoUrl; // Photo uploaded when completing the item

  const BucketListItemModel({
    required this.id,
    required this.creatorId,
    required this.title,
    required this.description,
    required this.isCompleted,
    required this.createdAt,
    this.completedAt,
    this.memoryPhotoUrl,
  });

  factory BucketListItemModel.fromJson(Map<String, dynamic> json) {
    return BucketListItemModel(
      id: json['id'] as String,
      creatorId: json['creatorId'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      isCompleted: json['isCompleted'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      memoryPhotoUrl: json['memoryPhotoUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'creatorId': creatorId,
      'title': title,
      'description': description,
      'isCompleted': isCompleted,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'memoryPhotoUrl': memoryPhotoUrl,
    };
  }

  BucketListItemModel copyWith({
    String? id,
    String? creatorId,
    String? title,
    String? description,
    bool? isCompleted,
    DateTime? createdAt,
    DateTime? completedAt,
    String? memoryPhotoUrl,
  }) {
    return BucketListItemModel(
      id: id ?? this.id,
      creatorId: creatorId ?? this.creatorId,
      title: title ?? this.title,
      description: description ?? this.description,
      isCompleted: isCompleted ?? this.isCompleted,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      memoryPhotoUrl: memoryPhotoUrl ?? this.memoryPhotoUrl,
    );
  }
}
