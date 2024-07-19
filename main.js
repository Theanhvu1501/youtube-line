// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs/promises");

// Hàm đọc file và phân tích nội dung
async function parseTranscript(filePath, voiceName1, voiceName2, voiceName3) {
  const transcript = [];
  const data = await fs.readFile(filePath, "utf-8");
  const lines = data.split("\n");
  const regex = /(Speaker \d+): \[(\d{2}:\d{2}:\d{2}:\d{2})\] (.+)/;

  lines.forEach((line) => {
    const match = line.match(regex);
    if (match) {
      const speaker = match[1];
      const timestamp = match[2];
      const text = match[3];
      const voiceName = speaker?.includes("1") ? voiceName1 : speaker.includes("2") ? voiceName2 : voiceName3
      const avatarSpeaker2 = "https://noidia.b-cdn.net/thumbnails/726447699727.jpg";
      const avatarSpeaker3 = "https://smilemedia.vn/wp-content/uploads/2022/09/chup-anh-gia-dinh-kieu-han-quoc-8.jpg"
      const avatar = speaker?.includes("1") ? avatarSpeaker2 : speaker.includes("2") ? avatarSpeaker2 : avatarSpeaker3
      transcript.push({ speaker, timestamp, text, voiceName, avatar });
    }
  });

  return transcript;
}

// Đường dẫn tới file chứa nội dung
const inputFilePath = "./input.txt";
const outputFilePath = "./chat_data.json";
// ko-KR-Neural2-A Nu tre
// ko-KR-Neural2-B Nu Gia
// ko-KR-Neural2-C Nam

async function main() {
  try {
    const transcriptData = await parseTranscript(
      inputFilePath,
      "ko-KR-Neural2-C",
      "ko-KR-Neural2-A",
      "ko-KR-Neural2-B"
    );

    // Ghi dữ liệu đã phân tích vào file JSON
    await fs.writeFile(
      outputFilePath,
      JSON.stringify(transcriptData, null, 2),
      "utf-8"
    );

    console.log("Dữ liệu đã được ghi vào file JSON.");
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
  }
}

main();
