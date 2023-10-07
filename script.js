const newPeriodFormEl = document.getElementsByTagName("form")[0];
const startDateInputEl = document.getElementById("start-date");
const endDateInputEl = document.getElementById("end-date");
const pastPeriodContainer = document.getElementById("past-periods");

// Add the storage key as an app-wide constant
const STORAGE_KEY = "period-tracker";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(
    (registration) => {
      console.log("Service worker registration successful:", registration);
    },
    (error) => {
      console.error(`Service worker registration failed: ${error}`);
    },
  );
} else {
  console.error("Service workers are not supported.");
}

// Check if the browser supports service workers.
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch(function(error) {
    console.error('Service Worker registration failed:', error);
  });
} else {
  console.error("Service workers are not supported.");
}

// Check if the app is already installed.
window.addEventListener('beforeinstallprompt', function(event) {
  // Prevent the default browser install prompt.
  event.preventDefault();

  // Show your custom install button.
  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  // Save the event for later use.
  let deferredPrompt = event;

  // Handle the custom install button click.
  installButton.addEventListener('click', function() {
    // Show the browser's install prompt.
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt.
    deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the installation prompt');
      } else {
        console.log('User dismissed the installation prompt');
      }

      // Reset the install button display.
      installButton.style.display = 'none';
    });

    // Reset the deferredPrompt.
    deferredPrompt = null;
  });
});


// Listen to form submissions.
newPeriodFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const startDate = startDateInputEl.value;
  const endDate = endDateInputEl.value;
  if (checkDatesInvalid(startDate, endDate)) {
    return;
  }
  storeNewPeriod(startDate, endDate);
  renderPastPeriods();
  newPeriodFormEl.reset();
});

function checkDatesInvalid(startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) {
    newPeriodFormEl.reset();
    return true;
  }
  return false;
}

function storeNewPeriod(startDate, endDate) {
  const periods = getAllStoredPeriods();
  periods.push({ startDate, endDate });
  periods.sort((a, b) => {
    return new Date(b.startDate) - new Date(a.startDate);
  });
  //window.localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(periods) )


}

function getAllStoredPeriods() {
  const data = window.localStorage.getItem(STORAGE_KEY);
  const periods = data ? JSON.parse(data) : [];
  console.dir(periods);
  console.log(periods);
  return periods;
}

function renderPastPeriods() {
  const pastPeriodHeader = document.createElement("h2");
  const pastPeriodList = document.createElement("ul");
  const periods = getAllStoredPeriods();
  if (periods.length === 0) {
    return;
  }
  pastPeriodContainer.innerHTML = "";
  pastPeriodHeader.textContent = "Past periods";
  periods.forEach((period) => {
    const periodEl = document.createElement("li");
    periodEl.textContent = `From ${formatDate(
      period.startDate,
    )} to ${formatDate(period.endDate)}`;
    pastPeriodList.appendChild(periodEl);
  });

  pastPeriodContainer.appendChild(pastPeriodHeader);
  pastPeriodContainer.appendChild(pastPeriodList);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

renderPastPeriods();
