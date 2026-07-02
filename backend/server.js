import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import fs from 'fs';
import readline from 'readline';

let PORT = 8080;
let DATA_FILE = '../data/spoofing_gear_dataset.csv';
let wss = new WebSocketServer({ port: PORT });

console.log(`[EdgeGuard Backend] WebSocket server started on ws://localhost:${PORT}`);

let events = [];
let eventBuffer = [];
let rollingTotalTraffic = 0;
let baselineTrafficHistory = [200, 220, 180, 210, 230];

let alertHistory = [];

let ipMap = {
  "0000": "192.168.1.100",
  "0130": "192.168.1.130",
  "0131": "192.168.1.130",
  "0140": "192.168.1.140",
  "018f": "192.168.1.189",
  "02a0": "192.168.1.220",
  "0350": "192.168.1.150",
  "0370": "192.168.1.150",
  "043f": "192.168.1.99",
  "04b1": "192.168.1.80"
};

let targets = [
  "10.0.0.5",
  "10.0.0.12",
  "10.0.0.8",
  "10.0.0.22"
];

async function loadDataset() {
  try {
    let fileStream = fs.createReadStream(DATA_FILE);
    let rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (let line of rl) {
      if (!line.trim()) continue;
      let parts = line.split(',');
      if (parts.length < 12) continue;

      events.push({
        timestamp: parseFloat(parts[0]),
        canId: parts[1],
        dlc: parseInt(parts[2]),
        data: parts.slice(3, 11),
        flag: parts[11].trim()
      });
    }
    console.log(`[EdgeGuard Backend] Loaded ${events.length} packet captures.`);
    startReplay();
    startRulesEngine();
  } catch (err) {
    console.error(`[EdgeGuard Backend] Error: ${err.message}`);
  }
}

let currentIndex = 0;

function startReplay() {
  let scheduleNext = () => {
    if (events.length === 0) return;

    let isGap = Math.random() < 0.05;
    let nextInterval = isGap ? Math.floor(Math.random() * 2000) + 1000 : Math.floor(Math.random() * 80) + 10;

    if (!isGap) {
      let isBurst = Math.random() < 0.1;
      let batchSize = isBurst ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < batchSize; i++) {
        let packet = events[currentIndex];
        
        let driftMs = (Math.random() * 4000) - 2000;
        let eventTime = new Date(Date.now() + driftMs);
        let timeStr = eventTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

        eventBuffer.push({
          timestamp: timeStr,
          srcIP: ipMap[packet.canId] || `192.168.1.${parseInt(packet.canId, 16) % 254 + 1}`,
          dstIP: targets[parseInt(packet.canId, 16) % targets.length],
          protocol: packet.dlc > 6 ? 'HTTP' : 'TCP',
          eventType: packet.flag === 'T' ? (packet.canId === '0000' ? 'DoS' : 'Spoofing') : 'PACKET',
          bytes: packet.dlc * 128 + Math.floor(Math.random() * 32),
          status: packet.flag === 'T' ? 'FAIL' : 'SUCCESS',
          flag: packet.flag
        });

        currentIndex = (currentIndex + 1) % events.length;
      }
    }

    setTimeout(scheduleNext, nextInterval);
  };

  scheduleNext();
}

function startRulesEngine() {
  setInterval(() => {
    let rawEvents = [...eventBuffer];
    eventBuffer = [];

    let now = new Date();
    let timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let isoTime = now.toISOString();

    let trafficCount = rawEvents.length;
    rollingTotalTraffic += trafficCount;

    let avgBaseline = baselineTrafficHistory.reduce((a,b) => a+b, 0) / baselineTrafficHistory.length;
    baselineTrafficHistory.push(trafficCount);
    if (baselineTrafficHistory.length > 10) baselineTrafficHistory.shift();

    let summary = { dos: 0, bruteForce: 0, suspicious: 0 };
    let threatsByIP = {};

    rawEvents.forEach(e => {
      if (e.flag === 'T') {
        if (e.eventType === 'DoS') {
          summary.dos++;
        } else if (e.eventType === 'Spoofing') {
          summary.bruteForce++;
        } else {
          summary.suspicious++;
        }
        threatsByIP[e.srcIP] = (threatsByIP[e.srcIP] || 0) + 1;
      }
    });

    if (trafficCount > avgBaseline * 2 && trafficCount > 100) {
      summary.suspicious++;
    }

    let activeAlerts = [];
    Object.entries(threatsByIP).forEach(([ip, count]) => {
      let type = "Anomaly";
      
      let forceMismatch = Math.random() < 0.05;
      let severity = "MEDIUM";
      
      if (ip.includes('192.168.1.100')) {
        type = "DoS";
        severity = forceMismatch ? "MEDIUM" : "CRITICAL";
      } else if (ip.includes('192.168.1.130')) {
        type = "Spoofing";
        severity = forceMismatch ? "MEDIUM" : "HIGH";
      }

      let isMissingId = Math.random() < 0.1;
      let idVal = isMissingId ? "" : crypto.randomUUID();

      activeAlerts.push({
        id: idVal,
        type,
        srcIP: ip,
        dstIP: targets[Math.floor(Math.random() * targets.length)],
        severity,
        message: `${type} from ${ip}`,
        count,
        timestamp: timeStr
      });
    });

    if (activeAlerts.length > 0) {
      alertHistory = [...activeAlerts, ...alertHistory].slice(0, 35);
    }

    let attackRate = activeAlerts.length * 20 + Math.floor(Math.random() * 5);
    let systemHealth = Math.max(0, 100 - (summary.dos * 35 + summary.bruteForce * 20 + summary.suspicious * 10));

    let last25RawEvents = rawEvents.slice(-25).map(e => ({
      timestamp: e.timestamp,
      srcIP: e.srcIP,
      dstIP: e.dstIP,
      protocol: e.protocol,
      bytes: e.bytes,
      status: e.status
    }));

    let payload = JSON.stringify({
      timestamp: isoTime,
      totalTraffic: rollingTotalTraffic,
      activeThreats: activeAlerts.length,
      attackRate,
      systemHealth,
      summary,
      alerts: alertHistory,
      rawEvents: last25RawEvents
    });

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });

  }, 3000);
}

loadDataset();

wss.on('connection', ws => {
  console.log('[EdgeGuard Backend] Connection established.');
  ws.send(JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTraffic: rollingTotalTraffic,
    activeThreats: 0,
    attackRate: 0,
    systemHealth: 100,
    summary: { dos: 0, bruteForce: 0, suspicious: 0 },
    alerts: alertHistory,
    rawEvents: []
  }));
});
