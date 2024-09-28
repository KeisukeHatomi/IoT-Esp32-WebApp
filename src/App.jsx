// src/App.jsx
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import "./App.css";

import {
  Authenticator,
  Input,
  Label,
  Flex,
  Button,
  TextAreaField,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pubMessage, setPubMessage] = useState("");

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
      // setMessages((prevMessages) => [
      //   ...prevMessages,
      //   { topic, message: message.toString() },
      // ]);
      setMessages(message.toString());
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const publishMessage = () => {
    if (client && isConnected) {
      client.publish("emqx/esp32", pubMessage);
      setPubMessage("");
    }
  };

  const handleInput = (e) => {
    console.log("e🔵 ", e.currentTarget.value);
    setPubMessage(e.currentTarget.value);
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <Flex direction="column" gap="small" width="100%" alignItems="center">
            <h1>MQTT Web Client</h1>
            <h2>Hello {user?.signInDetails.loginId}</h2>
            <Button onClick={signOut} width="30%" marginBottom={50}>
              Sign out
            </Button>
            <Flex
              direction="row"
              gap="small"
              width="100%"
              alignItems="stretch"
              alignContent="space-between"
            >
              <Label htmlFor="message">
                Message:
              </Label>
              <Input
                id="massage"
                name="message"
                isRequired
                onInput={(e) => handleInput(e)}
                width={"40%"}
                value={pubMessage}
              />
              <Button onClick={publishMessage}>Publish</Button>
            </Flex>
          </Flex>
          <div>
            {/* <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  Topic: {msg.topic} | Message: {msg.message}
                </li>
              ))}
            </ul> */}
            <TextAreaField
              descriptiveText="Subscribe Messages"
              name="subscribe"
              rows={5}
              value={messages}
              marginTop={30}
            />
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
