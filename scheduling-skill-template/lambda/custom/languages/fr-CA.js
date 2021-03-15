module.exports = {
  translation: {
    SKILL_NAME: 'Logiciel de prise de rendez-vous',
    GREETING: [
      'Bonjour. Bienvenue sur %s. Souhaitez-vous créer un rendez-vous?',
      'Salut. Bienvenue sur %s. Souhaitez-vous créer un rendez-vous?',
      'Coucou. Bienvenue sur %s. Souhaitez-vous créer un rendez-vous?',
    ],
    GREETING_REPROMPT: [
      'Souhaitez-vous créer un rendez-vous?',
      'Est-ce que je peux créer un rendez-vous pour vous?',
      'Je peux créer un rendez-vous pour vous. Souhaitez-vous commencer?',
    ],
    SCHEDULE_YES: [
      'Bien, on va créer un rendez-vous',
      'Bien, on va commencer.',
      'D\'accord, nous allons vous créer un rendez-vous.',
    ],
    SCHEDULE_NO: [
      'D\'accord. Retournez quand vous souhaitez créer un rendez-vous.',
      'Bien, je serai ici quand vous souhaitez créer un rendez-vous.',
      'D\'accord, quand vous êtes prêts pour créer un rendez-vous n\'hésiter pas à retourner.',
    ],
    HELP: [
      ' Cette skill peut vous aider à créer un rendez-vous. Souhaitez vous créer un rendez-vous ?',
    ],
    HELP_REPROMPT: [
      'Souhaitez vous créer un rendez-vous?',
    ],
    CANCEL_STOP_RESPONSE: [
      'Au revoir',
      'D\'accord. Je serai ici si vous avez besoin de moi.',
    ],
    FALLBACK: [
      'Vous pouvez dire: vous voulez prendre rendez-vous, ou que vous avez une demande de rendez-vous. Voulez-vous prendre un rendez-vous?',
    ],
    FALLBACK_REPROMPT: [
      'Voulez-vous prendre un rendez-vous?',
    ],
    APPOINTMENT_CONFIRM: [
      'J\'ai  programmé votre  rendez-vous avec %s pour le %s. Souhaitez-vous le confirmer ?',
    ],
    APPOINTMENT_CONFIRM_REPROMPT: [
      'Dois-je envoyer votre demande de rendez-vous pour %s?',
    ],
    APPOINTMENT_CONFIRM_COMPLETED: [
      'Votre rendez-vous avec %s sur %s a été créé. Vous recevrez également une confirmation par e-mail. Veuillez répondre à l\'e-mail de confirmation pour annuler ou reprogrammer. Je vous remercie.',
    ],
    TIME_AVAILABLE: [
      '%s est disponible. Souhaitez-vous le réserver?',
    ],
    TIME_AVAILABLE_REPROMPT: [
      'Souhaitez-vous réserver %s ?',
    ],
    TIME_NOT_AVAILABLE: [
      'Désolé, %s n\'est pas disponible. Voulez-vous réessayer pour une autre date?',
    ],
    TIME_NOT_AVAILABLE_REPROMPT: [
      'Voulez-vous réessayer pour une autre date?',
    ],
    APPOINTMENT_TITLE: 'Rendez-vous avec %s',
    APPOINTMENT_DESCRIPTION: 'ça c\'est un rendez-vous téléphonique pour %s avec %s. Nous vous appellerons à %s. Si vous voulez annuler ou modifier ce rendez-vous, veuillez répondre à cet e-mail.',
    EMAIL_SUBJECT: 'Rendez-vous pour %s avec %s',
    EMAIL_TEXT: 'ça c\'est un rendez-vous téléphonique pour %s avec %s. Nous vous appellerons à %s. Si vous voulez annuler ou modifier ce rendez-vous, veuillez répondre à cet e-mail.',
    NO_CONFIRM: 'Bien, pour commencer vous pouvez dire: créez-moi un rendez-vous, ou pour annuler dites arrête.',
    NO_CONFIRM_REPROMOT: 'Vous pouvez dire créez un rendez-vous pour recommencer, ou vous pouvez dire arrête pour annuler.',
    ENV_NOT_CONFIGURED: 'Une ou plusieurs variables d\'environnement ne sont pas définies. Veuillez consulter le fichier readme pour obtenir de l\'aide.',
    PERMISSIONS_REQUIRED: 'Pour créer et confirmer des rendez-vous, %s on aura besoin d\'accéder à votre nom, à votre adresse e-mail et à votre numéro de téléphone. Pour fournir  l\'accès, veuillez activer les autorisations de profil dans l\'application Amazon Alexa.',
    EMAIL_REQUIRED: 'Il semble que vous n\'ayez pas de messagerie. Vous pouvez définir votre e-mail dans l\'application  Alexa.',
    EMAIL_REQUIRED_REPROMPT: 'Veuillez définir votre adresse e-mail dans l\'application  Alexa.',
    NAME_REQUIRED: 'Il semble que votre nom n\'est pas défini. Vous pouvez ajouter votre nom dans l\'application  Alexa.',
    NAME_REQUIRED_REPROMPT: 'Veuillez ajouter votre nom dans l\'application Alexa.',
    PHONE_REQUIRED: 'Il semble que votre numéro de téléphone portable n\'est pas défini. Vous pouvez ajouter votre numéro de mobile dans l\'application Alexa.',
    PHONE_REQUIRED_REPROMPT: 'Veuillez ajouter votre numéro de téléphone dans l\'application Alexa.',
    ERROR: 'Désolé, je n\'ai pas compris. Pouvez-vous répéter ?',
    ERROR_REPROMPT: 'Pouvez-vous répéter ?',
    FREEBUSY_DISABLED: 'Désolé, le contrôle de disponibilité est désactivé. Souhaitez-vous quand même créer un rendez-vous ?',
  },
};
