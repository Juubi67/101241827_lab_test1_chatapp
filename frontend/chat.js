import { io } from "socket.io-client";

const chatForm = document.getElementById("chatForm");
const roomSelect = document.getElementById("roomSelect");
const disconnectBtn = document.getElementById("disconnectBtn");

const socket =
  false ||
  io(`http://localhost:3031?token=${localStorage.getItem("CHAT_APP_token")}`);

const username = localStorage.getItem("CHAT_APP_username");

async function run() {
  const populateOldMessages = async (room) => {
    const oldMessagesData = await fetch(
      `http://localhost:3030/group-messages?room=${roomSelect.value}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("CHAT_APP_token")}`,
          "Content-Type": "application/json", // You can add other headers if needed
        },
      }
    );

    const oldMessages = await oldMessagesData.json();

    //clear chat
    const chatArea = document.getElementById("chat-area");

    // Check if the element with the specified ID exists
    if (chatArea) {
      // Clear all child elements
      while (chatArea.firstChild) {
        chatArea.removeChild(chatArea.firstChild);
      }
    }

    oldMessages.forEach((msg) => {
      const messageElement = document.createElement("div");
      messageElement.className = "alert alert-info";
      messageElement.innerHTML = `<strong>${
        msg.from_user.username || "other"
      }:</strong> ${msg.message}`;

      // Append the message to the chat area
      document.getElementById("chat-area").appendChild(messageElement);
    });
  };

  await populateOldMessages(roomSelect.value);

  if (socket) {
    socket.on("connect", () => {
      console.log("Socket.IO connection opened");
    });

    socket.emit("joinRoom", roomSelect.value);

    socket.on("receive-message", (message) => {
      const messageElement = document.createElement("div");
      messageElement.className = "alert alert-info";
      messageElement.innerHTML = `<strong>${
        username || "other"
      }:</strong> ${message}`;

      // Append the message to the chat area
      document.getElementById("chat-area").appendChild(messageElement);

      // Scroll to the bottom of the chat area
      document.getElementById("chat-area").scrollTop =
        document.getElementById("chat-area").scrollHeight;
    });

    socket.on("user-joined", (message) => {
      console.log({ message }, "joined");
    });

    function sendMessage() {
      // Get values from input fields
      const room = document.getElementById("roomSelect").value;
      const message = document.getElementById("messageText").value;

      // Clear the message input field
      document.getElementById("messageText").value = "";

      // Create a new message element
      const messageElement = document.createElement("div");
      messageElement.className = "alert alert-info";
      messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;

      // Append the message to the chat area
      document.getElementById("chat-area").appendChild(messageElement);

      // Scroll to the bottom of the chat area
      document.getElementById("chat-area").scrollTop =
        document.getElementById("chat-area").scrollHeight;

      socket.emit("send-message", message, room);
    }

    chatForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      sendMessage();
    });

    roomSelect.addEventListener("change", async (e) => {
      socket.emit("joinRoom", e.target.value);
      await populateOldMessages(e.target.value);
    });

    disconnectBtn.addEventListener("click", (e) => {
      socket.disconnect();
      console.log("user disconnected");
      window.location.href = "/";
      localStorage.removeItem("CHAT_APP_token");
    });
  }
}

run();
