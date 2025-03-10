export type Gender = {
  id: string;
  name: {
    en: string;
    es: string;
    fr: string;
    pt: string;
  };
};

export const genders: Gender[] = [
  { 
    id: 'male', 
    name: {
      en: 'Male',
      es: 'Masculino',
      fr: 'Masculin',
      pt: 'Masculino'
    }
  },
  { 
    id: 'female', 
    name: {
      en: 'Female',
      es: 'Femenino',
      fr: 'Féminin',
      pt: 'Feminino'
    }
  },
  { 
    id: 'non_binary', 
    name: {
      en: 'Non-binary',
      es: 'No binario',
      fr: 'Non-binaire',
      pt: 'Não binário'
    }
  },
  { 
    id: 'other', 
    name: {
      en: 'Other',
      es: 'Otro',
      fr: 'Autre',
      pt: 'Outro'
    }
  },
  { 
    id: 'prefer_not_to_say', 
    name: {
      en: 'Prefer not to say',
      es: 'Prefiero no decirlo',
      fr: 'Je préfère ne pas le dire',
      pt: 'Prefiro não dizer'
    }
  }
]; 