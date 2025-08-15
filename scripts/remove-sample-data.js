const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeSampleData() {
  console.log('🗑️  Starting to remove sample data...');

  try {
    // Remove in correct order to respect foreign key constraints
    
    // Remove job applications first
    await prisma.jobApplication.deleteMany({});
    console.log('✅ Removed job applications');

    // Remove payments
    await prisma.payment.deleteMany({});
    console.log('✅ Removed payments');

    // Remove gigs
    await prisma.gig.deleteMany({});
    console.log('✅ Removed gigs');

    // Remove jobs
    await prisma.job.deleteMany({});
    console.log('✅ Removed jobs');

    // Remove users (except keep any existing real users)
    const sampleUsernames = [
      'alexchen_dev',
      'sarahw_nft', 
      'marcus_trader',
      'emily_security',
      'davidkim_dao',
      'techcorp_vc',
      'defiprotocol_labs'
    ];

    for (const username of sampleUsernames) {
      try {
        await prisma.user.delete({
          where: { username }
        });
        console.log(`✅ Removed user: ${username}`);
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`⚠️  User ${username} not found, skipping...`);
        } else {
          console.error(`❌ Error removing user ${username}:`, error.message);
        }
      }
    }

    // Verify removal
    const remainingUsers = await prisma.user.count();
    const remainingGigs = await prisma.gig.count();
    const remainingJobs = await prisma.job.count();
    
    console.log('\n📊 Current database state:');
    console.log(`- Users: ${remainingUsers}`);
    console.log(`- Gigs: ${remainingGigs}`);
    console.log(`- Jobs: ${remainingJobs}`);

    console.log('\n🎉 Sample data removal completed successfully!');

  } catch (error) {
    console.error('❌ Error removing sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  removeSampleData();
}

module.exports = { removeSampleData };