const strengthsFinder = require("../botScripts/soren/strengthsFinder.js");

const mainController = async (body) => {
  const { nextStep, messages } = body;

  if (nextStep === "strengthsFinder") {
    const chatGptResponse = await strengthsFinder({ messages });
    return chatGptResponse;
  }

  return {
    success: "Request received from main controller!",
  };
};

module.exports = mainController;
