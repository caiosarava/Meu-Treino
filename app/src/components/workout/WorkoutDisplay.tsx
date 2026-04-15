import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { GeneratedWorkout, WorkoutDay } from '@/types';
import { 
  downloadHevyJson, 
  downloadWorkoutCSV, 
  downloadWorkoutText,
  copyWorkoutToClipboard 
} from '@/utils/hevyExport';
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Download,
  FileJson,
  FileText,
  Table,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  Info
} from 'lucide-react';

interface WorkoutDisplayProps {
  workout: GeneratedWorkout;
  onReset: () => void;
}

function ExerciseCard({ exercise, index }: { exercise: WorkoutDay['exercicios'][0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {index + 1}
          </span>
          <div>
            <p className="font-medium">{exercise.nome}</p>
            <p className="text-sm text-muted-foreground">
              {exercise.series} séries × {exercise.repeticoes}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-muted/30 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Séries</p>
              <p className="font-medium">{exercise.series}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Repetições</p>
              <p className="font-medium">{exercise.repeticoes}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Carga</p>
              <p className="font-medium">{exercise.carga || 'Peso corporal'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Descanso</p>
              <p className="font-medium">{exercise.descanso}</p>
            </div>
          </div>
          {exercise.observacoes && (
            <div className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">{exercise.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: WorkoutDay }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {day.dia}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              {day.grupoMuscular}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {day.duracaoEstimada} min
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {day.exercicios.map((exercise, idx) => (
            <ExerciseCard key={idx} exercise={exercise} index={idx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkoutDisplay({ workout, onReset }: WorkoutDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyWorkoutToClipboard(workout);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">{workout.nome}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {workout.descricao}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Nível: {workout.nivel}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {workout.diasTreino.length} dias/semana
          </Badge>
        </div>
      </div>

      {/* Tabs para os dias de treino */}
      <Tabs defaultValue="day-0" className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-1">
          {workout.diasTreino.map((day, idx) => (
            <TabsTrigger 
              key={idx} 
              value={`day-${idx}`}
              className="flex-shrink-0"
            >
              {day.dia.substring(0, 3)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="recomendacoes" className="flex-shrink-0">
            Dicas
          </TabsTrigger>
        </TabsList>

        {workout.diasTreino.map((day, idx) => (
          <TabsContent key={idx} value={`day-${idx}`} className="mt-4">
            <DayCard day={day} />
          </TabsContent>
        ))}

        <TabsContent value="recomendacoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Recomendações e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recomendações Gerais */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Recomendações Gerais
                </h4>
                <ul className="space-y-2">
                  {workout.recomendacoesGerais.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Restrições Consideradas */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Restrições e Adaptações
                </h4>
                <ul className="space-y-2">
                  {workout.restricoesConsideradas.map((rest, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{rest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Exportar Treino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => downloadHevyJson(workout)}
            >
              <FileJson className="w-6 h-6 text-blue-500" />
              <span className="text-xs">Hevy (JSON)</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => downloadWorkoutCSV(workout)}
            >
              <Table className="w-6 h-6 text-green-500" />
              <span className="text-xs">Planilha (CSV)</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => downloadWorkoutText(workout)}
            >
              <FileText className="w-6 h-6 text-gray-500" />
              <span className="text-xs">Texto (TXT)</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-6 h-6 text-green-500" />
              ) : (
                <Copy className="w-6 h-6 text-purple-500" />
              )}
              <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Exporte seu treino para o app Hevy ou compartilhe com seu personal trainer.
          </p>
        </CardContent>
      </Card>

      {/* Botão de Novo Treino */}
      <div className="flex justify-center">
        <Button 
          variant="default" 
          size="lg"
          onClick={onReset}
          className="min-w-[200px]"
        >
          <Dumbbell className="w-4 h-4 mr-2" />
          Gerar Novo Treino
        </Button>
      </div>
    </div>
  );
}
