import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { players } = await req.json();

    if (!players || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { error: 'No players provided' },
        { status: 400 }
      );
    }

    const prompt = `As an Ultimate Frisbee team formation expert, create two balanced teams from these players. Consider their ratings and assign roles (Handler/Receiver/Utility).

Player Data:
${players.map((p: PlayerStats) => 
  `${p.name} (Overall: ${p.stats.overall}):
   - Speed: ${p.stats.speed}
   - Throwing: ${p.stats.throwing}
   - Awareness: ${p.stats.awareness}
   - Catching: ${p.stats.catching}
   - Defense: ${p.stats.defense}
   - Endurance: ${p.stats.endurance}
   - Spirit: ${p.stats.spirit}`
).join('\n\n')}

Create two evenly matched teams. For each player, specify:
1. Their team (1 or 2)
2. Their role (Handler/Receiver/Utility)
3. Their overall rating

Format your response as a JSON object with a "teams" array containing objects with properties:
{
  "teams": [
    {
      "player_name": string,
      "team": number,
      "role": string,
      "overall_rating": number
    }
  ]
}

Ensure teams are balanced in both overall rating and roles distribution.`;

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert Ultimate Frisbee team formation assistant. You analyze player stats and create balanced teams."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const response = JSON.parse(content);
      
      if (!response.teams || !Array.isArray(response.teams)) {
        throw new Error('Invalid response format from AI');
      }

      return NextResponse.json(response.teams);
    } catch (openAIError: any) {
      if (openAIError.error?.type === 'insufficient_quota') {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      throw openAIError;
    }

  } catch (error) {
    console.error('Error generating teams:', error);
    return NextResponse.json(
      { error: 'Failed to generate teams' },
      { status: 500 }
    );
  }
} 