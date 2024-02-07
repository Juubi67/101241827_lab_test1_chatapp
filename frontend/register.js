import { io } from "socket.io-client";

const registerForm = document.getElementById("registerForm");

const register = async (firstname, lastname, username, password) => {
  try {
    const userData = await fetch("http://localhost:3030/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, firstname, lastname }),
    });

    const user = await userData.json();

    console.log({ user });

    if (user && user.token) {
      localStorage.setItem("CHAT_APP_token", user.token);
      localStorage.setItem("CHAT_APP_username", user.username);

      const socket = io(`http://localhost:3031?token=${user.token}`);

      socket.on("connect", () => {
        console.log("Socket.IO connection opened");
      });

      window.location.href = "/chat.html";
    } else {
      document.getElementById("register_error").innerHTML =
        "Invalid credentials.";
    }
  } catch (error) {
    document.getElementById("register_error").innerText =
      "Invalid credentials.";
    console.log(error);
  }
};

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const firstname = document.getElementById("register-firstname").value;
  const lastname = document.getElementById("register-lastname").value;
  await register(firstname, lastname, username, password);
});
