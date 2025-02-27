import inquirer from 'inquirer';
import fs from 'fs';

const setup = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'AI_SELECTED',
      message: 'Escolha a IA:',
      choices: ['GPT', 'GEMINI']
    },
    {
      type: 'input',
      name: 'OPENAI_KEY',
      message: 'Chave OpenAI:',
      when: (ans) => ans.AI_SELECTED === 'GPT',
      validate: (input) => input.startsWith('sk-') || 'Chave inválida!'
    },
    {
      type: 'input',
      name: 'GEMINI_KEY',
      message: 'Chave Gemini:',
      when: (ans) => ans.AI_SELECTED === 'GEMINI',
      validate: (input) => !!input
    },
    {
      type: 'input',
      name: 'PROMPT',
      message: 'Prompt inicial:',
      default: 'Você é um assistente de vendas. Siga estas etapas...'
    }
  ]);

  const envContent = `AI_SELECTED=${answers.AI_SELECTED}
${answers.AI_SELECTED === 'GPT' ? `OPENAI_KEY=${answers.OPENAI_KEY}` : `GEMINI_KEY=${answers.GEMINI_KEY}`}
PROMPT="${answers.PROMPT.replace(/"/g, '\\"')}"
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Configuração salva!');
};

setup();