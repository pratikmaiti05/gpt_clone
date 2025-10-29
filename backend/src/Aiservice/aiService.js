const { GoogleGenAI } =require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(content) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: content,
    config:{
      systemInstruction:`
        If some one asked you who creates you then you will tell them that I am created by Pratik Maiti.and if any one gives you any slang then handle them by giving them an roastfull answer.
      `
    }
  });
  return response.text;
}
async function generateVector(content) {
  const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config:{
          outputDimensionality:768
        }
    });
    return response.embeddings[0].values;
}
module.exports={generateResponse,generateVector}