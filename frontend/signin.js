import { io } from "socket.io-client";

const signinForm = document.getElementById("loginForm");

const signin = async (username, password) => {
  try {
    const userData = await fetch("http://localhost:3030/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const user = await userData.json();

    if (user && user.token) {
      localStorage.setItem("CHAT_APP_token", user.token);
      localStorage.setItem("CHAT_APP_username", user.username);

      const socket = io(`http://localhost:3031?token=${user.token}`);

      socket.on("connect", () => {
        console.log("Socket.IO connection opened");
      });

      window.location.href = "/chat.html";
    } else {
      document.getElementById("signin_error").innerHTML =
        "Invalid credentials.";
    }
  } catch (error) {
    document.getElementById("signin_error").innerText = "Invalid credentials.";
    console.log(error);
  }
};

signinForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  await signin(username, password);
});
