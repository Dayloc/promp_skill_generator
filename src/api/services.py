import os
from groq import Groq
from api.utils import APIException


class AIService:

    PROMPT_SYSTEM = """Eres un experto en ingeniería de prompts. Tu misión es construir un prompt completo, estructurado y listo para usar en cualquier sistema de IA (ChatGPT, Claude, Gemini, Mistral, etc.).

Dadas las especificaciones del usuario, genera un prompt que sea:
- Claro y sin ambigüedades
- Autocontenido (funciona sin contexto adicional)
- Optimizado para obtener la mejor respuesta posible de la IA
- Estructurado con secciones bien definidas usando markdown cuando sea apropiado

El prompt debe incluir todos los elementos provistos: rol, contexto, tarea, formato y restricciones. Si no se proporcionó algún elemento, infiere el más adecuado según el contexto.

REGLA CRÍTICA: Devuelve ÚNICAMENTE el texto del prompt. Sin explicaciones, sin prefijos como "Aquí está el prompt:", sin comillas que lo envuelvan. Solo el prompt puro y listo para copiar."""

    SKILL_SYSTEM = """Eres un experto en Claude Code y en el diseño de skills (habilidades personalizadas). Tu misión es generar un archivo de skill completo en formato Markdown que siga exactamente el estándar de Claude Code.

El archivo de skill DEBE tener esta estructura:

---
description: [Una descripción concisa y específica de cuándo activar este skill. Escrita orientada al trigger de uso.]
---

# [Nombre del Skill]

[Instrucciones detalladas, claras y accionables para Claude. Usa un tono imperativo y directo.]

## Pasos
1. [Paso 1]
2. [Paso 2]

## Consideraciones
- [Punto importante]

[Incluye ejemplos si fueron provistos por el usuario]

REGLAS:
- Las instrucciones deben ser suficientemente específicas para que Claude actúe sin pedir aclaraciones
- Menciona las herramientas de Claude Code cuando sean relevantes (Read, Edit, Grep, Bash, Glob, Write, etc.)
- El skill debe ser autocontenido

REGLA CRÍTICA: Devuelve ÚNICAMENTE el contenido markdown del skill. Sin explicaciones externas, sin prefijos, sin comillas que lo envuelvan."""

    @classmethod
    def _build_prompt_content(cls, inputs: dict) -> str:
        return f"""Especificaciones para el prompt:

**Tipo de tarea:** {inputs.get('task_type') or 'No especificado'}

**Rol / Persona:** {inputs.get('role') or 'No especificado'}

**Contexto:** {inputs.get('context') or 'No especificado'}

**Tarea principal:** {inputs.get('task') or 'No especificado'}

**Formato de respuesta:** {inputs.get('format') or 'No especificado'}

**Restricciones / Estilo:** {inputs.get('constraints') or 'No especificado'}

**Ejemplos:** {inputs.get('examples') or 'No proporcionados'}"""

    @classmethod
    def _build_skill_content(cls, inputs: dict) -> str:
        return f"""Especificaciones para el skill:

**Tipo de skill:** {inputs.get('task_type') or 'No especificado'}

**Nombre del skill:** {inputs.get('skill_name') or 'No especificado'}

**Cuándo debe activarse:** {inputs.get('trigger') or 'No especificado'}

**Qué debe hacer:** {inputs.get('action') or 'No especificado'}

**Herramientas disponibles:** {inputs.get('tools') or 'Las que sean necesarias'}

**Ejemplo de uso:** {inputs.get('example') or 'No proporcionado'}"""

    @classmethod
    def generate(cls, mode: str, inputs: dict) -> str:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise APIException("GROQ_API_KEY not configured on the server", 500)

        system = cls.PROMPT_SYSTEM if mode == "prompt" else cls.SKILL_SYSTEM
        user_content = (
            cls._build_prompt_content(inputs)
            if mode == "prompt"
            else cls._build_skill_content(inputs)
        )

        client = Groq(api_key=api_key)
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        try:
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.7,
                max_tokens=2048,
            )
            return completion.choices[0].message.content
        except Exception as e:
            raise APIException(f"AI generation failed: {str(e)}", 502)
