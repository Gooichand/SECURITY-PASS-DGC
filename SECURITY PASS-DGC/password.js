// Common passwords list for basic check
const commonPasswords = [
  "123456", "password", "123456789", "12345", "12345678", "qwerty", "abc123",
  "football", "monkey", "letmein", "dragon", "111111", "baseball", "iloveyou"
];

// Character sets for variety calculation
const charSets = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  special: "!@#$%^&*()-_=+[]{}|;:'\",.<>/?`~"
};

function calculateStrength(password) {
  let score = 0;
  let vulnerabilities = [];
  const length = password.length;

  // Length score (30%)
  const lengthScore = Math.min(length / 12, 1) * 30;

  // Character variety (40%)
  let varietyCount = 0;
  if (/[a-z]/.test(password)) varietyCount++;
  if (/[A-Z]/.test(password)) varietyCount++;
  if (/\d/.test(password)) varietyCount++;
  if (/[^a-zA-Z0-9]/.test(password)) varietyCount++;
  const varietyScore = (varietyCount / 4) * 40;

  // Entropy calculation (20%)
  // Approximate entropy: log2(charset_size^length) = length * log2(charset_size)
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += charSets.lowercase.length;
  if (/[A-Z]/.test(password)) charsetSize += charSets.uppercase.length;
  if (/\d/.test(password)) charsetSize += charSets.digits.length;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += charSets.special.length;
  const entropy = length * (Math.log2(charsetSize) || 0);
  const maxEntropy = 12 * Math.log2(94); // max entropy for 12 chars with all printable ASCII
  const entropyScore = Math.min(entropy / maxEntropy, 1) * 20;

  // Common password check (10%)
  const isCommon = commonPasswords.includes(password.toLowerCase());
  const commonScore = isCommon ? 0 : 10;

  score = lengthScore + varietyScore + entropyScore + commonScore;
  score = Math.min(Math.round(score), 100);

  // Vulnerabilities detection
  if (!/[A-Z]/.test(password)) vulnerabilities.push("Missing uppercase letters");
  if (!/[^a-zA-Z0-9]/.test(password)) vulnerabilities.push("No special characters");
  if (/(.)\1{2,}/.test(password)) vulnerabilities.push("Repeated characters detected");
  if (/(012|123|234|345|456|567|678|789|890)/.test(password)) vulnerabilities.push("Sequential numeric patterns detected");
  if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) vulnerabilities.push("Sequential alphabetic patterns detected");

  // Combinations calculation: charset_size^length
  const combinations = Math.pow(charsetSize || 1, length);

  return {
    score,
    vulnerabilities,
    combinations
  };
}

// Utility to format combinations in scientific notation
function formatCombinations(num) {
  if (num === 0) return "0";
  const exponent = Math.floor(Math.log10(num));
  const mantissa = num / Math.pow(10, exponent);
  return mantissa.toFixed(2) + "e+" + exponent;
}

// Fortress rating labels based on score
function getFortressRating(score) {
  if (score <= 30) return "Wooden Door";
  if (score <= 60) return "Iron Gate";
  if (score <= 90) return "Vault Door";
  return "Fort Knox";
}

// Crack time estimation (very rough, in seconds)
function estimateCrackTime(combinations) {
  // Assume 1 billion guesses per second (1e9)
  const guessesPerSecond = 1e9;
  const seconds = combinations / guessesPerSecond;

  if (seconds < 1) return "Less than 1 second";
  if (seconds < 60) return Math.round(seconds) + " seconds";
  if (seconds < 3600) return Math.round(seconds / 60) + " minutes";
  if (seconds < 86400) return Math.round(seconds / 3600) + " hours";
  if (seconds < 31536000) return Math.round(seconds / 86400) + " days";
  if (seconds < 3153600000) return Math.round(seconds / 31536000) + " years";
  return "Centuries";
}

const passwordInput = document.getElementById("password-input");
const strengthMeterFill = document.querySelector(".strength-meter-fill");
const strengthLabel = document.getElementById("strength-label");
const vulnerabilitiesList = document.getElementById("vulnerabilities-list");
const crackTimeElem = document.getElementById("crack-time");

// Update UI based on password input
function updateStrengthUI() {
  const password = passwordInput.value;
  const { score, vulnerabilities, combinations } = calculateStrength(password);

  // Update strength meter fill width and color
  strengthMeterFill.style.width = score + "%";
  // Color gradient from red to white to green
  if (score <= 30) {
    strengthMeterFill.style.background = "linear-gradient(90deg, #FF0000 0%, #FF3333 100%)";
  } else if (score <= 60) {
    strengthMeterFill.style.background = "linear-gradient(90deg, #FF3333 0%, #FFFFFF 100%)";
  } else if (score <= 90) {
    strengthMeterFill.style.background = "linear-gradient(90deg, #FFFFFF 0%, #00FF00 100%)";
  } else {
    strengthMeterFill.style.background = "linear-gradient(90deg, #00FF00 0%, #00CC00 100%)";
  }

  // Update fortress rating label
  const fortressRating = getFortressRating(score);
  strengthLabel.textContent = "Fortress Rating: " + fortressRating;

  // Update shield visualization based on fortress rating
  updateShieldVisualization(fortressRating);

  // Update vulnerabilities list
  vulnerabilitiesList.innerHTML = "";
  if (vulnerabilities.length === 0 && password.length > 0) {
    const li = document.createElement("li");
    li.textContent = "No vulnerabilities detected";
    vulnerabilitiesList.appendChild(li);
  } else {
    vulnerabilities.forEach(vuln => {
      const li = document.createElement("li");
      li.textContent = vuln;
      vulnerabilitiesList.appendChild(li);
    });
  }

  // Update crack time estimation
  crackTimeElem.textContent = estimateCrackTime(combinations);
}

// Function to update shield visualization SVG based on fortress rating
function updateShieldVisualization(rating) {
  const shieldDiv = document.querySelector(".shield-visualization");
  let svgContent = "";

  if (rating === "No Password") {
    svgContent = `
      <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="var(--color-gray-dark)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
        <rect x="12" y="12" width="40" height="40" fill="#e0e0e0" />
        <line x1="12" y1="12" x2="52" y2="52" stroke="#a0a0a0" stroke-width="3" />
        <line x1="52" y1="12" x2="12" y2="52" stroke="#a0a0a0" stroke-width="3" />
      </svg>
    `;
  } else {
    switch (rating) {
      case "Drawbridge Defense":
        svgContent = `
          <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="var(--color-red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
            <path d="M32 2 L12 12 L12 32 C12 48 32 62 32 62 C32 62 52 48 52 32 L52 12 Z" fill="#ffcccc" />
            <circle cx="32" cy="32" r="10" fill="#ff9999" />
          </svg>
        `;
        break;
      case "Moat Protected":
        svgContent = `
          <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="var(--color-red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
            <path d="M32 2 L10 14 L10 34 C10 50 32 62 32 62 C32 62 54 50 54 34 L54 14 Z" fill="#ff9999" />
            <circle cx="32" cy="32" r="12" fill="#ff6666" />
            <rect x="20" y="20" width="24" height="24" fill="#ff4d4d" />
          </svg>
        `;
        break;
      case "Castle Walls":
        svgContent = `
          <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="var(--color-red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
            <path d="M32 2 L8 16 L8 40 C8 56 32 62 32 62 C32 62 56 56 56 40 L56 16 Z" fill="#ff6666" />
            <circle cx="32" cy="32" r="14" fill="#ff3333" />
            <rect x="18" y="18" width="28" height="28" fill="#cc0000" />
            <polygon points="32,10 26,20 38,20" fill="#990000" />
          </svg>
        `;
        break;
      case "Dragon-Guarded":
        svgContent = `
          <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="var(--color-red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
            <path d="M32 2 L6 18 L6 44 C6 58 32 62 32 62 C32 62 58 58 58 44 L58 18 Z" fill="#ff3333" />
            <circle cx="32" cy="32" r="16" fill="#cc0000" />
            <rect x="16" y="16" width="32" height="32" fill="#990000" />
            <polygon points="32,8 24,22 40,22" fill="#660000" />
            <path d="M20 40 Q32 50 44 40" stroke="#660000" stroke-width="3" fill="none" />
          </svg>
        `;
        break;
      default:
        svgContent = `
          <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="var(--color-red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
            <path d="M32 2 L12 12 L12 32 C12 48 32 62 32 62 C32 62 52 48 52 32 L52 12 Z" />
            <circle cx="32" cy="32" r="10" />
          </svg>
        `;
    }
  }

  shieldDiv.innerHTML = svgContent;
}

// Real-time update on input
passwordInput.addEventListener("input", updateStrengthUI);

// Initialize UI on page load
updateStrengthUI();
