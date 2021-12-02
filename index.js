const axios = require('axios');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

class Uberduck {

    constructor(apiKey, apiSecret) {
        this.API_KEY = apiKey;
        this.API_SECRET = apiSecret;
    }

    async speak(speech, voice) {
        const dataString = JSON.stringify({
            speech,
            voice
        });
    
        try {
            const response = await axios({
                url: 'https://api.uberduck.ai/speak',
                method: 'post',
                headers: {},
                auth: {
                  username: this.API_KEY,
                  password: this.API_SECRET
                },
                data: dataString,
            });

            return response.data;
        } catch(error) {
            console.log("ERROR while attempting to call speak API.", error);
            return null;
        }
    }
    
    async pollSpeakStatus(uuid) {
        try {
            const response = await axios({
                url: `https://api.uberduck.ai/speak-status\?uuid\=${uuid}`,
                method: 'get',
                headers: {},
                auth: {
                  username: this.API_KEY,
                  password: this.API_SECRET
                }
            });
    
            return response.data;
        } catch(error) {
            console.log("ERROR while polling speak status.", error);
            return null;
        }
    }
    
    async synthesize(speech, voice) {

        try {
            const speakResponse = await this.speak(speech, voice);
            if(speakResponse == null || speakResponse.uuid == null) {
                console.log("ERROR synthesizing: Null speak response or null uuid.");
                return null;
            }

            await sleep(300);
    
            let pollResponse = await this.pollSpeakStatus(speakResponse.uuid);
            while(pollResponse == null || pollResponse.path == null) {
                await sleep(1000);
                pollResponse = await this.pollSpeakStatus(speakResponse.uuid);
            }
        
            pollResponse.uuid = speakResponse.uuid;
            return pollResponse;
        } catch(error) {
            console.log(`ERROR synthesizing.\nSpeech: ${speech}\nVoice: ${voice}`, error);
            return null;
        }
    }
}

module.exports = Uberduck;