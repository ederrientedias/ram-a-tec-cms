import LoadingLoginAnimation from '@/components/animations/loadingLogin';
import { loginRequest } from '@/config/msal.config';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

const Login = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleMicrosoftLogin = async () => {
    await instance
      .loginPopup(loginRequest)
      .then((loginResponse) => {
        if (loginResponse.account) {
          navigate('/dashboard');
        }
      })
      .catch((error) => console.error('Login failed:', error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portal do Colaborador</h1>
          <p className="text-gray-600 mt-2">Gerencie informações de fundos e documentos</p>
        </div>
        <div>
          <LoadingLoginAnimation />
          <Button variant="outline" className="w-full" onClick={() => handleMicrosoftLogin()}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M11.4 24H0V12.6h11.4V24z" fill="#F25022" />
              <path d="M24 24H12.6V12.6H24V24z" fill="#00A4EF" />
              <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#7FBA00" />
              <path d="M24 11.4H12.6V0H24v11.4z" fill="#FFB900" />
            </svg>
            Continuar com Microsoft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
