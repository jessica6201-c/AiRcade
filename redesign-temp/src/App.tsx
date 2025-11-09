import React from 'react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Star } from 'lucide-react';

export default function App() {
  const games = [
    {
      id: 1,
      title: "2048",
      subtitle: "Real-time Detection",
      description: "See your pose landmarks in real-time",
      gradient: "from-orange-600 via-orange-500 to-amber-600",
      image: "https://images.unsplash.com/photo-1635366400548-05fefa95193b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcG9zZSUyMHNpbGhvdWV0dGV8ZW58MXx8fHwxNzYyNjE1MDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.8
    },
    {
      id: 2,
      title: "Fruit Ninja",
      subtitle: "Hand Slicing",
      description: "Slice fruits with your hands!",
      gradient: "from-purple-600 via-purple-500 to-violet-600",
      image: "https://images.unsplash.com/photo-1565875833293-f192c7914a63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMHNsaWNlJTIwbmluamF8ZW58MXx8fHwxNzYyNjU5MjUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.6
    },
    {
      id: 3,
      title: "Piano Tiles",
      subtitle: "Finger Control",
      description: "Pinch your fingers and move over circles to collect them!",
      gradient: "from-blue-600 via-blue-500 to-sky-600",
      image: "https://images.unsplash.com/photo-1549706844-5ca4f36b20a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kJTIwZ2VzdHVyZSUyMHBpbmNofGVufDF8fHx8MTc2MjY1OTI1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 perspective-wrapper" style={{ pointerEvents: 'none' }}>
        {/* Bottom Grid */}
        <div className="grid-floor">
          <svg className="grid-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="black" />
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" />
              </pattern>
              <linearGradient id="fadeFloor" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="60%" stopColor="white" stopOpacity="1" />
                <stop offset="85%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask id="fadeMaskFloor">
                <rect width="100%" height="100%" fill="url(#fadeFloor)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" mask="url(#fadeMaskFloor)" />
          </svg>
        </div>
        
        {/* Top Grid */}
        <div className="grid-ceiling">
          <svg className="grid-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid-top" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="black" />
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" />
              </pattern>
              <linearGradient id="fadeCeiling" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="15%" stopColor="white" stopOpacity="0.3" />
                <stop offset="40%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </linearGradient>
              <mask id="fadeMaskCeiling">
                <rect width="100%" height="100%" fill="url(#fadeCeiling)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-top)" mask="url(#fadeMaskCeiling)" />
          </svg>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen pt-[13rem] px-8 pb-16">
        {/* Title */}
        <div className="text-center">
          <h1 className="arcade-title mb-2">AIRGAME</h1>
          
          {/* Subtitle */}
          <p className="arcade-subtitle mb-12">SELECT A GAME TO PLAY USING POSE DETECTION</p>
        </div>
        
        {/* Game Cards Fan Layout */}
        <div className="relative w-full max-w-5xl h-[400px] flex items-center justify-center mb-8">
          {games.map((game, index) => (
            <div
              key={game.id}
              className={`game-card-3d card-${index + 1} group absolute cursor-pointer transition-all duration-500 hover:scale-110`}
              style={{
                transform: `translateX(${(index - 1) * 280}px) rotateY(${(index - 1) * -8}deg) rotateZ(${(index - 1) * 2}deg)`,
                zIndex: index === 1 ? 20 : 10,
              }}
            >
              
              {/* Solid Neon Border Effect */}
              <div className="neon-border-solid absolute inset-0 rounded-2xl"></div>
              
              {/* Card Background with Gradient */}
              <div className={`card-gradient bg-gradient-to-br ${game.gradient} absolute inset-0 rounded-2xl overflow-hidden`}>
                {/* Image */}
                <div className="absolute inset-0 opacity-60 mix-blend-overlay">
                  <ImageWithFallback 
                    src={game.image} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Gradient Overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              
              {/* Card Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                {/* Rating Badge */}
                <div className="flex justify-end">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="arcade-rating text-white">{game.rating}</span>
                  </div>
                </div>
                
                {/* Title and Subtitle */}
                <div>
                  <h2 className="arcade-card-title text-white mb-1">{game.title.toUpperCase()}</h2>
                  <p className="arcade-card-subtitle text-white/80 text-sm">{game.subtitle}</p>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 
              0 0 10px rgba(255, 255, 255, 0.4),
              0 0 20px rgba(255, 255, 255, 0.3),
              0 0 30px rgba(255, 255, 255, 0.2),
              0 0 40px rgba(255, 255, 255, 0.1),
              inset 0 0 10px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.6),
              0 0 30px rgba(255, 255, 255, 0.5),
              0 0 45px rgba(255, 255, 255, 0.4),
              0 0 60px rgba(255, 255, 255, 0.3),
              inset 0 0 15px rgba(255, 255, 255, 0.3);
          }
        }

        @keyframes neonShine {
          0%, 100% {
            text-shadow: 
              0 0 20px rgba(168, 85, 247, 1),
              0 0 40px rgba(168, 85, 247, 0.9),
              0 0 60px rgba(168, 85, 247, 0.8),
              0 0 80px rgba(168, 85, 247, 0.7),
              0 0 120px rgba(168, 85, 247, 0.6),
              0 0 160px rgba(168, 85, 247, 0.4);
          }
          50% {
            text-shadow: 
              0 0 30px rgba(168, 85, 247, 1),
              0 0 60px rgba(168, 85, 247, 1),
              0 0 90px rgba(168, 85, 247, 1),
              0 0 120px rgba(168, 85, 247, 0.9),
              0 0 180px rgba(168, 85, 247, 0.8),
              0 0 240px rgba(168, 85, 247, 0.6);
          }
        }

        .arcade-title {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 8rem;
          letter-spacing: 0.5rem;
          text-transform: uppercase;
          color: rgba(220, 180, 255, 1);
          animation: neonShine 1.5s ease-in-out infinite;
        }

        .arcade-subtitle {
          font-family: 'Orbitron', sans-serif;
          font-weight: 500;
          font-size: 1.1rem;
          letter-spacing: 0.2rem;
          text-transform: uppercase;
          color: rgba(180, 130, 240, 0.9);
          text-shadow: 
            0 0 10px rgba(168, 85, 247, 0.6),
            0 0 20px rgba(168, 85, 247, 0.4);
        }

        .arcade-card-title {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          letter-spacing: 0.1rem;
        }

        .arcade-card-desc {
          font-family: 'Orbitron', sans-serif;
          font-weight: 400;
          letter-spacing: 0.05rem;
        }

        .arcade-card-subtitle {
          font-family: 'Orbitron', sans-serif;
          font-weight: 400;
          letter-spacing: 0.08rem;
        }

        .arcade-rating {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .perspective-wrapper {
          perspective: 600px;
          perspective-origin: 50% 50%;
        }

        .grid-floor {
          position: absolute;
          width: 300%;
          height: 300%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -45%) rotateX(70deg);
          transform-style: preserve-3d;
          opacity: 0.8;
        }

        .grid-ceiling {
          position: absolute;
          width: 300%;
          height: 300%;
          left: 50%;
          top: 0%;
          transform: translate(-50%, -55%) rotateX(-70deg);
          transform-style: preserve-3d;
          opacity: 0.8;
        }

        .grid-svg {
          width: 100%;
          height: 100%;
          filter: 
            drop-shadow(0 0 3px rgba(255, 255, 255, 0.9))
            drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))
            drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))
            drop-shadow(0 0 25px rgba(255, 255, 255, 0.3));
        }



        .game-card-3d {
          width: 320px;
          height: 360px;
          border-radius: 1rem;
          transform-style: preserve-3d;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-card-3d:hover {
          transform: translateX(var(--hover-x, 0)) rotateY(0deg) rotateZ(0deg) !important;
          z-index: 50 !important;
        }

        .card-1:hover {
          --hover-x: -280px;
        }

        .card-2:hover {
          --hover-x: 0px;
        }

        .card-3:hover {
          --hover-x: 280px;
        }

        .neon-border-solid {
          border: 2px solid rgba(255, 255, 255, 0.6);
          animation: neonPulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        .card-gradient {
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 10px 30px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
