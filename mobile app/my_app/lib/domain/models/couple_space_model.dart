class CoupleSpaceModel {
  final String id;
  final DateTime relationshipStartDate;
  final String partner1Mood;
  final String partner2Mood;

  const CoupleSpaceModel({
    required this.id,
    required this.relationshipStartDate,
    required this.partner1Mood,
    required this.partner2Mood,
  });

  factory CoupleSpaceModel.fromJson(Map<String, dynamic> json) {
    return CoupleSpaceModel(
      id: json['id'] as String,
      relationshipStartDate: DateTime.parse(json['relationshipStartDate'] as String),
      partner1Mood: json['partner1Mood'] as String? ?? '',
      partner2Mood: json['partner2Mood'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'relationshipStartDate': relationshipStartDate.toIso8601String(),
      'partner1Mood': partner1Mood,
      'partner2Mood': partner2Mood,
    };
  }
}
