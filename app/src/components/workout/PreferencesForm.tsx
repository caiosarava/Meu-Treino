import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TrainingPreferences, TrainingGoal } from '@/types';
import { trainingGoalLabels } from '@/types';
import { Target, Calendar, Clock, Dumbbell } from 'lucide-react';

interface PreferencesFormProps {
  preferences: TrainingPreferences;
  onUpdate: (field: keyof TrainingPreferences, value: any) => void;
  errors: Record<string, string>;
}

const trainingGoalsList: TrainingGoal[] = ['emagrecimento', 'hipertrofia', 'resistencia', 'condicionamento', 'forca'];

export function PreferencesForm({ preferences, onUpdate, errors }: PreferencesFormProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-5 h-5 text-primary" />
          Preferências de Treino
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Objetivo */}
        <div className="space-y-2">
          <Label htmlFor="objetivo" className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Objetivo Principal
          </Label>
          <Select
            value={preferences.objetivo}
            onValueChange={(value: TrainingGoal) => onUpdate('objetivo', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione seu objetivo" />
            </SelectTrigger>
            <SelectContent>
              {trainingGoalsList.map((goal) => (
                <SelectItem key={goal} value={goal}>
                  {trainingGoalLabels[goal]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Seu objetivo principal determinará a estrutura e intensidade do treino.
          </p>
        </div>

        {/* Dias Disponíveis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Dias Disponíveis por Semana
            </Label>
            <span className="text-2xl font-bold text-primary">
              {preferences.diasDisponiveis}
            </span>
          </div>
          <Slider
            value={[preferences.diasDisponiveis]}
            onValueChange={(value) => onUpdate('diasDisponiveis', value[0])}
            min={1}
            max={7}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 dia</span>
            <span>4 dias</span>
            <span>7 dias</span>
          </div>
          {errors.diasDisponiveis && (
            <p className="text-sm text-red-500">{errors.diasDisponiveis}</p>
          )}
        </div>

        {/* Tempo por Treino */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Tempo por Treino
            </Label>
            <span className="text-2xl font-bold text-primary">
              {preferences.tempoPorTreino} min
            </span>
          </div>
          <Slider
            value={[preferences.tempoPorTreino]}
            onValueChange={(value) => onUpdate('tempoPorTreino', value[0])}
            min={15}
            max={180}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>15 min</span>
            <span>60 min</span>
            <span>180 min</span>
          </div>
          {errors.tempoPorTreino && (
            <p className="text-sm text-red-500">{errors.tempoPorTreino}</p>
          )}
        </div>

        {/* Resumo Visual */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Resumo do Programa</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Objetivo:</span>
              <p className="font-medium">{trainingGoalLabels[preferences.objetivo]}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Frequência:</span>
              <p className="font-medium">{preferences.diasDisponiveis}x por semana</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duração:</span>
              <p className="font-medium">{preferences.tempoPorTreino} min/treino</p>
            </div>
            <div>
              <span className="text-muted-foreground">Volume semanal:</span>
              <p className="font-medium">{preferences.diasDisponiveis * preferences.tempoPorTreino} min</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
