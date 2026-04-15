// Tipos para o formulário de entrada do usuário
export interface UserProfile {
  idade: number;
  altura: number; // em cm
  peso: number; // em kg
  sexo: 'masculino' | 'feminino' | 'outro';
  imc: number;
}

export type ActivityLevel = 
  | 'sedentario' 
  | 'levemente_ativo' 
  | 'moderadamente_ativo' 
  | 'muito_ativo';

export type HealthCondition = 
  | 'gravidez' 
  | 'diabetes' 
  | 'hipertensao' 
  | 'lesoes' 
  | 'outros';

export interface HealthInfo {
  nivelAtividade: ActivityLevel;
  condicoesEspeciais: HealthCondition[];
  outrasCondicoes?: string;
}

export type TrainingGoal = 
  | 'emagrecimento' 
  | 'hipertrofia' 
  | 'resistencia' 
  | 'condicionamento' 
  | 'forca';

export interface TrainingPreferences {
  objetivo: TrainingGoal;
  diasDisponiveis: number; // 1-7
  tempoPorTreino: number; // em minutos
}

// Interface completa do formulário
export interface WorkoutFormData {
  perfil: UserProfile;
  saude: HealthInfo;
  preferencias: TrainingPreferences;
}

// Tipos para o treino gerado
export interface Exercise {
  nome: string;
  series: number;
  repeticoes: string;
  carga?: string;
  descanso: string;
  observacoes?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  dia: string;
  grupoMuscular: string;
  exercicios: Exercise[];
  duracaoEstimada: number;
}

export interface GeneratedWorkout {
  nome: string;
  descricao: string;
  nivel: string;
  diasTreino: WorkoutDay[];
  recomendacoesGerais: string[];
  restricoesConsideradas: string[];
}

// Formato de exportação para Hevy
export interface HevyExercise {
  exercise_name: string;
  exercise_type: 'weight_reps' | 'bodyweight_reps' | 'timed';
  sets: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
}

export interface HevyWorkout {
  workout_name: string;
  description: string;
  exercises: HevyExercise[];
}

// Estado do aplicativo
export interface AppState {
  formData: WorkoutFormData | null;
  generatedWorkout: GeneratedWorkout | null;
  isLoading: boolean;
  error: string | null;
  workoutHistory: GeneratedWorkout[];
}

// Labels para exibição
export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentario: 'Sedentário (pouco ou nenhum exercício)',
  levemente_ativo: 'Levemente Ativo (exercício 1-3x por semana)',
  moderadamente_ativo: 'Moderadamente Ativo (exercício 3-5x por semana)',
  muito_ativo: 'Muito Ativo (exercício 6-7x por semana)',
};

export const healthConditionLabels: Record<HealthCondition, string> = {
  gravidez: 'Gravidez',
  diabetes: 'Diabetes',
  hipertensao: 'Hipertensão (Pressão Alta)',
  lesoes: 'Lesões ou Limitações Físicas',
  outros: 'Outras Condições',
};

export const trainingGoalLabels: Record<TrainingGoal, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Hipertrofia (Ganho de Massa)',
  resistencia: 'Resistência Cardiovascular',
  condicionamento: 'Condicionamento Físico Geral',
  forca: 'Força',
};
