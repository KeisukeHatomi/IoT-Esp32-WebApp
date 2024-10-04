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
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [subMessages, setSubMessages] = useState([]);
  const [pubMessage, setPubMessage] = useState("");
  let str = [];

  const command = {
    Forward: {
      command: "up",
    },
    Left: {
      command: "left",
    },
    Right: {
      command: "right",
    },
    Back: {
      command: "down",
    },
    Stop: {
      command: "stop",
    },
    SpeedUp: {
      command: "speedUp",
    },
    SpeedDown: {
      command: "speedDown",
    },
  };

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
      // console.log("Received message:", topic, message.toString());
      setMessages((prevMessages) => [
        ...prevMessages,
        { topic, message: message.toString() },
      ]);

      str.push(message + "\n");
      if (str.length > 5) {
        str.shift(0);
      }
      setSubMessages(str);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const publishMessage = (mes) => {
    console.log("mes🔵 ", JSON.stringify(mes));
    if (client && isConnected) {
      client.publish("emqx/esp32", JSON.stringify(mes));
      setPubMessage("");
    }
  };

  const handleInput = (e) => {
    console.log("e🔵 ", e.currentTarget.value);
    setPubMessage(e.currentTarget.value);
  };

  const handleForward = () => {
    publishMessage(command.Forward);
  };

  const handleLeft = () => {
    publishMessage(command.Left);
  };

  const handleRight = () => {
    publishMessage(command.Right);
  };

  const handleBack = () => {
    publishMessage(command.Back);
  };

  const handleStop = () => {
    publishMessage(command.Stop);
  };

  const handleSpeedUp = () => {
    publishMessage(command.SpeedUp);
  };

  const handleSpeedDown = () => {
    publishMessage(command.SpeedDown);
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <Flex direction="column" gap="small" width="100%" alignItems="center">
            <h1>MQTT Operation Panel</h1>
            <h2>{user?.signInDetails.loginId}</h2>
            <Button marginBottom={30} onClick={signOut} width="30%">
              Sign out
            </Button>
            <Divider
              marginBottom={40}
              marginTop={0}
              orientation="horizontal"
            />
            {/* <Flex
              direction="row"
              gap="small"
              width="100%"
              alignItems="stretch"
              alignContent="space-between"
            >
              <Label htmlFor="message">Message:</Label>
              <Input
                id="massage"
                name="message"
                isRequired
                onInput={(e) => handleInput(e)}
                width={"40%"}
                value={pubMessage}
              />
              <Button onClick={publishMessage}>Publish</Button>
            </Flex> */}
          </Flex>
          <div>
            {/* <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  Topic: {msg.topic} | Message: {msg.message}
                </li>
              ))}
            </ul> */}
            <Flex direction="column" alignItems={"center"}>
              <Button width={60} onClick={handleForward}>
                UP
              </Button>
              <Flex>
                <Button width={60} onClick={handleLeft}>
                  LEFT
                </Button>
                <Button width={60} onClick={handleStop}>
                  STOP
                </Button>
                <Button width={60} onClick={handleRight}>
                  RIGHT
                </Button>
              </Flex>
              <Button width={60} onClick={handleBack}>
                DOWN
              </Button>
              <Flex>
                <Button width={140} onClick={handleSpeedUp}>
                  SPEED UP
                </Button>
                <Button width={140} onClick={handleSpeedDown}>
                  SPEED DOWN
                </Button>
              </Flex>
            </Flex>

            <TextAreaField
              descriptiveText="Subscribe Messages"
              name="subscribe"
              rows={6}
              value={subMessages}
              marginTop={30}
              isReadOnly={true}
            />
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
