import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GeneratedWorkout } from '@/types';
import { History, Trash2, Eye, Dumbbell, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WorkoutHistoryProps {
  onSelectWorkout: (workout: GeneratedWorkout) => void;
}

const STORAGE_KEY = 'fitgen_workout_history';

export function WorkoutHistory({ onSelectWorkout }: WorkoutHistoryProps) {
  const [history, setHistory] = useState<GeneratedWorkout[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  }, []);

  const saveHistory = (newHistory: GeneratedWorkout[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const removeWorkout = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de Treinos
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {history.map((workout, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{workout.nome}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{workout.diasTreino.length} dias</span>
                      <span>•</span>
                      <span>{workout.nivel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{workout.nome}</DialogTitle>
                        <DialogDescription>{workout.descricao}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{workout.nivel}</Badge>
                          <Badge variant="outline">{workout.diasTreino.length} dias</Badge>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Dias de Treino:</h4>
                          <ul className="space-y-1">
                            {workout.diasTreino.map((day, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                {day.dia}: {day.grupoMuscular} ({day.exercicios.length} exercícios)
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          onClick={() => onSelectWorkout(workout)}
                          className="w-full"
                        >
                          Ver Treino Completo
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeWorkout(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Hook para gerenciar o histórico
export function useWorkoutHistory() {
  const addToHistory = (workout: GeneratedWorkout) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history: GeneratedWorkout[] = stored ? JSON.parse(stored) : [];
    const newHistory = [workout, ...history].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const getHistory = (): GeneratedWorkout[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  return { addToHistory, getHistory };
}
