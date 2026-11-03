class AlertModel {
  final String id;
  final String senderId;
  final String type;
  final DateTime sentAt;

  const AlertModel({
    required this.id,
    required this.senderId,
    required this.type,
    required this.sentAt,
  });

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      type: json['type'] as String,
      sentAt: DateTime.parse(json['sentAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'type': type,
      'sentAt': sentAt.toIso8601String(),
    };
  }
}
