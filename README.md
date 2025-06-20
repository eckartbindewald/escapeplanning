# Escape Planning - Text Adventure Game

Escape Planning is an interactive text-based adventure game where you navigate through a world, solve puzzles, and interact with characters to plan your escape. The game features a rich narrative, AI-powered character interactions, and an immersive command-line interface.

## Features

- Interactive text-based gameplay
- AI-powered character interactions using Transformers
- Rich narrative with multiple locations and items
- Command-based interface for natural language input
- Dynamic game state management

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd escapeplanning
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Game

### Development Mode

To start the development server:

```bash
npm run dev
```

This will start the Vite development server. Open your browser and navigate to the provided local URL (usually http://localhost:5173).

### Production Build

To create a production build:

```bash
npm run build
npm run preview
```

## How to Play

1. **Starting the Game**:
   - Run the game using the commands above
   - The game will display a welcome message and instructions

2. **Basic Commands**:
   - `look` - View your current location and surroundings
   - `go [direction]` - Move in a direction (north, south, east, west, etc.)
   - `take [item]` - Pick up an item
   - `use [item]` - Use an item in your inventory
   - `talk to [character]` - Interact with a character
   - `inventory` - View items you're carrying
   - `help` - Show available commands
   - `quit` - Exit the game

3. **Gameplay Tips**:
   - Pay attention to the environment descriptions
   - Talk to characters to gather information
   - Examine items and locations carefully
   - Some commands may require specific items or conditions

## Game Data

The game data is stored in the `data/` directory with the following structure:

- `characters.tsv` - Information about in-game characters
- `dialogs.tsv` - Dialog trees and character interactions
- `items.tsv` - Game items and their properties
- `locations.tsv` - Game world locations and descriptions
- `quests.tsv` - Game quests and objectives

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with TypeScript and Vite
- Uses [@xenova/transformers](https://github.com/xenova/transformers.js/) for AI character interactions
- Inspired by classic text adventure games
