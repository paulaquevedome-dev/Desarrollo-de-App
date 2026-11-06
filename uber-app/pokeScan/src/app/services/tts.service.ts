import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Función para hablar que usaremos en cualquier pantalla
export async function speakPokemonInfo(text: string) {
  try {
    await TextToSpeech.speak({
      text: text,
      lang: 'es-ES',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    });
  } catch (e) {
    console.error('Error al reproducir voz', e);
  }
}