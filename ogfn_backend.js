# 🎮 RELIVE BACKEND - COMPLETE COPY & PASTE SETUP

## 📁 CREATE THESE FOLDERS FIRST

Create a folder called `relive-backend` on your Desktop, then create these folders inside it:

```
relive-backend/
├── logs/
```

That's it! Just ONE folder called "logs" inside your main folder.

---

## 📄 FILE 1: `.env`

**Create a file called `.env` (just `.env` with a dot, no .txt)**

Copy this EXACTLY:

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
JWT_SECRET=relive_super_secret_change_this_12345
PORT=3551
HOST=0.0.0.0
```

**⚠️ IMPORTANT:** Replace `YOUR_BOT_TOKEN_HERE` with your real Discord bot token!

---

## 📄 FILE 2: `package.json`

**Create a file called `package.json`**

Copy this EXACTLY:

```json
{
  "name": "relive-backend",
  "version": "1.0.0",
  "description": "Relive Chapter 3 Season 1",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  }
}
```

---

## 📄 FILE 3: `index.js`

**Create a file called `index.js`**

Copy this EXACTLY:

```javascript
// ============================================
// RELIVE BACKEND - CHAPTER 3 SEASON 1
// Complete Single-File Setup
// ============================================

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  PORT: process.env.PORT || 3551,
  HOST: process.env.HOST || '0.0.0.0',
  JWT_SECRET: process.env.JWT_SECRET || 'relive_super_secret_change_me',
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  SEASON_NUMBER: 19,
  SEASON_NAME: 'Chapter 3 Season 1',
  SERVER_NAME: 'Relive',
  BUILD_VERSION: '19.01'
};

// ============================================
// DATA STORAGE
// ============================================
const users = new Map();
const authCodes = new Map();
const sessions = new Map();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  console.log(logMessage.trim());
  
  const logFile = path.join(logsDir, `relive-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage);
}

// ============================================
// SEASON 19 CONFIGURATION
// ============================================
const SEASON_CONFIG = {
  seasonNumber: 19,
  chapter: 3,
  season: 1,
  buildVersion: '19.01',
  displayName: 'Chapter 3 Season 1',
  startDate: '2021-12-05T00:00:00.000Z',
  endDate: '2022-03-20T00:00:00.000Z',
  features: {
    slidingMechanic: true,
    spidermanWebShooters: true,
    tentsCamping: true,
    crownedVictoryRoyale: true,
    weatherSystem: true
  },
  battlePassTiers: 100,
  defaultLoadout: {
    characterId: 'CID_001_Athena_Commando_F_Default',
    backpackId: 'BID_001_Default',
    pickaxeId: 'DefaultPickaxe',
    gliderId: 'DefaultGlider'
  }
};

// ============================================
// ITEM SHOP DATA
// ============================================
const ITEM_SHOP = {
  daily: [
    { id: 'daily_1', name: 'Bushranger', type: 'skin', rarity: 'epic', price: 1500 },
    { id: 'daily_2', name: 'Take the L', type: 'emote', rarity: 'rare', price: 500 },
    { id: 'daily_3', name: 'Dazzle', type: 'skin', rarity: 'uncommon', price: 800 },
    { id: 'daily_4', name: 'Star Wand', type: 'pickaxe', rarity: 'rare', price: 800 }
  ],
  featured: [
    { id: 'featured_1', name: 'Spider-Man', type: 'skin', rarity: 'legendary', price: 0, battlePass: true },
    { id: 'featured_2', name: 'The Foundation', type: 'skin', rarity: 'legendary', price: 2000 },
    { id: 'featured_3', name: 'Chapter 3 Bundle', type: 'bundle', rarity: 'legendary', price: 2800 }
  ]
};

// ============================================
// DISCORD BOT SETUP
// ============================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  log(`Discord Bot: ${client.user.tag} is online!`, 'BOT');
  console.log(`✅ Discord Bot: ${client.user.tag} is online!`);
  client.user.setActivity('Relive Chapter 3 Season 1', { type: 0 });
});

// !register command
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // REGISTER COMMAND
  if (message.content.toLowerCase() === '!register') {
    const discordId = message.author.id;
    const existingUser = Array.from(users.values()).find(u => u.discordId === discordId);
    
    if (existingUser) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Account Already Exists')
        .setDescription('You already have a Relive account!')
        .addFields(
          { name: 'Display Name', value: existingUser.displayName, inline: true },
          { name: 'Level', value: existingUser.level.toString(), inline: true },
          { name: 'Battle Pass Tier', value: existingUser.tier.toString(), inline: true }
        )
        .setFooter({ text: 'Relive - Chapter 3 Season 1' })
        .setTimestamp();
      
      log(`Registration attempted by existing user: ${message.author.tag}`, 'REGISTER');
      return message.reply({ embeds: [embed] });
    }
    
    // Create new account
    const accountId = crypto.randomUUID();
    const username = message.author.username;
    const displayName = message.author.globalName || username;
    
    const user = {
      accountId,
      discordId,
      username,
      displayName,
      email: `${discordId}@relive.local`,
      level: 1,
      vbucks: 0,
      battleStars: 0,
      tier: 1,
      xp: 0,
      seasonXp: 0,
      hasBattlePass: false,
      crownWins: 0,
      inventory: [
        'CID_001_Athena_Commando_F_Default',
        'BID_001_Default',
        'DefaultPickaxe',
        'DefaultGlider'
      ],
      stats: {
        wins: 0,
        kills: 0,
        matches: 0,
        deaths: 0,
        top10: 0,
        top25: 0
      },
      createdAt: new Date().toISOString()
    };
    
    users.set(accountId, user);
    log(`New user registered: ${displayName} (${accountId})`, 'REGISTER');
    
    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('✅ Welcome to Relive!')
      .setDescription(`Your Chapter 3 Season 1 account has been created!`)
      .addFields(
        { name: '👤 Display Name', value: displayName, inline: true },
        { name: '🆔 Account ID', value: accountId.substring(0, 8) + '...', inline: true },
        { name: '⭐ Level', value: '1', inline: true },
        { name: '🎮 Next Step', value: 'Click the button below to get your login code!' }
      )
      .setFooter({ text: 'Relive - Experience Chapter 3 Season 1' })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('get_login_code')
          .setLabel('🔑 Get Login Code')
          .setStyle(ButtonStyle.Success)
      );
    
    await message.reply({ embeds: [embed], components: [row] });
  }
  
  // LOGIN COMMAND
  if (message.content.toLowerCase() === '!login') {
    const discordId = message.author.id;
    const user = Array.from(users.values()).find(u => u.discordId === discordId);
    
    if (!user) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ No Account Found')
        .setDescription('You need to create an account first!')
        .addFields({ name: 'How to Register', value: 'Type `!register` to create your account' })
        .setFooter({ text: 'Relive' });
      
      return message.reply({ embeds: [embed] });
    }
    
    const authCode = crypto.randomBytes(16).toString('hex');
    authCodes.set(authCode, { 
      accountId: user.accountId, 
      expiresAt: Date.now() + 300000 // 5 minutes
    });
    
    log(`Login code generated for: ${user.displayName}`, 'LOGIN');
    
    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('🔑 Your Relive Login Code')
      .setDescription('Copy this code and paste it into the Relive launcher!')
      .addFields(
        { name: 'Login Code', value: `\`\`\`${authCode}\`\`\`` },
        { name: '⏰ Expires In', value: '5 minutes', inline: true },
        { name: '👤 Account', value: user.displayName, inline: true }
      )
      .setFooter({ text: '⚠️ Keep this code private! Do not share it.' })
      .setTimestamp();
    
    await message.author.send({ embeds: [embed] }).catch(() => {
      message.reply('❌ I cannot DM you! Please enable DMs from server members.');
    });
    
    if (message.guild) {
      message.reply('✅ Check your DMs for your login code! 📨');
    }
  }
  
  // STATS COMMAND
  if (message.content.toLowerCase() === '!stats') {
    const discordId = message.author.id;
    const user = Array.from(users.values()).find(u => u.discordId === discordId);
    
    if (!user) {
      return message.reply('❌ No account found! Use `!register` to create one.');
    }
    
    const winRate = user.stats.matches > 0 ? ((user.stats.wins / user.stats.matches) * 100).toFixed(1) : '0.0';
    const kd = user.stats.deaths > 0 ? (user.stats.kills / user.stats.deaths).toFixed(2) : user.stats.kills.toFixed(2);
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`📊 ${user.displayName}'s Stats`)
      .setDescription('**Chapter 3 Season 1 Statistics**')
      .addFields(
        { name: '🏆 Victories', value: user.stats.wins.toString(), inline: true },
        { name: '💀 Eliminations', value: user.stats.kills.toString(), inline: true },
        { name: '🎮 Matches', value: user.stats.matches.toString(), inline: true },
        { name: '📈 Win Rate', value: `${winRate}%`, inline: true },
        { name: '⚔️ K/D Ratio', value: kd, inline: true },
        { name: '👑 Crown Wins', value: user.crownWins.toString(), inline: true },
        { name: '⭐ Level', value: user.level.toString(), inline: true },
        { name: '🎟️ Battle Pass Tier', value: `${user.tier}/100`, inline: true },
        { name: '💎 V-Bucks', value: user.vbucks.toLocaleString(), inline: true }
      )
      .setFooter({ text: 'Relive - Chapter 3 Season 1' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
  
  // HELP COMMAND
  if (message.content.toLowerCase() === '!help') {
    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('🎮 Relive Commands')
      .setDescription('Available commands for Chapter 3 Season 1')
      .addFields(
        { name: '!register', value: 'Create a new Relive account' },
        { name: '!login', value: 'Get your login code for the launcher' },
        { name: '!stats', value: 'View your player statistics' },
        { name: '!help', value: 'Show this help message' }
      )
      .setFooter({ text: 'Relive - Experience Chapter 3 Season 1' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
});

// Button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  if (interaction.customId === 'get_login_code') {
    const discordId = interaction.user.id;
    const user = Array.from(users.values()).find(u => u.discordId === discordId);
    
    if (!user) {
      return interaction.reply({ content: '❌ Account not found!', ephemeral: true });
    }
    
    const authCode = crypto.randomBytes(16).toString('hex');
    authCodes.set(authCode, { 
      accountId: user.accountId, 
      expiresAt: Date.now() + 300000 
    });
    
    log(`Login code generated via button for: ${user.displayName}`, 'LOGIN');
    
    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('🔑 Your Relive Login Code')
      .setDescription('Copy and paste this into the Relive launcher!')
      .addFields(
        { name: 'Code', value: `\`\`\`${authCode}\`\`\`` },
        { name: 'Valid For', value: '5 minutes' }
      )
      .setFooter({ text: '⚠️ Keep this private!' });
    
    await interaction.user.send({ embeds: [embed] }).catch(() => {
      interaction.reply({ content: '❌ Enable DMs to receive your code!', ephemeral: true });
    });
    
    interaction.reply({ content: '✅ Login code sent to your DMs!', ephemeral: true });
  }
});

// ============================================
// EXPRESS API SERVER
// ============================================
const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`, 'API');
  next();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  const cleanToken = token.replace('eg1~', '');
  
  jwt.verify(cleanToken, CONFIG.JWT_SECRET, (err, decoded) => {
    if (err) {
      log(`Invalid token attempt: ${err.message}`, 'AUTH');
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Exchange auth code for token
app.post('/account/api/oauth/token', (req, res) => {
  const { grant_type, code } = req.body;
  
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ 
      error: 'invalid_grant',
      error_description: 'Only authorization_code grant type is supported'
    });
  }
  
  const authData = authCodes.get(code);
  
  if (!authData || authData.expiresAt < Date.now()) {
    authCodes.delete(code);
    log(`Invalid or expired auth code attempt`, 'AUTH');
    return res.status(400).json({ 
      error: 'invalid_code',
      error_description: 'Authorization code is invalid or expired'
    });
  }
  
  const user = users.get(authData.accountId);
  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }
  
  authCodes.delete(code);
  
  const accessToken = jwt.sign({ 
    accountId: user.accountId,
    displayName: user.displayName 
  }, CONFIG.JWT_SECRET, { expiresIn: '8h' });
  
  log(`Token issued for: ${user.displayName}`, 'AUTH');
  
  res.json({
    access_token: `eg1~${accessToken}`,
    expires_in: 28800,
    expires_at: new Date(Date.now() + 28800000).toISOString(),
    token_type: 'bearer',
    refresh_token: `eg1~${crypto.randomBytes(32).toString('hex')}`,
    refresh_expires: 86400,
    refresh_expires_at: new Date(Date.now() + 86400000).toISOString(),
    account_id: user.accountId,
    client_id: 'ec684b8c687f479fadea3cb2ad83f5c6',
    internal_client: true,
    client_service: 'fortnite',
    displayName: user.displayName,
    app: 'fortnite',
    in_app_id: user.accountId
  });
});

// Get account info
app.get('/account/api/public/account/:accountId', authenticateToken, (req, res) => {
  const user = users.get(req.params.accountId);
  
  if (!user) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  res.json({
    id: user.accountId,
    displayName: user.displayName,
    name: user.username,
    email: user.email,
    failedLoginAttempts: 0,
    lastLogin: new Date().toISOString(),
    numberOfDisplayNameChanges: 0,
    ageGroup: 'UNKNOWN',
    headless: false,
    country: 'US',
    lastName: 'User',
    preferredLanguage: 'en',
    canUpdateDisplayName: false,
    tfaEnabled: false,
    emailVerified: true,
    minorVerified: false,
    minorExpected: false,
    minorStatus: 'NOT_MINOR'
  });
});

// Get multiple accounts
app.get('/account/api/public/account', authenticateToken, (req, res) => {
  const accountIds = req.query.accountId;
  
  if (!accountIds) {
    return res.json([]);
  }
  
  const ids = Array.isArray(accountIds) ? accountIds : [accountIds];
  const accounts = ids.map(id => {
    const user = users.get(id);
    return user ? {
      id: user.accountId,
      displayName: user.displayName,
      externalAuths: {}
    } : null;
  }).filter(Boolean);
  
  res.json(accounts);
});

// ============================================
// FORTNITE GAME API ENDPOINTS
// ============================================

// Timeline (Season info)
app.get('/fortnite/api/calendar/v1/timeline', (req, res) => {
  res.json({
    channels: {
      'client-matchmaking': {
        states: [],
        cacheExpire: new Date(Date.now() + 3600000).toISOString()
      },
      'client-events': {
        states: [{
          validFrom: SEASON_CONFIG.startDate,
          activeEvents: [
            {
              eventType: `EventFlag.Season${SEASON_CONFIG.seasonNumber}`,
              activeUntil: SEASON_CONFIG.endDate,
              activeSince: SEASON_CONFIG.startDate
            },
            {
              eventType: 'EventFlag.LobbyWinterDecor',
              activeUntil: '2022-01-07T00:00:00.000Z',
              activeSince: '2021-12-05T00:00:00.000Z'
            }
          ],
          state: {
            activeStorefronts: [],
            eventNamedWeights: {},
            seasonNumber: SEASON_CONFIG.seasonNumber,
            seasonTemplateId: `Season${SEASON_CONFIG.seasonNumber}`,
            matchXpBonusPoints: 0,
            seasonBegin: SEASON_CONFIG.startDate,
            seasonEnd: SEASON_CONFIG.endDate,
            seasonDisplayedEnd: SEASON_CONFIG.endDate,
            weeklyStoreEnd: new Date(Date.now() + 604800000).toISOString(),
            stwEventStoreEnd: '9999-01-01T00:00:00.000Z',
            stwWeeklyStoreEnd: '9999-01-01T00:00:00.000Z',
            dailyStoreEnd: new Date(Date.now() + 86400000).toISOString()
          }
        }],
        cacheExpire: new Date(Date.now() + 3600000).toISOString()
      }
    },
    eventsTimeOffsetHrs: 0,
    cacheIntervalMins: 10,
    currentTime: new Date().toISOString()
  });
});

// Storefront (Item Shop)
app.get('/fortnite/api/storefront/v2/catalog', authenticateToken, (req, res) => {
  res.json({
    refreshIntervalHrs: 24,
    dailyPurchaseHrs: 24,
    expiration: new Date(Date.now() + 86400000).toISOString(),
    storefronts: [
      {
        name: 'BRDailyStorefront',
        catalogEntries: ITEM_SHOP.daily.map(item => ({
          offerId: item.id,
          devName: item.name,
          offerType: 'StaticPrice',
          prices: [{
            currencyType: 'MtxCurrency',
            currencySubType: '',
            regularPrice: item.price,
            finalPrice: item.price,
            saleExpiration: new Date(Date.now() + 86400000).toISOString(),
            basePrice: item.price
          }],
          categories: [],
          catalogGroup: '',
          catalogGroupPriority: 0,
          sortPriority: 0,
          title: item.name,
          shortDescription: '',
          description: '',
          displayAssetPath: '',
          itemGrants: []
        }))
      },
      {
        name: 'BRWeeklyStorefront',
        catalogEntries: ITEM_SHOP.featured.map(item => ({
          offerId: item.id,
          devName: item.name,
          offerType: 'StaticPrice',
          prices: [{
            currencyType: 'MtxCurrency',
            currencySubType: '',
            regularPrice: item.price,
            finalPrice: item.price,
            saleExpiration: new Date(Date.now() + 604800000).toISOString(),
            basePrice: item.price
          }],
          categories: [],
          catalogGroup: 'Featured',
          catalogGroupPriority: 1,
          sortPriority: 0,
          title: item.name,
          shortDescription: '',
          description: '',
          displayAssetPath: '',
          itemGrants: []
        }))
      }
    ]
  });
});

// MCP Profile Query
app.post('/fortnite/api/game/v2/profile/:accountId/client/:command', authenticateToken, (req, res) => {
  const user = users.get(req.params.accountId);
  const { command } = req.params;
  const profileId = req.query.profileId || 'athena';
  
  if (!user) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  const baseResponse = {
    profileRevision: 1,
    profileId: profileId,
    profileChangesBaseRevision: 1,
    profileChanges: [],
    profileCommandRevision: 1,
    serverTime: new Date().toISOString(),
    responseVersion: 1
  };
  
  // Handle different commands
  if (command === 'QueryProfile' || command === 'ClientQuestLogin') {
    res.json(baseResponse);
  } else if (command === 'SetMtxPlatform' || command === 'SetItemFavoriteStatusBatch') {
    res.json(baseResponse);
  } else {
    res.json(baseResponse);
  }
});

// Matchmaking
app.get('/fortnite/api/matchmaking/session/findPlayer/:accountId', (req, res) => {
  res.status(200).json([]);
});

// Version check
app.get('/fortnite/api/v2/versioncheck/*', (req, res) => {
  res.json({ type: 'NO_UPDATE' });
});

app.get('/fortnite/api/versioncheck/*', (req, res) => {
  res.json({ type: 'NO_UPDATE' });
});

// Content pages
app.get('/content/api/pages/*', (req, res) => {
  res.json({
    _title: 'Relive',
    _activeDate: SEASON_CONFIG.startDate,
    lastModified: new Date().toISOString(),
    _locale: 'en-US'
  });
});

// Enabled features
app.get('/fortnite/api/game/v2/enabled_features', (req, res) => {
  res.json([]);
});

// Receipts
app.get('/fortnite/api/receipts/v1/account/:accountId/receipts', (req, res) => {
  res.json([]);
});

// ============================================
// HEALTH & INFO ENDPOINTS
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    server: CONFIG.SERVER_NAME,
    season: CONFIG.SEASON_NAME,
    build: CONFIG.BUILD_VERSION,
    players: users.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: CONFIG.SERVER_NAME,
    description: `Experience ${CONFIG.SEASON_NAME}`,
    season: CONFIG.SEASON_NAME,
    chapter: SEASON_CONFIG.chapter,
    build: CONFIG.BUILD_VERSION,
    features: Object.keys(SEASON_CONFIG.features).filter(f => SEASON_CONFIG.features[f]),
    discord: 'Use !register in Discord to create your account',
    commands: ['!register', '!login', '!stats', '!help']
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    server: CONFIG.SERVER_NAME,
    path: req.path
  });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.clear();
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║                                           ║');
  console.log('║           RELIVE BACKEND SERVER           ║');
  console.log('║        CHAPTER 3 SEASON 1 (19.01)         ║');
  console.log('║                                           ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  console.log(`🌐 Server: http://localhost:${CONFIG.PORT}`);
  console.log(`📅 Season: ${CONFIG.SEASON_NAME}`);
  console.log(`🎮 Build: ${CONFIG.BUILD_VERSION}`);
  console.log(`👥 Registered Users: ${users.size}\n`);
  console.log('📋 Discord Commands:');
  console.log('   !register  - Create your Relive account');
  console.log('   !login     - Get your login code');
  console.log('   !stats     - View your statistics');
  console.log('   !help      - Show all commands\n');
  console.log('✨ Features: Sliding, Spider-Man, Tents, Crown Wins\n');
  
  log('Relive Backend Server started successfully', 'STARTUP');
  
  // Start Discord bot
  if (CONFIG.DISCORD_TOKEN && CONFIG.DISCORD_TOKEN !== 'YOUR_BOT_TOKEN_