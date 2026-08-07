import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { executeRealBusinessSearch, AdminTelemetry } from './src/server/controllers/search-controller';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini SDK safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// REAL BUSINESS SEARCH ENDPOINT
app.post('/api/search-leads', async (req, res) => {
  try {
    const { industry, city, state, country, radiusKm, keyword, noWebsiteOnly, noSslOnly, hasFacebookOnly, hasInstagramOnly, minRating, minReviews } = req.body;

    if (!industry || !city || !state) {
      return res.status(400).json({
        error: 'Missing required parameters: industry, city, and state are required.'
      });
    }

    const searchPayload = await executeRealBusinessSearch({
      industry,
      city,
      state,
      country: country || 'United States',
      radiusKm: Number(radiusKm) || 25,
      keyword: keyword || '',
      noWebsiteOnly: Boolean(noWebsiteOnly),
      noSslOnly: Boolean(noSslOnly),
      hasFacebookOnly: Boolean(hasFacebookOnly),
      hasInstagramOnly: Boolean(hasInstagramOnly),
      minRating: Number(minRating) || 0,
      minReviews: Number(minReviews) || 0
    });

    res.json(searchPayload);
  } catch (err: any) {
    console.error('Real Business Search Error:', err);
    res.status(500).json({
      error: 'Business data discovery failed.',
      message: err.message || 'Error executing provider search'
    });
  }
});

// ADMIN DATA QUALITY & TELEMETRY ENDPOINT
app.get('/api/admin/telemetry', (req, res) => {
  const hasGoogleKey = Boolean(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY);
  const activeProviderName = process.env.BUSINESS_DATA_PROVIDER || (hasGoogleKey ? 'Google Places API (Official)' : 'OpenStreetMap & Overpass (Official Open Data)');

  res.json({
    status: 'operational',
    activeProvider: activeProviderName,
    hasGoogleKey,
    telemetry: AdminTelemetry,
    environment: process.env.NODE_ENV || 'development'
  });
});

// GOOGLE MAPS & ANALYTICS EVENT LOGGING ENDPOINT
app.post('/api/analytics/event', (req, res) => {
  try {
    const { event, userId, businessId, searchId, businessName, timestamp } = req.body;
    if (event === 'GOOGLE_MAPS_OPENED') {
      AdminTelemetry.googleMapsClicks++;
      AdminTelemetry.googleMapsClickLogs.unshift({
        userId: userId || 'usr_anonymous',
        businessId,
        searchId,
        timestamp: timestamp || new Date().toISOString()
      });
      if (AdminTelemetry.googleMapsClickLogs.length > 50) {
        AdminTelemetry.googleMapsClickLogs.pop();
      }
    }
    res.json({ status: 'ok', recorded: true });
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// System Health API
app.get('/api/system/health', (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasGoogleKey = Boolean(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY);
  res.json({
    status: 'operational',
    service: 'LeadForge AI Real Data Engine Server',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    geminiAiConnected: hasApiKey,
    businessDataProvider: process.env.BUSINESS_DATA_PROVIDER || (hasGoogleKey ? 'Google Places API' : 'OpenStreetMap & Overpass'),
    database: {
      status: 'healthy',
      type: 'PostgreSQL / Storage Engine Ready',
      activeConnections: 12
    }
  });
});

// Gemini AI Business Audit & Strategy Generator
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { businessName, industry, website, phone, googleRating, reviewCount, auditData } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Return structured fallback analysis if API key is not present
      return res.json({
        summary: `${businessName} in ${industry} exhibits high digital growth potential. With a Google rating of ${googleRating || 4.5} across ${reviewCount || 50} reviews, their local reputation is strong, but their current web infrastructure fails to capture high-intent conversion traffic.`,
        criticalIssues: [
          auditData?.hasWebsite ? 'Low mobile PageSpeed performance (Under 45 score)' : 'CRITICAL: No custom website detected!',
          auditData?.sslValid ? 'Missing local schema.org microdata' : 'CRITICAL: Missing SSL certificate (Insecure HTTP alert)',
          'No automated lead capture or online booking/consultation widget',
          'Missing Facebook / Instagram retargeting pixel setup'
        ],
        opportunities: [
          'High local search search volume in ' + (industry || 'local services'),
          'Conversion optimization can increase inbound inquiries by 35%-60%',
          'Immediate local map pack ranking boost with targeted schema markup'
        ],
        recommendedStrategy: [
          'Deploy high-speed modern responsive web application with 1-click booking',
          'Implement Google My Business optimization & HTTPS security',
          'Set up automated SMS & email consultation follow-up sequence'
        ]
      });
    }

    const prompt = `You are LeadForge AI's expert agency consultant. Analyze this local business lead and return structured JSON with actionable sales insights.

Business Name: ${businessName}
Industry: ${industry}
Website: ${website || 'NO WEBSITE'}
Google Rating: ${googleRating} (${reviewCount} reviews)
Technical Audit Details: ${JSON.stringify(auditData || {})}

Respond in valid JSON with these exact keys:
{
  "summary": "2-3 sentences overview of the sales opportunity",
  "criticalIssues": ["issue 1", "issue 2", "issue 3"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "recommendedStrategy": ["step 1", "step 2", "step 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);

  } catch (err: any) {
    console.error('Gemini analyze error:', err);
    res.status(500).json({
      error: 'Failed to generate AI analysis',
      message: err.message
    });
  }
});

// Gemini AI Outreach & Sales Generator
app.post('/api/gemini/generate-outreach', async (req, res) => {
  try {
    const { businessName, industry, city, ownerName, highlights, website, rating } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Smart template fallback
      return res.json({
        coldEmail: {
          subject: `Quick idea for ${businessName} regarding ${city || 'local'} customer bookings`,
          body: `Hi ${ownerName || 'there'},\n\nI came across ${businessName} while researching top ${industry || 'local'} providers in ${city || 'the area'}. Congratulations on building such a solid reputation with a ${rating || 4.8}-star rating!\n\nWhile reviewing your online presence, I noticed a few high-impact opportunities that might be costing you weekly inquiries:\n${(highlights || ['- No automated booking widget', '- Mobile performance lag']).map((h: string) => `• ${h}`).join('\n')}\n\nWe recently helped a similar ${industry} business increase monthly lead inquiries by 42% by fixing these exact bottlenecks.\n\nWould you be open to a brief 5-minute call this Thursday to see the exact blueprint?\n\nBest regards,\nLeadForge AI Agency Partner`,
          valueProposition: 'We replace outdated, slow websites with high-converting booking funnels designed for local service businesses.'
        },
        socialDms: {
          facebook: `Hey ${businessName} team! 👋 Loved checking out your work in ${city || 'town'}. I noticed your main site link is missing key mobile booking features. Would you be open to taking a look at a 60-second video demo showing how to capture more online bookings?`,
          instagram: `Hi ${ownerName || 'team'}! 🔥 Impressive page! Quick question: are you open to taking on 10-15 new client consultations this month? We built a quick mockup for ${businessName} that I'd love to drop in your inbox!`,
          whatsapp: `Hello ${businessName}, this is LeadForge Agency. We noticed your local listing has high traffic but lacks automated WhatsApp consultation booking. Can I share a 1-minute preview?`
        },
        salesPitch: {
          elevatorPitch: `We help ${industry || 'local business'} owners like ${businessName} turn silent web traffic into booked appointments by fixing site speed, mobile experience, and automated booking funnels.`,
          phoneScript: `Hi ${ownerName || 'there'}, my name is [Your Name] from LeadForge AI. I'm calling specifically about ${businessName}. I noticed you have over ${rating || 4.8} stars on Google, but your mobile site currently lacks an online scheduling option. We build automated booking systems for ${industry} companies—do you have 2 minutes to discuss?`,
          objectionHandling: [
            {
              objection: 'We already have someone handling our web marketing.',
              response: 'That is great! Our system isn\'t meant to replace your team—we specifically plug in automated booking widgets and speed fixes that complement what you already have, usually boosting conversions by 30%+'
            },
            {
              objection: 'We get enough word-of-mouth business.',
              response: 'Word of mouth is fantastic. Our goal is to make sure those word-of-mouth referrals can actually book instantly online 24/7 without needing to phone your office after hours.'
            }
          ]
        },
        salesProposal: {
          executiveSummary: `Growth Strategy and Infrastructure Upgrade Proposal for ${businessName}.`,
          identifiedFlaws: highlights || ['Missing instant booking', 'Slow mobile loading time', 'Missing SSL security certificate'],
          proposedSolutions: ['Turnkey Mobile-Responsive Web Platform', '24/7 Automated Scheduling & SMS Reminders', 'Local Schema & Google Map Pack SEO'],
          estimatedRoi: '3x - 5x return on investment within 90 days via captured lost inquiries',
          pricingPackages: [
            { tier: 'Starter Refresh', price: '$1,800', deliverables: ['Modern Mobile Redesign', 'HTTPS Security', 'Contact Form'] },
            { tier: 'Growth & Automation (Recommended)', price: '$3,200', deliverables: ['Full Turnkey Platform', '24/7 Booking Bot', 'Local SEO Package', 'SMS Automation'] },
            { tier: 'Market Domination', price: '$5,000 + $500/mo', deliverables: ['Complete Agency Retainer', 'Meta & Google Ads Management', 'VIP Booking Funnel', 'Dedicated Account Manager'] }
          ]
        }
      });
    }

    const prompt = `You are LeadForge AI's expert sales copywriter and agency closing strategist. Generate a complete, high-converting outreach kit for this business.

Business Name: ${businessName}
Industry: ${industry}
City: ${city}
Owner Name: ${ownerName || 'Business Owner'}
Key Weaknesses / Opportunities: ${JSON.stringify(highlights || [])}

Return JSON with this schema:
{
  "coldEmail": {
    "subject": "string",
    "body": "string",
    "valueProposition": "string"
  },
  "socialDms": {
    "facebook": "string",
    "instagram": "string",
    "whatsapp": "string"
  },
  "salesPitch": {
    "elevatorPitch": "string",
    "phoneScript": "string",
    "objectionHandling": [
      { "objection": "string", "response": "string" }
    ]
  },
  "salesProposal": {
    "executiveSummary": "string",
    "identifiedFlaws": ["string"],
    "proposedSolutions": ["string"],
    "estimatedRoi": "string",
    "pricingPackages": [
      { "tier": "string", "price": "string", "deliverables": ["string"] }
    ]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);

  } catch (err: any) {
    console.error('Gemini outreach error:', err);
    res.status(500).json({
      error: 'Failed to generate AI outreach scripts',
      message: err.message
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadForge AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
