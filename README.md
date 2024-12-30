# Gemini Test

Gemini Test is an experiment I've made to test the capabilities of the Google Generative AI API.

The bot can greet users, manage a list of usernames, and handle user interactions based on predefined functions.

## Features

-   Greet users and manage user sessions
-   Get the list of usernames
-   Add new users to the list
-   Ensure only known users can interact with the bot

## Prerequisites

-   [Bun](https://bun.sh) v1.1.34 or later
-   Google Generative AI API key

## Installation

1. Clone the repository:

    ```bash
    git clone https://www.github.com/Stem-LG/gemini-experiment.git
    cd gemini-experiment
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

## Setup

1. Create a `.env` file in the root directory and add your Google Generative AI API key:

    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

## Running the Project

To start the bot, run:

```bash
bun run start
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

TLDR: Do whatever you want with this code.
