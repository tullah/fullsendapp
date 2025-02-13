import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define types for player data
interface PlayerData {
  players: {
    name: string;
  };
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
}

interface FormattedPlayer {
  name: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
  overall: number;
}

interface PlayerStats {
  name: string;
  stats: {
    speed: number;
    throwing: number;
    awareness: number;
    catching: number;
    defense: number;
    endurance: number;
    spirit: number;
    overall: number;
  }
}

interface PlayerInput {
  name: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
}

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { promptString } = await req.json();

    if (!promptString) {
      throw new Error('No players provided');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a team formation expert. Analyze the provided players and their attributes to create two balanced teams.
Rules:
- Only use players from the input list (no duplicates or new players)
- Create teams based on overall ratings and individual skills
- Balance throwing and catching abilities across teams
- It's okay to have uneven teams if the total player count is odd
- Focus on creating competitive matchups

Return a JSON response with this structure:
{
  "teams": [
    {
      "player_name": string,
      "team": 1 or 2,
      "overall_rating": number
    }
  ]
}`
        },
        {
          role: "user",
          content: promptString
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Validate response
    const teams = JSON.parse(content);
    const playerNames = teams.teams.map((p: any) => p.player_name);
    
    // Check for duplicates
    if (new Set(playerNames).size !== playerNames.length) {
      throw new Error('Response contains duplicate players');
    }

    return NextResponse.json(teams);

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate teams'
    }, { 
      status: error.status || 500 
    });
  }
} 