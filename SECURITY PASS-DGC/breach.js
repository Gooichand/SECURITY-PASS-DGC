const emailInput = document.getElementById("email-input");
const checkBreachBtn = document.getElementById("check-breach-btn");
const breachStatus = document.getElementById("breach-status");
const breachMessage = document.getElementById("breach-message");
const breachResults = document.getElementById("breach-results");
const lastChecked = document.getElementById("last-checked");
const exportPdfBtn = document.getElementById("export-pdf-btn");

// Mock breach data for demonstration
const mockBreachData = {
  "test@example.com": {
    breaches: 3,
    highRisk: true,
    details: [
      { name: "ExampleBreach1", date: "2021-05-10" },
      { name: "ExampleBreach2", date: "2022-01-15" },
      { name: "ExampleBreach3", date: "2023-03-20" }
    ]
  },
  "user@domain.com": {
    breaches: 0,
    highRisk: false,
    details: []
  }
};

// Utility to format date
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// Save last check to localStorage
function saveLastCheck(email, data) {
  const record = {
    email,
    data,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem("lastBreachCheck", JSON.stringify(record));
}

// Load last check from localStorage
function loadLastCheck() {
  const record = localStorage.getItem("lastBreachCheck");
  if (!record) return null;
  return JSON.parse(record);
}

// Update last checked display
function updateLastChecked(timestamp) {
  if (!timestamp) {
    lastChecked.textContent = "Last checked: Never";
  } else {
    const date = new Date(timestamp);
    lastChecked.textContent = "Last checked: " + date.toLocaleString();
  }
}

// Display breach results
function displayBreachResults(data) {
  breachResults.innerHTML = "";
  if (data.breaches === 0) {
    breachMessage.textContent = "No breaches detected";
    breachStatus.classList.remove("alert", "high-risk");
    breachStatus.classList.add("safe");
    exportPdfBtn.disabled = true;
  } else {
    breachMessage.textContent = `Compromised in ${data.breaches} breach${data.breaches > 1 ? "es" : ""}`;
    breachStatus.classList.remove("safe");
    breachStatus.classList.add("alert");
    if (data.highRisk) {
      breachStatus.classList.add("high-risk");
      // Flashing icon or animation can be added here
    } else {
      breachStatus.classList.remove("high-risk");
    }
    exportPdfBtn.disabled = false;

    // Show breach details with animated icons
    const ul = document.createElement("ul");
    ul.classList.add("breach-list");
    data.details.forEach(breach => {
      const li = document.createElement("li");
      li.textContent = `${breach.name} (${formatDate(breach.date)})`;
      ul.appendChild(li);
    });
    breachResults.appendChild(ul);
  }
}

async function checkBreaches(email) {
  // Always use mock data for demo mode to ensure working system
  const lowerEmail = email.toLowerCase();
  if (mockBreachData.hasOwnProperty(lowerEmail)) {
    return mockBreachData[lowerEmail];
  }
  return { breaches: 0, highRisk: false, details: [] };
}

// Loading state
function setLoading(isLoading) {
  if (isLoading) {
    checkBreachBtn.disabled = true;
    checkBreachBtn.textContent = "Checking...";
  } else {
    checkBreachBtn.disabled = false;
    checkBreachBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2L3 7v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7l-9-5z"></path>
        <path d="M12 12v4"></path>
        <circle cx="12" cy="17" r="1"></circle>
      </svg>
      Check
    `;
  }
}

function exportResultsAsPDF(email, data) {
  if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
    alert("PDF export requires jsPDF library.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Breach Alert Report", 10, 20);
  doc.setFontSize(12);
  doc.text(`Email: ${email}`, 10, 30);
  doc.text(`Breaches detected: ${data.breaches}`, 10, 40);
  if (data.breaches > 0) {
    doc.text("Details:", 10, 50);
    data.details.forEach((breach, index) => {
      doc.text(`${index + 1}. ${breach.name} (${formatDate(breach.date)})`, 15, 60 + index * 10);
    });
  }
  doc.save(`Breach_Report_${email.replace(/[@.]/g, "_")}.pdf`);
}

// Event handler for breach check
async function handleCheckBreach() {
  const email = emailInput.value.trim();
  // Validate email format before proceeding
  if (!email || !validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }
  setLoading(true);
  breachMessage.textContent = "Checking breaches...";
  breachResults.innerHTML = "";
  try {
    const data = await checkBreaches(email);
    displayBreachResults(data);
    saveLastCheck(email, data);
    updateLastChecked(new Date().toISOString());
  } catch (error) {
    console.error('Breach check error:', error);
    breachMessage.textContent = "Error checking breaches. Please try again later.";
    breachStatus.classList.remove("safe", "alert", "high-risk");
    exportPdfBtn.disabled = true;
  } finally {
    setLoading(false);
  }
}

// Email format validation function
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Load last check on page load
window.addEventListener("DOMContentLoaded", () => {
  const lastCheck = loadLastCheck();
  if (lastCheck) {
    emailInput.value = lastCheck.email;
    displayBreachResults(lastCheck.data);
    updateLastChecked(lastCheck.timestamp);
    exportPdfBtn.disabled = false;
  } else {
    updateLastChecked(null);
  }
});

// Attach event listeners
checkBreachBtn.addEventListener("click", handleCheckBreach);

exportPdfBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  if (!email) {
    alert("No email to export.");
    return;
  }
  const lastCheck = loadLastCheck();
  if (!lastCheck || lastCheck.email !== email) {
    alert("Please check breaches before exporting.");
    return;
  }
  exportResultsAsPDF(email, lastCheck.data);
});
