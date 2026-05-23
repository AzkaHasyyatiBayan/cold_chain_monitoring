```markdown
# Cold Chain Monitoring Dashboard

Dashboard pemantauan **rantai dingin** berbasis IoT untuk memonitor suhu, kelembaban, konsumsi daya listrik, dan status mesin pendingin secara _real-time_. Proyek ini merupakan bagian dari **Tugas Akhir Mata Kuliah Internet of Things**.

## Fitur Monitoring
- **Suhu** & **Kelembaban** dalam ruang penyimpanan dingin
- **Konsumsi daya listrik** (Watt), tegangan (Volt), dan arus (Ampere)
- **Status relay/kompresor** (ON/OFF)
- **Notifikasi bahaya** jika suhu > 8°C atau daya > 300W
- **Log data** 8 transaksi terakhir
- **Visualisasi gudang** dengan tiga zona suhu dan indikator peringatan
- Animasi salju, forklift, dan conveyor yang merespons data nyata

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

---

## Teknologi yang Digunakan
| Komponen | Keterangan |
|----------|------------|
| **Simulasi Mikrokontroler** | ESP32 di [Wokwi](https://wokwi.com) |
| **Sensor Suhu & RH** | DHT22 (simulasi) |
| **Simulasi Daya Listrik** | Potensiometer (ADC) |
| **Protokol Komunikasi** | MQTT via broker publik HiveMQ |
| **Dashboard Frontend** | HTML5, CSS3 (custom properties + animasi), JavaScript (Vanilla) |
| **Library JS** | MQTT.js (WebSocket) |

---