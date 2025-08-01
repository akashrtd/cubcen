// Simple test to verify analytics functionality
const { analyticsService } = require('./dist/services/analytics.js');

async function testAnalytics() {
  try {
    console.log('Testing analytics service...');
    
    // Test export functionality
    const testData = [
      { name: 'Agent 1', tasks: 10, success: 90 },
      { name: 'Agent 2', tasks: 5, success: 80 }
    ];
    
    const csvResult = await analyticsService.exportData(testData, 'csv');
    console.log('CSV Export:', csvResult);
    
    const jsonResult = await analyticsService.exportData(testData, 'json');
    console.log('JSON Export:', jsonResult);
    
    console.log('Analytics service test completed successfully!');
  } catch (error) {
    console.error('Analytics test failed:', error);
  }
}

testAnalytics();