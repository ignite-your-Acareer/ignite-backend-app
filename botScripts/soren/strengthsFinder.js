const openai = require("../../openai.js");
const axios = require("axios");
const { personalityPrompt } = require("../../prompts/soren/sorenPersonalityPrompt.js");
const { strengthsPrompt } = require("../../prompts/soren/strengthsPrompt.js");

async function strengthsFinder({ messages }) {
  console.log("Strengths finder messages:");
  console.log(messages);

  // Add personality and strengths-specific prompts
  messages.unshift({
    role: "system",
    content: `${personalityPrompt}\n\n${strengthsPrompt}`,
  });

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
    const functionName = response.choices[0].message.tool_calls[0].function.name;
    if (functionName === "updateStrengths") {
      console.log("Updating strengths...");
      const strengthsData = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);

      try {
        // Save strengths to Bubble database
        const saveResponse = await axios.post(
          "https://rakasha.bubbleapps.io/version-test/api/1.1/wf/save-user-strengths",
          {
            user: "1730429277720x101617448332705470",
            strengths: strengthsData.strengths, // Array
          }
        );
        console.log("Strengths updated successfully:", saveResponse.data);

        // Update the nextStep to inspirations
        const updateNextStepResponse = await axios.post(
          "https://rakasha.bubbleapps.io/version-test/api/1.1/wf/update-next-step",
          {
            user: "1730429277720x101617448332705470",
            nextStep: "inspirationsFinder",
          }
        );
        console.log("Next step updated successfully:", updateNextStepResponse.data);

        return {
          message: null,
          nextStep: "inspirations",
          success: true,
        };
      } catch (error) {
        console.error("Error updating strengths or next step:", error);
        return {
          message: "There was an error saving your strengths. Please try again.",
          nextStep: "strengthsFinder",
          success: false,
        };
      }
    }
  }

  return {
    message: response.choices[0].message.content,
    nextStep: null,
    success: true,
  };
}

module.exports = strengthsFinder;
