const openai = require("../../openai.js");
const axios = require("axios");
const { sorenSystemPrompt } = require("../../prompts/soren/careerBuilder.js");

async function strengthsFinder({ messages }) {
  console.log("Strengths finder messages:");
  console.log(messages);
  messages.unshift({ role: "system", content: sorenSystemPrompt });
  console.log("THESE ARE THE MESSAGES COMING INTO STRENGTHS FINDER");
  console.log(messages);
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

  console.log("Strengths finder response:");
  console.log(response.choices[0].message);
  console.log(response.choices[0].message.tool_calls);

  if (response.choices[0].message.tool_calls) {
    console;
    const functionName = response.choices[0].message.tool_calls[0].function.name;
    if (functionName === "updateStrengths") {
      console.log("Updating strengths...");
      const strengthsData = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);

      try {
        const response = await axios.post("https://rakasha.bubbleapps.io/version-test/api/1.1/wf/save-user-strengths", {
          user: "1730429277720x101617448332705470",
          strengths: strengthsData.strengths,
        });
        console.log("Strengths updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating strengths:", error);
      }

      return {
        message: null,
        nextStep: "interviewPrep",
        success: true,
      };
    }
  }
  return {
    message: response.choices[0].message.content,
    nextStep: null,
    success: true,
  };
}

module.exports = strengthsFinder;
