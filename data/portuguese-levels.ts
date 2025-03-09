export type PortugueseLevel = {
  id: string;
  name: {
    en: string;
    es: string;
    fr: string;
    pt: string;
  };
};

export const portugueseLevels: PortugueseLevel[] = [
  { 
    id: 'beginner', 
    name: {
      en: 'Beginner (A1)',
      es: 'Principiante (A1)',
      fr: 'Débutant (A1)',
      pt: 'Iniciante (A1)'
    }
  },
  { 
    id: 'elementary', 
    name: {
      en: 'Elementary (A2)',
      es: 'Elemental (A2)',
      fr: 'Élémentaire (A2)',
      pt: 'Elementar (A2)'
    }
  },
  { 
    id: 'intermediate', 
    name: {
      en: 'Intermediate (B1)',
      es: 'Intermedio (B1)',
      fr: 'Intermédiaire (B1)',
      pt: 'Intermediário (B1)'
    }
  },
  { 
    id: 'upper_intermediate', 
    name: {
      en: 'Upper Intermediate (B2)',
      es: 'Intermedio Alto (B2)',
      fr: 'Intermédiaire Supérieur (B2)',
      pt: 'Intermediário Avançado (B2)'
    }
  },
  { 
    id: 'advanced', 
    name: {
      en: 'Advanced (C1)',
      es: 'Avanzado (C1)',
      fr: 'Avancé (C1)',
      pt: 'Avançado (C1)'
    }
  },
  { 
    id: 'proficient', 
    name: {
      en: 'Proficient (C2)',
      es: 'Competente (C2)',
      fr: 'Maîtrise (C2)',
      pt: 'Proficiente (C2)'
    }
  },
  { 
    id: 'native', 
    name: {
      en: 'Native Speaker',
      es: 'Hablante Nativo',
      fr: 'Langue Maternelle',
      pt: 'Falante Nativo'
    }
  }
]; 