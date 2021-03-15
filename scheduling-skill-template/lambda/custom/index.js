/*
* Alexa Scheduling Skill Template
* Copyright (c) 2020 Dabble Lab - http://dabblelab.com
* Portions Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
* SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
* Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */

/* 
* This is an example skill that lets users schedule an appointment with the skill owner.
* Users can choose a date and time to book an appointment that is then emailed to the skill owner.
* This skill uses the ASK SDK 2.0 demonstrates the use of dialogs, getting a users email, name,
* and mobile phone fro the the settings api, along with sending email from a skill and integrating
* with calendaring to check free/busy times.
*/

const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const ics = require('ics');
const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env

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
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('ENV_NOT_CONFIGURED');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

// This is a handler that is used when the user has not enabled the
// required permissions.
const InvalidPermissionsHandler = {
  canHandle(handlerInput) {
    const attributes = handlerInput.attributesManager.getRequestAttributes();

    return attributes.permissionsError;
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getRequestAttributes();

    switch (attributes.permissionsError) {
      case 'no_name':
        return handlerInput.responseBuilder
          .speak(attributes.t('NAME_REQUIRED'))
          .withSimpleCard(attributes.t('SKILL_NAME'), attributes.t('NAME_REQUIRED_REPROMPT'))
          .getResponse();
      case 'no_email':
        return handlerInput.responseBuilder
          .speak(attributes.t('EMAIL_REQUIRED'))
          .withSimpleCard(attributes.t('SKILL_NAME'), attributes.t('EMAIL_REQUIRED_REPROMPT'))
          .getResponse();
      case 'no_phone':
        return handlerInput.responseBuilder
          .speak(attributes.t('PHONE_REQUIRED'))
          .withSimpleCard(attributes.t('SKILL_NAME'), attributes.t('PHONE_REQUIRED_REPROMPT'))
          .getResponse();
      case 'permissions_required':
        return handlerInput.responseBuilder
          .speak(attributes.t('PERMISSIONS_REQUIRED', attributes.t('SKILL_NAME')))
          .withAskForPermissionsConsentCard(['alexa::profile:email:read', 'alexa::profile:name:read', 'alexa::profile:mobile_number:read'])
          .getResponse();
      default:
        // throw an error if the permission is not defined
        throw new Error(`${attributes.permissionsError} is not a known permission`);
    }
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('GREETING', requestAttributes.t('SKILL_NAME'));
    const repromptOutput = requestAttributes.t('GREETING_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const StartedInProgressScheduleAppointmentIntentHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ScheduleAppointmentIntent'
      && request.dialogState !== 'COMPLETED';

  },
  async handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

    // get timezone
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const userTimezone = await upsServiceClient.getSystemTimeZone(deviceId);

    // get slots
    const appointmentDate = currentIntent.slots.appointmentDate;
    const appointmentTime = currentIntent.slots.appointmentTime;

    // we have an appointment date and time
    if (appointmentDate.value && appointmentTime.value) {
      // format appointment date
      const dateLocal = luxon.DateTime.fromISO(appointmentDate.value, { zone: userTimezone });
      const timeLocal = luxon.DateTime.fromISO(appointmentTime.value, { zone: userTimezone });
      const dateTimeLocal = dateLocal.plus({ 'hours': timeLocal.hour, 'minute': timeLocal.minute });
      const speakDateTimeLocal = dateTimeLocal.toLocaleString(luxon.DateTime.DATETIME_HUGE);

      // custom intent confirmation for ScheduleAppointmentIntent
      if (currentIntent.confirmationStatus === 'NONE'
        && currentIntent.slots.appointmentDate.value
        && currentIntent.slots.appointmentTime.value) {
        const speakOutput = requestAttributes.t('APPOINTMENT_CONFIRM', process.env.FROM_NAME, speakDateTimeLocal);
        const repromptOutput = requestAttributes.t('APPOINTMENT_CONFIRM_REPROMPT', process.env.FROM_NAME, speakDateTimeLocal);

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(repromptOutput)
          .addConfirmIntentDirective()
          .getResponse();
      }
    }

    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

// Handles the completion of an appointment. This handler is used when
// dialog in ScheduleAppointmentIntent is completed.
const CompletedScheduleAppointmentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ScheduleAppointmentIntent'
      && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

    // get timezone
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const userTimezone = await upsServiceClient.getSystemTimeZone(deviceId);
    // const userTimezone = 'Asia/Yerevan';

    // get slots
    const appointmentDate = currentIntent.slots.appointmentDate;
    const appointmentTime = currentIntent.slots.appointmentTime;

    // format appointment date and time
    const dateLocal = luxon.DateTime.fromISO(appointmentDate.value, { zone: userTimezone });
    const timeLocal = luxon.DateTime.fromISO(appointmentTime.value, { zone: userTimezone });
    const dateTimeLocal = dateLocal.plus({ 'hours': timeLocal.hour, 'minute': timeLocal.minute || 0 });
    const speakDateTimeLocal = dateTimeLocal.toLocaleString(luxon.DateTime.DATETIME_HUGE);

    // set appontement date to utc and add 30 min for end time
    const startTimeUtc = dateTimeLocal.toUTC().toISO();
    const endTimeUtc = dateTimeLocal.plus({ minutes: 30 }).toUTC().toISO();

    // get user profile details
    const mobileNumber = await upsServiceClient.getProfileMobileNumber();
    const profileName = await upsServiceClient.getProfileName();
    const profileEmail = await upsServiceClient.getProfileEmail();

    // deal with intent confirmation denied
    if (currentIntent.confirmationStatus === 'DENIED') {
      const speakOutput = requestAttributes.t('NO_CONFIRM');
      const repromptOutput = requestAttributes.t('NO_CONFIRM_REPROMPT');

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }

    // params for booking appointment
    const appointmentData = {
      title: requestAttributes.t('APPOINTMENT_TITLE', profileName),
      description: requestAttributes.t('APPOINTMENT_DESCRIPTION', profileName),
      appointmentDateTime: dateTimeLocal,
      userTimezone,
      appointmentDate: appointmentDate.value,
      appointmentTime: appointmentTime.value,
      profileName,
      profileEmail,
      profileMobileNumber: `+${mobileNumber.countryCode}${mobileNumber.phoneNumber}`,
    };

    sessionAttributes.appointmentData = appointmentData;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // schedule without freebusy check
    if ( process.env.CHECK_FREEBUSY === 'false' ) {
      await bookAppointment(handlerInput);

      const speakOutput = requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal);

      return handlerInput.responseBuilder
        .withSimpleCard(
          requestAttributes.t('APPOINTMENT_TITLE', process.env.FROM_NAME),
          requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal),
        )
        .speak(speakOutput)
        .getResponse();
    } else if ( process.env.CHECK_FREEBUSY === 'true' ) {

      // check if the request time is available
      const isTimeSlotAvailable = await checkAvailability(startTimeUtc, endTimeUtc, userTimezone);

      // schedule with freebusy check
      if (isTimeSlotAvailable) {
        await bookAppointment(handlerInput);

        const speakOutput = requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal);

        return handlerInput.responseBuilder
          .withSimpleCard(
            requestAttributes.t('APPOINTMENT_TITLE', process.env.FROM_NAME),
            requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal),
          )
          .speak(speakOutput)
          .getResponse();
      }

      // time requested is not available so prompt to pick another time
      const speakOutput = requestAttributes.t('TIME_NOT_AVAILABLE', speakDateTimeLocal);
      const speakReprompt = requestAttributes.t('TIME_NOT_AVAILABLE_REPROMPT', speakDateTimeLocal);

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakReprompt)
        .getResponse();
    }
  },
};

// This handler is used to handle cases when a user asks if an
// appointment time is available
const CheckAvailabilityIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CheckAvailabilityIntent';
  },
  async handle(handlerInput) {
    const {
      responseBuilder,
      attributesManager,
    } = handlerInput;

    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

    // get timezone
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const userTimezone = await upsServiceClient.getSystemTimeZone(deviceId);

    // get slots
    const appointmentDate = currentIntent.slots.appointmentDate;
    const appointmentTime = currentIntent.slots.appointmentTime;

    // format appointment date and time
    const dateLocal = luxon.DateTime.fromISO(appointmentDate.value, { zone: userTimezone });
    const timeLocal = luxon.DateTime.fromISO(appointmentTime.value, { zone: userTimezone });
    const dateTimeLocal = dateLocal.plus({ 'hours': timeLocal.hour, 'minute': timeLocal.minute || 0 });
    const speakDateTimeLocal = dateTimeLocal.toLocaleString(luxon.DateTime.DATETIME_HUGE);

    // set appontement date to utc and add 30 min for end time
    const startTimeUtc = dateTimeLocal.toUTC().toISO();
    const endTimeUtc = dateTimeLocal.plus({ minutes: 30 }).toUTC().toISO();

    // check to see if the appointment date and time is available
    const isTimeSlotAvailable = await checkAvailability(startTimeUtc, endTimeUtc, userTimezone);

    let speakOutput = requestAttributes.t('TIME_NOT_AVAILABLE', speakDateTimeLocal);
    let speekReprompt = requestAttributes.t('TIME_NOT_AVAILABLE_REPROMPT', speakDateTimeLocal);

    if (isTimeSlotAvailable) {
      // save booking time to session to be used for booking
      const sessionAttributes = {
        appointmentDate,
        appointmentTime,
      };

      attributesManager.setSessionAttributes(sessionAttributes);

      speakOutput = requestAttributes.t('TIME_AVAILABLE', speakDateTimeLocal);
      speekReprompt = requestAttributes.t('TIME_AVAILABLE_REPROMPT', speakDateTimeLocal);

      return responseBuilder
        .speak(speakOutput)
        .reprompt(speekReprompt)
        .getResponse();
    }

    return responseBuilder
      .speak(speakOutput)
      .reprompt(speekReprompt)
      .getResponse();
  },
};

// This handler is used to handle 'yes' utternaces
const YesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('SCHEDULE_YES');

    return handlerInput.responseBuilder
      .addDelegateDirective({
        name: 'ScheduleAppointmentIntent',
        confirmationStatus: 'NONE',
        slots: {},
      })
      .speak(speakOutput)
      .getResponse();
  },
};

// This handler is used to handle 'no' utternaces
const NoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = requestAttributes.t('SCHEDULE_NO');

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

// This function handles utterances that can't be matched to any
// other intent handler.
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('FALLBACK');
    const repromptOutput = requestAttributes.t('FALLBACK_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
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
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
    // .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};

/* INTERCEPTORS */

// This function checks to make sure required environment vairables
// exists. This function will only be called if required configuration
// is not found. So, it's just a utilty function and it is not used
// after the skill is correctly configured.
const EnvironmentCheckInterceptor = {
  process(handlerInput) {
    // load environment variable from .env
    dotenv.config();

    // check for process.env.S3_PERSISTENCE_BUCKET
    if (!process.env.S3_PERSISTENCE_BUCKET) {
      handlerInput.attributesManager.setRequestAttributes({ invalidConfig: true });
    }
  },
};

// This interceptor function checks to see if a user has enabled permissions
// to access their profile information. If not, a request attribute is set and
// and handled by the InvalidPermissionsHandler
const PermissionsCheckInterceptor = {
  async process(handlerInput) {
    const { serviceClientFactory, attributesManager } = handlerInput;

    try {
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();

      const profileName = await upsServiceClient.getProfileName();
      const profileEmail = await upsServiceClient.getProfileEmail();
      const profileMobileNumber = await upsServiceClient.getProfileMobileNumber();

      if (!profileName) {
        // no profile name
        attributesManager.setRequestAttributes({ permissionsError: 'no_name' });
      }

      if (!profileEmail) {
        // no email address
        attributesManager.setRequestAttributes({ permissionsError: 'no_email' });
      }

      if (!profileMobileNumber) {
        // no mobile number
        attributesManager.setRequestAttributes({ permissionsError: 'no_phone' });
      }
    } catch (error) {
      if (error.statusCode === 403) {
        // permissions are not enabled
        attributesManager.setRequestAttributes({ permissionsError: 'permissions_required' });
      }
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
      // const args = arguments;
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

// A function that usess the Google Calander API and the freebusy service
// to check if a given appointment time slot is available
function checkAvailability(startTime, endTime, timezone) {
  const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URIS,
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    TOKEN_TYPE,
    EXPIRE_DATE,
    SCOPE,
  } = process.env;

  return new Promise(((resolve, reject) => {
    // Setup oAuth2 client
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS);
    const tokens = {
      access_token: ACCESS_TOKEN,
      scope: SCOPE,
      token_type: TOKEN_TYPE,
      expiry_date: EXPIRE_DATE,
    };

    if (REFRESH_TOKEN) tokens.refresh_token = REFRESH_TOKEN;

    oAuth2Client.credentials = tokens;

    // Create a Calendar instance
    const Calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    /** RequestBody
     * @items Array [{id : "<email-address>"}]
     * @timeMax String 2020-06-17T15:30:00.000Z
     * @timeMin String 2020-06-17T15:00:00.000Z
     * @timeZone String America/New_York
     */

    // Setup request body
    const query = {
      items: [
        {
          id: process.env.NOTIFY_EMAIL,
        },
      ],
      timeMin: startTime,
      timeMax: endTime,
      timeZone: timezone,
    };

    Calendar.freebusy.query({
      requestBody: query,
    }, (err, resp) => {
      if (err) {
        reject(err);
      } else if (resp.data.calendars[process.env.NOTIFY_EMAIL].busy
        && resp.data.calendars[process.env.NOTIFY_EMAIL].busy.length > 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  }));
}

// This function processes a booking request by creating a .ics file,
// saving the .isc file to S3 and sending it via email to the skill ower.
function bookAppointment(handlerInput) {
  return new Promise(((resolve, reject) => {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    try {
      const appointmentData = sessionAttributes.appointmentData;
      const userTime = luxon.DateTime.fromISO(appointmentData.appointmentDateTime,
        { zone: appointmentData.userTimezone });
      const userTimeUtc = userTime.setZone('utc');

      // create .ics
      const event = {
        start: [
          userTimeUtc.year,
          userTimeUtc.month,
          userTimeUtc.day,
          userTimeUtc.hour,
          userTimeUtc.minute,
        ],
        startInputType: 'utc',
        endInputType: 'utc',
        productId: 'dabblelab/ics',
        duration: { hours: 0, minutes: 30 },
        title: appointmentData.title,
        description: appointmentData.description,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
        attendees: [
          {
            name: appointmentData.profileName,
            email: appointmentData.profileEmail,
            rsvp: true,
            partstat: 'ACCEPTED',
            role: 'REQ-PARTICIPANT',
          },
        ],
      };

      const icsData = ics.createEvent(event);

      // save .ics to s3
      const s3 = new AWS.S3();

      const s3Params = {
        Body: icsData.value,
        Bucket: process.env.S3_PERSISTENCE_BUCKET,
        Key: `appointments/${appointmentData.appointmentDate}/${event.title.replace(/ /g, '-')
          .toLowerCase()}-${luxon.DateTime.utc().toMillis()}.ics`,
      };

      s3.putObject(s3Params, () => {
        // send email to user
        
        if ( process.env.SEND_EMAIL === 'true' ) {
          console.log('DEGUB ' + typeof process.env.SEND_EMAIL)
          const attachment = Buffer.from(icsData.value);
          
          const msg = {
            to: [process.env.NOTIFY_EMAIL, appointmentData.profileEmail],
            from: process.env.FROM_EMAIL,
            subject: requestAttributes.t('EMAIL_SUBJECT', appointmentData.profileName, process.env.FROM_NAME),
            text: requestAttributes.t('EMAIL_TEXT',
              appointmentData.profileName,
              process.env.FROM_NAME,
              appointmentData.profileMobileNumber),
            attachments: [
              {
                content: attachment.toString('base64'),
                filename: 'appointment.ics',
                type: 'text/calendar',
                disposition: 'attachment',
              },
            ],
          };
  
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          sgMail.send(msg).then((result) => {
            // mail done sending
            resolve(result);
          });
          
        } else {
          resolve(true);
        }
      });
    } catch (ex) {
      console.log(`bookAppointment() ERROR: ${ex.message}`);
      reject(ex);
    }
  }));
}

/* LAMBDA SETUP */

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    InvalidConfigHandler,
    InvalidPermissionsHandler,
    LaunchRequestHandler,
    CheckAvailabilityIntentHandler,
    StartedInProgressScheduleAppointmentIntentHandler,
    CompletedScheduleAppointmentIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
  )
  .addRequestInterceptors(
    EnvironmentCheckInterceptor,
    PermissionsCheckInterceptor,
    LocalizationInterceptor,
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
