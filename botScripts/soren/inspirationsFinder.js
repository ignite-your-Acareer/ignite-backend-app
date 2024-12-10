const openai = require("../../openai.js");
const axios = require("axios");
const { personalityPrompt } = require("../../prompts/soren/sorenPersonalityPrompt.js");
const { inspirationsPrompt } = require("../../prompts/soren/inspirationsPrompt.js");

async function inspirationsFinder({ messages }) {
  console.log("Inspirations finder messages:");
  console.log(messages);
  messages.unshift({
    role: "system",
    content: `${personalityPrompt}\n\n${inspirationsPrompt}`,
  });

  const tools = [
    {
      type: "function",
      function: {
        name: "updateInspirations",
        description: "Saves information about the user's inspirations.",
        parameters: {
          type: "object",
          properties: {
            inspirations: {
              type: "array",
              items: {
                type: "string",
              },
              description: "An array of the user's top six inspirations.",
            },
          },
          required: ["inspirations"],
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

  console.log("Inspirations finder response:");
  console.log(response.choices[0].message);
  console.log(response.choices[0].message.tool_calls);

  if (response.choices[0].message.tool_calls) {
    const functionName = response.choices[0].message.tool_calls[0].function.name;
    if (functionName === "updateInspirations") {
      console.log("Updating inspirations...");
      const inspirationsData = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);

      try {
        // Save inspirations to Bubble database
        const saveResponse = await axios.post(
          "https://rakasha.bubbleapps.io/version-test/api/1.1/wf/save-user-inspirations",
          {
            user: "1730429277720x101617448332705470",
            inspirations: inspirationsData.inspirations, // Array
          }
        );
        console.log("Inspirations updated successfully:", saveResponse.data);

        // Update the nextStep to "environment"
        const updateNextStepResponse = await axios.post(
          "https://rakasha.bubbleapps.io/version-test/api/1.1/wf/update-next-step",
          {
            user: "1730429277720x101617448332705470",
            nextStep: "environment",
          }
        );
        console.log("Next step updated successfully:", updateNextStepResponse.data);

        return {
          message: null,
          nextStep: "environment",
          success: true,
        };
      } catch (error) {
        console.error("Error updating inspirations or next step:", error);
        return {
          message: "There was an error saving your inspirations. Please try again.",
          nextStep: "inspirationsFinder",
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

module.exports = inspirationsFinder;
