module.exports = {
  translation: {
    SKILL_NAME: 'Programmatore di appuntamenti',
    GREETING: [
      'Salve. Benvenuto a %s. Desideri programmare un appuntamento?',
      'Ciao. Benvenuto a %s. Desideri programmare un appuntamento?',
      'Ciao. Benvenuto a %s. Desideri programmare un appuntamento?',
    ],
    GREETING_REPROMPT: [
      'Desideri programmare un appuntamento?',
      'Posso programmare un appuntamento per te?',
      'Posso programmare un appuntamento per te. Vuoi iniziare?',
    ],
    SCHEDULE_YES: [
      'Va bene, adesso programmiamo un appuntamento.',
      'Va bene, iniziamo.',
      'Ve bene, programmiamo il tuo appuntamento.',
    ],
    SCHEDULE_NO: [
      'Va bene. Torna pure ogni volta che desideri programmare un appuntamento.',
      'Va bene, sarò  qui ogni volta che desideri programmare un appuntamento. ',
      'Va bene, quando sei pronto a programmare un appuntamento, torna pure. ',
    ],
    HELP: [
      'Questa skill può aiutarti a programmare un appuntamento. Desideri programmare un appuntamento?',
    ],
    HELP_REPROMPT: [
      'Desideri programmare un appuntamento?',
    ],
    CANCEL_STOP_RESPONSE: [
      'Arrivederci',
      'Va bene. Sarò qua se hai bisogno di me. ',
    ],
    FALLBACK: [
      'Puoi dire: vorrei fissare un appuntamento, oppure devo prendere un appuntamento. Vorresti fissare un appuntamento?',
    ],
    FALLBACK_REPROMPT: [
      'Vorresti fissare un appuntamento?',
    ],
    APPOINTMENT_CONFIRM: [
      'Ho la tua richiesta di appuntamento con %s programmata per %s. Desideri confermare la richiesta?',
    ],
    APPOINTMENT_CONFIRM_REPROMPT: [
      'Devo inviare la tua richiesta di appuntamento per %s?',
    ],
    APPOINTMENT_CONFIRM_COMPLETED: [
      'Il tuo appuntamento con %s per %s  è stato programmato. Riceverai anche una conferma via posta elettronica. Per favore rispondi alla email di conferma per cancellare o riprogrammare l\'appuntamento. Grazie.',
    ],
    TIME_AVAILABLE: [
      '%s è disponibile. Desideri riservarlo? ',
    ],
    TIME_AVAILABLE_REPROMPT: [
      'Desideri riservare %s?',
    ],
    TIME_NOT_AVAILABLE: [
      'Mi dispiace, %s non è disponibile. Desideri provare un\'altra data?',
    ],
    TIME_NOT_AVAILABLE_REPROMPT: [
      'Desideri provare un\'altra data?',
    ],
    APPOINTMENT_TITLE: 'Appuntamento con %s',
    APPOINTMENT_DESCRIPTION: 'Questo è un appuntamento telefonico per %s con %s. Ti chiameremo al %s. Se desideri cancellare o cambiare questo appuntamento, per favore rispondi a questa email.',
    EMAIL_SUBJECT: 'Appuntamento per %s con %s',
    EMAIL_TEXT: 'Questo è un appuntamento telefonico per %s con %s. Ti chiameremo al %s. Se desideri cancellare o cambiare questo appuntamento, per favore rispondi a questa email.',
    NO_CONFIRM: 'Va bene, per ricominciare da capo puoi dire: programma un appuntamento, o per cancellare dì stop. ',
    NO_CONFIRM_REPROMOT: 'Puoi dire programma un appuntamento per ricominciare da capo, oppure stop per cancellare.',
    ENV_NOT_CONFIGURED: 'Una o più variabili d\'ambiente non sono definite. Per favore consulta il file readme per ottenere aiuto. ',
    PERMISSIONS_REQUIRED: 'Per prenotare e confermare appuntamenti, %s dovrà avere accesso al tuo nome, al tuo indirizzo di posta elettronica e al tuo numero di telefono. Per fornire l\'accesso, per favore abilita le autorizzazioni del profilo nell\'Alexa app. ',
    EMAIL_REQUIRED: 'Sembra che tu non abbia configurato il tuo indirizzo di posta elettronica. Puoi configurare il tuo indirizzo di posta elettronica nell\'Alexa app.',
    EMAIL_REQUIRED_REPROMPT: 'Per favore configura il tuo indirizzo di posta elettronica nell\'Alexa app.',
    NAME_REQUIRED: 'Sembra che tu non abbia configurato il tuo nome. Puoi configurare il tuo nome nell\'Alexa app.',
    NAME_REQUIRED_REPROMPT: 'Per favore configura il tuo nome nell\'Alexa app.',
    PHONE_REQUIRED: 'Sembra che tu non abbia configurato il tuo numero di cellulare. Puoi configurare il tuo numero di cellulare nell\'Alexa app.',
    PHONE_REQUIRED_REPROMPT: 'Per favore configura il tuo numero di telefono nell\'Alexa app.',
    ERROR: 'Mi dispiace, non ho capito. Puoi ripetere?',
    ERROR_REPROMPT: 'Puoi ripetere?',
    FREEBUSY_DISABLED: 'Mi dispiace, la verifica di disponibilità è disabilitata. Desideri comunque programmare un appuntamento?',
  },
};
