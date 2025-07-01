"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  CheckSquare, 
  Target, 
  Zap, 
  Shield, 
  MessageSquare,
  BarChart3,
  Globe,
  Star,
  ArrowRight,
  Play
} from "lucide-react";
import { useState } from "react";

/** 
El componente `LoginForm` en React que proporciona una interfaz de usuario para iniciar sesión y registrarse en la aplicación "StudyCollab". El componente:

* Importa componentes de UI y hooks de contexto para manejar autenticación y notificaciones.
* Gestiona el estado de los formularios de inicio de sesión y registro con `useState`.
* Define funciones `handleLogin` y `handleRegister` que se ejecutan al enviar cada formulario, realizando llamadas a métodos `login` y `register` obtenidos desde el contexto de autenticación.
* Muestra notificaciones según el resultado de las operaciones de autenticación.
* Renderiza un formulario con pestañas (usando el componente `Tabs`) para alternar entre el inicio de sesión y el registro, cada uno con sus respectivos campos y botones.
* Muestra un ícono y el nombre de la aplicación en la parte superior de la interfaz.

El propósito del componente es permitir a los usuarios registrarse y autenticar sus credenciales para acceder al sistema de gestión colaborativa de proyectos estudiantiles.
*/ 
export function LoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(loginData.email, loginData.password);

    if (success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
    } else {
      toast({
        title: "Error",
        description: "Credenciales incorrectas.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await register(
      registerData.name,
      registerData.email,
      registerData.password
    );

    if (success) {
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">StudyCollab</h1>
                <p className="text-xs text-slate-600">Plataforma de Colaboración Estudiantil</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Características
              </Button>
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Precios
              </Button>
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Contacto
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Sección de Información */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                <span>Plataforma #1 para Estudiantes</span>
              </div>
              
              <h2 className="text-5xl font-bold text-slate-900 leading-tight">
                Colabora. 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Organiza</span>.
                <br />Alcanza el éxito
              </h2>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                StudyCollab es la plataforma definitiva para gestionar proyectos estudiantiles de manera colaborativa. Organiza tareas, coordina equipos y alcanza tus objetivos académicos con eficiencia.
              </p>

              <div className="flex items-center space-x-4">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold">
                  <Play className="h-4 w-4 mr-2" />
                  Ver Demo
                </Button>
                <Button variant="outline" className="px-8 py-3 rounded-xl font-semibold border-slate-300 hover:bg-slate-50">
                  Más Información
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Características Principales */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Colaboración en Tiempo Real</h3>
                    <p className="text-sm text-slate-600">Trabaja con tu equipo de forma sincronizada y eficiente.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Gestión de Tareas</h3>
                    <p className="text-sm text-slate-600">Organiza y prioriza tareas con fechas límite y recordatorios.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Calendario Inteligente</h3>
                    <p className="text-sm text-slate-600">Visualiza deadlines y planifica tu tiempo académico.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Análisis de Progreso</h3>
                    <p className="text-sm text-slate-600">Visualiza el avance de tus proyectos con métricas detalladas.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Comunicación Fluida</h3>
                    <p className="text-sm text-slate-600">Chat integrado y comentarios en tiempo real.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Seguridad Garantizada</h3>
                    <p className="text-sm text-slate-600">Tus datos académicos protegidos con encriptación avanzada.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-slate-600">Estudiantes Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-slate-600">Universidades</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">50K+</div>
                  <div className="text-sm text-slate-600">Proyectos Completados</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Login */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">¡Únete a StudyCollab!</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Comienza tu experiencia de colaboración académica
                </p>
              </div>

              <div className="p-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="font-medium">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register" className="font-medium">Registrarse</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-slate-900">Bienvenido de vuelta</h4>
                        <p className="text-sm text-slate-600">Ingresa tus credenciales para continuar</p>
                      </div>
                      
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                            Correo Electrónico
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="tu@universidad.edu"
                            value={loginData.email}
                            onChange={(e) =>
                              setLoginData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            required
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                            Contraseña
                          </Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) =>
                              setLoginData((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            required
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2 rounded border-slate-300" />
                            <span className="text-slate-600">Recordarme</span>
                          </label>
                          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                            ¿Olvidaste tu contraseña?
                          </a>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Iniciando sesión...
                            </div>
                          ) : (
                            "Iniciar Sesión"
                          )}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="register">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-slate-900">Crear tu cuenta</h4>
                        <p className="text-sm text-slate-600">Únete a miles de estudiantes exitosos</p>
                      </div>
                      
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-sm font-medium text-slate-700">
                            Nombre Completo
                          </Label>
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Juan Pérez"
                            value={registerData.name}
                            onChange={(e) =>
                              setRegisterData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-sm font-medium text-slate-700">
                            Correo Electrónico
                          </Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="tu@universidad.edu"
                            value={registerData.email}
                            onChange={(e) =>
                              setRegisterData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            required
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-sm font-medium text-slate-700">
                            Contraseña
                          </Label>
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            required
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="text-xs text-slate-600">
                          Al registrarte, aceptas nuestros{" "}
                          <a href="#" className="text-blue-600 hover:text-blue-700">
                            Términos de Servicio
                          </a>{" "}
                          y{" "}
                          <a href="#" className="text-blue-600 hover:text-blue-700">
                            Política de Privacidad
                          </a>
                          .
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creando cuenta...
                            </div>
                          ) : (
                            "Crear Cuenta Gratis"
                          )}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 mb-3">Confiado por estudiantes de:</p>
              <div className="flex justify-center items-center space-x-4 text-slate-400">
                <span className="text-sm font-medium">Harvard</span>
                <span>•</span>
                <span className="text-sm font-medium">MIT</span>
                <span>•</span>
                <span className="text-sm font-medium">Stanford</span>
                <span>•</span>
                <span className="text-sm font-medium">UNAM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">StudyCollab</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Soporte</a>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Español</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}