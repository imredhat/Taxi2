// اسکریپت آزادسازی پورت‌های 3000 و 3001 + کشندهٔ پردازش‌های node قبلی این پروژه
// روی ویندوز از taskkill و netstat استفاده می‌کنه
const { execSync } = require('child_process');

const PORTS = [3000, 3001, 3002];

function sh(cmd) {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); }
  catch { return ''; }
}

// ۱) پیدا کردن PIDهای نگه‌دارندهٔ پورت‌ها و کشتن اون‌ها
for (const port of PORTS) {
  const out = sh(`powershell.exe -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`);
  out.split(/\s+/).filter(Boolean).forEach(pid => {
    const n = Number(pid);
    if (!n) return;
    process.stdout.write(`killing PID ${n} on port ${port}... `);
    sh(`taskkill /F /PID ${n}`);
    process.stdout.write('done\n');
  });
}

// ۲) کشتن هر پردازش node که مسیر پروژهٔ ما توی command lineش هست
//    (برای جلوگیری از چندبار اجرا)
const wmic = sh('wmic process where "name=\'node.exe\'" get ProcessId,CommandLine /format:list');
const here = __dirname.toLowerCase().replace(/scripts$/, '');
const pidsToKill = new Set();
for (const line of wmic.split(/\r?\n/)) {
  if (line.toLowerCase().includes(here) && line.toLowerCase().includes('taxi2')) {
    // این خط commandline هست؛ PID رو از همین یا خط بعدی می‌گیریم
  }
}
// روش ساده‌تر: همهٔ nodeهای درگیر با taxi2 رو بکش
sh('powershell.exe -Command "Get-WmiObject Win32_Process -Filter \\"name=\'node.exe\'\\" | Where-Object { $_.CommandLine -like \'*Taxi2*\' } | ForEach-Object { Write-Output $_.ProcessId }"')
  .split(/\s+/).filter(Boolean).forEach(pid => {
    const n = Number(pid);
    if (n && !pidsToKill.has(n)) {
      pidsToKill.add(n);
      process.stdout.write(`killing stale node PID ${n} (Taxi2)... `);
      sh(`taskkill /F /PID ${n}`);
      process.stdout.write('done\n');
    }
  });

console.log('ports 3000/3001/3002 cleared. starting dev...');
