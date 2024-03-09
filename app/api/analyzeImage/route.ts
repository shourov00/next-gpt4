import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

// runtime needs to be edge in order to work with OpenAIStream and StreamingTextResponse
export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(request: Request) {
  const { image } = await request.json();
  const response = await openai.createChatCompletion({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 4096, // No max tokens: super short / cut off response
    messages: [
      {
        role: "user",
        // @ts-ignore
        content: [
          {
            type: "text",
            text: "What's in this image?",
          },
          {
            type: "image_url",
            image_url: image, // base64 images
          },
        ],
      },
    ],
  });

  // converting response to stream
  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
