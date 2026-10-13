package com.kamuilan.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.ui.theme.BlueLight
import com.kamuilan.app.ui.theme.BluePrimary
import com.kamuilan.app.ui.theme.SlateBorder
import com.kamuilan.app.ui.theme.SlateDark
import com.kamuilan.app.ui.theme.SuccessGreen
import com.kamuilan.app.ui.theme.SuccessGreenBg
import com.kamuilan.app.ui.theme.UrgentRed
import com.kamuilan.app.ui.theme.UrgentRedBg

@Composable
fun AppBadge(
    text: String,
    backgroundColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    Text(
        text = text,
        color = textColor,
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = modifier
            .background(color = backgroundColor, shape = RoundedCornerShape(6.dp))
            .padding(horizontal = 7.dp, vertical = 3.dp)
    )
}

@Composable
fun UrgentBadge(daysRemaining: Long, modifier: Modifier = Modifier) {
    val text = when {
        daysRemaining <= 0 -> "Bugün Son Gün!"
        daysRemaining == 1L -> "Son 1 Gün Kaldı!"
        else -> "Son $daysRemaining Gün"
    }
    AppBadge(
        text = text,
        backgroundColor = UrgentRedBg,
        textColor = UrgentRed,
        modifier = modifier
    )
}

@Composable
fun KpssBadge(kpssType: String, modifier: Modifier = Modifier) {
    if (kpssType == "Belirtilmemiş") return
    AppBadge(
        text = kpssType,
        backgroundColor = BlueLight,
        textColor = BluePrimary,
        modifier = modifier
    )
}

@Composable
fun EducationBadge(educationLevel: String, modifier: Modifier = Modifier) {
    if (educationLevel == "Belirtilmemiş") return
    AppBadge(
        text = educationLevel,
        backgroundColor = Color(0xFFF3E8FF),
        textColor = Color(0xFF7E22CE),
        modifier = modifier
    )
}

@Composable
fun CityBadge(city: String, modifier: Modifier = Modifier) {
    AppBadge(
        text = city,
        backgroundColor = Color(0xFFF1F5F9),
        textColor = SlateDark,
        modifier = modifier
    )
}
