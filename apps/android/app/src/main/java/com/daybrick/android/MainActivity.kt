package com.daybrick.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.daybrick.android.ui.theme.DaybrickTheme

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalComposeUiApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DaybrickTheme {
                // testTagsAsResourceId: testTag를 adb 화면 구조(uiautomator)의 resource-id로 보이게 한다 (AI 화면 확인용).
                Scaffold(modifier = Modifier.fillMaxSize().semantics { testTagsAsResourceId = true }) { innerPadding ->
                    CheckScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

// 개발 환경 확인용 임시 화면. 집중 모드 기능을 만들 때 바꾼다.
@Composable
fun CheckScreen(modifier: Modifier = Modifier) {
    var count by rememberSaveable { mutableIntStateOf(0) }
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Daybrick", style = MaterialTheme.typography.headlineMedium)
        Text("누른 횟수: $count", modifier = Modifier.testTag("count_text"))
        Button(onClick = { count++ }, modifier = Modifier.testTag("count_button")) {
            Text("눌러 보기")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CheckScreenPreview() {
    DaybrickTheme { CheckScreen() }
}
