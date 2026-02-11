export function VideoPlayer({ videoId }) {
  // Substitua 'seu-dominio' pelo domínio autorizado no dashboard do Panda
  const pandaUrl = `https://player-vz-7023366c-48c.tv.pandavideo.com.br/embed/?v=${videoId}`;

  return (
    <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden shadow-xl">
      <iframe
        src={pandaUrl}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={true}
        fetchpriority="high"
      ></iframe>
    </div>
  );
}