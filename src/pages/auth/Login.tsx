
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const BreusLogo = ({ size = 64 }: { size?: number }) => (
  <svg 
    version="1.2" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 500 305" 
    width={size} 
    height={(size * 305) / 500}
    className="fill-blue-600"
  >
    <path d="m355.2 201.7c-33.7 40.1-84.1 67.3-135.9 73.1-4.5 0.6-8.4 4.5-7.7 9.7 0.6 4.5 4.5 7.8 8.4 7.8h0.6c55.7-5.9 111.3-35 147.5-79 3.2-3.8 2.6-9-1.3-12.2-2.6-3.3-8.4-3.3-11.6 0.6z"/>
    <path d="m276.3 68.5h-0.7l-64-45.3c-2-1.3-4.5-1.9-6.5-1.3-1.9 0.7-4.5 2-5.2 3.9l-19.4 29.7c-77.6 8.5-146.1 62.1-170.1 114.5 0 0.7 0 1.3-0.6 2 0 0.6 0 1.3 0 1.3 0 0.6 0 1.2 0 1.2 0 0.7 0 1.3 0.6 2 16.2 35.6 60.8 80.2 116.5 102.2l9.7-15.6 69.8-103.4c2.6-3.9 1.3-9.7-2.6-12.3-3.9-2.6-9.7-1.3-12.3 2.6l-68.5 103.4-3.3 3.9c-43.9-20-76.3-53-91.1-84 23.9-48.6 88.6-97.1 161.6-101.6l20.1-29.1 18.1 12.9 33 25.3c40.7 14.2 73.7 40.1 93.8 64.6 3.2 3.9 8.4 4.6 12.2 1.3 3.9-3.2 4.6-8.4 1.3-12.3-20.7-25.2-53-51-92.4-65.9z"/>
    <path d="m486.4 84.6c-3.2-3.2-9-3.2-12.2 0l-82.8 82.8c-2 2-2.6 3.9-2.6 5.9 0 2.5 0.6 4.5 2.6 6.4l82.8 82.8c1.9 1.9 3.8 2.6 6.4 2.6 2.6 0 4.6-0.7 6.5-2.6 3.2-3.2 3.2-9.1 0-12.3l-77.6-76.9 76.9-76.4c3.3-3.2 3.3-9 0-12.3z"/>
    <path fillRule="evenodd" d="m112.6 162.3c-8.9 0-16.1-7.3-16.1-16.2 0-9 7.2-16.2 16.1-16.2 9 0 16.2 7.2 16.2 16.2 0 8.9-7.2 16.2-16.2 16.2z"/>
    <path d="m218.1 202.4l28.4-42.7c2.6-3.9 1.3-9.7-2.6-12.3-3.9-2.6-9.7-1.3-12.3 2.6l-0.6 0.6-26.5 41.4-12.3 18.8c-2.6 3.8-1.3 9.7 2.6 12.3 3.8 2.5 9.7 1.2 12.3-2.6l11-18.1c0-0.7 0 0 0 0z"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate(result.redirectPath || '/', { replace: true });
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BreusLogo size={80} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Buceo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <div className="text-center space-y-2">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
                <div>
                  <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
                  <Link 
                    to="/register" 
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Regístrate
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Credenciales de prueba:</p>
              <p>Email: adminbreus@aerocamchile.cl</p>
              <p>Contraseña: aerocam123456</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
