import { Channel } from "./types";

export interface ChannelConfig {
  id: Channel;
  label: string;
  description: string;
  rules: string;
  maxTokens: number;
}

export const CHANNELS: ChannelConfig[] = [
  {
    id: "social",
    label: "Social",
    description: "Instagram and TikTok captions",
    maxTokens: 1024,
    rules: `SOCIAL RULES (INSTAGRAM + TIKTOK):
- Return two fields: "hook" and "caption".
- Hook: maximum 8 words. A standalone punchy opener — works as a TikTok first line or as the opening of an Instagram caption. Creates curiosity, tension, or makes a direct statement. No preamble.
- Caption: 1 to 3 sentences. Anchors a product truth. Does not describe the photo or video — it adds to it.
- Hook styles: General = choose whichever style best suits the product and brief. Statement = bold claim. Question = specific question. Observation = notices something unexpected. Challenge = invites action.
- Lead with the strongest line. If the hook doesn't earn attention, cut it.
- Dry wit is welcome when it earns its place. Never forced.
- When hashtags are requested: 3 to 5 tags appended to the caption on a new line. Always include #memobottle first.
- Short = hook + 1 sentence. Standard = hook + 2 sentences. Long = hook + 3 sentences + hashtag line.
- No em dashes. No exclamation marks. No slang.`,
  },
  {
    id: "edm",
    label: "EDM",
    description: "Email campaigns",
    maxTokens: 2048,
    rules: `EDM RULES:
- Return five fields: subjectLine, previewText, heroHeadline, body, cta.
- Subject line: 4 to 8 words. Sentence case. No emoji. No exclamation marks.
- Preview text: 8 to 15 words. Extends the subject — does not repeat it.
- Hero headline: 2 to 6 words. ALLCAPS is acceptable for hero text only (e.g. DRINK PINK).
- Body: 3 to 5 short paragraphs. Maximum 2 sentences each. No preamble ("We're excited to..." is banned).
- THEME is the overriding direction — every part of the email must serve it. Never drift from it.
- EMAIL TYPE calibrates depth and product-forwardness: Evergreen/Brand = story-first, empathy-led; Product Launch = product as character; Sale = deal-first, brief; Winback = warm, no guilt; Welcome = brand before product.
- CUSTOMER TYPE calibrates register: High intent = minimal friction; Winback/Lapsed = warmth first; New subscriber = earn trust before selling; VIP = insider tone.
- When multiple products are included: weave them together around the theme — do not list them sequentially.
- When no product is selected: this is a brand or story email. Do not invent product references. Focus on connection, voice, and brand values.
- CTA: 2 to 4 words, verb-led. (Shop Now, Explore Sage, Get 20% Off)
- When includeFooter is true: end body with "BETTER PRODUCTS · B CORP · BIGGER PURPOSE / Proud supporter of Water.org"
- No em dashes anywhere. No exclamation marks.

---

EDM STRUCTURE GUIDE — OBSERVED ACROSS 60+ REAL CAMPAIGNS:

The following patterns are drawn from the full memobottle EDM library (2024-2025). Use these as structural blueprints. Do not invent new conventions — match what has been proven.

## SUBJECT LINE PATTERNS BY TYPE

Product launch:
- Named colourway: "[Colour] is here" / "Introducing [Product]" / verb-led pun tied to colour (e.g. "Play it Cool" for Cool Grey, "Cherry-picked for you" for Cherry Blossom)
- Limited edition/scarcity: "Final drop coming tomorrow" / "50 units reserved for subscribers"
- Teaser: date only ("25-02-25") or cryptic category hint ("We're adding to the A-team")

Sale / promotional:
- Offer-first: "Enjoy $20 off your next order" / "50% off accessories"
- Deadline-led: "Ends tonight: $20 off" / "Last chance to claim 50% off"
- Holiday-pegged sale: Subject names the occasion — "Our Boxing Day event is here"
- Black Friday: Often bold and direct — "Up to 40% off sitewide — yes, everything"

Seasonal gifting:
- Benefit for the giver: "Dad deserves an A+" / "Pass Father's Day with flying colours"
- Last minute: "The last-minute gift that's right on time" / "It's not too late"
- Occasion + offer combined: "Father's Day offer: free Silicone Sleeve"
- Urgency without guilt: "Final call for Father's Day" (never guilt-trip language)

Brand / content:
- Question or tension: "Have we got it wrong?" / "Dig the well before you're thirsty"
- Cause-led: Straightforward — "This World Rainforest Day, we're taking action"
- Year in review: "Thanks for the Memo-ries"

## HERO HEADLINE PATTERNS

Product launch — naming the moment:
- ALLCAPS for impact: "SATIN HAS LANDED" / "DRINK PINK" / "NUTS ABOUT PISTACHIO"
- Wordplay earned by the product name: "NOW SERVING: BUTTER YELLOW" / "Play it Cool" / "Cherry-picked for you"
- Simple and declarative: "The A3 Daily Tote is here." / "Copper is here."

Sale:
- Deal-first statement: "Up to 40% off sitewide — yes, everything."
- Wit + offer: "15% OFF? Yes, please." / "WE'RE OUT OF OFFICE — COPY THIS CODE"
- Occasion: "OUR BOXING DAY EVENT IS HERE"

Gifting:
- Pun tied to the product/occasion: "Dad deserves an A+" / "Every king needs his crown" / "Gift-giving is our love language"
- Last-minute rescue: "The last-minute gift that's right on time"
- Seasonal wordplay: "Oh the weather outside is frightful, but this deal is so delightful"

Brand / cause:
- Statement of intent: "THIS WORLD RAINFOREST DAY, WE'RE TAKING ACTION."
- Human-first: "Have we got it wrong?" / "Thanks for the Memo-ries"
- Challenge-specific: "HALF A MOUSTACHE, A WHOLE LOT OF PURPOSE"

## BODY COPY STRUCTURE BY EMAIL TYPE

### Product launch — new colourway
1. One-line description of the colour's character (sensory, evocative, 1 sentence)
2. Named colour sections with 1-sentence descriptors (e.g. INSIDE THE PALETTE / MADE FOR YOU / CARRY WATER DIFFERENTLY)
3. One closing line that frames who the bottle is for or what it represents
4. CTA: DISCOVER [COLOUR] / SHOP NOW

### Product launch — new product (hardware/bag/accessory)
1. Problem/benefit opening — what gap does it fill
2. Features as named modules (ULTRA-SLIM DESIGN / PADDED LAPTOP POCKET) — each 1 line
3. Part-of-ecosystem mention (fits with the memobottle you already have)
4. CTA: EXPLORE THE RANGE / SHOP NOW

### Limited edition / scarcity drop
1. Announce it is live and limited (1 sentence)
2. The distinctive detail — what makes it special (1-2 sentences)
3. Scarcity signal: "Only X units" / "Once they're gone, they won't return"
4. CTA: SHOP NOW / GET IN QUICK

### Sale launch
1. State the offer immediately — discount %, what it covers
2. Any gift-with-purchase or tiered offer details (brief)
3. Optional: one sentence of permission/invite ("consider this your sign to treat yourself")
4. CTA: SHOP SALE / SHOP NOW

### Sale countdown / urgency
- Keep it very short — 2-3 paragraphs max
- State what's left to claim, not what's ending
- One line of wit if appropriate ("before we box up our Boxing Day offer...")
- CTA: SHOP NOW / GET IN QUICK

### Seasonal gifting — launch
1. Frame the occasion briefly (1 sentence)
2. State the offer (what product + what they get free or saved)
3. Optional: team picks section — each pick is: name + product + 1-line quote
4. Deadline reminder
5. CTA: SHOP NOW / SHOP FOR [OCCASION]

### Seasonal gifting — last minute
- Very short — 2 paragraphs
- Wit about the lateness (never shame)
- Direct solution: e-gift cards / Amazon / in-store
- CTA: SHOP GIFT CARDS / FIND A STORE NEAR YOU

### Brand / cause / content
1. Human opening — observation, question, or personal moment
2. The point: what are we standing for / doing / reflecting on
3. Team voices if relevant (individual names + quotes, authentic not polished)
4. Gentle call to participate — never pressure
5. CTA: READ MORE / LEARN MORE / DONATE AND WIN

### Survey
- Minimal copy — let the action be the hero
- One-line opener in voice (optional)
- What they'll win, how long it takes
- CTA: TAKE THE SURVEY

## EMAIL SERIES CONVENTIONS

When writing an email that is part of a series, the register escalates:
- Email 1 (launch): full story, warmth, all product details
- Email 2 (reminder): shorter, specific angle (team picks / colour spotlight / feature focus)
- Email 3 (final call): shortest — urgency is stated once, no padding, strong CTA

The "last chance" email is always the shortest. 2-3 paragraphs maximum. One line of wit, one clear deadline, one CTA.

Subject lines across a series escalate: launch uses invitation language, reminder uses benefit, final uses urgency — but never guilt.

## STRUCTURAL CONVENTIONS OBSERVED ACROSS THE LIBRARY

- Named feature modules (e.g. FORM + FUNCTION / MADE FOR YOU) are used for product launches and colour emails. Each module = short ALLCAPS title + 1-2 sentence description.
- Team picks are formatted as: NAME'S PICK / product name + colour / 1-line personal quote. Used in Father's Day, Mother's Day, Boxing Day, and Father's Day 2025. Always named real team members.
- Offer T&Cs appear as a plain-text footnote at the bottom of the body — never inline.
- "BETTER PRODUCTS · B CORP · BIGGER PURPOSE" is a footer only — never body copy.
- The footer trust block: Multi-award winning design / 2-year manufacturing warranty / Designed in Australia / Proud supporter of Water.org
- Opt-out emails (Father's Day, Mother's Day) are brief, empathetic, and give both opt-outs in the same email.
- The "OOO" (Out Of Office) framing was used for Boxing Day 2024 — a rare personality device, not a template.
- Kickstarter campaigns use segment variants: EOI (early access/expression of interest), REG (general registrant), META (paid audience). The copy is nearly identical across variants — only 1-2 words differ to reflect access level.
- B2B/corporate emails targeting D2C subscribers use an "ask the boss" angle — encouraging consumers to advocate upward rather than buying direct.

## COPY DEVICES THAT APPEAR MOST FREQUENTLY

1. Extended metaphor tied to colour name (Butter Yellow food metaphor, Cherry Blossom season metaphor)
2. The "it's been X years" acknowledgement (BFCM 2025: "first sale in 5 years")
3. "Get in quick" / "First in, best dressed" — scarcity without aggression
4. Co-founder voice — Jesse and Jonno named and quoted directly in milestone/cause emails
5. Pop culture reference for seasonal tone ("Monica and Chandler" / "That's that me, espresso")
6. Christmas wordplay: pun on the occasion word ("Fa-la-la-la-last chance" / "'Tis the season to be buttery")
7. Permission-giving openers for sales: "Consider this your sign to treat yourself"
8. Three-item lists as a structural beat: "Brunch, to the office, and beyond" / "Tokyo's neon streets to Kyoto's hidden shrines"`,
  },
  {
    id: "pdp",
    label: "Product Description",
    description: "Product descriptions, bullets, and SEO fields",
    maxTokens: 1536,
    rules: `PRODUCT DESCRIPTION RULES:
- Return five fields: shortDesc, bullets (array of strings), fullDesc, seoTitle, seoMetaDesc.
- Short description: 1 to 2 sentences. Name the form factor in sentence 1. No exclamation marks.
- Bullets: 4 to 6 items. Fragment style — each is one product truth, not a vague benefit claim.
  Bullets do not begin with gerunds ("Fitting..." → "Fits...").
  Each bullet is a specific, verifiable fact about the product.
- Full description: 2 to 4 sentences. Benefit-first, spec-second. Functional-poetic register.
  Must name the form factor. Must not describe the product as "a water bottle" alone.
- SEO title: product name + single most important differentiator. Maximum 60 characters. No | or — separators. Plain text.
- SEO meta description: benefit-led, reads naturally, 140 to 155 characters. Not a list. No exclamation marks.
- Use the provided product details (material, finish, dimensions, capacity, colour character) as the factual foundation.
- For new colours: lead with the colour's character and mood, not just the name. Treat the colourway as a design decision, not a paint job.
- For new product categories: establish the form factor clearly before layering benefits.
- Write around durability with confidence — no caveats, no fragility implications.
- No em dashes. No exclamation marks. British/Australian spelling throughout.`,
  },
];

export function getChannel(id: Channel): ChannelConfig {
  const channel = CHANNELS.find((c) => c.id === id);
  if (!channel) throw new Error(`Unknown channel: ${id}`);
  return channel;
}

export function isValidChannel(id: string): id is Channel {
  return ["social", "edm", "pdp"].includes(id);
}
