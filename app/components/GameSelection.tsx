"use client";

import { BaseGame } from "@/app/types/game";

interface GameSelectionProps {
  games: BaseGame[];
  onSelectGame: (game: BaseGame) => void;
}

export default function GameSelection({ games, onSelectGame }: GameSelectionProps) {
  const getCardGradient = (gameName: string) => {
    const name = gameName.toLowerCase();
    if (name.includes('2048')) {
      return 'from-orange-600 via-orange-500 to-amber-600';
    } else if (name.includes('fruit') || name.includes('ninja')) {
      return 'from-purple-600 via-purple-500 to-violet-600';
    } else if (name.includes('piano') || name.includes('tiles') || name.includes('dino') || name.includes('run')) {
      return 'from-blue-600 via-blue-500 to-sky-600';
    }
    return 'from-orange-600 via-purple-500 to-blue-600';
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-16">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="arcade-title mb-2">AIRCADE</h1>

        {/* Subtitle */}
        <p className="arcade-subtitle mb-0">SELECT A GAME TO PLAY USING GESTURES</p>
      </div>

      {/* Game Cards Fan Layout */}
      <div className="relative w-full max-w-5xl h-96 flex items-center justify-center">
        {games.slice(0, 3).map((game, index) => (
          <div
            key={game.metadata.id}
            className={`game-card-3d card-${index + 1} group absolute cursor-pointer transition-all duration-500 hover:scale-110`}
            style={{
              transform: `translateX(${(index - 1) * 280}px) rotateY(${(index - 1) * -8}deg) rotateZ(${(index - 1) * 2}deg)`,
              zIndex: index === 1 ? 20 : 10,
            }}
            onClick={() => onSelectGame(game)}
          >

            {/* Solid Neon Border Effect */}
            <div className="neon-border-solid absolute inset-0 rounded-2xl"></div>

            {/* Card Background with Gradient */}
            <div className={`card-gradient bg-gradient-to-br ${getCardGradient(game.metadata.name)} absolute inset-0 rounded-2xl overflow-hidden`}>
              {/* Image */}
              {game.metadata.splashArt && (
                <div className="absolute inset-0 opacity-60 mix-blend-overlay">
                  <img
                    src={game.metadata.splashArt}
                    alt={game.metadata.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Gradient Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
              {/* Title and Subtitle */}
              <div>
                <h2 className="arcade-card-title text-white mb-1 text-2xl">{game.metadata.name.toUpperCase()}</h2>
                <p className="arcade-card-subtitle text-white/80 text-sm">{game.metadata.description}</p>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
