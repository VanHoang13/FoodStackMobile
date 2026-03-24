// Script to find local IP address for backend configuration
const os = require('os');

function findLocalIP() {
  console.log('🔍 Finding local IP addresses...\n');
  
  const interfaces = os.networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        results.push({
          name: name,
          address: interface.address,
          type: interface.address.startsWith('192.168.') ? 'WiFi/LAN' : 
                interface.address.startsWith('10.') ? 'Private Network' : 'Other'
        });
      }
    }
  }
  
  if (results.length === 0) {
    console.log('❌ No external IPv4 addresses found');
    console.log('💡 Make sure you are connected to WiFi or LAN');
    return;
  }
  
  console.log('📡 Available IP addresses:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.address} (${result.name}) - ${result.type}`);
  });
  
  const recommendedIP = results.find(r => r.address.startsWith('192.168.')) || results[0];
  
  console.log(`\n✅ Recommended IP: ${recommendedIP.address}`);
  console.log('\n📝 Update your config.js file:');
  console.log(`BACKEND_IP: '${recommendedIP.address}',`);
  
  console.log('\n🔧 Steps to update:');
  console.log('1. Open mobile-app/config.js');
  console.log(`2. Change BACKEND_IP to '${recommendedIP.address}'`);
  console.log('3. Make sure backend is running on this machine');
  console.log('4. Ensure mobile device is on the same network');
  
  return recommendedIP.address;
}

// Run the script
const ip = findLocalIP();

// Also test if backend is running
if (ip) {
  const axios = require('axios');
  
  console.log('\n🧪 Testing backend connection...');
  axios.get(`http://${ip}:3000/health`, { timeout: 3000 })
    .then(response => {
      console.log('✅ Backend is running and accessible!');
    })
    .catch(error => {
      console.log('❌ Backend is not accessible:');
      console.log('   Make sure to run: npm start in the backend folder');
    });
}