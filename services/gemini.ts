import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizQuestion, Difficulty } from "../types";

let _ai: GoogleGenAI | null = null;

export const getAI = (): GoogleGenAI => {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key || key === "undefined" || key === "null" || key === "") {
      throw new Error("Chave de API do Gemini não configurada nas configurações do projeto.");
    }
    _ai = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _ai;
};

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    question: "Qual é a capital da República de Angola?",
    options: ["Benguela", "Huambo", "Luanda", "Lubango"],
    correctAnswer: 2,
    curiosity: "A cidade de Luanda foi fundada a 25 de Janeiro de 1576 pelo explorador português Paulo Dias de Novais.",
    category: "Geografia"
  },
  {
    question: "Qual destas quedas de água é uma das maiores atracções de Angola, localizada na província de Malanje?",
    options: ["Quedas de Kalandula", "Quedas do Chiumbe", "Quedas do Ruacaná", "Cataratas de Vitória"],
    correctAnswer: 0,
    curiosity: "Com 105 metros de altura, as Quedas de Kalandula estão entre as maiores quedas de água do continente africano.",
    category: "Geografia e Natureza"
  },
  {
    question: "Que género de música e dança tradicional angolana foi declarado Património Cultural Imaterial da Humanidade pela UNESCO?",
    options: ["Kizomba", "Semba", "Kuduro", "Marrabenta"],
    correctAnswer: 1,
    curiosity: "O Semba é considerado o ritmo mãe angolano, cuja palavra deriva de 'semba' que em Kimbundu significa 'umbigada'.",
    category: "Cultura e Música"
  },
  {
    question: "Qual é o animal símbolo nacional e endêmico de Angola, que corre o risco de extinção?",
    options: ["Leão", "Guepardo", "Palanca Negra Gigante", "Elefante Africano"],
    correctAnswer: 2,
    curiosity: "A Palanca Negra Gigante é um antílope majestoso extremamente raro, cujo único habitat conhecido é o Parque Nacional de Cangandala em Malanje.",
    category: "Fauna"
  },
  {
    question: "Que planta endêmica, rara e pré-histórica, cresce no deserto do Namibe e sobrevive por séculos?",
    options: ["Welwitschia Mirabilis", "Baobá", "Mulemba", "Acácia Rubra"],
    correctAnswer: 0,
    curiosity: "A Welwitschia Mirabilis pode viver mais de 1000 anos e absorve luz e humidade através das suas extensas folhas e orvalho costeiro.",
    category: "Flora"
  },
  {
    question: "Quem foi a heroica soberana do reino do Ndongo e Matamba que ofereceu resistência firme à ocupação colonial no século XVII?",
    options: ["Rainha Ginga (Njinga Mbandi)", "Rainha Nzinga de Ndongo", "Rainha Lwei", "Princesa Aqualtune"],
    correctAnswer: 0,
    curiosity: "A Rainha Njinga dominava táticas de guerrilha e diplomacia brilhante, negociando tratados com potências internacionais de igual para igual.",
    category: "História"
  },
  {
    question: "Qual é o principal prato típico de Angola, tradicionalmente feito de farinha de mandioca ou milho cozida?",
    options: ["Calulu", "Funge", "Muamba de Galinha", "Mufete"],
    correctAnswer: 1,
    curiosity: "O funge acompanha pratos tradicionais como muamba ou calulu, sendo cozinhado através de um processo vigoroso de mistura.",
    category: "Gastronomia"
  },
  {
    question: "Que província é conhecida carinhosamente no país como a 'Cidade das Acácias Rubras'?",
    options: ["Uíge", "Cabinda", "Benguela", "Cunene"],
    correctAnswer: 2,
    curiosity: "Benguela foi buscar esta designação poética às belas acácia de cor vermelho-vivo que ladeiam as suas históricas avenidas.",
    category: "Geografia"
  },
  {
    question: "Em que dia, mês e ano Angola proclamou de forma oficial a sua Independência Nacional?",
    options: ["11 de Novembro de 1975", "10 de Dezembro de 1956", "4 de Fevereiro de 1961", "25 de Maio de 1963"],
    correctAnswer: 0,
    curiosity: "A proclamação foi feita em Luanda pelo Dr. António Agostinho Neto, que se tornou subsequentemente o primeiro presidente do país.",
    category: "História"
  },
  {
    question: "Qual é a designação da moeda monetária nacional em circulação em Angola?",
    options: ["Kwanza", "Escudo", "Real", "Dólar Angolano"],
    correctAnswer: 0,
    curiosity: "O Kwanza angolano (AOA) tomou o lugar do anterior escudo colonial em 1977 e é uma homenagem ao rio homónimo.",
    category: "Sociedade e Economia"
  },
  {
    question: "A Fenda da Tundavala, um espetacular miradouro natural com queda abrupta, localiza-se na província da...",
    options: ["Namibe", "Huíla", "Cuanza Sul", "Lunda Sul"],
    correctAnswer: 1,
    curiosity: "A Tundavala fica perto da cidade do Lubango, oferecendo uma vista formidável a mais de 2.200 metros acima do nível de mar.",
    category: "Geografia e Natureza"
  },
  {
    question: "Qual destas línguas de origem bantu é muito falada na província de Benguela e no Planalto Central?",
    options: ["Umbundu", "Kimbundu", "Fiote", "Cokwe"],
    correctAnswer: 0,
    curiosity: "O Umbundu é a língua tradicional do povo Ovimbundu, sendo a mais falada em termos de falantes nativos depois do Português.",
    category: "Línguas e Tradições"
  },
  {
    question: "Qual é o nome do icónico prato costeiro de peixe assado acompanhado por feijão de óleo de palma, típico da praia de Luanda?",
    options: ["Calulu", "Moamba", "Mufete", "Funge de Bombó"],
    correctAnswer: 2,
    curiosity: "O Mufete é uma refeição de peixe fresco (habitualmente carapau) servido com batata doce, mandioca, banana-pão cozida e feijão.",
    category: "Gastronomia"
  },
  {
    question: "Que província do norte de Angola é historicamente famosa pela sua farta colheita e altíssima qualidade de café?",
    options: ["Uíge", "Bié", "Zaire", "Cuando Cubango"],
    correctAnswer: 0,
    curiosity: "O café Robusta do Uíge gerou outrora grande riqueza material e colocou o país nas maiores quotas comerciais de exportação na época.",
    category: "Sociedade e Geografia"
  },
  {
    question: "Qual é o nome do histórico fortim em Luanda, datado do século XVI, que agora abriga o Museu das Forças Armadas?",
    options: ["Palácio de Ferro", "Fortaleza de São Miguel", "Mausoléu de Agostinho Neto", "Forte de São Francisco"],
    correctAnswer: 1,
    curiosity: "Fundada por Paulo Dias de Novais em 1576, a Fortaleza de São Miguel assenta no antigo monte de São Paulo dominando a entrada da baía.",
    category: "História e Turismo"
  },
  {
    question: "Que imensa árvore africana, conhecida como embondeiro, é sagrada e pode armazenar milhares de litros de água?",
    options: ["Figueira", "Baobá (Embondeiro)", "Eucalipto", "Mulemba"],
    correctAnswer: 1,
    curiosity: "O Imbondeiro ou Baobá é um dos grandes símbolos da flora de Angola, reverenciado pela sua longevidade de milénios.",
    category: "Flora"
  },
  {
    question: "Em que província angolana se situa a famosa Estrada da Serra da Leba, conhecida pelas suas curvas em ziguezague?",
    options: ["Namibe", "Huíla", "Benguela", "Cunene"],
    correctAnswer: 1,
    curiosity: "As impressionantes curvas da Serra da Leba ligam as províncias da Huíla e do Namibe, descendo um desfiladeiro de quase 1.000 metros.",
    category: "Geografia e Estrada"
  },
  {
    question: "Qual é o rio mais longo inteiramente dentro do território de Angola?",
    options: ["Rio Kwanza", "Rio Cunene", "Rio Cubango", "Rio Zambeze"],
    correctAnswer: 0,
    curiosity: "O Rio Kwanza nasce no Planalto Central (Bié) e corre por 960 km até desaguar no Oceano Atlântico ao sul de Luanda.",
    category: "Geografia e Natureza"
  },
  {
    question: "Quem escreveu o clássico livro de poemas 'Sagrada Esperança', um marco literário da identidade nacional?",
    options: ["Pepetela", "José Luandino Vieira", "António Agostinho Neto", "Alda Lara"],
    correctAnswer: 2,
    curiosity: "Agostinho Neto foi médico, escritor consagrado e político proeminente, retratando na sua literatura o sofrimento e luta do povo.",
    category: "Literatura"
  },
  {
    question: "O famoso 'Pensador' (O Pensador de Cokwe), uma magnífica escultura de madeira de uma figura sentada, é originário de que povo?",
    options: ["Ovimbundu", "Cokwe (Quiocos)", "Bakongo", "Ambos"],
    correctAnswer: 1,
    curiosity: "O Pensador é o símbolo máximo da cultura nacional angolana, representando a sabedoria dos anciões da etnia Cokwe da Lunda.",
    category: "Artesanato e Escultura"
  },
  {
    question: "Que famosa batalha militar ocorreu na província do Cuando Cubango em 1987-1988, definindo o rumo da história austral da África?",
    options: ["Batalha de Cuito Cuanavale", "Batalha de Ambuíla", "Batalha de Ntende", "Batalha do Luena"],
    correctAnswer: 0,
    curiosity: "A Batalha de Cuito Cuanavale é considerada o maior confronto militar em África desde a Segunda Guerra Mundial, acelerando a independência da Namíbia.",
    category: "História"
  },
  {
    question: "Qual é a segunda maior cidade de Angola em termos de população e pólo de desenvolvimento do Planalto Central?",
    options: ["Huambo", "Benguela", "Cabinda", "Lubango"],
    correctAnswer: 0,
    curiosity: "Huambo foi fundada em 1912 e chamou-se temporariamente 'Nova Lisboa' antes da proclamação da independência angolana.",
    category: "Geografia"
  },
  {
    question: "Qual destas especialidades é um doce tradicional feito de coco ralado e açúcar, muito popular em Angola?",
    options: ["Cocada", "Doce de Ginguba", "Pudim de Leite", "Bolo de Mandioca"],
    correctAnswer: 0,
    curiosity: "A cocada fresca ou assada é consumida extensivamente em feiras públicas, padarias e residências por todo o país.",
    category: "Gastronomia"
  },
  {
    question: "Que estilo musical angolano moderno, de andamento super rápido e batidas electrónicas, conquistou pistas mundiais nos anos 90?",
    options: ["Semba", "Kuduro", "Kizomba", "Rebita"],
    correctAnswer: 1,
    curiosity: "O Kuduro foi criado por Tony Amado no início dos anos 90, misturando ritmos tradicionais com batidas de techno e rap.",
    category: "Música"
  },
  {
    question: "A província de Cabinda é famosa pela sua grande riqueza natural. Que recurso é maioritariamente extraído nessa região?",
    options: ["Diamantes", "Petróleo", "Ouro", "Cobre"],
    correctAnswer: 1,
    curiosity: "Cabinda é um enclave de Angola, limitado geograficamente pelo Congo, e representa grande parte da extração petrolífera nacional.",
    category: "Economia"
  },
  {
    question: "O Parque Nacional da Quissama, uma reserva natural extraordinária para observação de fauna selvagem, situa-se perto de...",
    options: ["Luanda", "Malanje", "Namibe", "Uíge"],
    correctAnswer: 0,
    curiosity: "Apenas 75 quilómetros ao sul de Luanda, o Parque da Quissama abriga elefantes, girafas, pacaças e antílopes no seu habitat natural.",
    category: "Turismo e Fauna"
  },
  {
    question: "Qual é o principal rio que demarca a fronteira sul entre Angola e a Namíbia?",
    options: ["Rio Cunene", "Rio Cuanza", "Rio Zaire", "Rio Chobe"],
    correctAnswer: 0,
    curiosity: "O Rio Cunene serve de fronteira natural e alimenta a barragem hidroelétrica de Ruacaná no sul de Angola.",
    category: "Geografia"
  },
  {
    question: "Qual destas danças elegantes de par, que ganhou vulto global, tem o seu nome associado à evolução do Semba?",
    options: ["Kizomba", "Tango", "Salsa", "Funaná"],
    correctAnswer: 0,
    curiosity: "Kizomba significa 'festa' em Kimbundu, surgindo nos anos 80 pela mistura de Semba lento com música Zouk das Antilhas.",
    category: "Música e Dança"
  },
  {
    question: "Que instrumento folclórico de precussão angolano serve de base para guiar o tom e compasso do estilo musical Semba?",
    options: ["Reco-reco (Dikanza)", "Batuque", "Marimba", "Kisanji"],
    correctAnswer: 0,
    curiosity: "A Dikanza ou reco-reco é um pedaço de cana ou bambu ranhurado que se raspa ritmicamente com uma varinha.",
    category: "Instrumentos"
  },
  {
    question: "Qual de todas as opções de fidalgo de mar representa o peixe seco assado de forma rica no prato de peixe seco?",
    options: ["Carapau seco", "Calulu de peixe seco", "Mufete de peixe fresco", "Funge de milho"],
    correctAnswer: 1,
    curiosity: "O Calulu de Peixe Seco combina quiabos, folhas de rama (gimboa ou abóbora), óleo de palma e peixe seco saboroso.",
    category: "Gastronomia"
  }
];

export const generateQuizQuestions = async (difficulty: Difficulty): Promise<QuizQuestion[]> => {
  // Para começar o jogo INSTANTANEAMENTE (0ms), usamos o incrível acervo local de questões angolanas.
  // Isso remove completamente o ecrã de carregamento moroso, mantendo o jogo fluido e divertido!
  try {
    const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  } catch (e) {
    console.warn("Could not load randomized questions, using raw array:", e);
    return FALLBACK_QUESTIONS.slice(0, 10);
  }
};

export const getLearningAssistantResponse = async (query: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: "Você é um assistente educacional especialista em cultura, história e línguas de Angola. Forneça informações detalhadas, respeitosas e envolventes sobre províncias, figuras históricas como Njinga Mbandi e Agostinho Neto, e línguas nacionais."
      }
    });
    return response.text || "Desculpe, não consegui processar a sua pergunta.";
  } catch (err) {
    console.warn("Falha ao ligar com o assistente Gemini:", err);
    
    // Fallback inteligente para perguntas locais de Angola
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes("província") || queryLower.includes("onde") || queryLower.includes("provincia")) {
      return "Angola está dividida em 18 lindas províncias, incluindo Luanda, Benguela, Huíla, Namibe, Cabinda, Malanje e Uíge! Cada uma exprime heranças folclóricas belíssimas, sabores incríveis como o mufete de Luanda e belezas geográficas únicas.";
    }
    if (queryLower.includes("njinga") || queryLower.includes("ginga") || queryLower.includes("rainha")) {
      return "A Rainha Njinga Mbandi foi a perspicaz governante de Ndongo e Matamba que encabeçou a corajosa soberania contra a expansão colonial do século XVII. É o símbolo perene de pundonor e liberdade angolana!";
    }
    if (queryLower.includes("neto") || queryLower.includes("agostinho")) {
      return "O Dr. António Agostinho Neto liderou Angola rumo à proclamação da sua Independência a 11 de Novembro de 1975, servindo de primeiro Chefe de Estado. Também assinou obras literárias soberbas de poesia bantu, como em 'Sagrada Esperança'.";
    }
    if (queryLower.includes("kimbundu") || queryLower.includes("umbundu") || queryLower.includes("lingua") || queryLower.includes("língua")) {
      return "As línguas tradicionais de raiz Bantu (como Kimbundu, Umbundu, Kikongo, Cokwe) espelham a genuína pulsação do povo. Expressões comuns como 'Sakidila' (obrigado) e 'Kandandu' (abraço caloroso) atestam o afeto d'a banda.";
    }
    if (queryLower.includes("comida") || queryLower.includes("prato") || queryLower.includes("funge") || queryLower.includes("calulu") || queryLower.includes("culinária") || queryLower.includes("mufete")) {
      return "A cozinha angolana é deliciosa e robusta! Tem por base o funge cozido, habitualmente coroado com calulu tradicional saboroso ou com muamba de galinha marinada, e no litoral adora-se o mufete de peixe fresco grelhado.";
    }
    
    return `Olá! Sou o seu Guia de Angola. Atualmente, os sistemas de IA online do Gemini estão sob manutenção ou a chave API não foi totalmente estipulada em Settings > Secrets. Mas terei todo o gosto em explicar-lhe tudo sobre o nosso Semba, a fauna rara da Palanca Negra, e marcos emblemáticos como a Serra da Leba!`;
  }
};

export const speakPronunciation = async (word: string, language: string) => {
  try {
    const ai = getAI();
    const prompt = `Ditto/pronounce clearly in ${language}: ${word}.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Dados de voz indisponíveis.");
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioData = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
    
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (err) {
    console.warn("Falha ao usar Gemini TTS, usando síntese nativa do navegador:", err);
    try {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "pt-PT"; 
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch (speechErr) {
      console.error("Síntese nativa falhou:", speechErr);
    }
  }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
