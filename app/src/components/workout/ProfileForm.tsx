import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserProfile } from '@/types';
import { User, Ruler, Weight, Calculator } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate: (field: keyof UserProfile, value: any) => void;
  errors: Record<string, string>;
  imcClassification: { label: string; color: string };
}

export function ProfileForm({ profile, onUpdate, errors, imcClassification }: ProfileFormProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="w-5 h-5 text-primary" />
          Perfil Físico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Idade e Sexo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="idade" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Idade (anos)
            </Label>
            <Input
              id="idade"
              type="number"
              min={16}
              max={90}
              value={profile.idade}
              onChange={(e) => onUpdate('idade', parseInt(e.target.value) || 0)}
              className={errors.idade ? 'border-red-500' : ''}
              placeholder="30"
            />
            {errors.idade && (
              <p className="text-sm text-red-500">{errors.idade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Sexo
            </Label>
            <RadioGroup
              value={profile.sexo}
              onValueChange={(value) => onUpdate('sexo', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masculino" id="masculino" />
                <Label htmlFor="masculino" className="cursor-pointer">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feminino" id="feminino" />
                <Label htmlFor="feminino" className="cursor-pointer">Feminino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outro" id="outro" />
                <Label htmlFor="outro" className="cursor-pointer">Outro</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Altura e Peso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="altura" className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              Altura (cm)
            </Label>
            <Input
              id="altura"
              type="number"
              min={100}
              max={250}
              value={profile.altura}
              onChange={(e) => onUpdate('altura', parseInt(e.target.value) || 0)}
              className={errors.altura ? 'border-red-500' : ''}
              placeholder="170"
            />
            {errors.altura && (
              <p className="text-sm text-red-500">{errors.altura}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso" className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-muted-foreground" />
              Peso (kg)
            </Label>
            <Input
              id="peso"
              type="number"
              min={30}
              max={300}
              step={0.1}
              value={profile.peso}
              onChange={(e) => onUpdate('peso', parseFloat(e.target.value) || 0)}
              className={errors.peso ? 'border-red-500' : ''}
              placeholder="70"
            />
            {errors.peso && (
              <p className="text-sm text-red-500">{errors.peso}</p>
            )}
          </div>
        </div>

        {/* IMC Calculado */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-primary" />
            <Label className="font-semibold">IMC Calculado</Label>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {profile.imc > 0 ? profile.imc.toFixed(1) : '--'}
            </span>
            {imcClassification.label && (
              <span className={`text-sm font-medium ${imcClassification.color}`}>
                {imcClassification.label}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            O IMC é calculado automaticamente com base no seu peso e altura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
