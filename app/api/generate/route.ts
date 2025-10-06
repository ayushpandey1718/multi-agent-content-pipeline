// app/api/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
// NEW: Import the Google Generative AI library
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// NEW, CORRECTED CODE
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Use the stable and globally available 'gemini-1.0-pro' model for all tasks.
// We will instruct it to create JSON using the prompt itself.
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// For simplicity, we can use the same model instance for all our calls.
const textModel = model;

// Initialize Supabase client (this stays the same)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to log agent activity (this stays the same)
async function logToSupabase(
  run_id: string,
  agent: string,
  input_data: unknown,
  output_data: unknown
) {
  const { error } = await supabase.from('agent_logs').insert({
    run_id,
    agent,
    input_data: JSON.stringify(input_data),
    output_data: JSON.stringify(output_data),
  });
  if (error) {
    console.error(`Error logging ${agent} to Supabase:`, error);
  }
}

// This is the main function that runs when we call our API
export async function POST(req: NextRequest) {
  try {
    const { prd } = await req.json();
    const run_id = crypto.randomUUID();
// NEW, STRONGER PROMPT
const researchPrompt = `Based on the following Product Requirements Document, act as a researcher. Your goal is to provide 3-5 key factual points, statistics, or quotes that would be useful for a blog post. IMPORTANT: Respond with ONLY a valid JSON object and nothing else. The JSON object must have a single key called "research_points" which contains an array of strings.

PRD: "${prd}"`;
    const researchResponse = await model.generateContent(researchPrompt);
    const researchResult = JSON.parse(researchResponse.response.text());
    await logToSupabase(run_id, 'Researcher', { prd }, researchResult);

    // --- Agent 2: Writer ---
    const writerPrompt = `You are a blog writing assistant. Use the PRD and the research notes provided to write a draft blog post of about 300 words. \n\nPRD: "${prd}"\n\nResearch Notes: ${JSON.stringify(researchResult.research_points)}`;
    // MODIFIED: Calling the text-only Gemini model
    const writerResponse = await textModel.generateContent(writerPrompt);
    let blogDraft = writerResponse.response.text();
    await logToSupabase(run_id, 'Writer', { prd, research: researchResult }, { draft: blogDraft });

    // --- Agent 3: Fact-Checker ---
    let factCheckPassed = false;
    let factCheckFeedback = '';
    for (let i = 0; i < 2; i++) { // Allow for one retry
      const factCheckerPrompt = `You are a fact-checker. Given the draft blog post and the original research notes, verify that the claims in the draft are supported by the notes. Respond with only the word 'PASS' if everything is supported. Otherwise, provide a list of unsupported claims and suggest corrections. \n\nResearch Notes: ${JSON.stringify(researchResult.research_points)}\n\nDraft: "${blogDraft}"`;
      // MODIFIED: Calling the text-only Gemini model
      const factCheckerResponse = await textModel.generateContent(factCheckerPrompt);
      const factCheckResult = factCheckerResponse.response.text();

      if (factCheckResult.trim().toUpperCase() === 'PASS') {
        factCheckPassed = true;
        await logToSupabase(run_id, 'Fact-Checker', { draft: blogDraft }, { result: 'PASS' });
        break; // Exit the loop if it passes
      } else {
        factCheckFeedback = factCheckResult;
        await logToSupabase(run_id, 'Fact-Checker', { draft: blogDraft }, { result: 'FAIL', feedback: factCheckFeedback });

        const revisionPrompt = `The fact-checker found issues with the draft. Please revise it based on the feedback. \n\nOriginal Draft: "${blogDraft}"\n\nFeedback: "${factCheckFeedback}"\n\nRevise the draft:`;
        const revisionResponse = await textModel.generateContent(revisionPrompt);
        blogDraft = revisionResponse.response.text();
        await logToSupabase(run_id, 'Writer (Revision)', { previous_draft: blogDraft, feedback: factCheckFeedback }, { revised_draft: blogDraft });
      }
    }

    // --- Agent 4: Style-Polisher ---
    const polisherPrompt = `You are a style editor. Refine the following blog post to have a friendly and engaging tone. Do not change any factual information. \n\nBlog Post: "${blogDraft}"`;
    // MODIFIED: Calling the text-only Gemini model
    const polisherResponse = await textModel.generateContent(polisherPrompt);
    const finalBlogPost = polisherResponse.response.text();
    await logToSupabase(run_id, 'Style-Polisher', { draft: blogDraft }, { final_post: finalBlogPost });

    return NextResponse.json({
      blogPost: finalBlogPost,
      factCheckStatus: factCheckPassed ? 'Passed' : 'Failed after retries',
    });

  } catch (error) {
    console.error('Error in generation pipeline:', error);
    return NextResponse.json({ error: 'Failed to generate blog post.' }, { status: 500 });
  }
}