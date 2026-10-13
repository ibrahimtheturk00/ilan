package com.kamuilan.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Work
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Home : Screen("home", "İlanlar", Icons.Default.Work)
    object Categories : Screen("categories", "Bölümler", Icons.Default.School)
    object Favorites : Screen("favorites", "Favorilerim", Icons.Default.Favorite)
    object Profile : Screen("profile", "Hesabım", Icons.Default.Person)
    object Detail : Screen("detail/{jobId}", "İlan Detayı") {
        fun createRoute(jobId: Long) = "detail/$jobId"
    }
}
