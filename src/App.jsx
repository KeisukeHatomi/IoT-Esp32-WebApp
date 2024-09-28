// src/App.jsx
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import "./App.css";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // MQTTサーバーに接続
    const mqttClient = mqtt.connect(
      "wss://t191933e.ala.asia-southeast1.emqxsl.com:8084/mqtt",
      {
        username: "user001",
        password: "user001",
      }
    );

    mqttClient.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to MQTT broker");
      mqttClient.subscribe("emqx/esp32"); // トピックを購読
    });

    mqttClient.on("message", (topic, message) => {
      console.log("Received message:", topic, message.toString());
      setMessages((prevMessages) => [
        ...prevMessages,
        { topic, message: message.toString() },
      ]);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const sendMessage = () => {
    if (client && isConnected) {
      const message = "Hello from Web App";
      client.publish("emqx/esp32", message);
    }
  };

  const test =(e)=>{
    console.log('e🔵 ', e.signInDetails.loginId);

  }
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Hello {user?.signInDetails.loginId}</h1>
          <button onClick={signOut}>Sign out</button>
          <h1>MQTT Web Client</h1>
          <button onClick={sendMessage}>Send Message to ESP32</button>
          <div>
            <h2>Messages</h2>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  Topic: {msg.topic} | Message: {msg.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
