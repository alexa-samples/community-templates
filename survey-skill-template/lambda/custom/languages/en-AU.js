module.exports = {
  translation: {
    'SKILL_NAME': "Daily Stand Up",
    'GREETING': [
      "Welcome to %s. To continue, please tell me your passcode.",
    ],
    'GREETING_PERSONALIZED': [
      "Welcome to %s. To continue, please say \"start my stand up\".",
    ],
    'PERSONALIZED_GREETING': [
      "Hello %s.",
    ],
    'PERSONALIZED_FALLBACK': [
      "Sorry, I am unable to recognize you. To continue, please tell me your passcode.",
    ],
    'GREETING_REPROMPT': [
      "What is your passcode?",
    ],
    'PIN_VALID': [
      "Okay, your passcode is valid.",
    ],
    'PIN_INVALID': [
      "Sorry, that passcode is invalid. Please try again. What is your passcode?",
    ],
    'PIN_INVALID_REPROMPT': [
      "Please try again. What is your passcode?",
    ],
    'PIN_MAX_ATTEMPTS': [
      "You\'ve exceeded the maximum passcode attempts allowed. Please contact the skill administrator to get or reset your passcode. Good bye",
    ],
    'USER_INVALID': [
      "Sorry, you need to provide a valid passcode to continue. What is your passcode?",
    ],
    'USER_INVALID_REPROMPT': [
      "What is your passcode?",
    ],
    'EMAIL_SUBJECT': [
      "Stand Up Report for %s",
    ],
    'EMAIL_BODY': "Stand up report for %s (%s)\n\nWhat did you work on yesterday?\nANSWER: %s\n\nWhat are you working on today?\nANSWER: %s\n\nWhat is blocking your progress?\nANSWER: %s\n\n",
    'EMAIL_SENT': [
      "Thank you. Your report was sent.",
    ],
    'EMAIL_ERROR': [
      "Sorry, there was a problem sending your report. Please try again later.",
    ],
    'REPORT_SAVED': [
      "Thank you. Your report was saved.",
    ],
    'HELP': [
      "This skill collects daily stand up meeting reports and emails the daily reports to a team manager. Would you like to start?",
    ],
    'HELP_REPROMPT': [
      "Would you like to provide your daily stand up report?",
    ],
    'HELP_PIN': [
      "If you\'ve lost or forgotten your passcode, please contact the skill administrator.",
    ],
    'REFLECTOR': [
      "You just triggered the %s intent. You\'re hearing this response because %s does not have an intent handler yet.",
    ],
    'FALLBACK': [
      "You can say: yesterday i worked on, or today i will work on: followed by the work you did or will do. What did you work on yesterday?",
    ],
    'FALLBACK_REPROMPT': [
      "What did you work on today?",
    ],
    'ABOUT': [
      "This is an Alexa Skill Template from dabblelab.com. You can use it to collect daily stand up meeting reports. Would you like to provide a daily stand up report?",
    ],
    'YES': [
      "Okay, let\'s get started.",
    ],
    'NO': [
      "Okay, stop back when you\'re ready to provide your stand up report.",
    ],
    'ABOUT_REPROMPT': [
      "Would you like to provide a daily stand up report?",
    ],
    'CANCEL_STOP_RESPONSE': [
      "Good bye",
      "Okay. I\'ll be here if you need me.",
    ],
    'ENV_NOT_CONFIGURED': "One or more environment variables is not set. Please see the readme file for help.",
    'ERROR': "Sorry, I didn\'t get that. Could you say that again?",
    'ERROR_REPROMPT': "Could you say that again?",
    'VOICE_CONSENT_DENIED_REPROMPT': [
        "Please visit the app to grant permissions.",
    ],
    'VOICE_CONSENT_ERROR_REPROMPT': [
        "Something went wrong. Please try again later.",
    ],
  },
};
