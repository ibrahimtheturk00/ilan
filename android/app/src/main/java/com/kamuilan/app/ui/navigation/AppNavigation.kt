package com.kamuilan.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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
import com.kamuilan.app.ui.screens.categories.CategoriesScreen
import com.kamuilan.app.ui.screens.detail.JobDetailScreen
import com.kamuilan.app.ui.screens.favorites.FavoritesScreen
import com.kamuilan.app.ui.screens.home.HomeScreen
import com.kamuilan.app.ui.screens.home.HomeViewModel
import com.kamuilan.app.ui.screens.profile.ProfileScreen
import com.kamuilan.app.ui.screens.profile.ProfileViewModel
import com.kamuilan.app.ui.theme.BlueLight
import com.kamuilan.app.ui.theme.BluePrimary
import com.kamuilan.app.ui.theme.SlateBorder
import com.kamuilan.app.ui.theme.SlateDark
import com.kamuilan.app.ui.theme.SlateMuted

@Composable
fun AppNavigation(
    homeViewModel: HomeViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        Screen.Home,
        Screen.Categories,
        Screen.Favorites,
        Screen.Profile
    )

    // Detay ekranındayken alt menüyü gizle
    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp
                ) {
                    bottomNavItems.forEach { screen ->
                        val isSelected = currentRoute == screen.route
                        NavigationBarItem(
                            icon = {
                                screen.icon?.let { icon ->
                                    Icon(imageVector = icon, contentDescription = screen.title)
                                }
                            },
                            label = { Text(screen.title, fontSize = 11.sp) },
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
                                selectedIconColor = BluePrimary,
                                selectedTextColor = BluePrimary,
                                indicatorColor = BlueLight,
                                unselectedIconColor = SlateMuted,
                                unselectedTextColor = SlateMuted
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
