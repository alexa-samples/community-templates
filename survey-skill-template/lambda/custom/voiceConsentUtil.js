 /**
  * This is the library that handles
  * - Making a call to voice consent skill based on the inputs passed
  * - Handle callbacks from voice consent
  *
  * Developer README:
  * 1) Make a call to the library as follows....to initiate a voice consent request
  *      voiceConsentUtil.getVoiceConsentPermissionRequest(handlerInput, Array<RequestedPermission>).getResponse();
  *
  * 2) Add the handler in your respective chain to handle the skill connection response
  exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
  ......
  //handler that handles skill response for voice consent
  new voiceConsentUtil.skillConnectionsResponseHandler(handleCallBackForVoiceConsentAccepted)
  ....
  )

  where handleCallBackForVoiceConsentAccepted is a function that domain specific logic when the request has been accepted
  Ex:
  async function handleCallBackForVoiceConsentAccepted(handlerInput) {
             ...your code to handle goes here....
         }
  }
  *
  * */

  'use strict';
  const Alexa = require('ask-sdk-core');


  /**
   * Consent type determining the level at which user gives access to the permissions
   * @type {Readonly<{ACCOUNT: string, PERSON: string}>}
   */
  const CONSENT_LEVEL = Object.freeze({
      PERSON : "PERSON",
      ACCOUNT: "ACCOUNT"
  });


  /**
   * Util class to hold the requested permission data.
   * @param permissionScope - string of permission scope name.
   * @param consentLevel - string of consent level.
   */
  class RequestedPermission {
      constructor(permissionScope, consentLevel) {
          this.permissionScope = permissionScope;
          this.consentLevel = consentLevel;
      }
  }


  /**
   * Function that handles sending voice consent request for respective params
   * @params handlerInput - the handlerInput received from the IntentRequest
   * @params permissionScope - the scope to which voice permission needs to be requested
   * @params consentLevel - the consent level to which voice permission needs to be requested
   *
   * @returns AskForPermissionsConsentRequest request
   **/
  const getVoiceConsentPermissionRequest = (handlerInput, requestedPermissions) => {
      console.log("requestedPermissions", requestedPermissions);
      let permissionScopes = [];
      requestedPermissions.forEach(element => {
          permissionScopes.push({
              "permissionScope": element.permissionScope,
              "consentLevel": element.consentLevel,
          })
      });
      return handlerInput.responseBuilder
          .addDirective({
              type: "Connections.StartConnection",
              uri: "connection://AMAZON.AskForPermissionsConsent/2",
              input: {
                  "@type": "AskForPermissionsConsentRequest",
                  "@version": "2",
                  "permissionScopes": permissionScopes
              },
              token: ""
          });
  }


  /**
   * Default function to handle the case where the customer has rejected the consent via voice
   * Note: Developers can choose to override this behaviour by defining their own call back function to handle rejected case.
   *
   * @params handlerInput - the handlerInput received from the IntentRequest
   * @returns Response with rejected content
   **/
  const handleCallBackForVoiceConsentRejected = (handlerInput) => {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      ///DENIED handling of connections response
      return handlerInput.responseBuilder
          .speak(requestAttributes.t('VOICE_CONSENT_DENIED_REPROMPT'))
          .getResponse();
  }


  /**
   * Function to render default error message
   *
   * @params handlerInput - the handlerInput received from the IntentRequest
   * @returns Response with error message
   **/
  const defaultErrorResponse = (handlerInput) => {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      return handlerInput.responseBuilder
          .speak(requestAttributes.t('VOICE_CONSENT_ERROR_REPROMPT'))
          .getResponse();
  }

  /**
   * Response handler that handles SessionResumedRequest response from VoiceConsentSkill
   */
  const SessionResumedRequestHandler = class {

      constructor(callBackForAccepted,callBackForRejected = handleCallBackForVoiceConsentRejected) {
          this.callBackForAccepted = callBackForAccepted
          this.callBackForRejected = callBackForRejected
      }

      canHandle(handlerInput) {
          return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionResumedRequest';
      }

      handle(handlerInput) {
          const result = handlerInput.requestEnvelope.request.cause.result;
          if (typeof result !== 'undefined') {
              switch (result.status) {
                  case 'ACCEPTED' :
                      return this.callBackForAccepted(handlerInput);
                  case 'DENIED' :
                      return this.callBackForRejected(handlerInput);
                  case 'REDIRECT_TO_APP':
                      return this.callBackForRejected(handlerInput);
                  default :
                      ///Default handling of connections response
                      // Developer can override by having a different callback/ plain function to render different message
                      return defaultErrorResponse(handlerInput);
              }
          }
          ///Unknown error handling
          return defaultErrorResponse(handlerInput);
      }
  }

  //make these modules available to index.js
  module.exports = {
      getVoiceConsentPermissionRequest,
      SessionResumedRequestHandler,
      CONSENT_LEVEL,
      RequestedPermission
  };
