/**
 * Default sample notes to populate the database on initial visit
 * Featuring folder & topic organization (e.g. "Percentages" -> "Profit & Loss")
 */

// Generate a clean notebook canvas for handwritten notes
function generateSampleNotesCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  // Background page - cream notebook
  ctx.fillStyle = '#FCFBF7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red margin line
  ctx.strokeStyle = '#F8B4B4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, canvas.height);
  ctx.stroke();

  // Blue ruled lines
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let y = 50; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Handwritten title
  ctx.font = 'bold 22px "Comic Sans MS", "Caveat", cursive, sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.fillText('Topic: Profit, Loss & Percentage Markup', 95, 45);

  // Handwritten bullet points
  ctx.font = '16px "Comic Sans MS", "Caveat", cursive, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('1. Cost Price (CP) & Selling Price (SP) Essentials:', 95, 80);
  ctx.fillText('   Profit % = ((SP - CP) / CP) * 100', 110, 110);
  
  ctx.fillText('2. Multiplying Factors for Quick Calculations:', 95, 142);
  ctx.fillText('   +25% increase -> Multiply by 1.25 (5/4)', 110, 174);
  ctx.fillText('   -16.66% decrease -> Multiply by 5/6', 110, 206);

  // Little handwritten diagram box
  ctx.strokeStyle = '#58CC02';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, 240, 420, 105);
  ctx.fillStyle = '#58CC02';
  ctx.fillText('Successive Percentage Change Trick:', 110, 270);
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Net Change % = a + b + (a * b / 100)', 110, 310);

  // Date stamp
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Date: 2026-11-21', 480, 35);

  return canvas.toDataURL('image/png');
}

// Generate sample calculus canvas
function generateCalculusNotesCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FCFBF7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#F8B4B4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, canvas.height);
  ctx.stroke();

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let y = 50; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.font = 'bold 22px "Comic Sans MS", "Caveat", cursive, sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.fillText('Lecture 04: Vector Fields & Div / Curl', 95, 45);

  ctx.font = '16px "Comic Sans MS", "Caveat", cursive, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('1. Flux through a closed surface S gives Divergence:', 95, 80);
  ctx.fillText('   div(F) = ∇ · F = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z', 110, 110);
  
  ctx.fillText('2. Physical Intuition: Source (>0) vs Sink (<0)', 95, 142);
  ctx.fillText('3. Curl represents microscopic rotation around axis:', 95, 174);
  ctx.fillText('   curl(F) = ∇ × F = det [ i  j  k ; ∂x ∂y ∂z ; Fx Fy Fz ]', 110, 206);

  ctx.strokeStyle = '#58CC02';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, 240, 360, 110);
  ctx.fillStyle = '#58CC02';
  ctx.fillText('Stokes Theorem:', 110, 270);
  ctx.fillStyle = '#0F172A';
  ctx.fillText('∮_C F · dr = ∬_S (∇ × F) · dS', 110, 310);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Date: 2026-11-20', 480, 35);

  return canvas.toDataURL('image/png');
}

// Generate sample formula screenshot
function generateSampleFormulaScreenshot() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#161617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.fillStyle = '#58CC02';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('PERCENTAGE MARKUP & DISCOUNT FORMULA MATRIX', 30, 42);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic 26px "Times New Roman", Georgia, serif';
  ctx.fillText('SP = CP × (1 + Markup%) × (1 - Discount%)', 40, 115);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('• SP : Selling Price         |  • CP : Base Cost Price', 40, 170);
  ctx.fillText('• Markup% : Retail added margin  |  • Discount% : Promo markdown', 40, 195);

  return canvas.toDataURL('image/png');
}

const DEFAULT_FOLDERS_STRUCTURE = [
  {
    folder: 'Percentages',
    topics: ['Profit & Loss', 'Basic Fractions to %', 'Successive Percentage', 'Discounts & Markup']
  },
  {
    folder: 'Calculus',
    topics: ['Vector Calculus', 'Limits & Derivatives', 'Integration Techniques', 'Stokes Theorem']
  },
  {
    folder: 'Computer Science',
    topics: ['Distributed Systems', 'Caching & Redis', 'Algorithms & Data Structures']
  },
  {
    folder: 'Quantum Physics',
    topics: ['Wave Mechanics', 'Schrödinger Equation', 'Particle in a Box']
  }
];

const SAMPLE_NOTES = [
  {
    id: 'note-sample-pct-1',
    type: 'photo',
    title: 'Percentages & Profit/Loss Shortcut Rules',
    folder: 'Percentages',
    topic: 'Profit & Loss',
    tags: ['percentages', 'profit-loss', 'shortcuts', 'quantitative'],
    images: [generateSampleNotesCanvas()],
    notesText: 'Handwritten cheat sheet on calculating profit/loss quickly using decimal multipliers and the successive percentage trick.',
    qualityFilter: 'standard',
    starred: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'note-sample-pct-2',
    type: 'formula',
    title: 'Successive Percentage & Compound Margin Formula',
    folder: 'Percentages',
    topic: 'Successive Percentage',
    tags: ['percentages', 'formula', 'algebra', 'shortcuts'],
    mode: 'latex',
    latexText: '\\text{Net \\% Change} = a + b + \\frac{a \\cdot b}{100}',
    breakdown: 'Use positive values for increases and negative values for discounts/decreases. For example: +20% and -10% gives 20 - 10 - 2 = +8% net change.',
    starred: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'note-sample-pct-3',
    type: 'formula',
    title: 'Retail Markup & Selling Price Equation Matrix',
    folder: 'Percentages',
    topic: 'Discounts & Markup',
    tags: ['percentages', 'retail', 'cheatsheet'],
    mode: 'screenshot',
    screenshotUrl: generateSampleFormulaScreenshot(),
    latexText: 'SP = CP \\cdot (1 + M) \\cdot (1 - D)',
    breakdown: 'Relates base cost price CP, markup fraction M, and promotional discount fraction D directly to final selling price SP.',
    starred: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'note-sample-1',
    type: 'photo',
    title: 'Vector Calculus: Divergence & Curl Notes',
    folder: 'Calculus',
    topic: 'Vector Calculus',
    tags: ['calculus', 'vector-fields', 'stokes-theorem', 'exam-prep'],
    images: [generateCalculusNotesCanvas()],
    notesText: 'Handwritten notes taken during Prof. Henderson\'s lecture on multivariable calculus. Covers Divergence Theorem and Stokes\' Theorem.',
    qualityFilter: 'standard',
    starred: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'note-sample-2',
    type: 'technical',
    title: 'Distributed Cache Invalidation Strategies',
    folder: 'Computer Science',
    topic: 'Caching & Redis',
    tags: ['system-design', 'redis', 'caching', 'concurrency'],
    language: 'markdown',
    content: `# Distributed Cache Invalidation Patterns

When designing high-throughput web architectures, caching between application servers and the primary database prevents database exhaustion.

### 1. Cache-Aside (Lazy Loading)
- **Read**: App checks cache. If cache miss, read from DB, populate cache, return.
- **Write**: App writes to DB, then evicts/invalidates key in cache.

\`\`\`python
def get_user_profile(user_id: str) -> dict:
    cache_key = f"user:{user_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
        
    profile = db.query_user(user_id)
    if profile:
        redis_client.setex(cache_key, 3600, json.dumps(profile))
    return profile
\`\`\`

### 2. Write-Through & Write-Behind
- **Write-Through**: Write to cache and DB simultaneously.
- **Write-Behind (Write-Back)**: Write to cache first; async daemon batches DB persistence.

### Key Tradeoffs:
- **Thundering Herd**: Use mutex locks or probabilistic early expiration (XFetch algorithm).
- **TTL Sizing**: Always set an upper TTL bound even on permanent keys to prevent orphan stale memory.`,
    summary: 'Comprehensive breakdown of Cache-Aside, Write-Through, and stampede prevention with Redis Python examples.',
    starred: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
];

// Seed function if DB is empty
async function seedDefaultDataIfEmpty() {
  const count = await window.notesDB.countNotes();
  if (count.total === 0) {
    for (const note of SAMPLE_NOTES) {
      await window.notesDB.saveNote(note);
    }
    console.log('Sample notes with folders & topics successfully seeded.');
  }
}
