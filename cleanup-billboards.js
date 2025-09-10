const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function cleanupBillboards() {
  try {
    console.log('Starting cleanup...');
    
    // Get all billboards
    const allBillboards = await prisma.billboard.findMany();
    console.log(`Found ${allBillboards.length} billboards`);
    
    // Delete all billboards
    const deleteResult = await prisma.billboard.deleteMany({});
    console.log(`Deleted ${deleteResult.count} billboards`);
    
    // Create one test billboard
    const testBillboard = await prisma.billboard.create({
      data: {
        label: 'Test Billboard',
        imageUrl: 'https://via.placeholder.com/300x200',
        storeId: '75da612b-161b-4112-82ff-28cc32efb6e8', // Your store ID
      }
    });
    
    console.log('Created test billboard:', testBillboard);
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBillboards();
