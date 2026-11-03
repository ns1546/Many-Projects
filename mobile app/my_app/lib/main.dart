import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:my_app/ui/features/home/views/home_view.dart';
import 'package:my_app/ui/features/home/view_models/home_view_model.dart';
import 'package:my_app/ui/features/alerts/views/alerts_view.dart';
import 'package:my_app/ui/features/alerts/view_models/alerts_view_model.dart';
import 'package:my_app/ui/features/letters/views/letters_view.dart';
import 'package:my_app/ui/features/letters/view_models/letters_view_model.dart';
import 'package:my_app/ui/features/time_capsule/views/time_capsule_view.dart';
import 'package:my_app/ui/features/time_capsule/view_models/time_capsule_view_model.dart';
import 'package:my_app/ui/features/bucket_list/views/bucket_list_view.dart';
import 'package:my_app/ui/features/bucket_list/view_models/bucket_list_view_model.dart';
import 'package:my_app/data/services/firebase_backend_service.dart';
import 'package:my_app/data/repositories/letters_repository.dart';
import 'package:my_app/data/repositories/couple_space_repository.dart';
import 'package:my_app/data/repositories/alerts_repository.dart';
import 'package:my_app/data/repositories/time_capsule_repository.dart';
import 'package:my_app/data/repositories/bucket_list_repository.dart';
import 'package:my_app/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Dependency Injection (Step 7)
  final backendService = FirebaseBackendService();
  
  final lettersRepository = LettersRepository(backendService: backendService);
  final lettersViewModel = LettersViewModel(repository: lettersRepository);

  final coupleSpaceRepository = CoupleSpaceRepository(backendService: backendService);
  final homeViewModel = HomeViewModel(repository: coupleSpaceRepository);

  final alertsRepository = AlertsRepository(backendService: backendService);
  final alertsViewModel = AlertsViewModel(repository: alertsRepository);

  final timeCapsuleRepository = TimeCapsuleRepository(backendService: backendService);
  final timeCapsuleViewModel = TimeCapsuleViewModel(repository: timeCapsuleRepository);

  final bucketListRepository = BucketListRepository();
  final bucketListViewModel = BucketListViewModel(repository: bucketListRepository);

  runApp(LoveZoneApp(
    lettersViewModel: lettersViewModel,
    homeViewModel: homeViewModel,
    alertsViewModel: alertsViewModel,
    timeCapsuleViewModel: timeCapsuleViewModel,
    bucketListViewModel: bucketListViewModel,
  ));
}

class LoveZoneApp extends StatelessWidget {
  const LoveZoneApp({
    super.key, 
    required this.lettersViewModel,
    required this.homeViewModel,
    required this.alertsViewModel,
    required this.timeCapsuleViewModel,
    required this.bucketListViewModel,
  });
  
  final LettersViewModel lettersViewModel;
  final HomeViewModel homeViewModel;
  final AlertsViewModel alertsViewModel;
  final TimeCapsuleViewModel timeCapsuleViewModel;
  final BucketListViewModel bucketListViewModel;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Love Zone',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: MainNavigation(
        lettersViewModel: lettersViewModel,
        homeViewModel: homeViewModel,
        alertsViewModel: alertsViewModel,
        timeCapsuleViewModel: timeCapsuleViewModel,
        bucketListViewModel: bucketListViewModel,
      ),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({
    super.key, 
    required this.lettersViewModel,
    required this.homeViewModel,
    required this.alertsViewModel,
    required this.timeCapsuleViewModel,
    required this.bucketListViewModel,
  });

  final LettersViewModel lettersViewModel;
  final HomeViewModel homeViewModel;
  final AlertsViewModel alertsViewModel;
  final TimeCapsuleViewModel timeCapsuleViewModel;
  final BucketListViewModel bucketListViewModel;

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeView(viewModel: widget.homeViewModel),
      AlertsView(viewModel: widget.alertsViewModel),
      LettersView(viewModel: widget.lettersViewModel),
      TimeCapsuleView(viewModel: widget.timeCapsuleViewModel),
      BucketListView(viewModel: widget.bucketListViewModel),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.favorite_border),
            selectedIcon: Icon(Icons.favorite),
            label: 'Love Zone',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_none),
            selectedIcon: Icon(Icons.notifications),
            label: 'Surprises',
          ),
          NavigationDestination(
            icon: Icon(Icons.mail_outline),
            selectedIcon: Icon(Icons.mail),
            label: 'Letters',
          ),
          NavigationDestination(
            icon: Icon(Icons.lock_clock),
            selectedIcon: Icon(Icons.lock_clock),
            label: 'Capsule',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt),
            selectedIcon: Icon(Icons.list_alt),
            label: 'Dreams',
          ),
        ],
      ),
    );
  }
}

