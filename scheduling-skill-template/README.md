### Contribution
This skill template is contributed by Dabble Lab. They build VUI tools, conversational bots and robotic process automation solutions for businesses. You can check out more of their templates and tutorials on www.dabblelab.com and www.github.com/dabblelab

# Build An Appointment Scheduler Skill
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

This is an example skill that lets users schedule an appointment with the skill owner. 

## Skill Architecture
Each skill consists of two basic parts, a front end and a back end.
The front end is the voice interface, or VUI.
The voice interface is configured through the voice interaction model.
The back end is where the logic of your skill resides.

## Setting up Your Alexa Skill in the Developer Console (Alexa Hosted)

With an Alexa-hosted skill, you can build, edit, and publish a skill without leaving the developer console.
The skill includes a code editor for managing and deploying the backend code for your skill.
For details on what the Alexa-Hosted skills service provides, open [this page](https://developer.amazon.com/docs/hosted-skills/build-a-skill-end-to-end-using-an-alexa-hosted-skill.html) in a new tab.

### Steps
Now that you've chosen Alexa-Hosted for the method to host your skill's backend resources, to use this template, select **Scheduling Skill** and click "Choose". It will take a minute to create your Alexa hosted skill, then you will be taken to the Build tab of the console. It will take a minute to create your Alexa hosted skill, then you will be taken to the Build tab of the console.


 #### Build the Interaction Model for your skill

The Interaction Model for any skill lays the general guidelines of speech Alexa will listen for, including any additional information it may need to gather (ex: Slot Values). If you want to learn more about the Interaction Model and how it works, make sure to check out [the ASK Documentation on Creating an Interaction Model](https://developer.amazon.com/docs/custom-skills/create-the-interaction-model-for-your-skill.html).

- If you want to change the skill invocation name, select the **Build** tab, then **Invocation** under **Interaction Model**. Enter a **Skill Invocation Name**. This is the name that your users will need to say to start your skill.
- Click "Build Model".


#### NEXT: Review and Deploy the Alexa-Hosted Code
[![Next](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/buttons/next._TTH_.png)](./instructions/create-alexa-hosted-function.md)