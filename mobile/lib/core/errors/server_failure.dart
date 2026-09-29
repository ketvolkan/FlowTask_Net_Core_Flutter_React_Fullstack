import 'failure.dart';

class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.statusCode});
}
