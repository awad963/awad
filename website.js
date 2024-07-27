async function sendSMS() {
  const username = document.getElementById("usernameInput").value;
  const apiUrl = "http://192.168.136.139/webservice/rest/server.php";
  const token = "8085ee6bd1a62dc0fb4941fe262a5b99"; // Securely handle this token in real apps

  try {
    const userDetails = await fetchUserDetails(apiUrl, token, username);
    if (userDetails) {
      const verifyCode = generateVerificationCode();
      console.log(`Generated verification code: ${verifyCode}`);
      await sendSms(userDetails.phone1, verifyCode); // Ensure phone1 is the correct field
      // Show verification code input field and verify button
      document.getElementById("verificationSection").style.display = "block";
      sessionStorage.setItem("userId", userDetails.id); // Store user ID in session storage
    } else {
      alert("User not found for the given username.");
    }
  } catch (error) {
    console.error("Error in sendSMS:", error);
    alert("An error occurred. Please try again.");
  }
}

function verifySMS() {
  const enteredCode = document.getElementById("verificationCodeInput").value;
  const storedCode = sessionStorage.getItem("verificationCode");
  const verificationResult = document.getElementById("verificationResult");

  if (enteredCode === storedCode) {
    verificationResult.textContent = "Verification successful!";
    verificationResult.style.color = "green";
    resetPassword();
  } else {
    verificationResult.textContent = "Verification failed. Please try again.";
    verificationResult.style.color = "red";
  }
}

async function fetchUserDetails(apiUrl, token, username) {
  try {
    const response = await fetch(
      `${apiUrl}?wsfunction=core_user_get_users_by_field&wstoken=${token}&moodlewsrestformat=json&field=username&values[0]=${username}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}

async function resetPassword() {
  const apiUrl = "http://192.168.136.139/webservice/rest/server.php";
  const token = "16ed27e7aa31ffbaf08bdd4304572592"; // Securely handle this token in real apps
  const userId = sessionStorage.getItem("userId");

  const newPassword = prompt("Enter your new password:");
  const confirmPassword = prompt("Confirm your new password:");

  if (newPassword && confirmPassword && newPassword === confirmPassword) {
    const formData = new FormData();
    formData.append("wstoken", token);
    formData.append("wsfunction", "core_user_update_users");
    formData.append("moodlewsrestformat", "json");
    formData.append("users[0][id]", userId);
    formData.append("users[0][password]", newPassword);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data && !data.exception) {
        alert("Password updated successfully!");
      } else {
        alert("Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred. Please try again.");
    }
  } else {
    alert("Passwords do not match or are empty. Please try again.");
  }
}

function generateVerificationCode() {
  const code = Math.floor(1000 + Math.random() * 9000);
  sessionStorage.setItem("verificationCode", code); // Store the code in session storage
  return code;
}

async function sendSms(phoneNumber, verificationCode) {
  const smsUrl = "http://192.168.136.140/"; // The base URL for your Nginx server

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: "Basic " + btoa("HR:HR"),
  });

  const body = JSON.stringify({
    to: `09${phoneNumber}`,
    from: "SyriatelLMS",
    content: verificationCode.toString(),
  });

  try {
    const response = await fetch(smsUrl + "secure/send", {
      method: "POST",
      headers: headers,
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data && !data.exception) {
      console.log("SMS sent successfully!");
    } else {
      alert("Failed to send SMS. Please try again.");
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    alert("An error occurred while sending SMS. Please try again.");
  }
}
