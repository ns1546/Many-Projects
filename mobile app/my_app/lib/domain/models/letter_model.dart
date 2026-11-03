class LetterModel {
  final String id;
  final String senderId;
  final String content;
  final DateTime createdAt;
  final DateTime deliveryTime;
  final bool isRead;

  const LetterModel({
    required this.id,
    required this.senderId,
    required this.content,
    required this.createdAt,
    required this.deliveryTime,
    required this.isRead,
  });

  factory LetterModel.fromJson(Map<String, dynamic> json) {
    return LetterModel(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      deliveryTime: DateTime.parse(json['deliveryTime'] as String),
      isRead: json['isRead'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'deliveryTime': deliveryTime.toIso8601String(),
      'isRead': isRead,
    };
  }
}
