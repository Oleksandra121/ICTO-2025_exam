window.addEventListener("DOMContentLoaded", () => {
  const voiceStatus = document.getElementById("voiceStatus");
  const toggleBtn = document.getElementById("voiceToggleBtn");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.innerText = "🎤 Розпізнавання не підтримується в цьому браузері";
    toggleBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "uk-UA";
  recognition.continuous = false;
  recognition.interimResults = false;

  window.ANIMATION_DURATION = 600;
  let isListening = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    console.log("🎤 Розпізнано:", transcript);

    if (transcript.includes("швидко")) {
      window.ANIMATION_DURATION = 200;
      voiceStatus.innerText = "🎤 Швидка швидкість";
    } else if (transcript.includes("повільно")) {
      window.ANIMATION_DURATION = 1000;
      voiceStatus.innerText = "🎤 Повільна швидкість";
    } else if (transcript.includes("нормально")) {
      window.ANIMATION_DURATION = 600;
      voiceStatus.innerText = "🎤 Нормальна швидкість";
    } else {
      voiceStatus.innerText = `🎤 Не розпізнано: "${transcript}"`;
    }
  };

  recognition.onerror = (event) => {
    console.warn("🎤 Помилка:", event.error);
    voiceStatus.innerText = "🎤 Помилка голосового введення: " + event.error;
    if (isListening) {
      setTimeout(() => recognition.start(), 1000);
    }
  };

  recognition.onend = () => {
    if (isListening) {
      setTimeout(() => recognition.start(), 1000);
    }
  };

  toggleBtn.addEventListener("click", () => {
    if (!isListening) {
      isListening = true;
      recognition.start();
      toggleBtn.innerText = "🛑 Вимкнути голос";
      voiceStatus.innerText = "🎤 Очікую команду...";
    } else {
      isListening = false;
      recognition.stop();
      toggleBtn.innerText = "🎤 Активувати голос";
      voiceStatus.innerText = "🎤 Розпізнавання вимкнено";
    }
  });
});