# Cold Chain Monitoring Dashboard

Dashboard pemantauan **rantai dingin** berbasis IoT untuk memonitor suhu, kelembaban, konsumsi daya listrik, dan status mesin pendingin secara _real‑time_.  
Proyek ini merupakan bagian dari **Tugas Akhir Mata Kuliah Internet of Things**.

## Fitur Monitoring
| Kategori | Detail |
|----------|--------|
| Suhu & Kelembaban | Menampilkan nilai **T1 (°C)** dan **RH_1 (%)** dari sensor DHT22 |
| ⚡ Konsumsi Daya | Memonitor **Watt**, **Volt**, dan **Arus** yang disimulasikan oleh potensiometer |
| Status Kompresor | ON / OFF berdasarkan suhu > 4°C, ditampilkan dengan toggle visual dan animasi kipas |
| Notifikasi Bahaya | Banner merah berkedip jika suhu > 8°C **atau** daya > 300 W, disertai log "Kritis" |
| Log Riwayat | 8 data terakhir dalam tabel (waktu, suhu, kelembaban, daya, relay, status) |
| Visualisasi Gudang | SVG interaktif dengan 3 zona suhu, forklift berjalan, conveyor belt, dan getaran barang saat alert |

---

## Arsitektur Sistem
```
┌──────────────────────┐      MQTT Broker       ┌──────────────────────┐
│   Wokwi (ESP32)      │ ──────────────────────> │   Dashboard Web      │
│                      │   coldchain/telemetry   │   (HTML+CSS+JS)      │
│ • DHT22 (suhu, RH)   │                        │                      │
│ • Potensiometer (daya)│                       │ • Tampilan real-time │
│ • Relay (status)     │                        │ • Grafik & animasi   │
│ • LED & Buzzer       │                        │ • Log & alert banner │
└──────────────────────┘                        └──────────────────────┘
```

- **ESP32** membaca sensor setiap 3 detik, lalu mengirim data JSON melalui MQTT ke broker publik HiveMQ.
- **Dashboard** (web) terhubung ke broker via WebSocket dan menampilkan data secara langsung tanpa perlu refresh.

---

## Teknologi yang Digunakan
| Komponen | Keterangan |
|----------|------------|
| **Simulasi Mikrokontroler** | ESP32 di [Wokwi](https://wokwi.com) |
| **Sensor Suhu & RH** | DHT22 (simulasi) |
| **Simulasi Daya Listrik** | Potensiometer (ADC) |
| **Aktuator Lokal** | Relay, LED, Buzzer |
| **Protokol Komunikasi** | MQTT via broker publik HiveMQ (`broker.hivemq.com`) |
| **Dashboard Frontend** | HTML5, CSS3 (custom properties + animasi), JavaScript (Vanilla) |
| **Library JS** | [MQTT.js](https://github.com/mqttjs/MQTT.js) (WebSocket) |

---