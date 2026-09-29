import 'package:get_it/get_it.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_storage_service.dart';
import 'data/datasources/auth_remote_data_source.dart';
import 'data/datasources/project_remote_data_source.dart';
import 'data/datasources/issue_remote_data_source.dart';
import 'data/datasources/sprint_remote_data_source.dart';
import 'data/datasources/comment_remote_data_source.dart';
import 'data/datasources/notification_remote_data_source.dart';
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/project_repository_impl.dart';
import 'data/repositories/issue_repository_impl.dart';
import 'data/repositories/sprint_repository_impl.dart';
import 'data/repositories/comment_repository_impl.dart';
import 'data/repositories/notification_repository_impl.dart';
import 'domain/repositories/i_auth_repository.dart';
import 'domain/repositories/i_project_repository.dart';
import 'domain/repositories/i_issue_repository.dart';
import 'domain/repositories/i_sprint_repository.dart';
import 'domain/repositories/i_comment_repository.dart';
import 'domain/repositories/i_notification_repository.dart';
import 'domain/usecases/login_usecase.dart';
import 'domain/usecases/register_usecase.dart';
import 'domain/usecases/get_current_user_usecase.dart';
import 'domain/usecases/logout_usecase.dart';
import 'domain/usecases/delete_account_usecase.dart';
import 'domain/usecases/get_projects_usecase.dart';
import 'domain/usecases/create_project_usecase.dart';
import 'domain/usecases/get_issues_by_project_usecase.dart';
import 'domain/usecases/create_issue_usecase.dart';
import 'domain/usecases/update_issue_status_usecase.dart';
import 'domain/usecases/get_sprints_usecase.dart';
import 'domain/usecases/create_sprint_usecase.dart';
import 'domain/usecases/get_comments_usecase.dart';
import 'domain/usecases/add_comment_usecase.dart';
import 'domain/usecases/get_notifications_usecase.dart';
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/project/project_bloc.dart';
import 'presentation/blocs/issue/issue_bloc.dart';
import 'presentation/blocs/sprint/sprint_bloc.dart';
import 'presentation/blocs/language/language_cubit.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Core Services
  sl.registerLazySingleton<SecureStorageService>(() => SecureStorageService());
  sl.registerLazySingleton<ApiClient>(() => ApiClient(storageService: sl()));

  // Data Sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSource(client: sl()),
  );
  sl.registerLazySingleton<ProjectRemoteDataSource>(
    () => ProjectRemoteDataSource(client: sl()),
  );
  sl.registerLazySingleton<IssueRemoteDataSource>(
    () => IssueRemoteDataSource(client: sl()),
  );
  sl.registerLazySingleton<SprintRemoteDataSource>(
    () => SprintRemoteDataSource(client: sl()),
  );
  sl.registerLazySingleton<CommentRemoteDataSource>(
    () => CommentRemoteDataSource(client: sl()),
  );
  sl.registerLazySingleton<NotificationRemoteDataSource>(
    () => NotificationRemoteDataSource(client: sl()),
  );

  // Repositories
  sl.registerLazySingleton<IAuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      storageService: sl(),
    ),
  );
  sl.registerLazySingleton<IProjectRepository>(
    () => ProjectRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerLazySingleton<IIssueRepository>(
    () => IssueRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerLazySingleton<ISprintRepository>(
    () => SprintRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerLazySingleton<ICommentRepository>(
    () => CommentRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerLazySingleton<INotificationRepository>(
    () => NotificationRepositoryImpl(remoteDataSource: sl()),
  );

  // Use Cases
  sl.registerLazySingleton(() => LoginUseCase(repository: sl()));
  sl.registerLazySingleton(() => RegisterUseCase(repository: sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(repository: sl()));
  sl.registerLazySingleton(() => LogoutUseCase(repository: sl()));
  sl.registerLazySingleton(() => DeleteAccountUseCase(repository: sl()));
  sl.registerLazySingleton(() => GetProjectsUseCase(repository: sl()));
  sl.registerLazySingleton(() => CreateProjectUseCase(repository: sl()));
  sl.registerLazySingleton(() => GetIssuesByProjectUseCase(repository: sl()));
  sl.registerLazySingleton(() => CreateIssueUseCase(repository: sl()));
  sl.registerLazySingleton(() => UpdateIssueStatusUseCase(repository: sl()));
  sl.registerLazySingleton(() => GetSprintsUseCase(repository: sl()));
  sl.registerLazySingleton(() => CreateSprintUseCase(repository: sl()));
  sl.registerLazySingleton(() => GetCommentsUseCase(repository: sl()));
  sl.registerLazySingleton(() => AddCommentUseCase(repository: sl()));
  sl.registerLazySingleton(() => GetNotificationsUseCase(repository: sl()));

  // BLoCs & Cubits
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      registerUseCase: sl(),
      getCurrentUserUseCase: sl(),
      logoutUseCase: sl(),
      deleteAccountUseCase: sl(),
      authRepository: sl(),
    ),
  );
  sl.registerFactory(
    () => ProjectBloc(
      getProjectsUseCase: sl(),
      createProjectUseCase: sl(),
    ),
  );
  sl.registerFactory(
    () => IssueBloc(
      getIssuesByProjectUseCase: sl(),
      createIssueUseCase: sl(),
      updateIssueStatusUseCase: sl(),
    ),
  );
  sl.registerFactory(
    () => SprintBloc(
      getSprintsUseCase: sl(),
      createSprintUseCase: sl(),
    ),
  );
  sl.registerLazySingleton(
    () => LanguageCubit(storageService: sl()),
  );
}
