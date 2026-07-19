package com.melifecoaching.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onNewIntent(Intent intent) {
        setIntent(intent); // ✅ critical — lets Capacitor plugins read the new intent's extras
        super.onNewIntent(intent);
    }
}