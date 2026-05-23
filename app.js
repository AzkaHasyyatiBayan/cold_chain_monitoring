// MQTT Configuration
const broker = 'wss://broker.hivemq.com:8884/mqtt';
const topic  = 'coldchain/telemetry/dataset_sync';

const client = mqtt.connect(broker);

// ─── State ───
let lastData    = {};
let packetCount = 0;
const LOG_MAX   = 8;
let logRows     = [];

// ─── UI Elements ───
const connBadge      = document.getElementById('connection-status');
const tempValue      = document.getElementById('temp-value');
const humValue       = document.getElementById('hum-value');
const powerValue     = document.getElementById('power-value');
const powerBar       = document.getElementById('power-bar');
const voltValue      = document.getElementById('volt-value');
const currValue      = document.getElementById('curr-value');
const relayStatus    = document.getElementById('relay-status');
const fan            = document.querySelector('.fan');
const alertBanner    = document.getElementById('alert-banner');
const thermoFill     = document.getElementById('thermo-fill');
const warehouseItems = document.querySelectorAll('.item');

const tempGaugeArc   = document.getElementById('temp-gauge-arc');
const tempStateBadge = document.getElementById('temp-state-badge');
const tempCard       = document.getElementById('temp-card');
const humBar         = document.getElementById('hum-bar');
const voltBar        = document.getElementById('volt-bar');
const currBar        = document.getElementById('curr-bar');
const relayTrack     = document.getElementById('relay-track');
const waveLine       = document.getElementById('wave-line');
const logTbody       = document.getElementById('log-tbody');
const dataCountEl    = document.getElementById('data-count');
const warehouseBadge = document.getElementById('warehouse-status-badge');
const clockEl        = document.getElementById('live-clock');

// ─── Live Clock ───
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

// ─── MQTT Events ───
client.on('connect', () => {
  connBadge.querySelector('.status-text').textContent = 'Terhubung';
  connBadge.className = 'status-badge connected';
  client.subscribe(topic, err => {
    if (!err) console.log('Subscribed to', topic);
  });
});

client.on('close', () => {
  connBadge.querySelector('.status-text').textContent = 'Terputus';
  connBadge.className = 'status-badge disconnected';
});

client.on('message', (topicName, message) => {
  try {
    const data = JSON.parse(message.toString());
    updateDashboard(data);
  } catch (e) {
    console.error('Invalid JSON', e);
  }
});

// ─── Core Dashboard Update ───
function updateDashboard(data) {
  lastData = data;
  packetCount++;
  if (dataCountEl) dataCountEl.textContent = `${packetCount} paket diterima`;

  // Suhu
  const temp = parseFloat(data.T1).toFixed(1);
  tempValue.textContent = temp;

  let tempPercent = ((parseFloat(temp) + 10) / 50) * 100;
  tempPercent = Math.min(100, Math.max(0, tempPercent));
  thermoFill.style.width = tempPercent + '%';

  if (tempGaugeArc) {
    const offset = 172 - (tempPercent / 100) * 172;
    tempGaugeArc.style.strokeDashoffset = offset;
  }

  const tempNum = parseFloat(temp);
  if (tempNum > 20) {
    tempCard.className = 'card temp-card hot';
    if (tempStateBadge) { tempStateBadge.textContent = 'PANAS'; tempStateBadge.className = 'card-badge danger'; }
  } else if (tempNum < 0) {
    tempCard.className = 'card temp-card cold';
    if (tempStateBadge) { tempStateBadge.textContent = 'BEKU'; tempStateBadge.className = 'card-badge'; }
  } else {
    tempCard.className = 'card temp-card';
    if (tempStateBadge) { tempStateBadge.textContent = 'NORMAL'; tempStateBadge.className = 'card-badge'; }
  }

  // Kelembaban
  const hum = parseFloat(data.RH_1).toFixed(1);
  humValue.textContent = hum;

  if (humBar) {
    humBar.style.width = Math.min(100, Math.max(0, parseFloat(hum))) + '%';
  }

  const droplets = document.querySelectorAll('.droplet');
  const activeCount = Math.round((parseFloat(hum) / 100) * droplets.length);
  droplets.forEach((d, i) => d.classList.toggle('active', i < activeCount));

  // Daya
  const power = parseFloat(data.Appliances).toFixed(0);
  powerValue.textContent = power;

  let powerPercent = (parseFloat(power) / 500) * 100;
  powerPercent = Math.min(100, Math.max(0, powerPercent));
  powerBar.style.width = powerPercent + '%';
  updateWaveform(parseFloat(power));

  // Tegangan & Arus
  const volt = parseFloat(data.voltage).toFixed(1);
  const curr = parseFloat(data.current).toFixed(2);
  voltValue.textContent = volt + ' V';
  currValue.textContent = curr + ' A';
  if (voltBar) voltBar.style.width = Math.min(100, (parseFloat(volt) / 250) * 100) + '%';
  if (currBar) currBar.style.width = Math.min(100, (parseFloat(curr) / 10) * 100) + '%';

  // Relay
  const relayOn = data.relay === 'ON';
  relayStatus.textContent = data.relay;
  relayStatus.className = 'relay-status' + (relayOn ? ' on' : '');
  if (relayTrack) relayTrack.classList.toggle('on', relayOn);
  if (relayOn) fan.classList.add('spinning');
  else fan.classList.remove('spinning');

  // Alert
  const alertActive = data.alert === true || data.alert === 'true';
  alertBanner.classList.toggle('active', alertActive);

  warehouseItems.forEach(item => {
    item.classList.toggle('warning', alertActive);
    item.classList.toggle('shake', alertActive);
  });

  if (warehouseBadge) {
    if (alertActive) {
      warehouseBadge.textContent = 'PERINGATAN';
      warehouseBadge.style.cssText = 'background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.4);color:#f87171';
    } else {
      warehouseBadge.textContent = 'OPERASIONAL';
      warehouseBadge.style.cssText = '';
    }
  }

  addLogRow(data, temp, hum, power, alertActive);
}

// ─── Waveform ───
const waveHistory = new Array(11).fill(20);

function updateWaveform(power) {
  if (!waveLine) return;
  const amplitude = (power / 500) * 35;
  const yVal = 20 - amplitude / 2 + (Math.random() * amplitude);
  waveHistory.push(Math.max(3, Math.min(37, yVal)));
  if (waveHistory.length > 11) waveHistory.shift();
  waveLine.setAttribute('points', waveHistory.map((y, i) => `${i * 20},${y.toFixed(1)}`).join(' '));
}

// ─── Log Table ───
function addLogRow(data, temp, hum, power, alertActive) {
  if (!logTbody) return;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  let statusClass = 'ok', statusText = 'Normal';
  if (alertActive) { statusClass = 'critical'; statusText = 'Kritis'; }
  else if (parseFloat(temp) > 8 || parseFloat(hum) > 85) { statusClass = 'warn'; statusText = 'Perhatian'; }

  const tr = document.createElement('tr');
  tr.className = 'new-row';
  tr.innerHTML = `<td>${timeStr}</td><td>${temp}</td><td>${hum}</td><td>${power}</td><td>${data.relay}</td><td><span class="log-badge ${statusClass}">${statusText}</span></td>`;
  logRows.unshift(tr);

  const placeholder = logTbody.querySelector('td[colspan]');
  if (placeholder) logTbody.innerHTML = '';
  logTbody.insertBefore(tr, logTbody.firstChild);

  if (logRows.length > LOG_MAX) {
    const old = logRows.pop();
    if (old.parentNode) old.parentNode.removeChild(old);
  }
  setTimeout(() => tr.classList.remove('new-row'), 1100);
}