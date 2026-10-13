package com.kamuilan.app.ui.navigation

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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
import com.kamuilan.app.ui.theme.BrandSubtle
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate500

@Composable
fun AppNavigation(
    homeViewModel: HomeViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel()
) {
    val context = LocalContext.current
    val preferencesManager = remember { PreferencesManager(context) }
    val userProfile by preferencesManager.userProfileFlow.collectAsState(initial = null)

    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        Screen.Home,
        Screen.Personalized,
        Screen.Categories,
        Screen.Favorites,
        Screen.Profile
    )

    // Alt menüyü sadece ana sekmelerde göster (Onboarding ve Detay ekranlarında gizle)
    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                    tonalElevation = 8.dp,
                    modifier = Modifier.border(
                        width = 1.dp,
                        color = Slate200.copy(alpha = 0.6f)
                    )
                ) {
                    bottomNavItems.forEach { screen ->
                        val isSelected = currentRoute == screen.route
                        NavigationBarItem(
                            icon = {
                                screen.icon?.let { icon ->
                                    Icon(
                                        imageVector = icon,
                                        contentDescription = screen.title,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            },
                            label = { Text(screen.title, fontSize = 10.sp, maxLines = 1) },
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
                                selectedIconColor = BrandPrimary,
                                selectedTextColor = BrandPrimary,
                                indicatorColor = BrandSubtle,
                                unselectedIconColor = Slate500,
                                unselectedTextColor = Slate500
                            )
                        )
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
                    onCategoryClick = { keyword ->
                        homeViewModel.onSearchQueryChanged(keyword)
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
                ProfileScreen(viewModel = profileViewModel)
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
