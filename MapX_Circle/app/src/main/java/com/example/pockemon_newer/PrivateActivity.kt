package com.example.pockemon_newer

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import com.android.volley.Request
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import com.example.pockemon_newer.databinding.ActivityPrivateBinding
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class PrivateActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPrivateBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_private)
        binding = ActivityPrivateBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.submit.setOnClickListener {
            val privateKeyTekl = binding.privatekey.text.toString()
            val latitude= binding.lat.text.toString()
            val longtitude= binding.longtitude.text.toString()
            val intent = Intent(this, MapsActivity::class.java)
            intent.putExtra("KEY", privateKeyTekl)
            intent.putExtra("LAT",latitude)
            intent.putExtra("LONG",longtitude)
            startActivity(intent)
        }
        binding.CircleWLT.setOnClickListener {
            val queue= Volley.newRequestQueue( baseContext)
            GlobalScope.launch  {
                val stringRequest = StringRequest(
                    Request.Method.GET,
                    "https://circle-api-bc3x.onrender.com/encrypt-and-send",
                    { response ->
                        try {
                            Toast.makeText(
                                baseContext,
                                "Public Address" + response,
                                Toast.LENGTH_LONG
                            ).show()
                            binding.privatekey.setText(response.toString())
                        } catch (exception: Exception) {
                            exception.printStackTrace()
                        }
                    },
                    { error ->
                        Toast.makeText(
                            baseContext,
                            error.message,
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                )
                queue.add(stringRequest)
            }
        }
    }
}