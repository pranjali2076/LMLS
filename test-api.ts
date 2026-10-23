import path from 'path';
import dotenv from 'dotenv';
import { JevDecision } from '@/types';

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export async function testGemini(): Promise<void> {
  const key = process.env.GEMINI_API_KEY || process.env.HEALTH_AI_API_KEY;
  console.log("Testing Google Generative Language API with key from environment...");

  if (!key) {
    console.error("Error: GEMINI_API_KEY (or HEALTH_AI_API_KEY) not found in environment variables.");
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log("Gemini Status:", res.status);
    console.log("Gemini Models response:", JSON.stringify(data).slice(0, 400));
  } catch (err) {
    console.error("Gemini Fetch error:", err);
  }
}

export async function testJev(): Promise<void> {
  console.log("Testing Jev / TypeSafe Decision Engine (Local Fallback & Mock Simulation)...");

  // NOTE: TypeSafe AI requires paid billing credits to generate an active API key.
  // The live network call to https://api.typesafe.ai/v1/systemone is commented out below:
  /*
  const key = process.env.TYPESAFE_API_KEY || process.env.JEV_DECISION_API_KEY;
  try {
    const res = await fetch("https://api.typesafe.ai/v1/systemone", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "jev-latest",
        state: "Patient presents with fatigue at 2 PM and difficulty sleeping.",
        questions: {
          urgency: {
            type: "choice",
            instructions: "What is the recommended triage urgency?",
            criteria: ["low", "medium", "high"]
          }
        }
      })
    });
    console.log("Jev Status:", res.status);
    const data = await res.text();
    console.log("Jev Response:", data.slice(0, 400));
  } catch (err) {
    console.error("Jev Fetch error:", err);
  }
  */

  // Local resilient mock decision (matches src/lib/externalServices.ts fallback)
  const mockDecision: JevDecision = {
    decisionId: `JEV-LOCAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    triageScore: 52,
    recommendedUrgency: "medium",
    actionPathway: "Cardiovascular Endurance & Circadian Recovery Protocol (72h Biomarker Log)",
    riskFactors: ["Elevated endothelial stress, adenosine saturation, or sedentary fatigue"],
    decisionConfidence: "98.8%",
    checkpointDeadline: "Tomorrow, 8:00 AM"
  };

  console.log("Jev Status: 200 (Mock / Local Fallback Active)");
  console.log("Jev Decision:", JSON.stringify(mockDecision));
}

export async function main(): Promise<void> {
  console.log("=== Running API Connectivity Tests ===");
  await testGemini();
  console.log("--------------------------------------");
  await testJev();
  console.log("=== All Tests Completed ===");
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch((err) => {
    console.error("Execution error:", err);
    process.exit(1);
  });
}
