// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'couple_space_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CoupleSpaceModel {

 String get id; DateTime get relationshipStartDate; String get partner1Mood; String get partner2Mood;
/// Create a copy of CoupleSpaceModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CoupleSpaceModelCopyWith<CoupleSpaceModel> get copyWith => _$CoupleSpaceModelCopyWithImpl<CoupleSpaceModel>(this as CoupleSpaceModel, _$identity);

  /// Serializes this CoupleSpaceModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as CoupleSpaceModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CoupleSpaceModel&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.relationshipStartDate, _this.relationshipStartDate) || other.relationshipStartDate == _this.relationshipStartDate)&&(identical(other.partner1Mood, _this.partner1Mood) || other.partner1Mood == _this.partner1Mood)&&(identical(other.partner2Mood, _this.partner2Mood) || other.partner2Mood == _this.partner2Mood));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as CoupleSpaceModel;
  return Object.hash(runtimeType,_this.id,_this.relationshipStartDate,_this.partner1Mood,_this.partner2Mood);
}

@override
String toString() {
  final _this = this as CoupleSpaceModel;
  return 'CoupleSpaceModel(id: ${_this.id}, relationshipStartDate: ${_this.relationshipStartDate}, partner1Mood: ${_this.partner1Mood}, partner2Mood: ${_this.partner2Mood})';
}


}

/// @nodoc
abstract mixin class $CoupleSpaceModelCopyWith<$Res>  {
  factory $CoupleSpaceModelCopyWith(CoupleSpaceModel value, $Res Function(CoupleSpaceModel) _then) = _$CoupleSpaceModelCopyWithImpl;
@useResult
$Res call({
 String id, DateTime relationshipStartDate, String partner1Mood, String partner2Mood
});




}
/// @nodoc
class _$CoupleSpaceModelCopyWithImpl<$Res>
    implements $CoupleSpaceModelCopyWith<$Res> {
  _$CoupleSpaceModelCopyWithImpl(this._self, this._then);

  final CoupleSpaceModel _self;
  final $Res Function(CoupleSpaceModel) _then;

/// Create a copy of CoupleSpaceModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? relationshipStartDate = null,Object? partner1Mood = null,Object? partner2Mood = null,}) {
  return _then(CoupleSpaceModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,relationshipStartDate: null == relationshipStartDate ? _self.relationshipStartDate : relationshipStartDate // ignore: cast_nullable_to_non_nullable
as DateTime,partner1Mood: null == partner1Mood ? _self.partner1Mood : partner1Mood // ignore: cast_nullable_to_non_nullable
as String,partner2Mood: null == partner2Mood ? _self.partner2Mood : partner2Mood // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [CoupleSpaceModel].
extension CoupleSpaceModelPatterns on CoupleSpaceModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CoupleSpaceModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CoupleSpaceModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CoupleSpaceModel value)  $default,){
final _that = this;
switch (_that) {
case _CoupleSpaceModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CoupleSpaceModel value)?  $default,){
final _that = this;
switch (_that) {
case _CoupleSpaceModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  DateTime relationshipStartDate,  String partner1Mood,  String partner2Mood)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CoupleSpaceModel() when $default != null:
return $default(_that.id,_that.relationshipStartDate,_that.partner1Mood,_that.partner2Mood);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  DateTime relationshipStartDate,  String partner1Mood,  String partner2Mood)  $default,) {final _that = this;
switch (_that) {
case _CoupleSpaceModel():
return $default(_that.id,_that.relationshipStartDate,_that.partner1Mood,_that.partner2Mood);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  DateTime relationshipStartDate,  String partner1Mood,  String partner2Mood)?  $default,) {final _that = this;
switch (_that) {
case _CoupleSpaceModel() when $default != null:
return $default(_that.id,_that.relationshipStartDate,_that.partner1Mood,_that.partner2Mood);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CoupleSpaceModel implements CoupleSpaceModel {
  const _CoupleSpaceModel({required this.id, required this.relationshipStartDate, required this.partner1Mood, required this.partner2Mood});
  factory _CoupleSpaceModel.fromJson(Map<String, dynamic> json) => _$CoupleSpaceModelFromJson(json);

@override final  String id;
@override final  DateTime relationshipStartDate;
@override final  String partner1Mood;
@override final  String partner2Mood;

/// Create a copy of CoupleSpaceModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CoupleSpaceModelCopyWith<_CoupleSpaceModel> get copyWith => __$CoupleSpaceModelCopyWithImpl<_CoupleSpaceModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CoupleSpaceModelToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _CoupleSpaceModel&&(identical(other.id, id) || other.id == id)&&(identical(other.relationshipStartDate, relationshipStartDate) || other.relationshipStartDate == relationshipStartDate)&&(identical(other.partner1Mood, partner1Mood) || other.partner1Mood == partner1Mood)&&(identical(other.partner2Mood, partner2Mood) || other.partner2Mood == partner2Mood));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,relationshipStartDate,partner1Mood,partner2Mood);
}

@override
String toString() {
    return 'CoupleSpaceModel(id: $id, relationshipStartDate: $relationshipStartDate, partner1Mood: $partner1Mood, partner2Mood: $partner2Mood)';
}


}

/// @nodoc
abstract mixin class _$CoupleSpaceModelCopyWith<$Res> implements $CoupleSpaceModelCopyWith<$Res> {
  factory _$CoupleSpaceModelCopyWith(_CoupleSpaceModel value, $Res Function(_CoupleSpaceModel) _then) = __$CoupleSpaceModelCopyWithImpl;
@override @useResult
$Res call({
 String id, DateTime relationshipStartDate, String partner1Mood, String partner2Mood
});




}
/// @nodoc
class __$CoupleSpaceModelCopyWithImpl<$Res>
    implements _$CoupleSpaceModelCopyWith<$Res> {
  __$CoupleSpaceModelCopyWithImpl(this._self, this._then);

  final _CoupleSpaceModel _self;
  final $Res Function(_CoupleSpaceModel) _then;

/// Create a copy of CoupleSpaceModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? relationshipStartDate = null,Object? partner1Mood = null,Object? partner2Mood = null,}) {
  return _then(_CoupleSpaceModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,relationshipStartDate: null == relationshipStartDate ? _self.relationshipStartDate : relationshipStartDate // ignore: cast_nullable_to_non_nullable
as DateTime,partner1Mood: null == partner1Mood ? _self.partner1Mood : partner1Mood // ignore: cast_nullable_to_non_nullable
as String,partner2Mood: null == partner2Mood ? _self.partner2Mood : partner2Mood // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
