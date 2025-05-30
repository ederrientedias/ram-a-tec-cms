import animationData from '@/assets/animations/loading-login.json';
import Lottie from 'lottie-react';

const LoadingLoginAnimation = () => {
  return (
    <Lottie
      animationData={animationData}
      loop={true} // Define se a animação deve repetir
      autoplay={true} // Define se a animação inicia automaticamente
      style={{ width: 550, height: 'auto' }} // Ajuste o tamanho conforme necessário
    />
  );
};
export default LoadingLoginAnimation;
