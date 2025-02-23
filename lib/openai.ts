import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeDebtors(debtors: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a debt collection AI analyst. Your task is to analyze debtor profiles and suggest appropriate tags and segments based on their data. Consider all available factors including debt amount, age, payment history, debt type, location, and language preferences.

Available tags:
- High Priority (large amounts, long overdue, or concerning patterns)
- Medium Priority (moderate risk or amount)
- Low Priority (small amounts or good payment history)
- Payment Plan Candidate (shows willingness to pay or partial payments)
- Legal Review Needed (bankruptcy, disputes, or severe cases)
- Special Handling (language requirements or unique circumstances)
- Unresponsive (no contact or failed attempts)
- Dispute Pending (active disputes or complaints)

For each debtor, provide a structured analysis:
1. Risk Assessment:
   - Risk Level: (High/Medium/Low)
   - Key Risk Factors

2. Suggested Tags:
   - List applicable tags
   - Brief justification for each tag

3. Collection Strategy:
   - Recommended approach
   - Communication preferences
   - Special considerations

4. Priority Actions:
   - Immediate next steps
   - Timeline recommendations`
        },
        {
          role: "user",
          content: `Analyze these debtors and provide suggestions: ${JSON.stringify(debtors, null, 2)}`
        }
      ],
      stream: false,
    });

    return new Response(
      JSON.stringify({ analysis: completion.choices[0].message.content }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing debtors:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze debtors' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 