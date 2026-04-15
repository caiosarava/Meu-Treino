import { useState, useCallback, useEffect } from 'react';
import type { 
  WorkoutFormData, 
  UserProfile, 
  HealthInfo, 
  TrainingPreferences,
  HealthCondition
} from '@/types';

const initialProfile: UserProfile = {
  idade: 30,
  altura: 170,
  peso: 70,
  sexo: 'masculino',
  imc: 0,
};

const initialHealth: HealthInfo = {
  nivelAtividade: 'moderadamente_ativo',
  condicoesEspeciais: [],
  outrasCondicoes: '',
};

const initialPreferences: TrainingPreferences = {
  objetivo: 'hipertrofia',
  diasDisponiveis: 4,
  tempoPorTreino: 60,
};

export function useWorkoutForm() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [health, setHealth] = useState<HealthInfo>(initialHealth);
  const [preferences, setPreferences] = useState<TrainingPreferences>(initialPreferences);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular IMC automaticamente quando peso ou altura mudam
  useEffect(() => {
    if (profile.altura > 0 && profile.peso > 0) {
      const alturaEmMetros = profile.altura / 100;
      const imc = Number((profile.peso / (alturaEmMetros * alturaEmMetros)).toFixed(1));
      setProfile(prev => ({ ...prev, imc }));
    }
  }, [profile.peso, profile.altura]);

  const updateProfile = useCallback((field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const updateHealth = useCallback((field: keyof HealthInfo, value: any) => {
    setHealth(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleHealthCondition = useCallback((condition: HealthCondition) => {
    setHealth(prev => ({
      ...prev,
      condicoesEspeciais: prev.condicoesEspeciais.includes(condition)
        ? prev.condicoesEspeciais.filter(c => c !== condition)
        : [...prev.condicoesEspeciais, condition]
    }));
  }, []);

  const updatePreferences = useCallback((field: keyof TrainingPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar perfil
    if (profile.idade < 16 || profile.idade > 90) {
      newErrors.idade = 'Idade deve estar entre 16 e 90 anos';
    }
    if (profile.altura < 100 || profile.altura > 250) {
      newErrors.altura = 'Altura deve estar entre 100cm e 250cm';
    }
    if (profile.peso < 30 || profile.peso > 300) {
      newErrors.peso = 'Peso deve estar entre 30kg e 300kg';
    }

    // Validar preferências
    if (preferences.diasDisponiveis < 1 || preferences.diasDisponiveis > 7) {
      newErrors.diasDisponiveis = 'Dias disponíveis deve estar entre 1 e 7';
    }
    if (preferences.tempoPorTreino < 15 || preferences.tempoPorTreino > 180) {
      newErrors.tempoPorTreino = 'Tempo por treino deve estar entre 15 e 180 minutos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile, preferences]);

  const getFormData = useCallback((): WorkoutFormData => ({
    perfil: profile,
    saude: health,
    preferencias: preferences,
  }), [profile, health, preferences]);

  const resetForm = useCallback(() => {
    setProfile(initialProfile);
    setHealth(initialHealth);
    setPreferences(initialPreferences);
    setErrors({});
  }, []);

  // Classificação do IMC
  const getIMCClassification = useCallback((): { label: string; color: string } => {
    const imc = profile.imc;
    if (imc === 0) return { label: '', color: '' };
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-yellow-500' };
    if (imc < 25) return { label: 'Peso normal', color: 'text-green-500' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-orange-500' };
    return { label: 'Obesidade', color: 'text-red-500' };
  }, [profile.imc]);

  return {
    profile,
    health,
    preferences,
    errors,
    updateProfile,
    updateHealth,
    toggleHealthCondition,
    updatePreferences,
    validateForm,
    getFormData,
    resetForm,
    getIMCClassification,
  };
}
