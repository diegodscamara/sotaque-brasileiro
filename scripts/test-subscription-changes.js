/**
 * Test script to verify subscription change handling
 * 
 * This script simulates different subscription scenarios:
 * 1. New subscription
 * 2. Subscription renewal
 * 3. Upgrade to a higher tier
 * 4. Downgrade to a lower tier
 * 
 * Usage: node scripts/test-subscription-changes.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock student data
const mockStudentData = {
  userId: 'test-user-id',
  customerId: 'cus_test123',
  priceId: 'price_enthusiast_monthly',
  hasAccess: true,
  hasCompletedOnboarding: true,
  credits: 12, // Starting with Enthusiast monthly credits
  packageName: 'Enthusiast',
  packageExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  learningGoals: ['Speaking', 'Listening'],
  otherLanguages: ['English'],
  subscriptionInfo: JSON.stringify({
    currentSubscriptionId: 'sub_test123',
    planInterval: 'monthly',
    planUnits: 12,
    lastUpdated: new Date().toISOString()
  })
};

// Mock plan data
const mockPlans = {
  enthusiast: {
    monthly: { priceId: 'price_enthusiast_monthly', units: 12 },
    yearly: { priceId: 'price_enthusiast_yearly', units: 144 }
  },
  master: {
    monthly: { priceId: 'price_master_monthly', units: 24 },
    yearly: { priceId: 'price_master_yearly', units: 288 }
  }
};

/**
 * Simulate a new subscription
 */
async function testNewSubscription() {
  console.log('\n=== Testing New Subscription ===');
  
  try {
    // Create a new student record
    const student = await prisma.student.upsert({
      where: { userId: mockStudentData.userId },
      update: mockStudentData,
      create: mockStudentData
    });
    
    console.log('Created student record:', {
      id: student.id,
      credits: student.credits,
      packageName: student.packageName
    });
    
    return student;
  } catch (error) {
    console.error('Error creating student record:', error);
    throw error;
  }
}

/**
 * Simulate a subscription renewal
 */
async function testRenewal(student) {
  console.log('\n=== Testing Subscription Renewal ===');
  
  try {
    // Parse existing subscription info
    const subscriptionInfo = JSON.parse(student.subscriptionInfo || '{}');
    
    // Update the student record to simulate a renewal
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        credits: student.credits + mockPlans.enthusiast.monthly.units,
        packageExpiration: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        subscriptionInfo: JSON.stringify({
          ...subscriptionInfo,
          renewalHistory: [
            ...(subscriptionInfo.renewalHistory || []),
            {
              date: new Date().toISOString(),
              priceId: mockPlans.enthusiast.monthly.priceId,
              creditsAdded: mockPlans.enthusiast.monthly.units,
              totalCreditsAfterRenewal: student.credits + mockPlans.enthusiast.monthly.units
            }
          ],
          lastRenewal: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      }
    });
    
    console.log('Updated student record after renewal:', {
      id: updatedStudent.id,
      credits: updatedStudent.credits,
      packageName: updatedStudent.packageName
    });
    
    return updatedStudent;
  } catch (error) {
    console.error('Error simulating renewal:', error);
    throw error;
  }
}

/**
 * Simulate an upgrade to a higher tier
 */
async function testUpgrade(student) {
  console.log('\n=== Testing Upgrade to Higher Tier ===');
  
  try {
    // Parse existing subscription info
    const subscriptionInfo = JSON.parse(student.subscriptionInfo || '{}');
    
    // Update the student record to simulate an upgrade
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        priceId: mockPlans.master.monthly.priceId,
        credits: student.credits + mockPlans.master.monthly.units,
        packageName: 'Master',
        packageExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subscriptionInfo: JSON.stringify({
          ...subscriptionInfo,
          isUpgradeOrDowngrade: true,
          previousSubscriptionId: subscriptionInfo.currentSubscriptionId,
          currentSubscriptionId: 'sub_upgrade123',
          planInterval: 'monthly',
          planUnits: mockPlans.master.monthly.units,
          planChangeHistory: [
            ...(subscriptionInfo.planChangeHistory || []),
            {
              date: new Date().toISOString(),
              fromPriceId: student.priceId,
              toPriceId: mockPlans.master.monthly.priceId,
              creditsAdded: mockPlans.master.monthly.units,
              totalCreditsAfterChange: student.credits + mockPlans.master.monthly.units
            }
          ],
          lastUpdated: new Date().toISOString()
        })
      }
    });
    
    console.log('Updated student record after upgrade:', {
      id: updatedStudent.id,
      credits: updatedStudent.credits,
      packageName: updatedStudent.packageName
    });
    
    return updatedStudent;
  } catch (error) {
    console.error('Error simulating upgrade:', error);
    throw error;
  }
}

/**
 * Simulate a downgrade to a lower tier
 */
async function testDowngrade(student) {
  console.log('\n=== Testing Downgrade to Lower Tier ===');
  
  try {
    // Parse existing subscription info
    const subscriptionInfo = JSON.parse(student.subscriptionInfo || '{}');
    
    // Update the student record to simulate a downgrade
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        priceId: mockPlans.enthusiast.monthly.priceId,
        credits: student.credits + mockPlans.enthusiast.monthly.units,
        packageName: 'Enthusiast',
        packageExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subscriptionInfo: JSON.stringify({
          ...subscriptionInfo,
          isUpgradeOrDowngrade: true,
          previousSubscriptionId: subscriptionInfo.currentSubscriptionId,
          currentSubscriptionId: 'sub_downgrade123',
          planInterval: 'monthly',
          planUnits: mockPlans.enthusiast.monthly.units,
          planChangeHistory: [
            ...(subscriptionInfo.planChangeHistory || []),
            {
              date: new Date().toISOString(),
              fromPriceId: student.priceId,
              toPriceId: mockPlans.enthusiast.monthly.priceId,
              creditsAdded: mockPlans.enthusiast.monthly.units,
              totalCreditsAfterChange: student.credits + mockPlans.enthusiast.monthly.units
            }
          ],
          lastUpdated: new Date().toISOString()
        })
      }
    });
    
    console.log('Updated student record after downgrade:', {
      id: updatedStudent.id,
      credits: updatedStudent.credits,
      packageName: updatedStudent.packageName
    });
    
    return updatedStudent;
  } catch (error) {
    console.error('Error simulating downgrade:', error);
    throw error;
  }
}

/**
 * Clean up test data
 */
async function cleanUp(student) {
  console.log('\n=== Cleaning Up Test Data ===');
  
  try {
    await prisma.student.delete({
      where: { id: student.id }
    });
    
    console.log('Deleted test student record');
  } catch (error) {
    console.error('Error cleaning up:', error);
  }
}

/**
 * Run the test scenarios
 */
async function runTests() {
  try {
    // Create a new student with a subscription
    const student = await testNewSubscription();
    
    // Simulate a renewal
    const renewedStudent = await testRenewal(student);
    
    // Simulate an upgrade
    const upgradedStudent = await testUpgrade(renewedStudent);
    
    // Simulate a downgrade
    const downgradedStudent = await testDowngrade(upgradedStudent);
    
    // Print final state
    console.log('\n=== Final Student State ===');
    console.log('Credits:', downgradedStudent.credits);
    console.log('Package:', downgradedStudent.packageName);
    console.log('Subscription Info:', JSON.parse(downgradedStudent.subscriptionInfo || '{}'));
    
    // Clean up test data
    await cleanUp(downgradedStudent);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests(); 