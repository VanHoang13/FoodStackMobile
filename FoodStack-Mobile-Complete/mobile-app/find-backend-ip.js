/**
 * Script tự động tìm IP backend đúng
 * Chạy script này khi gặp lỗi AbortError
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testConnection(ip, port = 3000) {
  return new Promise((resolve) => {
    const testUrl = `http://${ip}:${port}/api/v1/auth/login`;
    const testData = JSON.stringify({
      email: 'owner@foodstack.test',
      password: 'password123'
    });

    const command = process.platform === 'win32' 
      ? `powershell -Command "try { Invoke-RestMethod -Uri '${testUrl}' -Method POST -Headers @{'Content-Type'='application/json'} -Body '${testData}' -TimeoutSec 5 | Out-Null; Write-Output 'SUCCESS' } catch { Write-Output 'FAILED' }"`
      : `curl -s -m 5 -X POST -H "Content-Type: application/json" -d '${testData}' ${testUrl} > /dev/null 2>&1 && echo "SUCCESS" || echo "FAILED"`;

    exec(command, (error, stdout) => {
      const success = stdout.includes('SUCCESS');
      resolve(success);
    });
  });
}

async function findWorkingIP() {
  console.log('🔍 Tìm kiếm IP backend...');
  
  // Lấy danh sách IP từ hệ thống
  const getIPCommand = process.platform === 'win32'
    ? 'ipconfig | findstr "IPv4"'
    : 'ifconfig | grep "inet " | grep -v 127.0.0.1';

  return new Promise((resolve) => {
    exec(getIPCommand, async (error, stdout) => {
      if (error) {
        console.error('❌ Không thể lấy danh sách IP:', error);
        resolve(null);
        return;
      }

      // Extract IPs từ output
      const ipRegex = /(\d+\.\d+\.\d+\.\d+)/g;
      const ips = stdout.match(ipRegex) || [];
      
      // Filter ra localhost và IPs không hợp lệ
      const validIPs = ips.filter(ip => 
        !ip.startsWith('127.') && 
        !ip.startsWith('169.254.') &&
        ip !== '0.0.0.0'
      );

      console.log('📋 Danh sách IP tìm thấy:', validIPs);

      // Test từng IP
      for (const ip of validIPs) {
        console.log(`🧪 Testing ${ip}:3000...`);
        const works = await testConnection(ip);
        
        if (works) {
          console.log(`✅ Backend hoạt động tại: ${ip}:3000`);
          resolve(ip);
          return;
        } else {
          console.log(`❌ ${ip}:3000 không hoạt động`);
        }
      }

      console.log('💥 Không tìm thấy IP backend nào hoạt động');
      resolve(null);
    });
  });
}

async function updateConfig(newIP) {
  const configPath = path.join(__dirname, 'config.js');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update IP trong config
    const ipRegex = /BACKEND_IP:\s*['"`]([^'"`]+)['"`]/;
    const newConfigContent = configContent.replace(
      ipRegex, 
      `BACKEND_IP: '${newIP}'`
    );

    fs.writeFileSync(configPath, newConfigContent, 'utf8');
    console.log(`✅ Đã cập nhật config.js với IP: ${newIP}`);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật config:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Bắt đầu tìm kiếm backend IP...\n');
  
  const workingIP = await findWorkingIP();
  
  if (workingIP) {
    console.log(`\n🎉 Tìm thấy backend tại: ${workingIP}:3000`);
    
    const updated = await updateConfig(workingIP);
    
    if (updated) {
      console.log('\n✅ Hoàn thành! Hãy restart mobile app và thử login lại.');
      console.log('\n📱 Các bước tiếp theo:');
      console.log('1. Force close mobile app');
      console.log('2. Mở lại app');
      console.log('3. Thử đăng nhập lại');
    }
  } else {
    console.log('\n💥 Không tìm thấy backend hoạt động!');
    console.log('\n🔧 Hãy kiểm tra:');
    console.log('1. Backend có đang chạy không? (npm run dev)');
    console.log('2. Port 3000 có bị block không?');
    console.log('3. Firewall có cho phép kết nối không?');
    console.log('4. Mobile và PC có cùng mạng WiFi không?');
  }
}

// Chạy script
main().catch(console.error);