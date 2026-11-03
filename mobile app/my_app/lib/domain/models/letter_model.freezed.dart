// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'letter_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$LetterModel {

 String get id; String get senderId; String get content; DateTime get createdAt; DateTime get deliveryTime; bool get isRead;
/// Create a copy of LetterModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LetterModelCopyWith<LetterModel> get copyWith => _$LetterModelCopyWithImpl<LetterModel>(this as LetterModel, _$identity);

  /// Serializes this LetterModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as LetterModel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LetterModel&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.senderId, _this.senderId) || other.senderId == _this.senderId)&&(identical(other.content, _this.content) || other.content == _this.content)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt)&&(identical(other.deliveryTime, _this.deliveryTime) || other.deliveryTime == _this.deliveryTime)&&(identical(other.isRead, _this.isRead) || other.isRead == _this.isRead));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as LetterModel;
  return Object.hash(runtimeType,_this.id,_this.senderId,_this.content,_this.createdAt,_this.deliveryTime,_this.isRead);
}

@override
String toString() {
  final _this = this as LetterModel;
  return 'LetterModel(id: ${_this.id}, senderId: ${_this.senderId}, content: ${_this.content}, createdAt: ${_this.createdAt}, deliveryTime: ${_this.deliveryTime}, isRead: ${_this.isRead})';
}


}

/// @nodoc
abstract mixin class $LetterModelCopyWith<$Res>  {
  factory $LetterModelCopyWith(LetterModel value, $Res Function(LetterModel) _then) = _$LetterModelCopyWithImpl;
@useResult
$Res call({
 String id, String senderId, String content, DateTime createdAt, DateTime deliveryTime, bool isRead
});




}
/// @nodoc
class _$LetterModelCopyWithImpl<$Res>
    implements $LetterModelCopyWith<$Res> {
  _$LetterModelCopyWithImpl(this._self, this._then);

  final LetterModel _self;
  final $Res Function(LetterModel) _then;

/// Create a copy of LetterModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? senderId = null,Object? content = null,Object? createdAt = null,Object? deliveryTime = null,Object? isRead = null,}) {
  return _then(LetterModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,senderId: null == senderId ? _self.senderId : senderId // ignore: cast_nullable_to_non_nullable
as String,content: null == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,deliveryTime: null == deliveryTime ? _self.deliveryTime : deliveryTime // ignore: cast_nullable_to_non_nullable
as DateTime,isRead: null == isRead ? _self.isRead : isRead // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [LetterModel].
extension LetterModelPatterns on LetterModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LetterModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LetterModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LetterModel value)  $default,){
final _that = this;
switch (_that) {
case _LetterModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LetterModel value)?  $default,){
final _that = this;
switch (_that) {
case _LetterModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String senderId,  String content,  DateTime createdAt,  DateTime deliveryTime,  bool isRead)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LetterModel() when $default != null:
return $default(_that.id,_that.senderId,_that.content,_that.createdAt,_that.deliveryTime,_that.isRead);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String senderId,  String content,  DateTime createdAt,  DateTime deliveryTime,  bool isRead)  $default,) {final _that = this;
switch (_that) {
case _LetterModel():
return $default(_that.id,_that.senderId,_that.content,_that.createdAt,_that.deliveryTime,_that.isRead);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String senderId,  String content,  DateTime createdAt,  DateTime deliveryTime,  bool isRead)?  $default,) {final _that = this;
switch (_that) {
case _LetterModel() when $default != null:
return $default(_that.id,_that.senderId,_that.content,_that.createdAt,_that.deliveryTime,_that.isRead);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LetterModel implements LetterModel {
  const _LetterModel({required this.id, required this.senderId, required this.content, required this.createdAt, required this.deliveryTime, required this.isRead});
  factory _LetterModel.fromJson(Map<String, dynamic> json) => _$LetterModelFromJson(json);

@override final  String id;
@override final  String senderId;
@override final  String content;
@override final  DateTime createdAt;
@override final  DateTime deliveryTime;
@override final  bool isRead;

/// Create a copy of LetterModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LetterModelCopyWith<_LetterModel> get copyWith => __$LetterModelCopyWithImpl<_LetterModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LetterModelToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _LetterModel&&(identical(other.id, id) || other.id == id)&&(identical(other.senderId, senderId) || other.senderId == senderId)&&(identical(other.content, content) || other.content == content)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.deliveryTime, deliveryTime) || other.deliveryTime == deliveryTime)&&(identical(other.isRead, isRead) || other.isRead == isRead));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,senderId,content,createdAt,deliveryTime,isRead);
}

@override
String toString() {
    return 'LetterModel(id: $id, senderId: $senderId, content: $content, createdAt: $createdAt, deliveryTime: $deliveryTime, isRead: $isRead)';
}


}

/// @nodoc
abstract mixin class _$LetterModelCopyWith<$Res> implements $LetterModelCopyWith<$Res> {
  factory _$LetterModelCopyWith(_LetterModel value, $Res Function(_LetterModel) _then) = __$LetterModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String senderId, String content, DateTime createdAt, DateTime deliveryTime, bool isRead
});




}
/// @nodoc
class __$LetterModelCopyWithImpl<$Res>
    implements _$LetterModelCopyWith<$Res> {
  __$LetterModelCopyWithImpl(this._self, this._then);

  final _LetterModel _self;
  final $Res Function(_LetterModel) _then;

/// Create a copy of LetterModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? senderId = null,Object? content = null,Object? createdAt = null,Object? deliveryTime = null,Object? isRead = null,}) {
  return _then(_LetterModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,senderId: null == senderId ? _self.senderId : senderId // ignore: cast_nullable_to_non_nullable
as String,content: null == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,deliveryTime: null == deliveryTime ? _self.deliveryTime : deliveryTime // ignore: cast_nullable_to_non_nullable
as DateTime,isRead: null == isRead ? _self.isRead : isRead // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
