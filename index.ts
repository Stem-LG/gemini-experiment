import { GeminiChat, type FunctionDefinition, SchemaType, logMessageResponse } from "./gemini";

const apiKey = process.env.GEMINI_API_KEY;

const users = ["Alice", "Bob", "Charlie"];

function getUserNames() {
  return users;
}

function addUser(name: string) {
  users.push(name);
}

const functions: FunctionDefinition[] = [
  {
    name: "getUserNames",
    description: "Get the list of user names",
    handler: () => ({
      usernames: getUserNames()
    })
  },
  {
    name: "addUser",
    description: "Add a user to the list",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "The name of the user to add"
        }
      },
      required: ["name"]
    },
    handler: (args) => {
      const name = args.name as string;
      addUser(name);
      return {
        success: true
      };
    }
  }
];

async function main() {

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const chat = new GeminiChat({
    apiKey,
    functions,
    systemInstruction: `You are a user management bot.
                        Start by greeting the user, ask for credentials and inform them that typing 'exit' will end the conversation.
                        Check the usernames list, and if the user isn't in the list, refuse to answer anything.
                        If no username is provided then ask again which user is currently talking.
                        Upon confirmation you should inform them that they can get the list of usernames, add users to the list and logout by typing logout.
                        Only known users can talk to you, and only known users can add new users to the list.
                        If a user logs out, you should aknowledge it and inform them that they can type another username to start again.`,
  });

  const initialMessage = await chat.initialMessage();

  logMessageResponse(initialMessage);

  while (true) {
    const input = prompt("You: ") || "";
    if (input === "exit") break;
    const response = await chat.sendMessage(input);
    logMessageResponse(response);
  }

}

main();