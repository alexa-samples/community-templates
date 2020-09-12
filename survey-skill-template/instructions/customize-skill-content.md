# Build a Survey Skill
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

This skill allows you to run surveys or receive updates from members of your team by providing access through pre-set passcodes.

## Customize the Skill to be Yours

At this point, you should have a working copy of the Survey/ Stand Up Meeting skill in your Alexa developer console.  In order start using the skill with your team members and have reports emailed, you'll need to to configure email setting and add team members.  Here is what you'll need to do:

1.  **Add Team Members** First, you will need to add a unique 4-digit passcode for each user to authorize with. Please note that the skill builder is responsible for setting the passcode and skill owner/users need to be aware that the skill is only as secure as the passcode.

    1. Navigate to the **Code** tab again, and expand the project folder on the left to `Skill Code/lambda`.

    2. Open **[team.json](../lambda/team.json)**

    3. Create a new user object for each one of your team memebrs. The example below shows what the file would look like with two uers (User One, and User Two). The name and email are just for reporting but the passcode is required to authorize users. Each user should have a unique 6-digit passcode.
    ```json
    [
    { 
        "name": "User One",
        "email": "user1@test.com",
        "passcode": 111111
    },
    { 
        "name": "User Two",
        "email": "user2@test.com",
        "passcode": 222222
    }
    ]
    ```
2.  **Email Delivery Setting** To have user responses emailed to you, you'll need to configure the email delivery settings. This skill uses [SendGrid.com](https://sendgrid.com) for email delievery but the code could be modified to work with other email service providers.

    > **NOTE:** As an alternative to using SendGrid, you could also modify this code to work with other  
    > email services like [MailChimp](https://mailchimp.com) or [AWS SES](https://aws.amazon.com/ses/).

    1. Get a Sendgrid API key. See: https://sendgrid.com/docs/ui/account-and-settings/api-keys/

    2. Open **[.env.example](../lambda/.env.example)**, set the SEND_EMAIL value to 'true' and replace the placeholder values with your values.
    ```
    SEND_EMAIL=true
    SENDGRID_API_KEY=your_sendgrid_api_key
    FROM_EMAIL=your_sender_email
    TO_EMAIL=your_recipient_email
    ```
    
    3. Rename the `.env.example` file to `.env`

3.  **Customize Voice Prompts.** There are several prompts and responses that you might want to customize. To do that:

    1. Navigate to the **Code** tab again, and expand the project folder on the left to `Skill Code/lambda`.

    2. Open **[languageStrings.js](../lambda/languages/en.js)**

    3. 

    Before:
    ```js
        module.exports = {
            translation: {
                'SKILL_NAME': 'Daily Stand Up',
                'GREETING': [
                'Welcome to %s. To continue, please tell me your passcode.',
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
                'SKILL_NAME': 'Project Happiness',
                'GREETING': [
                'Welcome to the %s skill. What is you passcode?',
                ],
                ...,
                ...,
                ...,
            },
        };
    ```

     After you're done editing, make sure to press **Save**, **Deploy**, and navigate back to the **Testing** tab. When you launch the skill, Alexa will say "Welcome to the Project Happiness skill. What is you passcode?" instead of "Welcome to Daily Stand Up. To continue, please tell me your passcode.".

4.  **New language.** If you are creating this skill for another language other than English, you will need to make sure Alexa's responses are also in that language.

    - For example, if you are creating your skill in German, every single response that Alexa makes has to be in German. You can't use English responses or your skill will fail certification.

5. **Once you have customized the skill's data, languages and/or sentences, return to the [Amazon Developer Portal](https://developer.amazon.com/alexa/console/ask?&sc_category=Owned&sc_channel=RD&sc_campaign=Evangelism2018&sc_publisher=github&sc_content=Survey&sc_detail=fact-nodejs-V2_GUI-5&sc_funnel=Convert&sc_country=WW&sc_medium=Owned_RD_Evangelism2018_github_Survey_fact-nodejs-V2_GUI-5_Convert_WW_beginnersdevs&sc_segment=beginnersdevs) and select your skill from the list.**

6.  **Click on "Distribution" in the top navigation to move on to the publishing and certification of your skill.**


[![Next](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/buttons/button_next_publication._TTH_.png)](./submit-for-certification.md)

