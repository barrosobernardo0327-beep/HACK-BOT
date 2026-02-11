import { Province, Achievement } from './types';

export const PROVINCES: Province[] = [
  { id: 'luanda', name: 'Luanda', capital: 'Luanda', culture: 'Centro político efervescente', attraction: 'Ilha do Cabo', coordinates: { lat: -8.839, lng: 13.289 } },
  { id: 'benguela', name: 'Benguela', capital: 'Benguela', culture: 'Cidade das Acácias Rubras', attraction: 'Baía Azul', coordinates: { lat: -12.576, lng: 13.405 } },
  { id: 'huila', name: 'Huíla', capital: 'Lubango', culture: 'Cultura Mumuila', attraction: 'Fenda da Tundavala', coordinates: { lat: -14.917, lng: 13.5 } },
  { id: 'namibe', name: 'Namibe', capital: 'Moçâmedes', culture: 'Deserto e mar', attraction: 'Welwitschia Mirabilis', coordinates: { lat: -15.196, lng: 12.152 } },
  { id: 'malanje', name: 'Malanje', capital: 'Malanje', culture: 'Terra da Palanca Negra Gigante', attraction: 'Quedas de Kalandula', coordinates: { lat: -9.54, lng: 16.34 } },
  { id: 'uige', name: 'Uíge', capital: 'Uíge', culture: 'Café e rituais', attraction: 'Grutas do Enco', coordinates: { lat: -7.608, lng: 15.061 } }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quiz', title: 'Explorador Curioso', description: 'Completou o seu primeiro quiz cultural.', unlocked: false, icon: '🎓' },
  { id: 'polyglot', title: 'Poliglota da Banda', description: 'Aprendeu pronúncias em Kimbundu e Umbundu.', unlocked: false, icon: '🗣️' },
  { id: 'traveler', title: 'Viajante das Províncias', description: 'Visitou pelo menos 3 províncias no simulador.', unlocked: false, icon: '✈️' },
  { id: 'memory_master', title: 'Mestre da Memória', description: 'Completou o jogo de memória com perfeição.', unlocked: false, icon: '🧩' },
  { id: 'culture_king', title: 'Rei da Cultura', description: 'Alcançou 1000 pontos no quiz.', unlocked: false, icon: '👑' }
];

export const ANGOLAN_SYMBOLS = [
  { name: 'Palanca Negra', icon: '🦌' },
  { name: 'Semba', icon: '🎸' },
  { name: 'Kizomba', icon: '💃' },
  { name: 'Funge', icon: '🥘' },
  { name: 'Mona Lisa Africana', icon: '🎭' },
  { name: 'Welwitschia', icon: '🌱' },
  { name: 'Bandeira', icon: '🇦🇴' },
  { name: 'Baobá', icon: '🌳' }
];