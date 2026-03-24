const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to get current IP address
function getCurrentIP() {
  try {
    // For Windows
    if (process.platform === 'win32') {
      const output = execSync('ipconfig', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.includes('IPv4 Address') && line.includes('192.168.')) {
          const match = line.match(/192\.168\.\d+\.\d+/);
          if (match) {
            return match[0];
          }
        }
      }
    } else {
      // For macOS/Linux
      const output = execSync('ifconfig', { encoding: 'utf8' });
      const match = output.match(/inet (192\.168\.\d+\.\d+)/);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting IP:', error.message);
    return null;
  }
}

// Function to update config.js
function updateConfig(newIP) {
  const configPath = path.join(__dirname, 'config.js');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Replace the IP in BACKEND_IP
    const ipRegex = /BACKEND_IP:\s*['"`](\d+\.\d+\.\d+\.\d+)['"`]/;
    const match = configContent.match(ipRegex);
    
    if (match) {
      const oldIP = match[1];
      configContent = configContent.replace(ipRegex, `BACKEND_IP: '${newIP}'`);
      
      fs.writeFileSync(configPath, configContent, 'utf8');
      
      console.log(`✅ IP updated successfully!`);
      console.log(`   Old IP: ${oldIP}`);
      console.log(`   New IP: ${newIP}`);
      console.log(`   Config file: ${configPath}`);
      
      return true;
    } else {
      console.error('❌ Could not find BACKEND_IP in config.js');
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating config:', error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🔍 Finding current IP address...');
  
  const currentIP = getCurrentIP();
  
  if (!currentIP) {
    console.error('❌ Could not find IP address');
    console.log('💡 Please manually update BACKEND_IP in config.js');
    process.exit(1);
  }
  
  console.log(`📍 Current IP: ${currentIP}`);
  
  const success = updateConfig(currentIP);
  
  if (success) {
    console.log('🚀 You can now restart your mobile app to use the new IP');
  } else {
    process.exit(1);
  }
}

// Run the script
main();