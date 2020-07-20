# Build An Appointment Scheduler Skill
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

Build a skill that lets users request and book an appointment with you.

## Customize the Skill to be Yours

At this point, you should have a working copy of the Scheduling Skill in your Alexa developer console.  In order start using the skill with your team members and have reports emailed, you'll need to to configure email setting and add team members.  Here is what you'll need to do:

1.  **Email Delivery Setting** By default, when a user requests and appointment, the details of their appointment request are simply saved as an [.ico file](https://en.wikipedia.org/wiki/ICO_(file_format)) in an S3 bucket. But, you'll want to be notified when a new appointment request is made. So, you'll need to enable the skill to send email to your email address. To make that happen, this skill uses [SendGrid.com](https://sendgrid.com) to send email. SendGrid is just one of many email service providers and you could easily modify the skill code to user another provider such as [MailChimp](https://mailchimp.com), or [AWS Simple Email Service](https://aws.amazon.com/ses). But to configure this skill without modifying the code, you'll need a SendGrid account and a SendGrid API key.

    1. Get a Sendgrid API key. See: https://sendgrid.com/docs/ui/account-and-settings/api-keys/

    2. Open **[.env.example](../lambda/.env.example)**, set the SEND_EMAIL value to 'true' and replace the placeholder values under the `### EMAIL ENVIRONMENT VARIABLES ###` section with your values.
    ```
    ### EMAIL ENVIRONMENT VARIABLES ###
    SEND_EMAIL=true
    SENDGRID_API_KEY=your_sendgrid_api_key
    FROM_NAME=your_email_from_name
    FROM_EMAIL=your_email_from_address
    NOTIFY_EMAIL=email_address_to_notify_of_new_appointment_requests
    ```
    
    3. Rename the `.env.example` file to `.env`

2. **Configure Free/Busy checking (optional)** If you use a Google Calander, this skill can be configured to check your availability before allowing a user to make an appointment request. 

    1. follow the instructions at https://developers.google.com/calendar/quickstart/nodejs and download the `credentails.json` file.

    2. Use the values from the `credentails.json` file to replace the placeholder values in `.env` file from the last step. The values are located under the `### FREEBUSY ENVIRONMENT VARIABLES ###` sction.

    ```
    CHECK_FREEBUSY=false
    CLIENT_ID=your_google_client_id
    CLIENT_SECRET=your_google_client_secret
    REDIRECT_URIS=your_google_redirect_uris
    ACCESS_TOKEN=your_google_access_token
    REFRESH_TOKEN=your_google_refresh_token
    TOKEN_TYPE=Bearer
    EXPIRE_DATE=your_google_expire_date
    SCOPE=https://www.googleapis.com/auth/calendar.readonly
    ```

3.  **Customize Voice Prompts.** There are several prompts and responses that you might want to customize. To do that:

    1. Navigate to the **Code** tab again, and expand the project folder on the left to `Skill Code/lambda`.

    2. Open **[languageStrings.js](../lambda/languages/en.js)**

    3. 

    Before:
    ```js
        module.exports = {
            translation: {
                SKILL_NAME: 'Appointment Scheduler',
                GREETING: [
                'Hello. Welcome to %s. Would you like to schedule an appointment?'
                ],
                ...,
                ...,
                ...,
            },
        };
    ```

    After:
    ```js
        module.exports = {
            translation: {
                'SKILL_NAME': 'Support Zone',
                'GREETING': [
                'Welcome to the %s skill. Would you like to schedule an appointment?',
                ],
                ...,
                ...,
                ...,
            },
        };
    ```

     After you're done editing, make sure to press **Save**, **Deploy**, and navigate back to the **Testing** tab. When you launch the skill, Alexa will say "Welcome to the Support Zone skill. Would you like to schedule an appointment?" instead of "Hello. Welcome to Appointment Scheduler. Would you like to schedule an appointment?".

4.  **New language.** If you are creating this skill for another language other than English, you will need to make sure Alexa's responses are also in that language.

    - For example, if you are creating your skill in German, every single response that Alexa makes has to be in German. You can't use English responses or your skill will fail certification.

5. **Once you have customized the skill's data, languages and/or sentences, return to the [Amazon Developer Portal](https://developer.amazon.com/alexa/console/ask?&sc_category=Owned&sc_channel=RD&sc_campaign=Evangelism2018&sc_publisher=github&sc_content=Survey&sc_detail=fact-nodejs-V2_GUI-5&sc_funnel=Convert&sc_country=WW&sc_medium=Owned_RD_Evangelism2018_github_Survey_fact-nodejs-V2_GUI-5_Convert_WW_beginnersdevs&sc_segment=beginnersdevs) and select your skill from the list.**

6.  **Click on "Distribution" in the top navigation to move on to the publishing and certification of your skill.**


[![Next](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/buttons/button_next_publication._TTH_.png)](./submit-for-certification.md)
