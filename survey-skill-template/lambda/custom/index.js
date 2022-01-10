/*
* Alexa Survey Skill Template
* Copyright (c) 2020 Dabble Lab - http://dabblelab.com
* Portions Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
* SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
* Licensed under the Amazon Software License  http://aws.amazon.com/asl/
*/

/* 
* This is an example skill that lets users submit a daily stand up meeting report.
* The skill owner can set up customers' name, emails address and assign a passcode. 
* The passcode will serve as an access mechanism for authorized customers to use the skill. 
* The skill owner will get email updates when a customer submits a response. 
* This template can also be used to run surveys or for other collaboration use-cases.
*/

const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const sgMail = require('@sendgrid/mail');
const personalization = require('./personalizationUtil');
const voiceConsent = require('./voiceConsentUtil');

// edit the team.json file to add uer pins
const usersData = require('./team.json');

/* CONSTANTS */
// set constants in the .env file. see README.md for details

/* LANGUAGE STRINGS */
const languageStrings = require('./languages/languageStrings');

/* HANDLERS */

// This handler responds when required environment variables
// missing or a .env file has not been created.
const InvalidConfigHandler = {
  canHandle(handlerInput) {
    const attributes = handlerInput.attributesManager.getRequestAttributes();

    const invalidConfig = attributes.invalidConfig || false;

    return invalidConfig;
  },
  handle(handlerInput) {
    const { responseBuilder, attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('ENV_NOT_CONFIGURED');

    return responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const skillName = requestAttributes.t('SKILL_NAME');
    const name = personalization.getPersonalizedPrompt(handlerInput);
    var speakOutput = ""
    if (name && name.length > 0) {
        speakOutput = requestAttributes.t('GREETING_PERSONALIZED', skillName);
    } else {
        speakOutput = requestAttributes.t('GREETING', skillName);
    }
    const repromptOutput = requestAttributes.t('GREETING_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const StartMyStandupIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StartMyStandupIntent';
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let speakOutput;
    const name = personalization.getPersonalizedPrompt(handlerInput);
    let response = handlerInput.responseBuilder;
    if (name && name.length > 0) {
        speakOutput = requestAttributes.t('PERSONALIZED_GREETING', name);
        const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
        let profileName
        let profileEmail
        try {
            profileName = await upsServiceClient.getPersonsProfileGivenName();
            profileEmail = await upsServiceClient.getProfileEmail();
        } catch (error) {
            return handleError(error, handlerInput)
        }

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.userEmail = profileEmail;
        sessionAttributes.userName = profileName;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        response
          .addDelegateDirective({
            name: 'GetReportIntent',
            confirmationStatus: 'NONE',
            slots: {},
          });
    } else {
      speakOutput = requestAttributes.t('PERSONALIZED_FALLBACK')
    }
    const repromptOutput = requestAttributes.t('GREETING_REPROMPT');
    return response
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse()
  },
};

function handleError(error, handlerInput) {
    console.log('getPersonsProfileGivenName or getProfileEmail: error with status code: ' + error.statusCode);
    if (error.statusCode === 403) {
        ///no consent at account level, indicate to the caller
        let emailPermissionScope = new voiceConsent.RequestedPermission("alexa::profile:email:read", voiceConsent.CONSENT_LEVEL.ACCOUNT);
        let namePermissionScope = new voiceConsent.RequestedPermission("alexa::profile:given_name:read", voiceConsent.CONSENT_LEVEL.PERSON);
        return voiceConsent.getVoiceConsentPermissionRequest(handlerInput, [namePermissionScope, emailPermissionScope])
            .getResponse();
    }
}

// This handler validates the user's passcode using the values
// in the team.json file.
const GetCodeIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetCodeIntent'
      && !sessionAttributes.validated;
  },
  async handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const pinAttempts = sessionAttributes.pinAttempts || 1;

    let speakOutput = requestAttributes.t('PIN_VALID');
    const repromptOutput = requestAttributes.t('PIN_INVALID_REPROMPT');

    if (pinAttempts > 2) {
      speakOutput = requestAttributes.t('PIN_MAX_ATTEMPTS');
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }

    const meetingCode = +currentIntent.slots.MeetingCode.value;
    const user = await getUserByPin(meetingCode);

    if (user) {
      sessionAttributes.userEmail = user.email;
      sessionAttributes.userName = user.name;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      return handlerInput.responseBuilder
        .addDelegateDirective({
          name: 'GetReportIntent',
          confirmationStatus: 'NONE',
          slots: {},
        })
        .speak(speakOutput)
        .getResponse();
    }

    speakOutput = requestAttributes.t('PIN_INVALID');

    sessionAttributes.pinAttempts = pinAttempts + 1;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const GetReportIntentNotCompleteHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetReportIntent'
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  async handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    // make sure the user is validated
    if (!sessionAttributes.userEmail) {
      const speakOutput = requestAttributes.t('USER_INVALID');
      const repromptOutput = requestAttributes.t('USER_INVALID_REPROMPT');
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }

    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

// This handler completes the GetReportIntent by calling the sendEmail
// helper function and confirming that the stand up report was sent.
const GetReportIntentCompleteHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetReportIntent'
      && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    // make sure the user is validated
    if (!sessionAttributes.userEmail) {
      const speakOutput = requestAttributes.t('USER_INVALID');
      const repromptOutput = requestAttributes.t('USER_INVALID_REPROMPT');
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }

    const questionYesterday = Alexa.getSlotValue(handlerInput.requestEnvelope, 'questionYesterday');
    const questionToday = Alexa.getSlotValue(handlerInput.requestEnvelope, 'questionToday');
    const questionBlocking = Alexa.getSlotValue(handlerInput.requestEnvelope, 'questionBlocking');

    const reportData = {
      reportDate: luxon.DateTime.local().toLocaleString(luxon.DateTime.DATE_HUGE),
      name: sessionAttributes.userName,
      email: sessionAttributes.userEmail,
      yesterday: questionYesterday,
      today: questionToday,
      blocking: questionBlocking,
    };

    sessionAttributes.reportData = reportData;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    let speakOutput = requestAttributes.t('REPORT_SAVED');

    // save the report to s3
    await saveToS3(handlerInput);

    // send the report via email if configured
    if (process.env.SEND_EMAIL && process.env.SEND_EMAIL === true) {
      await sendEmail(handlerInput)
        .then(() => {
          speakOutput = requestAttributes.t('EMAIL_SENT');
        })
        .catch(() => {
          speakOutput = requestAttributes.t('EMAIL_ERROR');
        });
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

// This handler function provides users with information about
// how to get or reset their passcode
const ResetPinIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ResetPinIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('HELP_PIN');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('HELP');
    const repromptOutput = requestAttributes.t('HELP_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

// This function handles 'yes' and 'no' responses.
const YesNoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    // make sure the user is validated
    if (!sessionAttributes.userEmail) {
      const speakOutput = requestAttributes.t('USER_INVALID');
      const repromptOutput = requestAttributes.t('USER_INVALID_REPROMPT');
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }

    let speakOutput = '';

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
      speakOutput = requestAttributes.t('YES');
      return handlerInput.responseBuilder
        .addDelegateDirective({
          name: 'GetReportIntent',
          confirmationStatus: 'NONE',
          slots: {},
        })
        .speak(speakOutput)
        .getResponse();
    }

    if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent') {
      speakOutput = requestAttributes.t('NO');
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

// This function handles utterances that can't be matched to any
// other intent handler.
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    // make sure the user is validated
    if (!sessionAttributes.userEmail) {
      const speakOutput = requestAttributes.t('USER_INVALID');
      const repromptOutput = requestAttributes.t('USER_INVALID_REPROMPT');

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }

    const speakOutput = requestAttributes.t('FALLBACK');
    const repromptOutput = requestAttributes.t('FALLBACK_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('CANCEL_STOP_RESPONSE');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

// This function handles syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented
// a handler for the intent or included it in the skill builder below
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error Request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    console.log(`Error handled: ${error.message}`);

    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = requestAttributes.t('ERROR');
    const repromptOutput = requestAttributes.t('ERROR_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

// This function is used for testing and debugging. It will echo back an
// intent name for an intent that does not have a suitable intent handler.
// a respond from this function indicates an intent handler function should
// be created or modified to handle the user's intent.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = requestAttributes.t('REFLECTOR', intentName);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

/* INTERCEPTORS */

// This function checks to make sure required environment vairables
// exists. This function will only be called if required configuration
// is not found so it's only a utilty function.
const EnvironmentCheckInterceptor = {
  process(handlerInput) {
    // load environment variable from .env
    dotenv.config();

    // check for process.env.S3_PERSISTENCE_BUCKET
    if (!process.env.S3_PERSISTENCE_BUCKET) {
      handlerInput.attributesManager.setRequestAttributes({ invalidConfig: true });
    }

    // check for process.env.SENDGRID_API_KEY
    if (!process.env.SENDGRID_API_KEY) {
      handlerInput.attributesManager.setRequestAttributes({ invalidConfig: true });
    }
  },
};

// This interceptor function is used for localization.
// It uses the i18n module, along with defined language
// string to return localized content. It defaults to 'en'
// if it can't find a matching language.
const LocalizationInterceptor = {
  process(handlerInput) {
    const { requestEnvelope, attributesManager } = handlerInput;

    const localizationClient = i18n.use(sprintf).init({
      lng: requestEnvelope.request.locale,
      fallbackLng: 'en-US',
      resources: languageStrings,
    });

    localizationClient.localize = (...args) => {
      const values = [];

      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });

      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };

    const attributes = attributesManager.getRequestAttributes();
    attributes.t = (...args) => localizationClient.localize(...args);
  },
};

/* FUNCTIONS */

function getUserByPin(userPin) {
  return new Promise(((resolve, reject) => {
    try {
      const users = usersData.filter((user) => user.passcode === userPin);
      if (users && users.length > 0) {
        resolve(users[0]);
      } else {
        resolve();
      }
    } catch (ex) {
      reject(ex);
    }
  }));
}

/**
 * Voice consent request - response is handled via Skill Connections.
 * Hence we need to handle async response from the Voice Consent.
 * The user could have accepted or rejected or skipped the voice consent request.
 * Create your custom callBackFunction to handle accepted flow - in this case its handling identifying the person
 * The rejected/skipped default handling is taken care by the library.
 *
 * @params handlerInput - the handlerInput received from the IntentRequest
 * @returns
 **/
async function handleCallBackForVoiceConsentAccepted(handlerInput) {
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
    let profileName = await upsServiceClient.getProfileEmail();
    let profileEmail = await upsServiceClient.getPersonsProfileGivenName();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.userEmail = profileEmail;
    sessionAttributes.userName = profileName;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // this is done because currently intent chaining is not supported from any
    // Skill Connections requests, such as SessionResumedRequest.
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const name = personalization.getPersonalizedPrompt(handlerInput);
    let speakOutput = requestAttributes.t('PERSONALIZED_GREETING', name) + " " + requestAttributes.t('ABOUT_REPROMPT');
    let repromptOutput = requestAttributes.t('ABOUT_REPROMPT');

    let response = handlerInput.responseBuilder;
    return response
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse()
}

// This function saves a copy of the stand up report to S3
// the report is located in the 'reports/yyyy-mm-dd/' folder
// where 'yyyy-mm-dd' is the data the reports was created
function saveToS3(handlerInput) {
  return new Promise((resolve, reject) => {
    try {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      const reportData = sessionAttributes.reportData;

      const s3 = new AWS.S3();

      const s3Params = {
        Body: requestAttributes.t('EMAIL_BODY', reportData.email, reportData.reportDate, reportData.yesterday, reportData.today, reportData.blocking),
        Bucket: process.env.S3_PERSISTENCE_BUCKET,
        Key: `reports/${luxon.DateTime.local().toISODate()}/${reportData.name.replace(/ /g, '-').toLowerCase()}-${luxon.DateTime.utc().toMillis()}.txt`,
      };

      s3.putObject(s3Params, () => {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

// This function emails the report using SendGrid.com.
// You could be modified this to use other email services providers
// like https://mailchimp.com or https://aws.amazon.com/ses
function sendEmail(handlerInput) {
  return new Promise((resolve, reject) => {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    try {
      const reportData = sessionAttributes.reportData;

      const msg = {
        to: process.env.TO_EMAIL,
        from: process.env.FROM_EMAIL,
        subject: requestAttributes.t('EMAIL_SUBJECT', reportData.name),
        text: requestAttributes.t('EMAIL_BODY', reportData.email, reportData.reportDate, reportData.yesterday, reportData.today, reportData.blocking),
      };

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      sgMail.send(msg).then(() => {
        // mail done sending
        resolve();
      });
    } catch (ex) {
      console.log(`bookAppointment() ERROR: ${ex.message}`);
      reject(ex);
    }
  });
}

/* LAMBDA SETUP */

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    InvalidConfigHandler,
    LaunchRequestHandler,
    GetCodeIntentHandler,
    GetReportIntentNotCompleteHandler,
    GetReportIntentCompleteHandler,
    StartMyStandupIntentHandler,
    YesNoIntentHandler,
    ResetPinIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    FallbackIntentHandler,
    IntentReflectorHandler,

    //handler that handles skill response for voice consent
    //Since voice consent is async, the call back is handled via handleCallBackForVoiceConsentAccepted
    new voiceConsent.SessionResumedRequestHandler(handleCallBackForVoiceConsentAccepted)
  )
  .addRequestInterceptors(
    EnvironmentCheckInterceptor,
    LocalizationInterceptor,
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
