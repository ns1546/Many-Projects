// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'couple_space_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CoupleSpaceModel _$CoupleSpaceModelFromJson(Map<String, dynamic> json) =>
    _CoupleSpaceModel(
      id: json['id'] as String,
      relationshipStartDate: DateTime.parse(
        json['relationshipStartDate'] as String,
      ),
      partner1Mood: json['partner1Mood'] as String,
      partner2Mood: json['partner2Mood'] as String,
    );

Map<String, dynamic> _$CoupleSpaceModelToJson(_CoupleSpaceModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'relationshipStartDate': instance.relationshipStartDate.toIso8601String(),
      'partner1Mood': instance.partner1Mood,
      'partner2Mood': instance.partner2Mood,
    };
