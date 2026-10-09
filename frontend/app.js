const form = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

let mode = "login";

// Create the username field automatically for registration
let usernameInput = document.getElementById("username");
let usernameGroup = document.getElementById("usernameGroup");

if (!usernameInput) {
usernameGroup = document.createElement("div");
usernameGroup.id = "usernameGroup";
usernameGroup.style.display = "none";

const usernameLabel = document.createElement("label");
usernameLabel.htmlFor = "username";
usernameLabel.textContent = "Username";

usernameInput = document.createElement("input");
usernameInput.type = "text";
usernameInput.id = "username";
usernameInput.name = "username";
usernameInput.minLength = 3;
usernameInput.maxLength = 50;
usernameInput.autocomplete = "username";

usernameGroup.appendChild(usernameLabel);
usernameGroup.appendChild(usernameInput);

// Insert username field before the email field
emailInput.parentElement.insertAdjacentElement("beforebegin", usernameGroup);
}

function setMode(nextMode) {
mode = nextMode;

loginTab.classList.toggle("active", mode === "login");
registerTab.classList.toggle("active", mode === "register");

submitBtn.textContent =
mode === "login" ? "Login" : "Create Account";

passwordInput.autocomplete =
mode === "login" ? "current-password" : "new-password";

usernameGroup.style.display =
mode === "register" ? "block" : "none";

usernameInput.required = mode === "register";

message.textContent = "";
message.style.color = "";
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));

form.addEventListener("submit", async (event) => {
event.preventDefault();

message.textContent = "Processing...";
message.style.color = "";
submitBtn.disabled = true;

try {
const payload = {
email: emailInput.value.trim(),
password: passwordInput.value
};

```
if (mode === "register") {
  payload.username = usernameInput.value.trim();
}

const response = await fetch(`/api/${mode}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Request failed.");
}

if (mode === "register") {
  form.reset();
  setMode("login");
  message.textContent =
    "Account created. You can now log in.";
} else {
  message.textContent =
    "Login successful. Welcome, " + result.user.username + "!";
}

message.style.color = "green";
```

} catch (error) {
message.textContent =
error.message === "Failed to fetch"
? "Cannot connect to the server. Please try again later."
: error.message;

```
message.style.color = "crimson";
```

} finally {
submitBtn.disabled = false;
}
});

setMode("login");
