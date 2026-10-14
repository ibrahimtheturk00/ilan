package com.kamuilan.app.ui.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.ui.screens.categories.CategoriesScreen
import com.kamuilan.app.ui.screens.detail.JobDetailScreen
import com.kamuilan.app.ui.screens.favorites.FavoritesScreen
import com.kamuilan.app.ui.screens.home.HomeScreen
import com.kamuilan.app.ui.screens.home.HomeViewModel
import com.kamuilan.app.ui.screens.onboarding.OnboardingScreen
import com.kamuilan.app.ui.screens.personalized.PersonalizedScreen
import com.kamuilan.app.ui.screens.profile.ProfileScreen
import com.kamuilan.app.ui.screens.profile.ProfileViewModel
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400

@Composable
fun AppNavigation(
    initialJobId: Long? = null,
    currentThemeMode: String = "system",
    onThemeModeChange: (String) -> Unit = {},
    homeViewModel: HomeViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel()
) {
    val context = LocalContext.current
    val preferencesManager = remember { PreferencesManager(context) }
    val userProfile by preferencesManager.userProfileFlow.collectAsState(initial = null)

    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Bildirime tıklanıp açıldıysa doğrudan ilanın detayına git
    LaunchedEffect(initialJobId) {
        if (initialJobId != null && initialJobId > 0) {
            navController.navigate(Screen.Detail.createRoute(initialJobId))
        }
    }

    val bottomNavItems = listOf(
        Screen.Home,
        Screen.Personalized,
        Screen.Categories,
        Screen.Favorites,
        Screen.Profile
    )

    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    // ── Scroll-to-Hide Navigation Mantığı ─────────────────────────────────────
    val homeListState = rememberLazyListState()
    var isBottomBarVisible by remember { mutableStateOf(true) }
    var previousIndex by remember { mutableIntStateOf(0) }
    var previousScrollOffset by remember { mutableIntStateOf(0) }

    val isScrollingDown by remember {
        derivedStateOf {
            val currentIndex = homeListState.firstVisibleItemIndex
            val currentOffset = homeListState.firstVisibleItemScrollOffset
            val isDown = when {
                currentIndex > previousIndex -> true
                currentIndex < previousIndex -> false
                else -> currentOffset > previousScrollOffset + 5
            }
            previousIndex = currentIndex
            previousScrollOffset = currentOffset
            isDown
        }
    }

    LaunchedEffect(isScrollingDown) {
        if (currentRoute == Screen.Home.route) {
            isBottomBarVisible = !isScrollingDown
        } else {
            isBottomBarVisible = true
        }
    }

    Scaffold(
        bottomBar = {
            AnimatedVisibility(
                visible = showBottomBar && isBottomBarVisible,
                enter = slideInVertically(initialOffsetY = { it }),
                exit = slideOutVertically(targetOffsetY = { it })
            ) {
                // Modern Glassmorphic Bottom Navigation
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.verticalGradient(
                                listOf(Color.Transparent, MaterialTheme.colorScheme.surface)
                            )
                        )
                ) {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.surface,
                        tonalElevation = 0.dp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                            .clip(RoundedCornerShape(26.dp))
                            .border(
                                width = 1.dp,
                                color = MaterialTheme.colorScheme.outline,
                                shape = RoundedCornerShape(26.dp)
                            )
                    ) {
                        bottomNavItems.forEach { screen ->
                            val isSelected = currentRoute == screen.route

                            val iconScale by animateFloatAsState(
                                targetValue = if (isSelected) 1.12f else 1f,
                                animationSpec = spring(dampingRatio = 0.55f, stiffness = 400f),
                                label = "nav_icon_scale_"
                            )

                            NavigationBarItem(
                                icon = {
                                    screen.icon?.let { icon ->
                                        Box(contentAlignment = Alignment.Center) {
                                            if (isSelected) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(36.dp)
                                                        .clip(RoundedCornerShape(10.dp))
                                                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                                                )
                                            }
                                            Icon(
                                                imageVector = icon,
                                                contentDescription = screen.title,
                                                modifier = Modifier
                                                    .size(20.dp)
                                                    .graphicsLayer {
                                                        scaleX = iconScale
                                                        scaleY = iconScale
                                                    }
                                            )
                                        }
                                    }
                                },
                                label = {
                                    Text(
                                        text = screen.title,
                                        fontSize = 10.sp,
                                        maxLines = 1
                                    )
                                },
                                selected = isSelected,
                                onClick = {
                                    if (currentRoute != screen.route) {
                                        navController.navigate(screen.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = Color.Transparent,
                                    unselectedIconColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                    unselectedTextColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                            )
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = homeViewModel,
                    listState = homeListState,
                    currentThemeMode = currentThemeMode,
                    onToggleTheme = {
                        val nextMode = when (currentThemeMode) {
                            "light" -> "dark"
                            "dark" -> "system"
                            else -> "light"
                        }
                        onThemeModeChange(nextMode)
                    },
                    onJobClick = { jobId ->
                        navController.navigate(Screen.Detail.createRoute(jobId))
                    }
                )
            }

            composable(Screen.Personalized.route) {
                PersonalizedScreen(
                    homeViewModel = homeViewModel,
                    onJobClick = { jobId ->
                        navController.navigate(Screen.Detail.createRoute(jobId))
                    },
                    onEditPreferences = {
                        navController.navigate(Screen.Onboarding.route)
                    }
                )
            }

            composable(Screen.Categories.route) {
                CategoriesScreen(
                    homeViewModel = homeViewModel,
                    onCategoryClick = { categorySlug ->
                        homeViewModel.onCategorySelected(categorySlug)
                        navController.navigate(Screen.Home.route) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                        }
                    }
                )
            }

            composable(Screen.Favorites.route) {
                FavoritesScreen(
                    homeViewModel = homeViewModel,
                    onJobClick = { jobId ->
                        navController.navigate(Screen.Detail.createRoute(jobId))
                    },
                    onExploreClick = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                        }
                    }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    viewModel = profileViewModel,
                    currentThemeMode = currentThemeMode,
                    onThemeModeChange = onThemeModeChange,
                    onEditPreferences = {
                        navController.navigate(Screen.Onboarding.route)
                    }
                )
            }

            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onComplete = {
                        navController.navigate(Screen.Personalized.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(
                route = Screen.Detail.route,
                arguments = listOf(navArgument("jobId") { type = NavType.LongType })
            ) { backStackEntry ->
                val jobId = backStackEntry.arguments?.getLong("jobId") ?: 0L
                JobDetailScreen(
                    jobId = jobId,
                    homeViewModel = homeViewModel,
                    onBackClick = { navController.popBackStack() }
                )
            }
        }
    }
}
