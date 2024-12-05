const openai = require("../../openai.js");
const axios = require("axios");

async function strengthsFinder() {
  const messages = [
    {
      role: "system",
      content: `You are Soren, an AI guide designed to help users identify their three core strengths. Your task is to engage the user in a conversation by asking thoughtful and specific questions about their skills, achievements, and experiences. Based on their responses, compile a list of three strengths that best define them. Once you have identified the three strengths, call the specified function you have access to in your tools.`,
    },
    { role: "user", content: "I want to figure out my career strengths and inspirations." },
    {
      role: "assistant",
      content: `Great! To help you identify your core career strengths, let's start by exploring your skills and experiences. Here are a few questions:

1. Can you describe a recent achievement or project that you're particularly proud of? What role did you play in it?
2. What are some skills that you find yourself using most frequently, either in your job or in daily life?
3. Are there any tasks or activities that you feel particularly energized or motivated by?

Feel free to answer any or all of these, and we'll start to identify patterns that point to your strengths.`,
    },
    {
      role: "user",
      content:
        "I'm proud of my ability to teach and mentor others. I like public speaking and explaining things to others. I also like coaching hockey!",
    },
    {
      role: "assistant",
      content: `It sounds like you have a strong passion and talent for communication and mentorship. Based on what you've shared, here are some potential core strengths:

1. **Teaching and Mentorship**: You have a knack for guiding and supporting others, which suggests you're skilled in building relationships and fostering growth in people.

2. **Public Speaking and Communication**: Enjoying public speaking and explaining things indicates you're confident and effective in conveying information clearly and engagingly.

3. **Coaching and Leadership**: Your interest in coaching hockey shows that you not only enjoy teaching but also leading and motivating teams towards common goals.

Does this resonate with you? If so, I can save these as your identified strengths. If there's anything else you'd like to add or adjust, let me know!`,
    },
    { role: "user", content: "Yes, these are my strengths!" },
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "updateStrengths",
        description: "Saves information about the user's strengths.",
        parameters: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: {
                type: "string",
              },
              description: "An array of the user's strengths.",
            },
          },
          required: ["strengths"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log(response.choices[0].message.content);

  if (response.choices[0].message.tool_calls) {
    const functionName = response.choices[0].message.tool_calls[0].function.name;
    if (functionName === "updateStrengths") {
      console.log("Updating strengths...");
      const strengthsData = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);

      try {
        const response = await axios.post("https://rakasha.bubbleapps.io/version-test/api/1.1/wf/save-user-strengths", {
          user: "1727397844969x668673440780892300",
          strengths: strengthsData.strengths,
        });
        console.log("Strengths updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating strengths:", error);
      }
    }
  }
}

module.exports = strengthsFinder;
