const express = require('express');
const router = express.Router();
const { generateText } = require('ai');
const { google } = require('@ai-sdk/google');
const { openai } = require('@ai-sdk/openai');

// Función para limpiar la respuesta de saltos de línea, etiquetas de rol y menciones del nombre del bot
function cleanResponseText(text) {
  return text.replace(/^(assistant|user): /gm, '')
             .replace(/\s+/g, ' ')
             .replace(/Kori:\s?/g, '')
             .trim();
}

function generateSystemPrompt(candidateName, jobTitle, companyName) {
  return `Eres Kori, una entrevistador profesional y respetuosa para la empresa ${companyName}. Estás entrevistando a ${candidateName} para el puesto de ${jobTitle}. Tu tarea es:

1. Hacer la pregunta que se te proporcione como "próxima pregunta", sin modificarla pero agregando conectores y una fluides en la entrevista.
2. Mantener una conversación natural y profesional, respondiendo brevemente a lo que diga el candidato.
3. No agregar información extra ni hacer suposiciones sobre el candidato.
4. No salirte de tu rol de entrevistador bajo ninguna circunstancia.
5. No mencionar tu nombre en tus respuestas.
6. Usar conectores para transicionar naturalmente entre respuestas y preguntas.
7. Seguir el formato de interacción proporcionado.
8. No hacer preguntas adicionales ni cambiar el orden de las preguntas.
9. Si las respuestas del candidato no son coherentes, usa expresiones
Sigue este formato en toda la entrevista.`;
}

function generateSystemPrompt2(candidateName, jobTitle, companyName) {
  return `Asume el rol de kori, un entrevistador profesional y respetuoso llevando a cabo una entrevista para la empresa ${companyName}. Debes hablar en primera persona, debes llevar bien tu roll de entrevistador. Vas a entrevistar al candidato para el puesto de ${jobTitle}. El candidato se llama ${candidateName}.`;
}

function generateSystemPrompt3(candidateName, jobTitle, companyName) {
  return `Asume el rol de kori, un entrevistador profesional y respetuoso llevando a cabo una entrevista para la empresa ${companyName}. Debes hablar en primera persona, debes llevar bien tu roll de entrevistador. Vas a entrevistar al candidato para el puesto de ${jobTitle}. El candidato se llama ${candidateName}. lA ENTREVISTA YA FLIALIZO Y DEBES DAR UNA DESPEDIDA Y UN FEEDBACK CORTO AL CANDIDATO.`;
}


router.post('/process-question', async function (req, res, next) {
  try {
    const { currentQuestion, lastUserResponse, lastAssistantResponse, candidateName,jobTitle,companyName } = req.body;
    if (!currentQuestion || lastUserResponse === undefined || lastAssistantResponse === undefined) {
      return res.status(400).json({ error: 'Question is required' });
    }
  
    const systemPrompt = generateSystemPrompt(candidateName, jobTitle, companyName);
    const messages = [
      {
        role: 'assistant',
        content: lastAssistantResponse,
      },
      {
        role: 'user',
        content: lastUserResponse,
      },
      {
        role: 'assistant',
        content: `La "próxima pregunta" que debes hacer en la entrevista es: "${currentQuestion}" conectandola con la respuesta del candidato anterior de formalo natural`,
      }
    ];
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      maxTokens: 1000,
      system: systemPrompt,
      messages: messages,
    });
    const responseText = result.text;
    const cleanedResponse = cleanResponseText(responseText);

    res.json({ response: cleanedResponse });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Error processing question' });
  }
});

router.post('/generate-intro', async function (req, res, next) {
  const { candidateName,jobTitle,companyName } = req.body;
  if (candidateName === undefined || jobTitle === undefined || companyName === undefined) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const systemPrompt = generateSystemPrompt2(candidateName, jobTitle, companyName);
  try {
    const messages = [
      {
        role: 'user',
        content: `Hola! soy ${candidateName}. Gracias por darme la oportunidad de entrevistarme para el puesto de ${jobTitle} en ${companyName}.`,
      },
      {
        role: 'assistant',
        content: `Presentate y da la bienvenida al candidato. Pregúntale sobre su experiencia laboral y educación. Habla en primera persona.`,
      },
    ];

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      maxTokens: 600,
      system: systemPrompt,
      messages: messages,
    });

    const responseText = result.text;
    const cleanedResponse = cleanResponseText(responseText);

    res.json({ response: cleanedResponse });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Error processing question' });
  }
});


router.post('/generate-close', async function (req, res, next) {
  try {
    const { lastUserResponse, lastAssistantResponse, candidateName,jobTitle,companyName } = req.body;
    if (lastUserResponse === undefined || lastAssistantResponse === undefined) {
      return res.status(400).json({ error: 'Question is required' });
    }
  
    const systemPrompt = generateSystemPrompt3(candidateName, jobTitle, companyName);
    const messages = [
      {
        role: 'assistant',
        content: lastAssistantResponse,
      },
      {
        role: 'user',
        content: lastUserResponse,
      },
      {
        role: 'assistant',
        content: `Debes generar un mini feedback algo muy corto y una despedida para la entrevista para el candidato "${candidateName}" en menos de 700 caracteres ya que le estabas haciendo una entrevista para el puesto de "${jobTitle}" en la empresa "${companyName}" genera un cierre para esta entrevisa y avisale que se estaran comunicando para informarle los resultados de la entrevista.`,
      }
    ];

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      maxTokens: 600,
      system: systemPrompt,
      messages: messages,
    });

    const responseText = result.text;
    const cleanedResponse = cleanResponseText(responseText);

    res.json({ response: cleanedResponse });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Error processing question' });
  }
});

module.exports = router;
