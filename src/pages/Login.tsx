import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/config/firebase.config'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { KeyRound, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Login = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    navigate('/dashboard')
    // try {
    //   if (formData.email.includes('@') && formData.password) {
    //     const result = await signInWithEmailAndPassword(auth, formData.email, formData.password)
    //     if (result.user) {
    //       toast.success('Login bem-sucedido!')
    //       navigate('/dashboard')
    //     }
    //   } else {
    //     toast.error('Credenciais inválidas!')
    //   }
    // } catch (error) {
    //   if (error.code === 'auth/invalid-credential') {
    //     toast.error('Credenciais inválidas!')
    //   }
    // } finally {
    //   setIsLoading(false)
    // }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success(`Login com ${provider} bem-sucedido!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(`Erro ao fazer login com ${provider}!`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-brand-gray p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Portal Intranet</h1>
          <p className='text-gray-600 mt-2'>Gerencie informações de fundos e documentos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-center'>Entrar</CardTitle>
            <CardDescription className='text-center'>
              Acesse com seus dados ou conta social
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='email' className='w-full'>
              <TabsList className='grid w-full grid-cols-2 mb-6'>
                <TabsTrigger value='email'>Email</TabsTrigger>
                <TabsTrigger value='social'>Social</TabsTrigger>
              </TabsList>

              {/* Login com Email e Senha */}
              <TabsContent value='email'>
                <form onSubmit={handleSubmit}>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email</Label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Mail className='h-5 w-5 text-gray-400' />
                        </div>
                        <Input
                          id='email'
                          name='email'
                          placeholder='seu@email.com'
                          type='email'
                          autoCapitalize='none'
                          autoComplete='email'
                          autoCorrect='off'
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <Label htmlFor='password'>Senha</Label>
                        <a
                          href='#'
                          className='text-sm font-medium text-primary hover:underline'
                          onClick={e => {
                            e.preventDefault()
                            toast('Funcionalidade não implementada ainda', {
                              description: 'Esta funcionalidade estará disponível em breve.'
                            })
                          }}
                        >
                          Esqueceu a senha?
                        </a>
                      </div>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <KeyRound className='h-5 w-5 text-gray-400' />
                        </div>
                        <Input
                          id='password'
                          name='password'
                          type='password'
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <Button type='submit' className='w-full' disabled={isLoading}>
                      {isLoading ? (
                        <span className='flex items-center gap-2'>
                          <svg
                            className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          Processando...
                        </span>
                      ) : (
                        <span className='flex items-center gap-2'>
                          <LogIn className='h-5 w-5' />
                          Entrar
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Login com Redes Sociais */}
              <TabsContent value='social'>
                <div className='space-y-4'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => handleSocialLogin('Google')}
                    disabled={isLoading}
                  >
                    <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                      <path
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        fill='#4285F4'
                      />
                      <path
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        fill='#34A853'
                      />
                      <path
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        fill='#FBBC05'
                      />
                      <path
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        fill='#EA4335'
                      />
                      <path d='M1 1h22v22H1z' fill='none' />
                    </svg>
                    Continuar com Google
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => handleSocialLogin('Microsoft')}
                    disabled={isLoading}
                  >
                    <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                      <path d='M11.4 24H0V12.6h11.4V24z' fill='#F25022' />
                      <path d='M24 24H12.6V12.6H24V24z' fill='#00A4EF' />
                      <path d='M11.4 11.4H0V0h11.4v11.4z' fill='#7FBA00' />
                      <path d='M24 11.4H12.6V0H24v11.4z' fill='#FFB900' />
                    </svg>
                    Continuar com Microsoft
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className='flex flex-col space-y-4'>
            <div className='text-center text-sm text-gray-600'>
              Não tem uma conta?{' '}
              <a
                href='#'
                className='text-primary hover:underline'
                onClick={e => {
                  e.preventDefault()
                  toast('Funcionalidade não implementada ainda', {
                    description: 'O cadastro de usuários será habilitado pelo administrador.'
                  })
                }}
              >
                Solicite acesso ao administrador
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
