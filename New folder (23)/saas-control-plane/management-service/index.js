const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const TEMPLATE_PATH = path.join(__dirname, '..', 'docker-compose.tenant-template.yml');
const TENANTS_DIR = path.join(__dirname, '..', 'tenants');

if (!fs.existsSync(TENANTS_DIR)) {
  fs.mkdirSync(TENANTS_DIR, { recursive: true });
}

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex');
}

// Register a new Business Owner
app.post('/api/owners', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const owner = await prisma.businessOwner.create({
      data: { email, password, name } // Note: password should be hashed in production
    });
    res.json(owner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Provision a new Tenant for an Owner
app.post('/api/tenants', async (req, res) => {
  try {
    const { ownerId, storeName, domain } = req.body;
    
    // Generate isolated credentials
    const tenantId = `tenant_${crypto.randomUUID().replace(/-/g, '').substring(0, 8)}`;
    const dbUser = `${tenantId}_user`;
    const dbPassword = generateRandomString(16);
    const dbName = `${tenantId}_db`;
    const secretKey = generateRandomString(32);
    
    // Assign a unique API port (in a real app, track used ports in DB or use a reverse proxy cleanly)
    // We'll just use a random port between 8001 and 8999 for this demo
    const apiPort = Math.floor(Math.random() * (8999 - 8001 + 1)) + 8001;

    // Create DB Record
    const tenant = await prisma.tenant.create({
      data: {
        ownerId,
        storeName,
        domain,
        apiPort,
        dbUser,
        dbPassword,
        dbName,
        secretKey
      }
    });

    // Create Tenant Env File
    const envContent = `
TENANT_API_PORT=${apiPort}
TENANT_DB_USER=${dbUser}
TENANT_DB_PASSWORD=${dbPassword}
TENANT_DB_NAME=${dbName}
TENANT_SECRET_KEY=${secretKey}
TENANT_DOMAIN=${domain}
TENANT_DB_VOLUME=${tenantId}_db_data
TENANT_REDIS_VOLUME=${tenantId}_redis_data
`;
    const envPath = path.join(TENANTS_DIR, `.env.${tenantId}`);
    fs.writeFileSync(envPath, envContent.trim());

    // Spin up the isolated Saleor instance using Docker Compose
    console.log(`Provisioning instance for ${domain} on port ${apiPort}...`);
    
    const command = `docker-compose -p ${tenantId} -f "${TEMPLATE_PATH}" --env-file "${envPath}" up -d`;
    
    // We run it asynchronously so we don't block the API response
    execPromise(command).then(() => {
        console.log(`Successfully provisioned ${tenantId}`);
        prisma.tenant.update({
            where: { id: tenant.id },
            data: { status: 'ACTIVE' }
        }).catch(console.error);
    }).catch((err) => {
        console.error(`Failed to provision ${tenantId}:`, err);
    });

    res.json({ message: 'Provisioning started', tenant });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List Tenants
app.get('/api/tenants', async (req, res) => {
  const tenants = await prisma.tenant.findMany({ include: { owner: true } });
  res.json(tenants);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Management Service running on port ${PORT}`);
});
