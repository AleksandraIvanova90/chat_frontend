import getDate from "./getDate";

export default class Chat {
  constructor(parentElement) {
    if (typeof parentElement === "string") {
      parentElement = document.querySelector(parentElement);
    }
    this.parentElement = parentElement;
    this.form = parentElement.querySelector(".form");
    this.chat = parentElement.querySelector(".chat-container");
    this.chatButton = this.chat.querySelector(".button-chat");
    this.formButton = this.form.querySelector(".form-button");
    this.formNickname = this.form.querySelector(".form-nickname");
    this.footerChat = this.chat.querySelector(".footer-chat");
    this.chatMessages = this.chat.querySelector(".messages-chat");
    this.chatClose = this.chat.querySelector(".menu-close");
    this.user = null;
    this.ws = null;
    this.url = "ws://localhost:7070/ws";

    this.onMessage = this.onMessage.bind(this);

    this.verificationNickname = this.verificationNickname.bind(this);
    this.sendMessages = this.sendMessages.bind(this);
    this.deleteNickname = this.deleteNickname.bind(this);
  }

  init() {
    this.formButton.addEventListener("click", this.verificationNickname);
    this.chatButton.addEventListener("click", this.sendMessages);
    this.chatClose.addEventListener("click", this.deleteNickname);
  }

  verificationNickname(env) {
    env.preventDefault();
    if (!env.target.classList.contains("form-button")) return;
    this.user = env.target
      .closest(".form")
      .querySelector(".form-nickname").value;
    if (this.user == "") {
      alert("Псевдоним не указан!");
      return;
    }
    console.log(this.user);
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      const data = JSON.stringify({ type: "registration", name: this.user });
      this.ws.send(data);
      console.log("connected");
    });

    this.ws.addEventListener("error", (e) => {
      console.log("error:", e);
    });

    this.ws.addEventListener("message", this.onMessage);
  }

  sendMessages(env) {
    env.preventDefault();
    const message = this.footerChat.value;
    console.log(message);

    if (!message) return;
    const data = JSON.stringify({
      type: "message",
      content: message,
      user: this.user,
      created: getDate(),
    });
    this.ws.send(data);
    this.footerChat.value = "";
    console.log("Сообщение отправлено");
  }

  onMessage(e) {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.type === "registration") {
      if (data.success) {
        this.formNickname.value = "";
        this.form.classList.add("plug");
        this.chat.classList.remove("plug");
        this.allNickname(data);
        this.allMessages(data.messages);
      }
    }
    if (data.type === "message") {
      if (data.success) {
        console.log(data.messages);
        this.addMessage(data.messages);
      } else {
        this.showError();
        console.log(data.error);
      }
    }
    if (data.type === "update") {
      if (data.success) {
        this.allNickname(data);
      }
    }
  }

  allNickname(data) {
    console.log(this.user);
    const users = this.parentElement.querySelector(".users-list");
    while (users.firstChild) {
      users.removeChild(users.firstChild);
    }
    let list = data.data;
    list.forEach((element) => {
      if (element.name == this.user) {
        users.insertAdjacentHTML(
          "beforeEnd",
          `<li class="user_my" id="${element.id}">${element.name}</div>`,
        );
      } else {
        users.insertAdjacentHTML(
          "beforeEnd",
          `<li class="user" id="${element.id}">${element.name}</div>`,
        );
      }
    });
  }

  allMessages(data) {
    if (data.length > 0) {
      while (this.chatMessages.firstChild) {
        this.chatMessages.removeChild(this.chatMessages.firstChild);
      }
      data.forEach((message) => {
        if (message.user != this.user) {
          this.chatMessages.insertAdjacentHTML(
            "beforeEnd",
            `<div class="messages-chat__message">
                <div class="messages-chat__message__info">${message.user}, ${message.created}</div>
                <div class="messages-chat__message__text">${message.content}</div>
            </div>
            `,
          );
        } else {
          this.chatMessages.insertAdjacentHTML(
            "beforeEnd",
            `<div class="messages-chat__message-my">
                <div class="messages-chat__message-my__info">You, ${message.created}</div>
                <div class="messages-chat__message-my__text">${message.content}</div>
            </div>`,
          );
        }
      });
    }
  }

  addMessage(data) {
    if (data.user != this.user) {
      this.chatMessages.insertAdjacentHTML(
        "beforeEnd",
        `<div class="messages-chat__message">
                <div class="messages-chat__message__info">${data.user}, ${data.created}</div>
                <div class="messages-chat__message__text">${data.content}</div>
            </div>
            `,
      );
    } else {
      this.chatMessages.insertAdjacentHTML(
        "beforeEnd",
        `<div class="messages-chat__message-my">
                <div class="messages-chat__message-my__info">You, ${data.created}</div>
                <div class="messages-chat__message-my__text">${data.content}</div>
            </div>`,
      );
    }
  }

  deleteNickname(env) {
    env.preventDefault();
    if (!env.target.classList.contains("menu-close")) return;

    const data = JSON.stringify({
      type: "update",
      user: this.user,
    });
    this.ws.send(data);
    this.form.classList.remove("plug");
    this.chat.classList.add("plug");
  }
}
