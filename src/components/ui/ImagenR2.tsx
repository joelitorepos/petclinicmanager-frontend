interface ImagenR2Props {
  imageKey: string
}

const ImagenR2 = ({ imageKey }: ImagenR2Props ) => {
  // Esta es la URL base que configuraste en el panel de Cloudflare R2
  const baseUrl = "https://assets.midominio.com"; 
  
  // La URL final es la combinación de ambas
  const imageUrl = `${baseUrl}/${imageKey}`;

  return (
    <div className="p-4 border rounded-xl">
      <img 
        src={imageUrl} 
        alt="Imagen desde Cloudflare R2"
        className="w-full h-auto rounded-md"
        // Importante: Si tienes problemas de CORS, a veces ayuda añadir:
        crossOrigin="anonymous" 
      />
      <p className="text-sm text-gray-500 mt-2">Key: {imageKey}</p>
    </div>
  );
};

export default ImagenR2;