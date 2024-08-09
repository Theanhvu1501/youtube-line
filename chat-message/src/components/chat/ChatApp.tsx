import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { MessageBox } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import notiVoice from "../../../noti_voice/iphone_notification.mp3";
import styles from "./ChatApp.module.css";

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_CHAT_ID;
const AVATAR_2 = import.meta.env.VITE_AVATAR_2;
const AVATAR_3 = import.meta.env.VITE_AVATAR_3;
const BG_VIDEO_PATH = import.meta.env.VITE_BG_VIDEO_PATH;
const CHANNEL = import.meta.env.VITE_CHANNEL;

interface ChatMessage {
  speaker: string;
  text: string;
  timestamp: string;
  avatar?: string;
  voiceBase64?: string;
  audioFile?: string;
}

interface ChatAppProps {
  chatData: ChatMessage[];
}

const ChatApp: React.FC<ChatAppProps> = ({ chatData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousMessageRef = useRef<ChatMessage | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true when component mounts

    return () => {
      setIsMounted(false); // Set isMounted to false when component unmounts
    };
  }, []);

  const sendTelegramMessage = async (message: string) => {
    const botToken = BOT_TOKEN;
    const chatId = CHAT_ID;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const dateNow = new Date();
    const text = `✅ ${dateNow.toLocaleString()} (Channel ${CHANNEL}): ${message}`;
    try {
      await axios.post(url, {
        chat_id: chatId,
        text,
      });
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
    }
  };

  useEffect(() => {
    const displayMessages = async () => {
      if (isMounted && currentIndex < chatData.length && hasUserInteracted) {
        // Check if component is mounted before executing
        const currentMessage = chatData[currentIndex];
        if (currentIndex === 0) {
          // Delay for 2 seconds before displaying the first message

          const audio = new Audio(notiVoice);
          // Phát âm thanh
          audio
            .play()
            .catch((error) => console.error("Error playing audio:", error));
          // Chờ âm thanh kết thúc hoặc hết 4 giây (lấy thời gian tối đa)
          await Promise.all([
            new Promise((resolve) => (audio.onended = resolve)),
            new Promise((resolve) => setTimeout(resolve, 2000)),
          ]);
        }
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, currentMessage];
          if (updatedMessages.length > 3) {
            updatedMessages.shift();
            updatedMessages.shift();
            updatedMessages.shift();
          }
          return updatedMessages;
        });
        if (currentMessage.audioFile) {
          const audio = new Audio(`../../../${currentMessage.audioFile}`);
          audio
            .play()
            .catch((error) => console.error("Error playing audio:", error));
          audio.onended = () => {
            if (currentIndex === chatData.length - 1) {
              sendTelegramMessage("Success");
            }
            setTimeout(() => {
              setCurrentIndex((prevIndex) => prevIndex + 1);
            }, 1000);
          };
        }
        previousMessageRef.current = currentMessage;
      }
    };

    displayMessages();
  }, [currentIndex, chatData, isMounted, hasUserInteracted]);

  return !hasUserInteracted ? (
    <>
      <button
        onClick={() => setHasUserInteracted(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Chat
      </button>
    </>
  ) : (
    <div
      className="relative  mx-auto border border-gray-300 shadow-lg overflow-hidden"
      style={{
        height: 720,
        width: 1280,
      }}
    >
      <video
        className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover z-0"
        autoPlay
        muted
        loop
      >
        <source src={BG_VIDEO_PATH} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div
        className="relative z-10  mx-auto border border-gray-300 shadow-lg"
        style={{
          height: 720,
          width: 1280,
          // backgroundColor:'#527c81'
        }}
      >
        <img src={"/asset/header.png"} className={styles.animatedImage} />
        <div className=" mb-4 p-4">
          {messages.map((msg) => (
            <div
              key={msg.timestamp}
              className={`flex ${
                msg.speaker === "Speaker 1" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex ${
                  msg.speaker === "Speaker 1" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.speaker !== "Speaker 1" && (
                  <img
                    src={msg.speaker === "Speaker 2" ? AVATAR_2 : AVATAR_3}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full mr-2"
                  />
                )}
                <MessageBox
                  type="text"
                  text={msg?.text}
                  date={new Date(msg.timestamp)}
                  position={msg.speaker === "Speaker 1" ? "right" : "left"}
                  styles={{
                    backgroundColor:
                      msg.speaker === "Speaker 1" ? "#FAE100" : "",
                    padding: 20,
                    borderRadius: 20,
                    borderTopLeftRadius: msg.speaker === "Speaker 1" ? 20 : 0,
                    borderTopRightRadius: msg.speaker === "Speaker 1" ? 0 : 20,
                  }}
                  notchStyle={{
                    fill: msg.speaker === "Speaker 1" ? "#FAE100" : "",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
