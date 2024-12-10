const strengthsFinder = require("../botScripts/soren/strengthsFinder.js");
const inspirationsFinder = require("../botScripts/soren/inspirationsFinder.js");

const mainController = async (body) => {
  const { nextStep, messages } = body;

  if (nextStep === "strengthsFinder") {
    const chatGptResponse = await strengthsFinder({ messages });
    return chatGptResponse;
  }
  
  if (nextStep === "inspirations" || nextStep === "inspirationsFinder") {
    const chatGptResponse = await inspirationsFinder({ messages });
    return chatGptResponse;
  }
  
  console.error(`Unknown nextStep: ${nextStep}`);
return {
  error: `Unrecognized nextStep: ${nextStep}`,
  success: false,
};
};

module.exports = mainController;
