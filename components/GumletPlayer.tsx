import React, { useEffect, useRef } from "react";

export const GumletPlayer: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Carrega o SDK do Smartplayer ConverteAI caso ainda não esteja no documento
    const scriptSrc = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const s = document.createElement("script");
      s.src = scriptSrc;
      s.async = true;
      document.head.appendChild(s);
    }

    // Inicializa a URL do iframe com os parâmetros necessários
    if (iframeRef.current) {
      const search = window.location.search || "?";
      const srcUrl =
        "https://scripts.converteai.net/c2c29858-1aab-41d1-85f5-eaa90817b848/players/6a7e70c90e4e7474042d228c/v4/embed.html" +
        search +
        "&vl=" +
        encodeURIComponent(window.location.href);
      iframeRef.current.src = srcUrl;
    }
  }, []);

  return (
    <div
      id="ifr_6a7e70c90e4e7474042d228c_wrapper"
      style={{ margin: "0 auto", width: "100%" }}
      className="relative w-full overflow-hidden rounded-2xl md:rounded-[2rem] bg-black shadow-2xl group/player"
    >
      <div
        id="ifr_6a7e70c90e4e7474042d228c_aspect"
        style={{ position: "relative", padding: "75% 0 0 0" }}
        className="w-full"
      >
        <iframe
          ref={iframeRef}
          frameBorder="0"
          allowFullScreen
          src="about:blank"
          id="ifr_6a7e70c90e4e7474042d228c"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          referrerPolicy="origin"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write;"
          title="Vídeo de Apresentação"
        />
      </div>

      {/* Subtle border overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl md:rounded-[2rem] border border-white/5 group-hover/player:border-white/10 transition-colors duration-500" />
    </div>
  );
};

