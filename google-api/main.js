const fs = require("fs");
const path = require("path");
API_KEY = "";
const dirPath = "../audio_files";
getVoiceBase64 = async (text, sex) => {
  const apiKey = API_KEY;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const name = sex === "female" ? "ko-KR-Neural2-A" : "ko-KR-Neural2-C";
  const request = {
    input: { text: text },
    voice: {
      languageCode: "ko-KR",
      name,
    },
    audioConfig: {
      audioEncoding: "MP3",
      effectsProfileId: ["small-bluetooth-speaker-class-device"],
      pitch: 0,
      speakingRate: 1,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.audioContent;
  } catch (error) {
    console.error("Error calling Text-to-Speech API:", error);
  }
};

const saveVoiceToFile = async (base64Data, fileName) => {
  const buffer = Buffer.from(base64Data, "base64");
  const filePath = path.join(dirPath, fileName);
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
};

const readChatData = async () => {
  const filePath = "../chat_data.json";
  const data = await fs.promises.readFile(filePath, "utf8");
  return JSON.parse(data);
};

const writeChatData = async (data) => {
  const filePath = "../chat_data.json";
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const ensureAudioFilesDirectoryExists = async () => {
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath);
  }
};
const loadVoiceAndSaveFiles = async () => {
  await ensureAudioFilesDirectoryExists();
  let chatData = await readChatData();
  const voices = await Promise.all(
    chatData.map((voice, index) => {
      return getVoiceBase64(voice.text, voice.sex).then((voiceBase64) => {
        const fileName = `voice_${index}.wav`;
        return saveVoiceToFile(voiceBase64, fileName).then((filePath) => {
          voice.audioFile = filePath;
          return voice;
        });
      });
    })
  );
  chatData = voices;

  await writeChatData(chatData);
};

loadVoiceAndSaveFiles()
  .then(() => {
    console.log("Completed loading and saving voices.");
  })
  .catch((error) => {
    console.error("Error:", error);
  });
