'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useLogin } from '@/shared/hooks/useLogin';
import { Loader2, Lock, Mail, User, Phone, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import IntroCover from '@/components/ui/IntroCover';

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [showIntro, setShowIntro] = useState(true);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [userType, setUserType] = useState<'vendedor' | 'cliente'>('vendedor');
    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
        rememberMe: false,
    });
    const [registerData, setRegisterData] = useState({
        storeName: '',
        email: '',
        phone: '',
        password: '',
        ruc: '',
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const { login, isLoading, error, clearError } = useLogin();

    const handleEnterPortal = () => {
        setShowIntro(false);
    };

    const introConfig = userType === 'vendedor'
        ? {
            title: 'El Marketplace que cuida tu marca',
            subtitle: 'Únete a la comunidad de vendedores que están transformando el comercio sostenible',
            icon: 'Building2',
            backgroundImage: '/img/intro/imagenVendedoresloginTienda.png',
            iconSize: '112px'
        }
        : {
            title: 'Únete a la evolución del comercio',
            subtitle: 'Crea tu cuenta en Lyrium y posiciona tu marca en el marketplace que cuida el futuro.',
            icon: 'Flower2',
            backgroundImage: '/img/intro/loginIngresar.png',
            iconSize: '112px'
        };

    const handleUserTypeChange = (type: 'vendedor' | 'cliente') => {
        setUserType(type);
        setIsRegisterMode(false);
        setFormError(null);
        setFormSuccess(null);
    };

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const result = await login(loginData);

        if (result.success) {
            setFormSuccess(result.message || 'Login exitoso');
            onSuccess?.();
        } else {
            setFormError(result.error || 'Credenciales inválidas');
        }
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        // Validación según tipo de usuario
        if (userType === 'vendedor') {
            if (registerData.ruc.length !== 11) {
                setFormError('El RUC debe tener exactamente 11 dígitos');
                return;
            }
            if (registerData.phone.length !== 9) {
                setFormError('El teléfono debe tener exactamente 9 dígitos');
                return;
            }
            setFormSuccess('Registro exitoso. Recibirás un email cuando sea aprobado.');
        } else {
            // Cliente: solo necesita email y password básicos
            if (!registerData.email || !registerData.password) {
                setFormError('Por favor completa todos los campos');
                return;
            }
            setFormSuccess('¡Cuenta creada exitosamente! Ya puedes comprar en Lyrium.');
        }

        setTimeout(() => {
            setRegisterData({
                storeName: '',
                email: '',
                phone: '',
                password: '',
                ruc: '',
            });
        }, 3000);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        formType: 'login' | 'register'
    ) => {
        const { name, value, type, checked } = e.target;

        if (formType === 'login') {
            setLoginData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        } else {
            if (name === 'phone' || name === 'ruc') {
                const numericValue = value.replace(/[^0-9]/g, '');
                setRegisterData(prev => ({ ...prev, [name]: numericValue }));
            } else {
                setRegisterData(prev => ({
                    ...prev,
                    [name]: value,
                }));
            }
        }
        clearError();
        setFormError(null);
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setFormError(null);
        setFormSuccess(null);
        clearError();
    };

    if (showIntro) {
        return (
            <IntroCover
                title={introConfig.title}
                subtitle={introConfig.subtitle}
                icon={introConfig.icon}
                buttonText="Entrar"
                onEnter={handleEnterPortal}
                autoHideAfter={0}
                backgroundImage={introConfig.backgroundImage}
                iconSize={introConfig.iconSize}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex items-center justify-center p-4">
            <div className="relative w-full max-w-[1200px] min-h-[650px] bg-white dark:bg-[var(--bg-secondary)] rounded-[30px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden flex transition-all duration-700">
                {/* Panel Lateral */}
                <div
                    className={`absolute top-0 left-0 h-full w-[40%] bg-gradient-to-br from-sky-500 via-sky-400 to-lime-400 p-10 flex flex-col justify-between text-white z-20 transition-all duration-700 cubic-bezier(0.68,-0.55,0.265,1.55) rounded-r-[20px] ${isRegisterMode ? 'left-[60%]' : ''
                        }`}
                    style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #84cc16 100%)'
                    }}
                >
                    {/* Grid pattern overlay con animación */}
                    <div className="absolute inset-0 opacity-30 animate-[gridMove_20s_linear_infinite]">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="gridLogin" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path
                                        d="M 20 0 L 0 0 0 20"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="1"
                                    />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridLogin)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        {/* Login Content */}
                        <div className={`transition-all duration-300 ${isRegisterMode ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            <h2 className="text-[2rem] font-black mb-4 leading-tight">
                                {userType === 'vendedor' ? '¡Qué gusto verte de nuevo!' : '¡Bienvenido de nuevo!'}
                            </h2>
                            <p className="text-white/95 text-center max-w-[300px] mx-auto">
                                {userType === 'vendedor'
                                    ? 'Accede a tu panel para revisar tus ventas de hoy y actualizar tu inventario.'
                                    : 'Accede a tu cuenta para realizar tus compras y gestionar tus pedidos.'}
                            </p>
                        </div>

                        {/* Register Content */}
                        <div className={`transition-all duration-300 absolute top-0 left-0 w-full px-10 py-10 ${isRegisterMode ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <h2 className="text-[2rem] font-black mb-4 leading-tight">
                                {userType === 'vendedor' ? 'Haz crecer tu marca con nosotros.' : 'Únete a Lyrium'}
                            </h2>
                            <p className="text-white/95 text-center max-w-[300px] mx-auto">
                                {userType === 'vendedor'
                                    ? 'Únete a la comunidad de vendedores más grande y gestiona tus pedidos en un solo lugar.'
                                    : 'Crea tu cuenta y descubre los mejores productos naturales y saludables.'}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm mb-4 opacity-90">
                            {isRegisterMode
                                ? '¿Ya tienes cuenta?'
                                : userType === 'vendedor'
                                    ? '¿Ya eres parte de Lyrium como vendedor?'
                                    : '¿Ya tienes una cuenta?'}
                        </p>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="w-full py-4 px-6 bg-white text-sky-500 rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {isRegisterMode
                                ? 'Iniciar Sesión'
                                : userType === 'vendedor'
                                    ? 'Registrarse como vendedor'
                                    : 'Crear cuenta'}
                        </button>
                    </div>

                    {/* Background Icon */}
                    <div className="absolute -bottom-40 -right-20 opacity-15 pointer-events-none z-0">
                        <Building2 className="w-[320px] h-[320px] text-white" />
                    </div>
                </div>

                {/* Form Section */}
                <div
                    className={`absolute top-0 right-0 h-full w-[60%] bg-white dark:bg-[var(--bg-secondary)] p-10 flex flex-col justify-between transition-all duration-700 cubic-bezier(0.68,-0.55,0.265,1.55) z-10 ${isRegisterMode ? 'right-[40%]' : ''
                        }`}
                >
                    {/* Toggle Vendedor/Cliente */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-slate-100 dark:bg-[var(--bg-primary)] p-1 rounded-full flex">
                            <button
                                type="button"
                                onClick={() => handleUserTypeChange('vendedor')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${userType === 'vendedor'
                                        ? 'bg-sky-500 text-white shadow-md'
                                        : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500'
                                    }`}
                            >
                                Soy vendedor
                            </button>
                            <button
                                type="button"
                                onClick={() => handleUserTypeChange('cliente')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${userType === 'cliente'
                                        ? 'bg-sky-500 text-white shadow-md'
                                        : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500'
                                    }`}
                            >
                                Soy cliente
                            </button>
                        </div>
                    </div>

                            {/* Login Form */}
                    <div className={`flex flex-col h-full ${isRegisterMode ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        <div className="flex-1 w-[90%] mx-auto">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-sky-500 shadow-[0_10px_20px_rgba(14,165,233,0.1)] flex-shrink-0">
                                    {userType === 'vendedor' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)]">
                                        {userType === 'vendedor' ? 'Inicia sesión como vendedor' : 'Inicia sesión como cliente'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm">
                                        {userType === 'vendedor'
                                            ? 'Ingresa tus credenciales para acceder al panel de vendedor.'
                                            : 'Ingresa tus credenciales para acceder a tu cuenta.'}
                                    </p>
                                </div>
                            </div>

                            {/* Error/Success Messages - Accessible */}
                            <div 
                                role="alert" 
                                aria-live="polite"
                                className={`error-message ${formError || error ? 'block' : 'hidden'}`}
                            >
                                {formError || error}
                            </div>
                            <div 
                                role="status" 
                                aria-live="polite"
                                className={`success-message ${formSuccess ? 'block' : 'hidden'}`}
                            >
                                {formSuccess}
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
                                <div>
                                    <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Usuario / Nombre de Tienda <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="login-email"
                                            type="text"
                                            name="username"
                                            value={loginData.username}
                                            onChange={(e) => handleInputChange(e, 'login')}
                                            placeholder={userType === 'vendedor' ? 'Nombre de tu tienda o admin' : 'tu@email.com'}
                                            autoComplete="username"
                                            required
                                            aria-required="true"
                                            aria-label={userType === 'vendedor' ? 'Nombre de tienda o usuario' : 'Correo electrónico'}
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Contraseña <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="login-password"
                                            type="password"
                                            name="password"
                                            value={loginData.password}
                                            onChange={(e) => handleInputChange(e, 'login')}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            required
                                            aria-required="true"
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            id="remember-me"
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={loginData.rememberMe}
                                            onChange={(e) => handleInputChange(e, 'login')}
                                            className="w-4 h-4 accent-sky-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-[var(--text-secondary)] select-none">Recordarme</span>
                                    </label>
                                    <a href="/forgot-password" className="text-sm text-sky-500 hover:text-sky-700 font-medium transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Iniciando sesión...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Iniciar Sesión</span>
                                                <User className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-10" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Register Form */}
                    <div className={`flex flex-col h-full ${isRegisterMode ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <div className="flex-1 w-[90%] mx-auto">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-sky-500 shadow-[0_10px_20px_rgba(14,165,233,0.1)] flex-shrink-0">
                                    {userType === 'vendedor' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)]">
                                        {userType === 'vendedor' ? 'Crea tu tienda' : 'Crea tu cuenta'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm">
                                        {userType === 'vendedor'
                                            ? 'Ingresa los detalles para configurar tu perfil de vendedor.'
                                            : 'Ingresa tus datos para registrarte como cliente.'}
                                    </p>
                                </div>
                            </div>

                            {/* Error/Success Messages - Accessible */}
                            <div 
                                role="alert" 
                                aria-live="polite"
                                className={`error-message ${formError ? 'block' : 'hidden'}`}
                            >
                                {formError}
                            </div>
                            <div 
                                role="status" 
                                aria-live="polite"
                                className={`success-message ${formSuccess ? 'block' : 'hidden'}`}
                            >
                                {formSuccess}
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="grid grid-cols-2 gap-5" noValidate>
                                <div className="col-span-2">
                                    <label htmlFor="store-name" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Nombre Comercial <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="store-name"
                                            type="text"
                                            name="storeName"
                                            value={registerData.storeName}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            placeholder="Ej: Mi Dulce Hogar"
                                            autoComplete="organization"
                                            required
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="reg-email"
                                            type="email"
                                            name="email"
                                            value={registerData.email}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            placeholder="email@tienda.com"
                                            autoComplete="email"
                                            required
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Teléfono <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="reg-phone"
                                            type="tel"
                                            name="phone"
                                            value={registerData.phone}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            placeholder="999 000 000"
                                            maxLength={9}
                                            inputMode="tel"
                                            required
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Contraseña <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="reg-password"
                                            type="password"
                                            name="password"
                                            value={registerData.password}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            required
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reg-ruc" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        RUC <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="reg-ruc"
                                            type="text"
                                            name="ruc"
                                            value={registerData.ruc}
                                            onChange={(e) => handleInputChange(e, 'register')}
                                            placeholder="11 dígitos"
                                            maxLength={11}
                                            inputMode="numeric"
                                            required
                                            className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="group relative w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Registrando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Crear Tienda</span>
                                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-10" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
