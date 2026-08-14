import React from "react";

export const GumletPlayer: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-[2rem] bg-black shadow-2xl border border-zinc-800/80 group/player">
      <iframe
        id="video-hero-iframe"
        loading="lazy"
        title="Gumlet video player"
        src="https://play.gumlet.io/embed/6a25f840fc14746995b9c492"
        className="w-full h-full border-0 absolute inset-0 transition-opacity duration-300"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write;"
        referrerPolicy="origin"
        allowFullScreen
      />

      {/* Elegant glassmorphism border highlight overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl md:rounded-[2rem] border border-white/5 group-hover/player:border-white/10 transition-colors duration-500" />
    </div>
  );
};
