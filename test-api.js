#!/usr/bin/env node

// Simple API test script to verify endpoints work
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

const testEndpoints = async () => {
  console.log('🧪 Testing API endpoints...\n');

  // Test cases
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      method: 'GET',
    },
    {
      name: 'Root Endpoint',
      url: `${BASE_URL}/`,
      method: 'GET',
    },
    {
      name: 'API Endpoint',
      url: `${BASE_URL}/api`,
      method: 'GET',
    },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Script/1.0 (similar to Postman)',
        },
      });

      const status = response.status;
      const statusText = response.statusText;

      if (status >= 200 && status < 300) {
        console.log(`✅ ${test.name}: ${status} ${statusText}`);

        // Try to parse response
        try {
          const data = await response.text();
          if (data) {
            const jsonData = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
          }
        } catch {
          const text = await response.text();
          console.log(`   Response: ${text}`);
        }
      } else {
        console.log(`❌ ${test.name}: ${status} ${statusText}`);
        const errorData = await response.text();
        console.log(`   Error: ${errorData}`);
      }

      console.log(''); // Empty line
    } catch (error) {
      console.log(`❌ ${test.name}: Connection failed`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch {
    return false;
  }
};

const main = async () => {
  console.log('🔍 Checking if server is running...');

  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('❌ Server is not running at http://localhost:3000');
    console.log('💡 Please start your server first:');
    console.log('   npm run dev');
    process.exit(1);
  }

  console.log('✅ Server is running\n');
  await testEndpoints();

  console.log('🎉 Tests completed!');
  console.log(
    '\n💡 If all tests pass, your API should work fine with Postman now!'
  );
};

main().catch(console.error);
