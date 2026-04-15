import { useState, useCallback } from 'react';
import type { WorkoutFormData, GeneratedWorkout, TrainingGoal, ActivityLevel } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface UseGeminiAPIReturn {
  generateWorkout: (formData: WorkoutFormData) => Promise<GeneratedWorkout | null>;
  isLoading: boolean;
  error: string | null;
}

// Função para construir o prompt dinâmico
function buildPrompt(formData: WorkoutFormData): string {
  const { perfil, saude, preferencias } = formData;

  const goalLabels: Record<TrainingGoal, string> = {
    emagrecimento: 'emagrecimento e queima de gordura',
    hipertrofia: 'hipertrofia muscular (ganho de massa)',
    resistencia: 'resistência cardiovascular e muscular',
    condicionamento: 'condicionamento físico geral',
    forca: 'força máxima',
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentario: 'sedentário (pouco ou nenhum exercício)',
    levemente_ativo: 'levemente ativo (exercício 1-3x por semana)',
    moderadamente_ativo: 'moderadamente ativo (exercício 3-5x por semana)',
    muito_ativo: 'muito ativo (exercício 6-7x por semana)',
  };

  const healthConditionsText = saude.condicoesEspeciais.length > 0
    ? saude.condicoesEspeciais.map(c => {
        const labels: Record<string, string> = {
          gravidez: 'Gravidez',
          diabetes: 'Diabetes',
          hipertensao: 'Hipertensão',
          lesoes: 'Lesões ou limitações físicas',
          outros: saude.outrasCondicoes || 'Outras condições',
        };
        return labels[c] || c;
      }).join(', ')
    : 'Nenhuma condição especial';

  return `ROLE:

Você é um treinador físico profissional certificado, com experiência em prescrição de treinos personalizados baseados em evidências científicas, considerando limitações físicas, condições de saúde e nível de condicionamento.
OBJETIVO:

Criar um plano de treino seguro, eficaz e personalizado para o usuário com base nos dados fornecidos.
📥 DADOS DO USUÁRIO

Idade: ${perfil.idade}

Sexo: ${perfil.sexo}

Altura: ${perfil.altura} cm

Peso: ${perfil.peso} kg

IMC: ${perfil.imc}

Nível de atividade: ${activityLabels[saude.nivelAtividade]}
Condições especiais:

${healthConditionsText}
Objetivo do usuário:

${goalLabels[preferencias.objetivo]}
⚠️ REGRAS IMPORTANTES

Priorize segurança acima de performance

Adapte exercícios para quaisquer limitações ou condições médicas

Evite exercícios de risco quando houver:
Hipertensão → evitar picos de esforço

Diabetes → considerar controle glicêmico

Gravidez → evitar impacto e compressão abdominal

Lesões → substituir exercícios afetados

Ajuste intensidade com base no nível de atividade:
Sedentário → início leve

Intermediário → progressão moderada

Avançado → maior volume/intensidade
🏋️ FORMATO DA RESPOSTA (OBRIGATÓRIO)
Responda em JSON estruturado, sem texto adicional fora do JSON:


{
  "workout_name": "string",
  "goal": "string",
  "frequency_per_week": number,
  "days": [
    {
      "day": "string",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string",
          "rest_seconds": number,
          "notes": "string"
        }
      ]
    }
  ],
  "safety_notes": "string",
  "progression_plan": "string"
}

📤 REQUISITOS DE QUALIDADE

Treino deve ser claro e prático

Exercícios devem ser comuns (evitar nomes obscuros)

Incluir instruções curtas nas notas

Garantir progressão ao longo do tempo

Evitar redundância de exercícios
🔄 COMPATIBILIDADE COM HEVY

Use nomes de exercícios padronizados (ex: "Bench Press", "Squat", "Deadlift")

Evite abreviações incomuns

Estruture séries e repetições de forma clara
🎯 RESULTADO ESPERADO
Retorne apenas o JSON válido, pronto para ser convertido em arquivo exportável.`;
}

// Função para fazer parsing seguro da resposta
function parseWorkoutResponse(text: string): GeneratedWorkout | null {
  try {
    // Tentar extrair JSON da resposta (pode vir com markdown ou texto ao redor)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Nenhum JSON encontrado na resposta');
      return null;
    }
    
    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);
    
    // Validar estrutura mínima
    if (!parsed.nome || !parsed.diasTreino || !Array.isArray(parsed.diasTreino)) {
      console.error('Estrutura do JSON inválida');
      return null;
    }
    
    return parsed as GeneratedWorkout;
  } catch (error) {
    console.error('Erro ao fazer parse da resposta:', error);
    return null;
  }
}

export function useGeminiAPI(): UseGeminiAPIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = useCallback(async (formData: WorkoutFormData): Promise<GeneratedWorkout | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se a API key está configurada
      const apiKey = GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key do Gemini não configurada. Configure a variável VITE_GEMINI_API_KEY.');
      }

      const prompt = buildPrompt(formData);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Erro na API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta da API em formato inesperado');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      const workout = parseWorkoutResponse(generatedText);
      
      if (!workout) {
        throw new Error('Não foi possível processar o treino gerado. Tente novamente.');
      }

      return workout;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao gerar treino:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateWorkout,
    isLoading,
    error,
  };
}

// Hook alternativo que usa mock quando a API não está disponível
export function useWorkoutGenerator(): UseGeminiAPIReturn {
  const geminiAPI = useGeminiAPI();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = useCallback(async (formData: WorkoutFormData): Promise<GeneratedWorkout | null> => {
    // Se tiver API key, usa a API real
    if (GEMINI_API_KEY) {
      return geminiAPI.generateWorkout(formData);
    }

    // Caso contrário, gera um treino mockado para demonstração
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWorkout = generateMockWorkout(formData);
      return mockWorkout;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [geminiAPI]);

  return {
    generateWorkout,
    isLoading: geminiAPI.isLoading || isLoading,
    error: geminiAPI.error || error,
  };
}

// Função para gerar treino mockado quando a API não está disponível
function generateMockWorkout(formData: WorkoutFormData): GeneratedWorkout {
  const { perfil, saude, preferencias } = formData;
  
  const objetivos: Record<TrainingGoal, string> = {
    emagrecimento: 'Queima de Gordura',
    hipertrofia: 'Hipertrofia Muscular',
    resistencia: 'Resistência',
    condicionamento: 'Condicionamento',
    forca: 'Força Máxima',
  };

  const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  const gruposMusculares = [
    'Peito e Tríceps',
    'Costas e Bíceps',
    'Pernas Completo',
    'Ombros e Abdômen',
    'Treino Full Body',
    'Cardio e Core',
    'Treino Superior',
  ];

  const exerciciosPorGrupo: Record<string, Array<{nome: string; series: number; repeticoes: string; carga: string; descanso: string}>> = {
    'Peito e Tríceps': [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', carga: '60-70% RM', descanso: '90s' },
      { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', carga: '50-60% RM', descanso: '75s' },
      { nome: 'Crucifixo', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '60s' },
      { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '60s' },
      { nome: 'Tríceps Corda', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '45s' },
    ],
    'Costas e Bíceps': [
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', carga: '60-70% RM', descanso: '90s' },
      { nome: 'Remada Curvada', series: 4, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
      { nome: 'Remada Unilateral', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '60s' },
      { nome: 'Rosca Direta', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '60s' },
      { nome: 'Rosca Martelo', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '45s' },
    ],
    'Pernas Completo': [
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', carga: '60-70% RM', descanso: '120s' },
      { nome: 'Leg Press', series: 4, repeticoes: '10-15', carga: 'Pesado', descanso: '90s' },
      { nome: 'Extensão de Joelhos', series: 3, repeticoes: '12-15', carga: 'Moderada', descanso: '60s' },
      { nome: 'Flexão de Joelhos', series: 3, repeticoes: '12-15', carga: 'Moderada', descanso: '60s' },
      { nome: 'Elevação de Panturrilha', series: 4, repeticoes: '15-20', carga: 'Leve', descanso: '45s' },
    ],
    'Ombros e Abdômen': [
      { nome: 'Desenvolvimento com Halteres', series: 4, repeticoes: '8-12', carga: '60-70% RM', descanso: '90s' },
      { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '60s' },
      { nome: 'Elevação Frontal', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '60s' },
      { nome: 'Abdominal Crunch', series: 3, repeticoes: '15-20', carga: 'Peso corporal', descanso: '45s' },
      { nome: 'Prancha', series: 3, repeticoes: '30-60s', carga: 'Peso corporal', descanso: '45s' },
    ],
    'Treino Full Body': [
      { nome: 'Agachamento', series: 3, repeticoes: '12-15', carga: 'Moderada', descanso: '90s' },
      { nome: 'Supino', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
      { nome: 'Remada', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
      { nome: 'Desenvolvimento', series: 3, repeticoes: '10-12', carga: 'Leve', descanso: '60s' },
      { nome: 'Puxada', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
    ],
    'Cardio e Core': [
      { nome: 'Esteira - Corrida Leve', series: 1, repeticoes: '20 min', carga: 'RITMO CONFIORTÁVEL', descanso: '-' },
      { nome: 'Bicicleta', series: 1, repeticoes: '15 min', carga: 'RESISTÊNCIA MODERADA', descanso: '-' },
      { nome: 'Prancha', series: 3, repeticoes: '45s', carga: 'Peso corporal', descanso: '30s' },
      { nome: 'Russian Twist', series: 3, repeticoes: '20', carga: 'Leve', descanso: '45s' },
      { nome: 'Mountain Climbers', series: 3, repeticoes: '30s', carga: 'Peso corporal', descanso: '30s' },
    ],
    'Treino Superior': [
      { nome: 'Supino Reto', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
      { nome: 'Puxada Frontal', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
      { nome: 'Desenvolvimento', series: 3, repeticoes: '10-12', carga: 'Moderada', descanso: '75s' },
      { nome: 'Rosca Direta', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '60s' },
      { nome: 'Tríceps Corda', series: 3, repeticoes: '12-15', carga: 'Leve', descanso: '60s' },
    ],
  };

  const diasTreino = [];
  for (let i = 0; i < preferencias.diasDisponiveis; i++) {
    const grupo = gruposMusculares[i % gruposMusculares.length];
    const exercicios = exerciciosPorGrupo[grupo] || exerciciosPorGrupo['Treino Full Body'];
    
    diasTreino.push({
      dia: diasSemana[i],
      grupoMuscular: grupo,
      duracaoEstimada: preferencias.tempoPorTreino,
      exercicios: exercicios.map(ex => ({
        ...ex,
        observacoes: saude.condicoesEspeciais.length > 0 
          ? 'Ajuste a carga conforme suas limitações' 
          : 'Mantenha a forma correta',
      })),
    });
  }

  const restricoes = saude.condicoesEspeciais.map(c => {
    const map: Record<string, string> = {
      gravidez: 'Adaptado para gestantes - evitar exercícios deitadas de costas após 1º trimestre',
      diabetes: 'Monitorar glicemia antes e após treino',
      hipertensao: 'Evitar exercícios isométricos prolongados e Valsalva',
      lesoes: 'Atenção redobrada às limitações articulares',
      outros: saude.outrasCondicoes || 'Condições especiais consideradas',
    };
    return map[c] || c;
  });

  return {
    nome: `Programa de ${objetivos[preferencias.objetivo]}`,
    descricao: `Treino personalizado para ${perfil.sexo}, ${perfil.idade} anos, focado em ${objetivos[preferencias.objetivo].toLowerCase()}.`,
    nivel: saude.nivelAtividade === 'sedentario' ? 'Iniciante' : 
           saude.nivelAtividade === 'muito_ativo' ? 'Avançado' : 'Intermediário',
    diasTreino,
    recomendacoesGerais: [
      'Aqueça por 5-10 minutos antes de cada treino',
      'Hidrate-se adequadamente durante o treino',
      'Respeite os tempos de descanso indicados',
      'Aumente a carga gradualmente (princípio da progressão)',
      'Consulte um médico antes de iniciar qualquer programa de exercícios',
    ],
    restricoesConsideradas: restricoes.length > 0 ? restricoes : ['Nenhuma restrição especial'],
  };
}
