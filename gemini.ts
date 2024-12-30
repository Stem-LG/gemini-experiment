import { GoogleGenerativeAI, SchemaType, type FunctionResponsePart } from "@google/generative-ai";

interface FunctionParameters {
  type: SchemaType;
  properties: Record<string, {
    type: SchemaType;
    description: string;
  }>;
  required: string[];
}

interface FunctionDefinition {
  name: string;
  description: string;
  parameters?: FunctionParameters;
  handler: (args: Record<string, unknown>) => Promise<object> | object;
}

interface ChatGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

interface GeminiChatConfig {
  apiKey: string;
  functions: FunctionDefinition[];
  modelName?: string;
  systemInstruction?: string;
  generationConfig?: ChatGenerationConfig;
}

class GeminiChat {
  private model;
  private chatSession;
  private functions: FunctionDefinition[];

  private static DEFAULT_MODEL = "gemini-2.0-flash-exp";
  private static DEFAULT_GENERATION_CONFIG: ChatGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain"
  };

  constructor({
    apiKey,
    functions,
    modelName = GeminiChat.DEFAULT_MODEL,
    systemInstruction,
    generationConfig = {}
  }: GeminiChatConfig) {

    if (!apiKey) throw new Error('API key is required');

    if (!functions?.length) throw new Error('At least one function definition is required');

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelConfig: any = {
      model: modelName,
      tools: [{
        functionDeclarations: functions.map(({ name, description, parameters }) => ({
          name,
          description,
          parameters
        }))
      }]
    };

    this.functions = functions;

    if (systemInstruction) {
      modelConfig.systemInstruction = systemInstruction;
    }

    this.model = genAI.getGenerativeModel(modelConfig);

    this.chatSession = this.model.startChat({
      generationConfig: {
        ...GeminiChat.DEFAULT_GENERATION_CONFIG,
        ...generationConfig
      }
    });

  }

  /** Let the model initialize the conversation */
  async initialMessage(): Promise<string> {
    return this.sendMessage(' ');
  }

  async sendMessage(message: string): Promise<string> {
    try {
      let result = await this.chatSession.sendMessage(message);

      let functionCalls = result.response.functionCalls();

      while (functionCalls) {
        const functionResponses: FunctionResponsePart[] = await Promise.all(
          functionCalls.map(async call => {
            try {

              const fn = this.functions.find(f => f.name === call.name);

              if (!fn) throw new Error(`Function ${call.name} not found`);

              const response = await Promise.resolve(fn.handler(call.args as Record<string, unknown>));
              return {
                functionResponse: {
                  name: call.name,
                  response
                }
              };
            } catch (error) {
              console.error(`Error executing function ${call.name}:`, error);
              return {
                functionResponse: {
                  name: call.name,
                  response: { error: 'Function execution failed' }
                }
              };
            }
          })
        );

        result = await this.chatSession.sendMessage(functionResponses);
        functionCalls = result.response.functionCalls();
      }

      const responseText = result.response.text();

      return responseText;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw new Error('Failed to process message');
    }
  }
}

export { GeminiChat, type FunctionDefinition, type FunctionParameters, SchemaType };