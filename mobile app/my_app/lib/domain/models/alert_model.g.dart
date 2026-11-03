// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'alert_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AlertModel _$AlertModelFromJson(Map<String, dynamic> json) => _AlertModel(
  id: json['id'] as String,
  senderId: json['senderId'] as String,
  type: json['type'] as String,
  sentAt: DateTime.parse(json['sentAt'] as String),
);

Map<String, dynamic> _$AlertModelToJson(_AlertModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'senderId': instance.senderId,
      'type': instance.type,
      'sentAt': instance.sentAt.toIso8601String(),
    };
