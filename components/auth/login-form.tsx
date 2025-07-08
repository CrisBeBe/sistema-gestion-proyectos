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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Play,
  X,
  Check,
  Crown,
  Mail,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function LoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { login, register } = useAuth();
  const { toast } = useToast();

  // Simulamos la función de autenticación
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

  const handleForgotPassword = () => {
    const email = prompt("Ingresa tu email para recuperar la contraseña:");
    if (email) {
      alert(`Se ha enviado un enlace de recuperación a ${email}`);
    }
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
              <Dialog open={showFeatures} onOpenChange={setShowFeatures}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                    Características
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Características de StudyCollab</DialogTitle>
                    <DialogDescription className="text-center">
                      Descubre todas las herramientas que tenemos para ti
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Colaboración en Tiempo Real</h3>
                          <p className="text-sm text-slate-600">Edita documentos simultáneamente con tu equipo, comparte pantalla y mantén videollamadas integradas.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                        <CheckSquare className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Gestión Avanzada de Tareas</h3>
                          <p className="text-sm text-slate-600">Kanban boards, diagramas de Gantt, asignación automática y seguimiento de progreso con IA.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-purple-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Calendario Inteligente</h3>
                          <p className="text-sm text-slate-600">Sincronización con Google Calendar, recordatorios automáticos y optimización de horarios de estudio.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-orange-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Analytics y Reportes</h3>
                          <p className="text-sm text-slate-600">Métricas de productividad, análisis de tiempo invertido y reportes automáticos de progreso.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-indigo-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Comunicación Integrada</h3>
                          <p className="text-sm text-slate-600">Chat grupal, foros de discusión, anotaciones en tiempo real y sistema de notificaciones inteligente.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-teal-50 rounded-lg">
                        <Shield className="h-6 w-6 text-teal-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900">Seguridad Enterprise</h3>
                          <p className="text-sm text-slate-600">Encriptación end-to-end, autenticación de dos factores y backups automáticos en la nube.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
                <Dialog open={showDemo} onOpenChange={setShowDemo}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold">
                      <Play className="h-4 w-4 mr-2" />
                      Ver Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center">Demo de StudyCollab</DialogTitle>
                      <DialogDescription className="text-center">
                        Descubre cómo StudyCollab puede transformar tu experiencia académica
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 space-y-6">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-full object-cover rounded-lg"
                          src="/demo.mp4"
                        >
                          Tu navegador no soporta la etiqueta de video.
                        </video>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <h4 className="font-semibold">Colaboración</h4>
                          <p className="text-sm text-slate-600">Ve cómo trabajar en equipo</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <h4 className="font-semibold">Gestión</h4>
                          <p className="text-sm text-slate-600">Organiza tus proyectos</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <h4 className="font-semibold">Análisis</h4>
                          <p className="text-sm text-slate-600">Mide tu progreso</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>


                <Button 
                  variant="outline" 
                  className="px-8 py-3 rounded-xl font-semibold border-slate-300 hover:bg-slate-50"
                  onClick={() => setShowFeatures(true)}
                >
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
                          <button 
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            Términos de Servicio
                          </button>{" "}
                          y{" "}
                          <button 
                            type="button"
                            onClick={() => setShowPrivacy(true)}
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            Política de Privacidad
                          </button>
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
              <button 
                onClick={() => setShowPrivacy(true)}
                className="hover:text-white transition-colors"
              >
                Privacidad
              </button>
              <button 
                onClick={() => setShowTerms(true)}
                className="hover:text-white transition-colors"
              >
                Términos
              </button>
              
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Español</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Privacidad */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Política de Privacidad</DialogTitle>
            <DialogDescription>
              Última actualización: Enero 2025
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Información que Recopilamos</h3>
              <p className="text-slate-600">
                Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, 
                utilizas nuestros servicios o te comunicas con nosotros. Esto incluye tu nombre, dirección 
                de correo electrónico, información del perfil y contenido que creas o compartes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">2. Cómo Utilizamos tu Información</h3>
              <p className="text-slate-600">
                Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, 
                procesar transacciones, comunicarnos contigo y personalizar tu experiencia. También podemos 
                usar la información para fines de seguridad y prevención de fraudes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Compartir Información</h3>
              <p className="text-slate-600">
                No vendemos, intercambiamos ni transferimos tu información personal a terceros sin tu 
                consentimiento, excepto en las circunstancias limitadas descritas en esta política, 
                como cuando es necesario para proporcionar nuestros servicios o cumplir con obligaciones legales.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4. Seguridad de Datos</h3>
              <p className="text-slate-600">
                Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para 
                proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5. Tus Derechos</h3>
              <p className="text-slate-600">
                Tienes derecho a acceder, actualizar, corregir o eliminar tu información personal. 
                También puedes optar por no recibir ciertas comunicaciones de nosotros. 
                Para ejercer estos derechos, contáctanos en privacy@studycollab.com.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Términos */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Términos de Servicio</DialogTitle>
            <DialogDescription>
              Última actualización: Enero 2025
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Aceptación de Términos</h3>
              <p className="text-slate-600">
                Al acceder y utilizar StudyCollab, aceptas estar sujeto a estos Términos de Servicio 
                y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de 
                estos términos, no utilices nuestro servicio.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">2. Descripción del Servicio</h3>
              <p className="text-slate-600">
                StudyCollab es una plataforma de colaboración estudiantil que permite a los usuarios 
                gestionar proyectos académicos, colaborar en tiempo real y organizar tareas educativas. 
                Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Cuentas de Usuario</h3>
              <p className="text-slate-600">
                Para utilizar ciertas funciones del servicio, debes crear una cuenta. Eres responsable 
                de mantener la confidencialidad de tu cuenta y contraseña, y de todas las actividades 
                que ocurran bajo tu cuenta.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4. Uso Aceptable</h3>
              <p className="text-slate-600">
                Te comprometes a utilizar StudyCollab únicamente para fines legales y educativos. 
                No puedes usar el servicio para actividades ilegales, dañinas o que violen los 
                derechos de otros usuarios.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5. Propiedad Intelectual</h3>
              <p className="text-slate-600">
                El contenido, las características y la funcionalidad del servicio son propiedad de 
                StudyCollab y están protegidos por derechos de autor, marcas comerciales y otras 
                leyes de propiedad intelectual.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">6. Limitación de Responsabilidad</h3>
              <p className="text-slate-600">
                StudyCollab no será responsable de ningún daño indirecto, incidental, especial o 
                consecuente que resulte del uso o la imposibilidad de usar el servicio.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
