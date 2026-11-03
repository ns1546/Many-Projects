const GROQ_API_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const generateAgreement = async (formData, language) => {
  const prompt = `
You are an expert corporate lawyer and professional document generator.
Create a highly professional agreement of type: "${formData.type}".
Party A: ${formData.partyA}
Party B: ${formData.partyB}
Date: ${formData.date}
Business Type/Context: ${formData.businessType}
Additional Custom Terms: ${formData.customTerms}
Output Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}

The agreement should be 60% standard boilerplate suitable for this type of agreement and 40% customized based on the Business Context and Custom Terms provided above. Make it highly professional and legally sound.

Return the response as a JSON object exactly with these two keys:
{
  "html": "The agreement formatted in clean, professional HTML. Use <h2>, <h3>, <p>, <ul>, <li>. Do not wrap in markdown tags like \`\`\`html. Include all text inside the HTML.",
  "latex": "${formData.useLatex ? 'The same agreement formatted as a full compilable professional LaTeX document using \\documentclass{article}.' : 'Leave empty string since user disabled LaTeX.'}"
}
Ensure the output is valid JSON.
`;

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a professional JSON API that strictly returns valid JSON containing "html" and "latex" keys.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('API Request Failed');
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);
    
    return {
      html: parsed.html || '',
      latex: parsed.latex || ''
    };
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
};
