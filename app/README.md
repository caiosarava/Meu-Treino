# FitGen AI - Gerador de Treinos Personalizados

Aplicativo web completo que gera treinos físicos personalizados com base nos dados do usuário, utilizando a API do Gemini para criar programas de treino inteligentes e adaptados às necessidades individuais.

## Funcionalidades

### 1. Formulário de Entrada (UX Intuitiva)
- **Dados básicos**: Idade, Altura, Peso, Sexo
- **IMC calculado automaticamente** (peso / altura²)
- **Saúde e estilo de vida**:
  - Nível de sedentarismo (dropdown)
  - Condições especiais (checkbox múltiplo): Gravidez, Diabetes, Hipertensão, Lesões
- **Preferências de treino**: Objetivo, dias disponíveis, tempo por treino

### 2. Integração com API do Gemini
- Geração de treinos personalizados com IA
- Divisão semanal inteligente
- Exercícios com séries, repetições, carga sugerida
- Observações de segurança adaptadas

### 3. Exportação para Hevy
- Formato JSON compatível com importação no app Hevy
- Exportação CSV para planilhas
- Exportação TXT para texto simples
- Copiar para área de transferência

### 4. Interface Moderna
- Design responsivo (mobile-first)
- Feedback visual de carregamento
- Exibição clara do treino gerado
- Histórico de treinos (localStorage)

## Stack Tecnológica

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Integração IA**: Google Gemini API
- **Deploy**: Vercel (compatível)

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   └── workout/         # Componentes específicos do app
│       ├── ProfileForm.tsx
│       ├── HealthForm.tsx
│       ├── PreferencesForm.tsx
│       ├── WorkoutDisplay.tsx
│       ├── LoadingState.tsx
│       └── WorkoutHistory.tsx
├── hooks/
│   ├── useWorkoutForm.ts    # Gerenciamento do formulário
│   └── useGeminiAPI.ts      # Integração com Gemini
├── types/
│   └── index.ts             # Tipos TypeScript
├── utils/
│   └── hevyExport.ts        # Funções de exportação
├── App.tsx
├── main.tsx
└── index.css
```

## Configuração

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd fitgen-ai
npm install
```

### 2. Configure a API Key do Gemini

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da API do Gemini:

```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```

> **Obtenha sua chave em**: https://aistudio.google.com/app/apikey

### 3. Execute em desenvolvimento

```bash
npm run dev
```

### 4. Build para produção

```bash
npm run build
```

## Deploy na Vercel

### Opção 1: Deploy via CLI

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

### Opção 2: Deploy via GitHub

1. Faça push do código para um repositório GitHub
2. Conecte o repositório na Vercel
3. Configure a variável de ambiente `VITE_GEMINI_API_KEY`
4. Deploy automático a cada push

### Configuração de Variáveis de Ambiente na Vercel

1. Acesse o dashboard do projeto
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: sua_chave_aqui

## Exemplo de Prompt Enviado ao Gemini

```
Você é um personal trainer especialista com 20 anos de experiência. 
Crie um treino de musculação personalizado baseado nos seguintes dados:

**PERFIL FÍSICO:**
- Idade: 30 anos
- Sexo: masculino
- Altura: 170cm
- Peso: 70kg
- IMC: 24.2

**ESTILO DE VIDA:**
- Nível de atividade: moderadamente ativo
- Condições especiais: Nenhuma

**PREFERÊNCIAS:**
- Objetivo: hipertrofia
- Dias disponíveis: 4 dias
- Tempo por treino: 60 minutos

[... instruções detalhadas de formato JSON ...]
```

## Exemplo de Resposta Gerada

```json
{
  "nome": "Programa de Hipertrofia Muscular",
  "descricao": "Treino focado em ganho de massa muscular",
  "nivel": "Intermediário",
  "diasTreino": [
    {
      "dia": "Segunda-feira",
      "grupoMuscular": "Peito e Tríceps",
      "duracaoEstimada": 60,
      "exercicios": [
        {
          "nome": "Supino Reto",
          "series": 4,
          "repeticoes": "8-12",
          "carga": "60-70% RM",
          "descanso": "90 segundos",
          "observacoes": "Mantenha a coluna neutra"
        }
      ]
    }
  ],
  "recomendacoesGerais": ["Aqueça antes", "Hidrate-se"],
  "restricoesConsideradas": ["Nenhuma restrição especial"]
}
```

## Funcionamento sem API Key

Se a variável `VITE_GEMINI_API_KEY` não estiver configurada, o aplicativo funcionará em **modo demonstração**, gerando treinos mockados baseados nos dados do usuário. Isso é útil para:

- Testes de desenvolvimento
- Demonstrações
- Fallback quando a API estiver indisponível

## Recursos Adicionais

### Sistema de Recomendação Adaptativa
- Treinos ajustados conforme nível de atividade
- Modificações para condições especiais de saúde
- Progressão de carga sugerida

### Histórico de Treinos
- Armazenamento local (localStorage)
- Até 10 treinos salvos
- Visualização rápida e reutilização

### Personalização por Objetivo
- **Emagrecimento**: Foco em queima calórica e HIIT
- **Hipertrofia**: Treino split com volume adequado
- **Resistência**: Cardio e circuitos
- **Condicionamento**: Full body funcional
- **Força**: Baixas repetições, alta carga

## Segurança

- Validação de dados no cliente
- Sanitização de inputs
- Tratamento de erros da API
- Avisos médicos para condições especiais

## Licença

MIT License - Livre para uso e modificação.

---

**Nota**: Este aplicativo é apenas para fins informativos. Consulte um médico antes de iniciar qualquer programa de exercícios.
