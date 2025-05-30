import animationData from '@/assets/animations/loading-doc.json';
import Lottie from 'lottie-react';

const LoadingDocAnimation = () => {
  return (
    <div className="w-full h-2/3 flex items-center justify-center">
      <Lottie
        animationData={animationData}
        loop={true} // Define se a animação deve repetir
        autoplay={true} // Define se a animação inicia automaticamente
        style={{ width: 600, height: 600 }} // Ajuste o tamanho conforme necessário
      />
    </div>
  );
};
export default LoadingDocAnimation;
