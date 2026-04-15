import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { ProfileForm } from '@/components/workout/ProfileForm';
import { HealthForm } from '@/components/workout/HealthForm';
import { PreferencesForm } from '@/components/workout/PreferencesForm';
import { WorkoutDisplay } from '@/components/workout/WorkoutDisplay';
import { LoadingState } from '@/components/workout/LoadingState';
import { WorkoutHistory, useWorkoutHistory } from '@/components/workout/WorkoutHistory';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';
import { useWorkoutGenerator } from '@/hooks/useGeminiAPI';
import type { GeneratedWorkout } from '@/types';
import { 
  Dumbbell, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Info
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilitário para classes condicionais
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'profile' | 'health' | 'preferences' | 'generating' | 'result';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [progress, setProgress] = useState(0);
  
  const {
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
  } = useWorkoutForm();

  const { generateWorkout, isLoading, error } = useWorkoutGenerator();
  const { addToHistory } = useWorkoutHistory();

  // Simular progresso durante a geração
  useEffect(() => {
    if (currentStep === 'generating') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Tratar erro da API
  useEffect(() => {
    if (error) {
      toast.error('Erro ao gerar treino', {
        description: error,
      });
      setCurrentStep('preferences');
    }
  }, [error]);

  const steps = [
    { id: 'profile' as Step, label: 'Perfil', number: 1 },
    { id: 'health' as Step, label: 'Saúde', number: 2 },
    { id: 'preferences' as Step, label: 'Preferências', number: 3 },
  ];

  const handleNext = () => {
    switch (currentStep) {
      case 'profile':
        if (validateForm()) {
          setCurrentStep('health');
        } else {
          toast.error('Corrija os erros no formulário');
        }
        break;
      case 'health':
        setCurrentStep('preferences');
        break;
      case 'preferences':
        if (validateForm()) {
          handleGenerate();
        } else {
          toast.error('Corrija os erros no formulário');
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'health':
        setCurrentStep('profile');
        break;
      case 'preferences':
        setCurrentStep('health');
        break;
      case 'result':
        setCurrentStep('preferences');
        setGeneratedWorkout(null);
        break;
    }
  };

  const handleGenerate = async () => {
    setCurrentStep('generating');
    const formData = getFormData();
    const workout = await generateWorkout(formData);
    
    if (workout) {
      setProgress(100);
      setTimeout(() => {
        setGeneratedWorkout(workout);
        addToHistory(workout);
        setCurrentStep('result');
        toast.success('Treino gerado com sucesso!', {
          description: `${workout.nome} - ${workout.diasTreino.length} dias de treino`,
        });
      }, 500);
    }
  };

  const handleReset = () => {
    resetForm();
    setGeneratedWorkout(null);
    setCurrentStep('profile');
    setProgress(0);
  };

  const handleSelectHistoryWorkout = useCallback((workout: GeneratedWorkout) => {
    setGeneratedWorkout(workout);
    setCurrentStep('result');
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <ProfileForm
            profile={profile}
            onUpdate={updateProfile}
            errors={errors}
            imcClassification={getIMCClassification()}
          />
        );
      case 'health':
        return (
          <HealthForm
            health={health}
            onUpdate={updateHealth}
            onToggleCondition={toggleHealthCondition}
          />
        );
      case 'preferences':
        return (
          <PreferencesForm
            preferences={preferences}
            onUpdate={updatePreferences}
            errors={errors}
          />
        );
      case 'generating':
        return <LoadingState progress={progress} />;
      case 'result':
        return generatedWorkout ? (
          <WorkoutDisplay 
            workout={generatedWorkout} 
            onReset={handleReset}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Meu Treino
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Treinos personalizados com IA
                </p>
              </div>
            </div>
            
            {currentStep !== 'generating' && currentStep !== 'result' && (
              <div className="flex items-center gap-1">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : steps.findIndex(s => s.id === currentStep) > idx
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {steps.findIndex(s => s.id === currentStep) > idx ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-6 h-0.5 mx-1',
                          steps.findIndex(s => s.id === currentStep) > idx
                            ? 'bg-primary'
                            : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Banner */}
        {currentStep === 'profile' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Bem-vindo ao Meu Treino
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Preencha seus dados para gerar um treino personalizado. Nossa IA 
                analisará seu perfil e criará um programa adaptado às suas necessidades 
                e objetivos.
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'generating' && currentStep !== 'result' && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'profile'}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {currentStep === 'preferences' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Treino
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* History */}
        {currentStep !== 'result' && currentStep !== 'generating' && (
          <div className="mt-12">
            <WorkoutHistory onSelectWorkout={handleSelectHistoryWorkout} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Meu Treino - Treinos personalizados com inteligência artificial
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Powered by Gemini
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Este aplicativo é apenas para fins informativos. Consulte um médico antes de iniciar qualquer programa de exercícios.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
