export type LearningGoal = {
  id: string;
  name: {
    en: string;
    es: string;
    fr: string;
    pt: string;
  };
};

export const learningGoals: LearningGoal[] = [
  { 
    id: 'conversation', 
    name: {
      en: 'Conversation',
      es: 'Conversación',
      fr: 'Conversation',
      pt: 'Conversação'
    }
  },
  { 
    id: 'business', 
    name: {
      en: 'Business Communication',
      es: 'Comunicación Empresarial',
      fr: 'Communication d\'Affaires',
      pt: 'Comunicação Empresarial'
    }
  },
  { 
    id: 'travel', 
    name: {
      en: 'Travel',
      es: 'Viajes',
      fr: 'Voyage',
      pt: 'Viagem'
    }
  },
  { 
    id: 'academic', 
    name: {
      en: 'Academic Purposes',
      es: 'Fines Académicos',
      fr: 'Objectifs Académiques',
      pt: 'Fins Acadêmicos'
    }
  },
  { 
    id: 'cultural', 
    name: {
      en: 'Cultural Understanding',
      es: 'Comprensión Cultural',
      fr: 'Compréhension Culturelle',
      pt: 'Compreensão Cultural'
    }
  },
  { 
    id: 'reading', 
    name: {
      en: 'Reading Literature',
      es: 'Lectura de Literatura',
      fr: 'Lecture de Littérature',
      pt: 'Leitura de Literatura'
    }
  },
  { 
    id: 'writing', 
    name: {
      en: 'Writing Skills',
      es: 'Habilidades de Escritura',
      fr: 'Compétences en Écriture',
      pt: 'Habilidades de Escrita'
    }
  },
  { 
    id: 'fluency', 
    name: {
      en: 'Fluency Improvement',
      es: 'Mejora de Fluidez',
      fr: 'Amélioration de la Fluidité',
      pt: 'Melhoria de Fluência'
    }
  },
  { 
    id: 'pronunciation', 
    name: {
      en: 'Pronunciation',
      es: 'Pronunciación',
      fr: 'Prononciation',
      pt: 'Pronúncia'
    }
  },
  { 
    id: 'vocabulary', 
    name: {
      en: 'Vocabulary Building',
      es: 'Construcción de Vocabulario',
      fr: 'Enrichissement du Vocabulaire',
      pt: 'Construção de Vocabulário'
    }
  },
  { 
    id: 'grammar', 
    name: {
      en: 'Grammar Mastery',
      es: 'Dominio de Gramática',
      fr: 'Maîtrise de la Grammaire',
      pt: 'Domínio da Gramática'
    }
  },
  { 
    id: 'certification', 
    name: {
      en: 'Language Certification',
      es: 'Certificación de Idioma',
      fr: 'Certification Linguistique',
      pt: 'Certificação de Idioma'
    }
  },
  { 
    id: 'relocation', 
    name: {
      en: 'Relocation/Immigration',
      es: 'Reubicación/Inmigración',
      fr: 'Relocalisation/Immigration',
      pt: 'Relocação/Imigração'
    }
  },
  { 
    id: 'heritage', 
    name: {
      en: 'Heritage/Family Connection',
      es: 'Conexión Familiar/Herencia',
      fr: 'Connexion Familiale/Patrimoine',
      pt: 'Conexão Familiar/Herança'
    }
  },
  { 
    id: 'professional', 
    name: {
      en: 'Professional Development',
      es: 'Desarrollo Profesional',
      fr: 'Développement Professionnel',
      pt: 'Desenvolvimento Profissional'
    }
  }
].sort((a, b) => a.name.en.localeCompare(b.name.en)); 