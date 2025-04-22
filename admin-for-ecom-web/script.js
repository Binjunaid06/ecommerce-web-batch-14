function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    if (username === "admin" && password === "password123") {
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("error").innerText = "Invalid credentials!";
    }
  }
  
  function checkAuth() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.location.href = "index.html";
    }
  }
  
  function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
  }
  