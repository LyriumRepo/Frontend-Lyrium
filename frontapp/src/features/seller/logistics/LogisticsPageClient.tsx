'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { GlobalLogisticsConfig } from '@/features/seller/logistics/types';
import ToggleSwitch from './components/ToggleSwitch';
import AddCityModal from './components/AddCityModal';
import AddAgencyModal from './components/AddAgencyModal';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';

import { useSellerLogistics } from '@/features/seller/logistics/hooks/useSellerLogistics';

interface LogisticsPageClientProps {
}

export function LogisticsPageClient(_props: LogisticsPageClientProps) {
    const {
        config,
        isLoading,
        isAddCityOpen,
        setIsAddCityOpen,
        isAddAgencyOpen,
        setIsAddAgencyOpen,
        selectedCityIndex,
        setSelectedCityIndex,
        updateGlobalConfig,
        updateOperator,
        addCityRate,
        removeCityRate,
        updateCityRateValue,
        addAgency,
        removeAgency,
        saveConfig
    } = useSellerLogistics();

    const headerActions = (
        <BaseButton variant="action" onClick={saveConfig} leftIcon="Save">
            Guardar Configuración
        </BaseButton>
    );

    if (isLoading && !config) {
        return <BaseLoading message="Sincronizando Logística..." />;
    }

    if (!config) return null;

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            <ModuleHeader
                title="Mi Logística"
                subtitle="Configuración estratégica de envíos y operadoras"
                icon="Truck"
                actions={headerActions}
            />

            <div className="glass-card p-8 bg-gradient-to-r from-sky-600/5 to-emerald-600/5 border-none rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center text-sky-500 shadow-sm border border-[var(--border-subtle)]">
                            <Icon name="Map" className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Alcance de Cobertura</h3>
                            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Define el rango geográfico de tus entregas</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: 'Envíos Locales', sub: 'Misma ciudad', key: 'localEnabled' as keyof GlobalLogisticsConfig },
                            { label: 'Interprovinciales', sub: 'A nivel nacional', key: 'interprovincialEnabled' as keyof GlobalLogisticsConfig }
                        ].map(item => (
                            <div key={item.key} className="flex items-center gap-5 bg-[var(--bg-card)]/80 p-4 pr-6 rounded-[2rem] border border-[var(--border-subtle)] shadow-sm transition-all hover:shadow-md">
                                <div className="flex flex-col text-left">
                                    <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">{item.label}</span>
                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">{item.sub}</span>
                                </div>
                                <ToggleSwitch
                                    enabled={!!config.globalConfig[item.key]}
                                    onChange={(val) => updateGlobalConfig({ [item.key]: val })}
                                    size="sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card group p-8 flex flex-col h-full border-t-4 border-emerald-500/50 rounded-[2.5rem] bg-[var(--bg-card)]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <Icon name="Gift" className="w-6 h-6" />
                        </div>
                        <ToggleSwitch
                            enabled={!!config.globalConfig.envioGratuitoEnabled}
                            onChange={(val) => updateGlobalConfig({ envioGratuitoEnabled: val })}
                        />
                    </div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Envío Gratuito</h3>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-8 flex-1">Incentiva compras mayores con envíos sin costo adicional.</p>
                    <div className="space-y-2">
                        <label htmlFor="logistics-monto-minimo" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Monto Mínimo <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--text-secondary)]">S/</span>
                            <input
                                id="logistics-monto-minimo"
                                type="number"
                                value={config.globalConfig.montoMinimoGratuito}
                                onChange={(e) => updateGlobalConfig({ montoMinimoGratuito: parseFloat(e.target.value) })}
                                className="w-full pl-10 pr-4 py-3.5 bg-[var(--bg-secondary)]/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-black text-[var(--text-primary)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card group p-8 flex flex-col h-full border-t-4 border-purple-500/50 rounded-[2.5rem] bg-[var(--bg-card)]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                            <Icon name="Store" className="w-6 h-6" />
                        </div>
                        <ToggleSwitch
                            enabled={!!config.globalConfig.recojoTiendaEnabled}
                            onChange={(val) => updateGlobalConfig({ recojoTiendaEnabled: val })}
                        />
                    </div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Recojo en Tienda</h3>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-8 flex-1"> Permite a tus clientes recoger pedidos localmente en tus sedes.</p>
                    <div className="space-y-2">
                        <label htmlFor="logistics-direccion-recojo" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Dirección de Recojo <span className="text-red-500">*</span></label>
                        <textarea
                            id="logistics-direccion-recojo"
                            rows={2}
                            value={config.globalConfig.direccionTienda}
                            onChange={(e) => updateGlobalConfig({ direccionTienda: e.target.value })}
                            className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-bold text-[var(--text-primary)] text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="glass-card group p-8 flex flex-col h-full border-t-4 border-sky-500/50 rounded-[2.5rem] bg-[var(--bg-card)]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                            <Icon name="Truck" className="w-6 h-6" />
                        </div>
                        <ToggleSwitch
                            enabled={!!config.globalConfig.deliveryEnabled}
                            onChange={(val) => updateGlobalConfig({ deliveryEnabled: val })}
                        />
                    </div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Envío por Delivery</h3>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-8 flex-1">Gestión de entregas a domicilio con tarifas dinámicas por región.</p>
                    <div className="flex items-center gap-2 px-4 py-3.5 bg-sky-500/10 text-sky-500 rounded-2xl border border-sky-500/20">
                        <Icon name="Info" className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Tarifas Activas por Zona</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 shadow-sm border border-sky-500/20">
                            <Icon name="MapPin" className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Gestión de Destinos</h3>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Configura tarifas y agencias en un solo lugar</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAddCityOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-sky-500 text-white rounded-2xl text-xs font-black hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
                    >
                        <Icon name="PlusCircle" className="w-5 h-5" /> Añadir Ciudad
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {config.cityRates.map((city, index) => (
                        <div key={`${city.department}-${city.city}`} className="glass-card p-6 border-l-4 border-sky-500 bg-[var(--bg-card)] space-y-6 rounded-3xl hover:shadow-xl transition-all border border-[var(--border-subtle)]">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-black text-sky-500 uppercase tracking-widest block mb-1">{city.department}</span>
                                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{city.city}</h4>
                                </div>
                                <button
                                    onClick={() => removeCityRate(index)}
                                    className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors active:scale-90"
                                >
                                    <Icon name="Trash2" className="w-4 h-4 ml-[2px]" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor={`city-rate-${index}`} className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tarifa Plana</label>
                                    <div className="flex items-center gap-2 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                                        <span className="text-xs font-black text-emerald-500">S/</span>
                                        <input
                                            id={`city-rate-${index}`}
                                            type="number"
                                            value={city.rate}
                                            onChange={(e) => updateCityRateValue(index, parseFloat(e.target.value))}
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Puntos de Recojo</span>
                                        <button
                                            onClick={() => {
                                                setSelectedCityIndex(index);
                                                setIsAddAgencyOpen(true);
                                            }}
                                            className="text-xs font-black text-sky-500 uppercase hover:underline"
                                        >
                                            + Añadir
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {city.agencies.map((ag, agIdx) => (
                                            <div key={ag.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)] group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Icon name="Building2" className="text-[var(--text-secondary)] w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-[var(--text-primary)] truncate">{ag.name}</p>
                                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase truncate max-w-[120px]">{ag.address}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeAgency(index, agIdx)}
                                                    className="text-[var(--text-secondary)] hover:text-red-500 p-1 transition-colors active:scale-90"
                                                >
                                                    <Icon name="Trash2" className="w-[14px] h-[14px] ml-[2px]" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                        <Icon name="ShieldCheck" className="text-sky-500 w-5 h-5" /> Operadores Habilitados
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {(Object.entries(config.operators) as [keyof typeof config.operators, { enabled: boolean; name: string; discount: number }][]).map(([key, op]) => (
                            <div key={key} className="glass-card p-4 rounded-3xl border border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                                        <Icon name="Truck" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-[var(--text-primary)]">{op.name}</h4>
                                        <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${op.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
                                            {op.enabled ? 'Operando' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                                <ToggleSwitch
                                    enabled={op.enabled}
                                    onChange={(val) => updateOperator(key, val)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                        <Icon name="ListChecks" className="text-sky-500 w-5 h-5" /> Estrategias de Despacho
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Puerta a Puerta', icon: 'Home', key: 'puertaAPuertaEnabled' as keyof GlobalLogisticsConfig, desc: 'Envío directo al domicilio del cliente.' },
                            { label: 'Recojo en Agencia', icon: 'Building2', key: 'recojoAgenciaEnabled' as keyof GlobalLogisticsConfig, desc: 'Puntos de recojo Shalom, Olva o Cruz del Sur.' }
                        ].map(strategy => (
                            <div key={strategy.key} className="p-5 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:shadow-xl transition-all group flex items-start gap-4">
                                <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 flex-shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                    <Icon name={strategy.icon} className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-black text-[var(--text-primary)] text-sm tracking-tight">{strategy.label}</h4>
                                        <ToggleSwitch
                                            enabled={!!config.globalConfig[strategy.key]}
                                            onChange={(val) => updateGlobalConfig({ [strategy.key]: val })}
                                            size="sm"
                                        />
                                    </div>
                                    <p className="text-[10px] font-medium text-[var(--text-secondary)]">{strategy.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AddCityModal
                isOpen={isAddCityOpen}
                onClose={() => setIsAddCityOpen(false)}
                onSave={(rate) => addCityRate(rate)}
            />

            <AddAgencyModal
                isOpen={isAddAgencyOpen}
                onClose={() => {
                    setIsAddAgencyOpen(false);
                    setSelectedCityIndex(null);
                }}
                onSave={(agency) => {
                    if (selectedCityIndex !== null) {
                        const logo = agency.name.toUpperCase().includes('SHALOM') ? '/img/SHALOM.png' :
                            agency.name.toUpperCase().includes('OLVA') ? '/img/OLVA.png' : '/img/AGENCY_DEFAULT.png';
                        addAgency(selectedCityIndex, { ...agency, logo });
                    }
                }}
            />
        </div>
    );
}
