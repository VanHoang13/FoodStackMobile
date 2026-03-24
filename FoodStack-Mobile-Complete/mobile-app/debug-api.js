// Debug API connection from mobile app
const axios = require('axios');

// Import config to get the same IP
const { CONFIG } = require('./config');

const API_BASE_URL = `http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}/api/v1`;

async function debugAPI() {
  console.log('🔍 Debugging API connection...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`📍 Backend IP: ${CONFIG.BACKEND_IP}`);
  console.log(`📍 Backend Port: ${CONFIG.BACKEND_PORT}`);
  
  try {
    // Test 1: Basic health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}/health`, {
      timeout: 5000
    });
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Test menu API
    console.log('\n2. Testing menu API...');
    const menuResponse = await axios.get(`${API_BASE_URL}/branches/branch-1/menu`, {
      timeout: 10000
    });
    
    if (menuResponse.data.success) {
      console.log('✅ Menu API works!');
      console.log(`📋 Categories: ${menuResponse.data.data.categories.length}`);
      menuResponse.data.data.categories.forEach(cat => {
        console.log(`   - ${cat.name}: ${cat.menu_items.length} items`);
      });
    } else {
      console.log('❌ Menu API failed:', menuResponse.data);
    }

    // Test 3: Test with different timeout
    console.log('\n3. Testing with longer timeout...');
    const longTimeoutResponse = await axios.get(`${API_BASE_URL}/branches/branch-1/menu`, {
      timeout: 30000
    });
    console.log('✅ Long timeout test passed');

  } catch (error) {
    console.error('\n❌ API Debug failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused - possible causes:');
      console.error('   - Backend server is not running');
      console.error('   - Wrong IP address');
      console.error('   - Firewall blocking connection');
      console.error('   - Different network (mobile vs computer)');
    }
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection timeout - possible causes:');
      console.error('   - Network is slow');
      console.error('   - Backend is overloaded');
      console.error('   - Mobile and computer on different networks');
    }
  }
}

// Run debug
debugAPI();