import type { GeneratedWorkout, WorkoutDay, Exercise, HevyWorkout, HevyExercise } from '@/types';

/**
 * Converte um exercício do formato FitGen para o formato Hevy
 */
function convertExerciseToHevy(exercise: Exercise): HevyExercise {
  // Determinar o tipo de exercício
  let exerciseType: 'weight_reps' | 'bodyweight_reps' | 'timed' = 'weight_reps';
  
  const lowerName = exercise.nome.toLowerCase();
  if (lowerName.includes('prancha') || 
      lowerName.includes('plank') || 
      lowerName.includes('corrida') ||
      lowerName.includes('esteira') ||
      lowerName.includes('bicicleta') ||
      exercise.repeticoes.includes('min') ||
      exercise.repeticoes.includes('s')) {
    exerciseType = 'timed';
  } else if (lowerName.includes('peso corporal') || 
             exercise.carga?.toLowerCase().includes('peso corporal') ||
             lowerName.includes(' abdominal') ||
             lowerName.includes('flexão')) {
    exerciseType = 'bodyweight_reps';
  }

  // Parse repetições
  let reps: number | undefined;
  let durationSeconds: number | undefined;
  
  if (exerciseType === 'timed') {
    // Extrair tempo em segundos ou minutos
    const minMatch = exercise.repeticoes.match(/(\d+)\s*min/i);
    const secMatch = exercise.repeticoes.match(/(\d+)\s*s/i);
    
    if (minMatch) {
      durationSeconds = parseInt(minMatch[1]) * 60;
    } else if (secMatch) {
      durationSeconds = parseInt(secMatch[1]);
    } else {
      // Se tiver formato "30-60s", pegar o valor médio
      const rangeMatch = exercise.repeticoes.match(/(\d+)-(\d+)s?/);
      if (rangeMatch) {
        durationSeconds = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
      } else {
        durationSeconds = 30; // default
      }
    }
  } else {
    // Parse repetições numéricas
    const repMatch = exercise.repeticoes.match(/(\d+)(?:-(\d+))?/);
    if (repMatch) {
      if (repMatch[2]) {
        // Range: pegar o valor do meio
        reps = Math.round((parseInt(repMatch[1]) + parseInt(repMatch[2])) / 2);
      } else {
        reps = parseInt(repMatch[1]);
      }
    } else {
      reps = 10; // default
    }
  }

  // Parse carga (kg)
  let weightKg: number | undefined;
  if (exercise.carga && exerciseType === 'weight_reps') {
    // Tentar extrair número da carga
    const weightMatch = exercise.carga.match(/(\d+)/);
    if (weightMatch) {
      weightKg = parseInt(weightMatch[1]);
    }
  }

  // Parse descanso em segundos
  let restSeconds = 60;
  const restMatch = exercise.descanso.match(/(\d+)/);
  if (restMatch) {
    restSeconds = parseInt(restMatch[1]);
    // Se estiver em minutos (valor pequeno provavelmente é minutos)
    if (restSeconds < 10) {
      restSeconds *= 60;
    }
  }

  return {
    exercise_name: exercise.nome,
    exercise_type: exerciseType,
    sets: exercise.series,
    reps,
    weight_kg: weightKg,
    duration_seconds: durationSeconds,
    rest_seconds: restSeconds,
    notes: exercise.observacoes,
  };
}

/**
 * Converte um dia de treino para o formato Hevy
 */
function convertWorkoutDayToHevy(day: WorkoutDay): HevyWorkout {
  return {
    workout_name: `${day.dia} - ${day.grupoMuscular}`,
    description: `Treino de ${day.grupoMuscular} - Duração estimada: ${day.duracaoEstimada} minutos`,
    exercises: day.exercicios.map((ex) => convertExerciseToHevy(ex)),
  };
}

/**
 * Exporta o treino completo para o formato Hevy (array de treinos)
 */
export function exportToHevy(workout: GeneratedWorkout): HevyWorkout[] {
  return workout.diasTreino.map(day => convertWorkoutDayToHevy(day));
}

/**
 * Gera o arquivo JSON para download
 */
export function downloadHevyJson(workout: GeneratedWorkout): void {
  const hevyWorkouts = exportToHevy(workout);
  const jsonStr = JSON.stringify(hevyWorkouts, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workout.nome.replace(/\s+/g, '_')}_Hevy.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gera um arquivo CSV compatível com importação em alguns apps de treino
 */
export function downloadWorkoutCSV(workout: GeneratedWorkout): void {
  let csv = 'Dia,Grupo Muscular,Exercício,Séries,Repetições,Carga,Descanso,Observações\n';
  
  workout.diasTreino.forEach(day => {
    day.exercicios.forEach(exercise => {
      csv += `"${day.dia}","${day.grupoMuscular}","${exercise.nome}",${exercise.series},"${exercise.repeticoes}","${exercise.carga || ''}","${exercise.descanso}","${exercise.observacoes || ''}"\n`;
    });
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workout.nome.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formata o treino como texto simples para compartilhamento
 */
export function formatWorkoutAsText(workout: GeneratedWorkout): string {
  let text = `🏋️ ${workout.nome.toUpperCase()}\n`;
  text += `${'='.repeat(50)}\n\n`;
  text += `📋 ${workout.descricao}\n`;
  text += `📊 Nível: ${workout.nivel}\n\n`;
  
  workout.diasTreino.forEach(day => {
    text += `📅 ${day.dia.toUpperCase()} - ${day.grupoMuscular}\n`;
    text += `⏱️ Duração: ${day.duracaoEstimada} minutos\n`;
    text += `${'-'.repeat(40)}\n`;
    
    day.exercicios.forEach((ex, idx) => {
      text += `${idx + 1}. ${ex.nome}\n`;
      text += `   ${ex.series} séries x ${ex.repeticoes}`;
      if (ex.carga) text += ` @ ${ex.carga}`;
      text += `\n`;
      text += `   ⏸️ Descanso: ${ex.descanso}\n`;
      if (ex.observacoes) {
        text += `   💡 ${ex.observacoes}\n`;
      }
      text += '\n';
    });
    text += '\n';
  });
  
  text += `📌 RECOMENDAÇÕES GERAIS:\n`;
  text += `${'-'.repeat(40)}\n`;
  workout.recomendacoesGerais.forEach((rec, idx) => {
    text += `${idx + 1}. ${rec}\n`;
  });
  
  text += `\n⚠️ RESTRIÇÕES CONSIDERADAS:\n`;
  text += `${'-'.repeat(40)}\n`;
  workout.restricoesConsideradas.forEach((rest, idx) => {
    text += `${idx + 1}. ${rest}\n`;
  });
  
  text += `\n${'='.repeat(50)}\n`;
  text += `Gerado por FitGen AI 💪\n`;
  
  return text;
}

/**
 * Copia o treino formatado para a área de transferência
 */
export async function copyWorkoutToClipboard(workout: GeneratedWorkout): Promise<boolean> {
  try {
    const text = formatWorkoutAsText(workout);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
}

/**
 * Faz download do treino como arquivo de texto
 */
export function downloadWorkoutText(workout: GeneratedWorkout): void {
  const text = formatWorkoutAsText(workout);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workout.nome.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
