// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'letter_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_LetterModel _$LetterModelFromJson(Map<String, dynamic> json) => _LetterModel(
  id: json['id'] as String,
  senderId: json['senderId'] as String,
  content: json['content'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  deliveryTime: DateTime.parse(json['deliveryTime'] as String),
  isRead: json['isRead'] as bool,
);

Map<String, dynamic> _$LetterModelToJson(_LetterModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'senderId': instance.senderId,
      'content': instance.content,
      'createdAt': instance.createdAt.toIso8601String(),
      'deliveryTime': instance.deliveryTime.toIso8601String(),
      'isRead': instance.isRead,
    };
