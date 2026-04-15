import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { HealthInfo, HealthCondition, ActivityLevel } from '@/types';
import { activityLevelLabels, healthConditionLabels } from '@/types';
import { Heart, Activity, AlertCircle } from 'lucide-react';

interface HealthFormProps {
  health: HealthInfo;
  onUpdate: (field: keyof HealthInfo, value: any) => void;
  onToggleCondition: (condition: HealthCondition) => void;
}

const healthConditionsList: HealthCondition[] = ['gravidez', 'diabetes', 'hipertensao', 'lesoes', 'outros'];

export function HealthForm({ health, onUpdate, onToggleCondition }: HealthFormProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Heart className="w-5 h-5 text-primary" />
          Saúde e Estilo de Vida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nível de Atividade */}
        <div className="space-y-2">
          <Label htmlFor="nivelAtividade" className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Nível de Atividade Física
          </Label>
          <Select
            value={health.nivelAtividade}
            onValueChange={(value: ActivityLevel) => onUpdate('nivelAtividade', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione seu nível de atividade" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(activityLevelLabels) as ActivityLevel[]).map((level) => (
                <SelectItem key={level} value={level}>
                  {activityLevelLabels[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Selecione o nível que melhor descreve sua rotina atual de exercícios.
          </p>
        </div>

        {/* Condições Especiais */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            Condições Especiais de Saúde
          </Label>
          <p className="text-xs text-muted-foreground">
            Selecione todas as condições que se aplicam ao seu caso. Isso ajudará a personalizar seu treino de forma segura.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {healthConditionsList.map((condition) => (
              <div
                key={condition}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onToggleCondition(condition)}
              >
                <Checkbox
                  id={`condition-${condition}`}
                  checked={health.condicoesEspeciais.includes(condition)}
                  onCheckedChange={() => onToggleCondition(condition)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`condition-${condition}`}
                  className="text-sm cursor-pointer font-normal leading-tight"
                >
                  {healthConditionLabels[condition]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Campo para outras condições */}
        {health.condicoesEspeciais.includes('outros') && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="outrasCondicoes">
              Descreva outras condições ou limitações
            </Label>
            <Textarea
              id="outrasCondicoes"
              value={health.outrasCondicoes || ''}
              onChange={(e) => onUpdate('outrasCondicoes', e.target.value)}
              placeholder="Ex: Asma, problema no joelho esquerdo, hérnia de disco..."
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Alerta de segurança */}
        {health.condicoesEspeciais.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Importante
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Você selecionou condições especiais de saúde. Recomendamos fortemente 
                consultar um médico antes de iniciar qualquer programa de exercícios. 
                O treino gerado será adaptado, mas não substitui orientação médica.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
