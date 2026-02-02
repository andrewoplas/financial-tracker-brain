#!/usr/bin/env node

import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

// Test MCP server functionality
async function testMCPServer() {
  console.log('🧪 Testing Financial Tracker MCP Server...\n');

  // Test 1: Check if MCP server starts
  console.log('1. Starting MCP server...');
  
  try {
    const mcpProcess = spawn('node', ['src/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd()
    });

    // Send a simple list_tools request
    const listToolsRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    });

    mcpProcess.stdin.write(listToolsRequest + '\n');
    
    // Wait for response
    let response = '';
    mcpProcess.stdout.on('data', (data) => {
      response += data.toString();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    mcpProcess.kill();

    if (response.includes('add_transaction')) {
      console.log('✅ MCP server started successfully and tools are available\n');
    } else {
      console.log('❌ MCP server tools not found\n');
      return;
    }

  } catch (error) {
    console.log('❌ Failed to start MCP server:', error.message, '\n');
    return;
  }

  // Test 2: Check Supabase connection
  console.log('2. Testing Supabase connection...');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.from('wallets').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message, '\n');
      return;
    }

    console.log('✅ Supabase connection successful\n');

  } catch (error) {
    console.log('❌ Supabase test failed:', error.message, '\n');
    return;
  }

  // Test 3: Check if required tables exist
  console.log('3. Checking database schema...');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const tables = ['wallets', 'transactions', 'categories'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table "${table}" not accessible:`, error.message);
        return;
      }
    }

    console.log('✅ All required tables are accessible\n');

  } catch (error) {
    console.log('❌ Schema check failed:', error.message, '\n');
    return;
  }

  console.log('🎉 All tests passed! Your MCP server is ready to use.\n');
  console.log('💡 Next steps:');
  console.log('   1. Run the wallet balance function in Supabase SQL editor');
  console.log('   2. Configure your OpenClaw to use this MCP server');
  console.log('   3. Start adding transactions via Claude!\n');
}

testMCPServer().catch(console.error);