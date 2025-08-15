const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Starting to seed sample data...');

  try {
    // Get existing categories
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.log('❌ No categories found. Please run the main seed script first.');
      return;
    }

    console.log(`Found ${categories.length} categories`);

    // Create sample users
    const sampleUsers = [
      {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Alex Chen',
        username: 'alexchen_dev',
        bio: 'Full-stack Web3 developer with 5+ years experience in DeFi protocols. Specialized in Solana smart contracts and React frontends.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'FREELANCER',
        isVerified: true,
        categories: ['Smart Contract Development', 'DeFi Development', 'Solana Development'],
        rating: 4.8,
        totalEarned: 15000,
      },
      {
        walletAddress: '7RyVxqVScKqT2kzz8YWvCpXJ9cXz2NfQyf3YzGhQsXM5',
        name: 'Sarah Williams',
        username: 'sarahw_nft',
        bio: 'NFT artist and marketplace developer. Created successful collections with 10K+ holders. Expert in generative art and Web3 UX.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'FREELANCER',
        isVerified: true,
        categories: ['NFT Development', 'Web3 Frontend', 'Web3 UI/UX Design'],
        rating: 4.9,
        totalEarned: 22000,
      },
      {
        walletAddress: '4KzZ8YbQrR7vLp2Mhv6Z3xJnXwY8sQfR6TzRxQfY2Wy3',
        name: 'Marcus Johnson',
        username: 'marcus_trader',
        bio: 'Quantitative trader and DeFi protocol architect. Built automated trading systems handling $10M+ in volume.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'FREELANCER',
        isVerified: true,
        categories: ['Crypto Trading Bots', 'DeFi Development', 'Crypto Analysis'],
        rating: 4.7,
        totalEarned: 35000,
      },
      {
        walletAddress: '6PqRzVxDhT2nZ9sWjY8uKp7GxRfQ3MzY5NrBvCwX4Lt8',
        name: 'Emily Davis',
        username: 'emily_security',
        bio: 'Smart contract auditor with experience in finding critical vulnerabilities. Audited 200+ contracts worth $500M+ TVL.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'FREELANCER',
        isVerified: true,
        categories: ['Web3 Security', 'Smart Contract Development'],
        rating: 4.95,
        totalEarned: 45000,
      },
      {
        walletAddress: '8ZxR2nVw9PtMqL4Y7bGfK3sE5QrT6WzN8CmJ9UvX2Hf4',
        name: 'David Kim',
        username: 'davidkim_dao',
        bio: 'DAO consultant and governance expert. Helped launch 15+ successful DAOs with combined treasury of $50M+.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'FREELANCER',
        isVerified: true,
        categories: ['DAO Development', 'Tokenomics', 'Web3 Marketing'],
        rating: 4.6,
        totalEarned: 28000,
      },
      // Hirers
      {
        walletAddress: '3MnR8YfQ9sTpLx5Wv2Kj6GzE4NbT7UwM9CvB5XrY8Ht2',
        name: 'TechCorp Ventures',
        username: 'techcorp_vc',
        bio: 'Leading Web3 venture capital firm investing in the next generation of decentralized applications.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'HIRER',
        isVerified: true,
        categories: [],
        rating: 4.8,
        totalSpent: 125000,
      },
      {
        walletAddress: '5QwE3RtY8uPzX2NvB6MjG7KsL4CfQ9WrT5HxD2YfN8Zm',
        name: 'DefiProtocol Labs',
        username: 'defiprotocol_labs',
        bio: 'Building the future of decentralized finance. Looking for top-tier developers to join our mission.',
        avatarUrl: '/avatars/blockchain-architect.png',
        role: 'HIRER',
        isVerified: true,
        categories: [],
        rating: 4.7,
        totalSpent: 85000,
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      try {
        const user = await prisma.user.create({
          data: userData,
        });
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.username}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User ${userData.username} already exists, skipping...`);
          // Try to find existing user
          const existingUser = await prisma.user.findUnique({
            where: { username: userData.username }
          });
          if (existingUser) createdUsers.push(existingUser);
        } else {
          console.error(`❌ Error creating user ${userData.username}:`, error.message);
        }
      }
    }

    // Get freelancers and hirers
    const freelancers = createdUsers.filter(user => user.role === 'FREELANCER');
    const hirers = createdUsers.filter(user => user.role === 'HIRER');

    console.log(`Created ${freelancers.length} freelancers and ${hirers.length} hirers`);

    // Create sample gigs
    const sampleGigs = [
      {
        title: 'I will develop your Solana smart contract with Anchor framework',
        description: 'Professional Solana smart contract development using the Anchor framework. I specialize in:\n\n• SPL token creation and management\n• DeFi protocols (DEX, lending, staking)\n• NFT marketplaces and collections\n• Multi-signature wallets\n• Governance and DAO contracts\n\nWhat you get:\n✅ Clean, well-documented code\n✅ Comprehensive testing suite\n✅ Security audit recommendations\n✅ Deployment assistance\n✅ 30-day support included',
        deliverables: ['Smart contract code', 'Test suite', 'Deployment scripts', 'Documentation', 'Security audit report'],
        packages: {
          basic: {
            name: 'Basic Contract',
            price: 500,
            deliveryTime: 7,
            features: ['Simple smart contract', 'Basic testing', 'Documentation']
          },
          standard: {
            name: 'Standard Contract',
            price: 1200,
            deliveryTime: 14,
            features: ['Complex smart contract', 'Comprehensive testing', 'Deployment support', 'Security review']
          },
          premium: {
            name: 'Premium Contract',
            price: 2500,
            deliveryTime: 21,
            features: ['Multi-contract system', 'Full test coverage', 'Professional audit', 'Ongoing support']
          }
        },
        gallery: ['/gig-images/solana-contract-1.jpg', '/gig-images/solana-contract-2.jpg'],
        tags: ['solana', 'smart-contracts', 'anchor', 'rust', 'defi'],
        freelancerId: freelancers[0]?.id,
        categoryId: categories.find(c => c.name === 'Solana Development')?.id,
        rating: 4.9,
        orderCount: 23,
        viewCount: 450,
      },
      {
        title: 'I will create stunning NFT collections with generative art',
        description: 'Turn your vision into a successful NFT collection! I create unique, high-quality generative art collections with:\n\n• Custom trait system design\n• Professional artwork creation\n• Rarity distribution optimization\n• Metadata generation\n• Smart contract integration\n\nMy collections have:\n🎨 Generated 50,000+ unique NFTs\n💎 Achieved 15+ SOL floor prices\n🚀 Helped clients raise $2M+ in mints\n⭐ 98% client satisfaction rate\n\nPerfect for entrepreneurs, artists, and businesses looking to enter the NFT space!',
        deliverables: ['Generative art system', 'NFT collection (up to 10k)', 'Metadata files', 'Rarity analysis', 'Minting website'],
        packages: {
          basic: {
            name: 'Starter Collection',
            price: 800,
            deliveryTime: 10,
            features: ['1K NFT collection', 'Basic traits', 'Metadata', 'Preview gallery']
          },
          standard: {
            name: 'Professional Collection',
            price: 1800,
            deliveryTime: 18,
            features: ['10K NFT collection', 'Advanced traits', 'Rarity optimization', 'Minting page']
          },
          premium: {
            name: 'Premium Launch',
            price: 3500,
            deliveryTime: 28,
            features: ['10K collection', 'Custom smart contract', 'Full website', 'Marketing assets', 'Launch support']
          }
        },
        gallery: ['/gig-images/nft-collection-1.jpg', '/gig-images/nft-collection-2.jpg'],
        tags: ['nft', 'generative-art', 'collection', 'solana', 'metadata'],
        freelancerId: freelancers[1]?.id,
        categoryId: categories.find(c => c.name === 'NFT Development')?.id,
        rating: 4.8,
        orderCount: 15,
        viewCount: 320,
      },
      {
        title: 'I will build automated trading bots for crypto markets',
        description: 'Professional cryptocurrency trading bot development with proven strategies!\n\n🤖 Bot Types Available:\n• Grid trading bots\n• DCA (Dollar Cost Averaging)\n• Arbitrage bots\n• Market making strategies\n• Custom algorithmic strategies\n\n📊 Features:\n• Real-time market data integration\n• Risk management systems\n• Backtesting capabilities\n• Performance analytics\n• Multi-exchange support\n\n💰 My bots have generated:\n• 25%+ annual returns\n• $500K+ in client profits\n• 90%+ uptime reliability',
        deliverables: ['Trading bot source code', 'Configuration guide', 'Backtesting results', 'Risk management system', 'Performance dashboard'],
        packages: {
          basic: {
            name: 'Simple Bot',
            price: 600,
            deliveryTime: 12,
            features: ['Basic trading strategy', 'Single exchange', 'Basic monitoring']
          },
          standard: {
            name: 'Advanced Bot',
            price: 1500,
            deliveryTime: 20,
            features: ['Multiple strategies', 'Multi-exchange', 'Risk management', 'Performance tracking']
          },
          premium: {
            name: 'Custom Algorithm',
            price: 3000,
            deliveryTime: 30,
            features: ['Custom strategy development', 'Advanced analytics', 'White-label solution', '90-day support']
          }
        },
        gallery: ['/gig-images/trading-bot-1.jpg', '/gig-images/trading-bot-2.jpg'],
        tags: ['trading-bot', 'cryptocurrency', 'automation', 'algorithm', 'defi'],
        freelancerId: freelancers[2]?.id,
        categoryId: categories.find(c => c.name === 'Crypto Trading Bots')?.id,
        rating: 4.7,
        orderCount: 31,
        viewCount: 680,
      },
      {
        title: 'I will audit your smart contracts for security vulnerabilities',
        description: 'Professional smart contract security auditing services with comprehensive vulnerability assessment.\n\n🛡️ Audit Process:\n• Automated security scanning\n• Manual code review\n• Gas optimization analysis\n• Logic vulnerability assessment\n• Business logic validation\n\n📋 What You Receive:\n• Detailed vulnerability report\n• Severity classifications\n• Fix recommendations\n• Re-audit after fixes\n• Security best practices guide\n\n🏆 Track Record:\n• 200+ contracts audited\n• $500M+ TVL secured\n• 0 post-audit incidents\n• 15+ critical vulnerabilities found',
        deliverables: ['Security audit report', 'Vulnerability assessment', 'Fix recommendations', 'Gas optimization suggestions', 'Re-audit service'],
        packages: {
          basic: {
            name: 'Basic Audit',
            price: 1000,
            deliveryTime: 7,
            features: ['Single contract audit', 'Basic security scan', 'Summary report']
          },
          standard: {
            name: 'Comprehensive Audit',
            price: 2500,
            deliveryTime: 14,
            features: ['Multi-contract audit', 'Manual review', 'Detailed report', 'Gas optimization']
          },
          premium: {
            name: 'Enterprise Audit',
            price: 5000,
            deliveryTime: 21,
            features: ['Full protocol audit', 'Economic analysis', 'Formal verification', 'Ongoing support']
          }
        },
        gallery: ['/gig-images/audit-report-1.jpg', '/gig-images/audit-report-2.jpg'],
        tags: ['security', 'audit', 'smart-contracts', 'vulnerability', 'defi'],
        freelancerId: freelancers[3]?.id,
        categoryId: categories.find(c => c.name === 'Web3 Security')?.id,
        rating: 4.95,
        orderCount: 42,
        viewCount: 890,
      },
      {
        title: 'I will design and launch your DAO with governance system',
        description: 'Complete DAO development and launch service including governance, tokenomics, and community management.\n\n🏛️ DAO Services:\n• Governance structure design\n• Token economics modeling\n• Voting mechanisms\n• Treasury management\n• Community onboarding\n\n📊 Deliverables Include:\n• DAO smart contracts\n• Governance portal\n• Token distribution plan\n• Community guidelines\n• Launch strategy\n\n🚀 Success Stories:\n• 15+ DAOs launched\n• $50M+ combined treasury\n• 10,000+ active members\n• 85% governance participation',
        deliverables: ['DAO smart contracts', 'Governance portal', 'Tokenomics model', 'Community framework', 'Launch roadmap'],
        packages: {
          basic: {
            name: 'DAO Foundation',
            price: 1500,
            deliveryTime: 21,
            features: ['Basic DAO structure', 'Simple voting', 'Token contract', 'Documentation']
          },
          standard: {
            name: 'Full DAO Launch',
            price: 3500,
            deliveryTime: 35,
            features: ['Advanced governance', 'Treasury management', 'Member portal', 'Launch support']
          },
          premium: {
            name: 'Enterprise DAO',
            price: 7500,
            deliveryTime: 50,
            features: ['Custom governance', 'Multi-sig treasury', 'Advanced features', 'Ongoing advisory']
          }
        },
        gallery: ['/gig-images/dao-governance-1.jpg', '/gig-images/dao-governance-2.jpg'],
        tags: ['dao', 'governance', 'tokenomics', 'community', 'web3'],
        freelancerId: freelancers[4]?.id,
        categoryId: categories.find(c => c.name === 'DAO Development')?.id,
        rating: 4.6,
        orderCount: 18,
        viewCount: 380,
      }
    ];

    // Create gigs
    const createdGigs = [];
    for (const gigData of sampleGigs) {
      if (!gigData.freelancerId || !gigData.categoryId) {
        console.log(`⚠️  Skipping gig "${gigData.title}" - missing freelancer or category`);
        continue;
      }

      try {
        const gig = await prisma.gig.create({
          data: gigData,
        });
        createdGigs.push(gig);
        console.log(`✅ Created gig: ${gig.title.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error creating gig:`, error.message);
      }
    }

    // Create sample jobs
    const sampleJobs = [
      {
        title: 'Build a DeFi Yield Farming Protocol on Solana',
        description: 'We need an experienced Solana developer to build a comprehensive yield farming protocol with the following features:\n\n**Core Requirements:**\n• Liquidity pool creation and management\n• Yield farming rewards distribution\n• Staking mechanisms with lock periods\n• Admin controls for pool parameters\n• Integration with major DEXs (Raydium, Orca)\n\n**Technical Specifications:**\n• Built using Anchor framework\n• Comprehensive test coverage (90%+)\n• Gas-optimized smart contracts\n• Security audit ready code\n• Detailed documentation\n\n**Additional Features:**\n• Multi-token support\n• Compound farming options\n• Emergency pause functionality\n• Fee collection mechanisms\n• Governance token integration\n\n**Timeline:** 6-8 weeks\n**Budget:** $15,000 - $25,000\n\nPlease include examples of similar DeFi projects you\'ve built and your approach to smart contract security.',
        requirements: [
          'Expert-level Solana/Rust development experience',
          'Previous DeFi protocol development',
          'Anchor framework proficiency',
          'Smart contract security knowledge',
          'Experience with yield farming mechanisms',
          'Available for full-time commitment (40hrs/week)',
          'Portfolio of similar projects required'
        ],
        budget: 20000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isUrgent: true,
        attachments: ['/job-attachments/defi-protocol-spec.pdf', '/job-attachments/technical-requirements.pdf'],
        tags: ['defi', 'solana', 'yield-farming', 'smart-contracts', 'anchor'],
        hirerId: hirers[0]?.id,
        categoryId: categories.find(c => c.name === 'DeFi Development')?.id,
        views: 245,
        applicantCount: 0,
      },
      {
        title: 'NFT Marketplace Development with Advanced Features',
        description: 'Looking for a skilled Web3 developer to create a feature-rich NFT marketplace on Solana with unique functionalities:\n\n**Core Features:**\n• Buy/Sell NFT functionality\n• Auction system with bidding\n• Collection management\n• User profiles and verification\n• Advanced search and filtering\n\n**Unique Requirements:**\n• Fractional ownership system\n• NFT lending and borrowing\n• Royalty distribution automation\n• Cross-chain bridge integration\n• Mobile-responsive design\n\n**Technical Stack:**\n• Next.js frontend\n• Solana smart contracts\n• MetaPlex integration\n• Modern UI/UX design\n• Real-time notifications\n\n**Deliverables:**\n• Complete marketplace platform\n• Smart contracts for all features\n• Admin dashboard\n• User documentation\n• Deployment and launch support\n\nWe\'re looking for a developer who can think creatively about NFT utility and user experience.',
        requirements: [
          'Full-stack Web3 development experience',
          'Solana NFT marketplace experience',
          'MetaPlex framework knowledge',
          'Next.js/React expertise',
          'Smart contract development skills',
          'UI/UX design capabilities',
          '3+ years Web3 development experience'
        ],
        budget: 18000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isUrgent: false,
        attachments: ['/job-attachments/marketplace-wireframes.pdf', '/job-attachments/feature-specs.pdf'],
        tags: ['nft', 'marketplace', 'solana', 'metaplex', 'frontend'],
        hirerId: hirers[1]?.id,
        categoryId: categories.find(c => c.name === 'NFT Development')?.id,
        views: 189,
        applicantCount: 0,
      },
      {
        title: 'Crypto Trading Bot with Machine Learning Integration',
        description: 'Seeking an expert developer to create an advanced cryptocurrency trading bot that incorporates machine learning for predictive analysis:\n\n**Bot Requirements:**\n• Multi-exchange integration (Binance, Coinbase, FTX)\n• Real-time market data processing\n• Multiple trading strategies (grid, DCA, arbitrage)\n• Risk management system\n• Portfolio optimization\n\n**Machine Learning Features:**\n• Price prediction models\n• Sentiment analysis integration\n• Pattern recognition algorithms\n• Adaptive strategy selection\n• Performance optimization\n\n**Technical Requirements:**\n• Python-based backend\n• Real-time WebSocket connections\n• Database for historical data\n• RESTful API for management\n• Web dashboard for monitoring\n\n**Performance Expectations:**\n• 99.9% uptime reliability\n• Sub-second execution times\n• Comprehensive backtesting\n• Risk-adjusted returns optimization\n\nThis is a high-value project for a serious trading firm. We expect professional-grade code and comprehensive documentation.',
        requirements: [
          'Expert Python development skills',
          'Machine learning/AI experience',
          'Cryptocurrency trading knowledge',
          'Exchange API integration experience',
          'High-frequency trading background',
          'Statistical analysis expertise',
          'Previous trading bot development',
          'Strong mathematical background'
        ],
        budget: 35000,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        isUrgent: true,
        attachments: ['/job-attachments/trading-requirements.pdf', '/job-attachments/ml-specifications.pdf'],
        tags: ['trading-bot', 'machine-learning', 'cryptocurrency', 'python', 'ai'],
        hirerId: hirers[0]?.id,
        categoryId: categories.find(c => c.name === 'Crypto Trading Bots')?.id,
        views: 312,
        applicantCount: 0,
      },
      {
        title: 'Smart Contract Security Audit for DeFi Protocol',
        description: 'We have developed a comprehensive DeFi protocol and need a thorough security audit before mainnet launch:\n\n**Protocol Overview:**\n• Decentralized lending platform\n• Automated market maker (AMM)\n• Governance token with voting\n• Yield farming mechanisms\n• Cross-chain bridge functionality\n\n**Audit Requirements:**\n• Comprehensive smart contract review\n• Gas optimization analysis\n• Economic attack vector assessment\n• Formal verification where applicable\n• Detailed vulnerability report\n\n**Protocol Statistics:**\n• 12 interconnected smart contracts\n• Expected TVL: $100M+\n• Multi-signature governance\n• Emergency pause mechanisms\n• Upgradeability patterns\n\n**Deliverables:**\n• Complete security audit report\n• Vulnerability classification (Critical/High/Medium/Low)\n• Detailed fix recommendations\n• Gas optimization suggestions\n• Re-audit after fixes implemented\n\nWe need an auditor with proven track record in DeFi protocol security and experience with high-TVL projects.',
        requirements: [
          'Smart contract security expertise',
          'DeFi protocol audit experience',
          'Formal verification knowledge',
          'Economic attack vector analysis',
          'Experience with $50M+ TVL protocols',
          'Professional audit report writing',
          'Previous audit portfolio required',
          'Available for urgent timeline'
        ],
        budget: 25000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isUrgent: true,
        attachments: ['/job-attachments/protocol-contracts.zip', '/job-attachments/audit-requirements.pdf'],
        tags: ['security', 'audit', 'defi', 'smart-contracts', 'vulnerability'],
        hirerId: hirers[1]?.id,
        categoryId: categories.find(c => c.name === 'Web3 Security')?.id,
        views: 156,
        applicantCount: 0,
      },
      {
        title: 'DAO Governance Platform with Token Economics Design',
        description: 'We need a complete DAO platform with sophisticated governance mechanisms and tokenomics for our DeFi protocol:\n\n**Governance Features:**\n• Proposal creation and voting system\n• Delegation mechanisms\n• Quadratic voting implementation\n• Time-weighted voting power\n• Execution automation\n\n**Token Economics:**\n• Multi-tier staking system\n• Reward distribution algorithms\n• Inflation/deflation mechanisms\n• Treasury management\n• Value accrual strategies\n\n**Platform Requirements:**\n• User-friendly governance interface\n• Mobile-responsive design\n• Real-time voting updates\n• Analytics and reporting\n• Integration with existing protocol\n\n**Technical Specifications:**\n• Smart contracts for governance\n• Frontend governance portal\n• Backend API services\n• Database for off-chain data\n• Integration with notification systems\n\nThis project requires deep understanding of DAO governance patterns and token economics theory.',
        requirements: [
          'DAO development experience',
          'Token economics expertise',
          'Governance mechanism knowledge',
          'Smart contract development skills',
          'Frontend development (React/Next.js)',
          'DeFi protocol understanding',
          'Economic modeling experience',
          'Previous DAO launch experience'
        ],
        budget: 30000,
        deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
        isUrgent: false,
        attachments: ['/job-attachments/dao-specifications.pdf', '/job-attachments/tokenomics-model.xlsx'],
        tags: ['dao', 'governance', 'tokenomics', 'voting', 'defi'],
        hirerId: hirers[0]?.id,
        categoryId: categories.find(c => c.name === 'DAO Development')?.id,
        views: 198,
        applicantCount: 0,
      }
    ];

    // Create jobs
    const createdJobs = [];
    for (const jobData of sampleJobs) {
      if (!jobData.hirerId || !jobData.categoryId) {
        console.log(`⚠️  Skipping job "${jobData.title}" - missing hirer or category`);
        continue;
      }

      try {
        const job = await prisma.job.create({
          data: jobData,
        });
        createdJobs.push(job);
        console.log(`✅ Created job: ${job.title.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error creating job:`, error.message);
      }
    }

    // Create some job applications
    if (createdJobs.length > 0 && freelancers.length > 0) {
      const sampleApplications = [
        {
          coverLetter: "Hi! I'm Alex, a Solana expert with 5+ years in DeFi development. I've built 8 yield farming protocols with combined TVL of $50M+. My approach focuses on gas optimization and security-first development. I can start immediately and deliver within 6 weeks. Let's discuss your specific requirements!",
          proposedBudget: 22000,
          estimatedDays: 45,
          attachments: ['/applications/alex-portfolio.pdf', '/applications/defi-examples.pdf'],
          freelancerId: freelancers[0]?.id,
          jobId: createdJobs[0]?.id,
        },
        {
          coverLetter: "Hello! I specialize in NFT marketplaces and have launched 5 successful platforms. My latest marketplace handles 1000+ daily transactions with advanced features like fractional ownership. I love the unique requirements in your project and can deliver a standout platform. Portfolio attached!",
          proposedBudget: 17500,
          estimatedDays: 42,
          attachments: ['/applications/sarah-nft-portfolio.pdf'],
          freelancerId: freelancers[1]?.id,
          jobId: createdJobs[1]?.id,
        },
        {
          coverLetter: "Greetings! I'm Marcus, a quantitative developer with ML expertise. I've built trading systems generating 35%+ returns with $2M+ AUM. Your project combines my two specialties perfectly. I can implement advanced ML models for predictive trading with robust risk management.",
          proposedBudget: 33000,
          estimatedDays: 85,
          attachments: ['/applications/marcus-trading-results.pdf', '/applications/ml-models-demo.pdf'],
          freelancerId: freelancers[2]?.id,
          jobId: createdJobs[2]?.id,
        }
      ];

      for (const appData of sampleApplications) {
        if (!appData.freelancerId || !appData.jobId) continue;

        try {
          await prisma.jobApplication.create({
            data: appData,
          });
          
          // Update job application count
          await prisma.job.update({
            where: { id: appData.jobId },
            data: { applicantCount: { increment: 1 } }
          });

          console.log(`✅ Created application for job`);
        } catch (error) {
          console.error(`❌ Error creating application:`, error.message);
        }
      }
    }

    console.log('\n🎉 Sample data seeded successfully!');
    console.log(`Created ${createdUsers.length} users, ${createdGigs.length} gigs, and ${createdJobs.length} jobs`);

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSampleData();
}

module.exports = { seedSampleData };