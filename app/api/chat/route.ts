import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  createUIMessageStream,
  UIMessage,
  createUIMessageStreamResponse,
} from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { message }: { message: string } = await req.json();

  const stream = createUIMessageStream<UIMessage>({
    execute: async ({ writer }) => {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        messages: convertToModelMessages([
          { role: "user", parts: [{ type: "text", text: message }] },
        ]),
        stopWhen: stepCountIs(5),
        tools: {
          weather: tool({
            description: "Get the weather in a location (fahrenheit)",
            inputSchema: z.object({
              location: z
                .string()
                .describe("The location to get the weather for"),
            }),
            execute: async ({ location }) => {
              const weather = await getWeather(location);

              writer.write({
                type: "data-weather",
                id: "weather-1", // Same ID = update existing part
                data: {
                  city: "San Francisco",
                  weather: "sunny",
                  status: "success",
                },
              });

              return {
                location,
                weather,
              };
            },
          }),
          createDocument: tool({
            description: "Create a document with streaming progress updates",
            inputSchema: z.object({
              title: z.string().describe("The title of the document"),
              content: z
                .string()
                .describe("The main content/topic of the document"),
              format: z
                .enum(["markdown", "html", "text"])
                .default("markdown")
                .describe("The format of the document"),
            }),
            execute: async ({ title, content, format }) => {
              const documentId = crypto.randomUUID();

              // Stream initial status
              writer.write({
                type: "data-document",
                id: documentId,
                data: {
                  status: "starting",
                  title,
                  progress: 0,
                  message: "Starting document creation...",
                },
              });

              // Generate the complete document using LLM with streaming
              const documentResult = await streamText({
                model: openai("gpt-4o-mini"),
                messages: [
                  {
                    role: "user",
                    content: `Write a comprehensive document titled "${title}" about ${content}. 
                    
                    The document should be well-structured with:
                    - A clear introduction
                    - Detailed main content with proper headings
                    - Key points and important information
                    - A conclusion with actionable takeaways
                    
                    Format as markdown with proper headings, lists, and emphasis where appropriate.
                    Make it informative and engaging.`,
                  },
                ],
              });

              let fullDocument = "";
              let progress = 0;

              // Stream the content as it's being generated
              for await (const chunk of documentResult.textStream) {
                fullDocument += chunk;
                progress = Math.min(
                  95,
                  Math.round((fullDocument.length / 2000) * 95)
                ); // Estimate progress based on content length

                // Stream real-time updates with current content
                writer.write({
                  type: "data-document",
                  id: documentId,
                  data: {
                    status: "processing",
                    title,
                    progress,
                    message: "Generating document content...",
                    documentPreview: fullDocument,
                  },
                });
              }

              // Final completion update
              writer.write({
                type: "data-document",
                id: documentId,
                data: {
                  status: "completed",
                  title,
                  progress: 100,
                  message: "Document creation completed!",
                  fullDocument,
                  format,
                  wordCount: fullDocument.split(" ").length,
                  characterCount: fullDocument.length,
                },
              });

              return {
                documentId,
                title,
                content: fullDocument,
                format,
                status: "completed",
                wordCount: fullDocument.split(" ").length,
                characterCount: fullDocument.length,
              };
            },
          }),
        },
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    location
  )}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as any;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as any;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown";
}
