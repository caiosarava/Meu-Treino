import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Brain, FileCheck, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  progress?: number;
}

export function LoadingState({ progress = 0 }: LoadingStateProps) {
  const steps = [
    { icon: Dumbbell, text: 'Analisando seu perfil físico...', active: progress >= 0 },
    { icon: Brain, text: 'Consultando base de conhecimento...', active: progress >= 30 },
    { icon: Sparkles, text: 'Gerando exercícios personalizados...', active: progress >= 60 },
    { icon: FileCheck, text: 'Finalizando seu treino...', active: progress >= 90 },
  ];

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Criando seu treino personalizado
          </h3>
          <p className="text-sm text-muted-foreground">
            Nossa IA está analisando seus dados e criando o programa perfeito para você...
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                step.active
                  ? 'bg-primary/10 opacity-100'
                  : 'bg-muted opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  step.active ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                }`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  step.active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.text}
              </span>
              {step.active && progress >= (idx + 1) * 25 && (
                <CheckIcon className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            {progress}% concluído
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
