const fs = require('fs');
const path = require('path');

// Helper to load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

const apiKey = process.env.NVIDIA_API_KEY;
const baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const model = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

/**
 * Robust fetch wrapper that handles API requests to the NVIDIA NIM endpoint
 */
async function callLLM(systemPrompt, userPrompt) {
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not defined in environment/.env');
  }

  const url = `${baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NVIDIA API call failed: ${response.status} ${response.statusText} - ${text}`);
  }

  const result = await response.json();
  if (!result.choices || result.choices.length === 0) {
    throw new Error('NVIDIA API returned empty choices');
  }

  return result.choices[0].message.content;
}

/**
 * Extracts structured club data from raw openfootball text lines
 */
async function extractClub(rawText, country) {
  const systemPrompt = `You are a strict data extraction assistant.
Extract information about a football club from the raw openfootball text line and its subsequent alias/comment lines.
The country of the club is "${country}".

The output MUST be a valid JSON object matching the following structure:
{
  "name": "Official name of the club (string, required)",
  "city": "City/location of the club (string, null if not mentioned)",
  "founded": 1905, // (integer year, null if not mentioned)
  "stadium": "Home stadium name (string, null if not mentioned, strip '@' prefix)",
  "aliases": ["Alternative names/short names listed in text (array of strings, empty array if none)"],
  "discontinuities": [
    // Array of objects matching any refoundation or bankruptcy mentions in the comments/text.
    // e.g. "founded in 1921 and formerly known as Hampton FC" or "bankrupted and folded in 2018."
    // Each object must have:
    // "year": (integer year of event, e.g. 2018 or 1921. Use null if not mentioned but implied)
    // "type": "bankruptcy" | "reformation" | "merger" | "dissolution" | "other" (string)
    // "notes": "Detailed description of the event" (string)
  ]
}

Strict constraints:
1. Extract values EXACTLY as they are mentioned in the text.
2. Return null for fields that are not mentioned or cannot be inferred from the text (do not guess!).
3. Do not include markdown code block formatting (e.g. \`\`\`json). Return ONLY the raw JSON string starting with { and ending with }.`;

  const rawJson = await callLLM(systemPrompt, rawText);
  
  // Clean markdown if present
  let cleaned = rawJson.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON response from LLM:', cleaned);
    throw err;
  }
}

/**
 * Generates search query terms to find the club on Wikidata
 */
async function getWikidataCandidates(clubName, country) {
  const systemPrompt = `You are a Wikidata search term generator.
Given a football club name and country, return a JSON array of 1-3 string candidates to search Wikidata for.
For example, for "Chelsea FC" in "England", you could return ["Chelsea F.C.", "Chelsea Football Club"].
The output MUST be a valid JSON array of strings (e.g. ["Query 1", "Query 2"]). Do not include markdown code blocks.`;

  const userPrompt = `Club Name: "${clubName}"\nCountry: "${country}"`;
  const rawJson = await callLLM(systemPrompt, userPrompt);

  let cleaned = rawJson.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse candidates JSON from LLM:', cleaned);
    // Fallback candidate
    return [clubName];
  }
}

module.exports = {
  extractClub,
  getWikidataCandidates
};
