package com.example.homework1

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button

class SecondActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.second)

        val backPageButton: Button = findViewById(R.id.backPageButton)
        backPageButton.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java))
        }
    }
}

