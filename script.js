document.addEventListener("DOMContentLoaded", () => {
  // The Prediction
  const fileInput = document.getElementById("file-input");
  const classifyBtn = document.getElementById("classify-btn");
  const labelCell = document.querySelector("tr:nth-child(1) td");
  const presentaseCell = document.querySelector("tr:nth-child(2) td");
  const deskripsiCell = document.querySelector("tr:nth-child(3) td");
  const notification = document.getElementById("notification");

  classifyBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      showNotification("Silakan pilih gambar terlebih dahulu!");
      return;
    }

    // Show loading indication
    labelCell.textContent = "Loading...";
    presentaseCell.textContent = "Loading...";
    deskripsiCell.textContent = "Loading...";

    const formData = new FormData();
    formData.append("image", file);

    // Check connection before sending
    if (!navigator.onLine) {
      labelCell.textContent = "Offline";
      presentaseCell.textContent = "-";
      deskripsiCell.textContent = "Anda sedang offline. Silakan periksa koneksi internet.";
      showNotification("Anda sedang offline");
      return;
    }

    try {
      const response = await fetch(
        "https://web-production-02ce.up.railway.app/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memproses gambar");
      }

      const data = await response.json();
      const label = data.label;
      const confidence = data.confidence;

      labelCell.textContent = label === 0 ? "Segar" : "Tidak Segar";
      presentaseCell.textContent = (confidence * 100).toFixed(2) + " %";
      deskripsiCell.textContent =
        label === 0
          ? "Ikan ini tergolong segar berdasarkan fitur visualnya."
          : "Ikan ini tidak segar, perhatikan perubahan warna dan tekstur.";
      
      // Store recent result in localStorage
      saveRecentResult({
        label: labelCell.textContent,
        presentase: presentaseCell.textContent,
        deskripsi: deskripsiCell.textContent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      labelCell.textContent = "Error";
      presentaseCell.textContent = "-";
      deskripsiCell.textContent = "Terjadi kesalahan saat mengirim gambar ke API.";
      showNotification("Terjadi kesalahan saat memproses gambar");
    }
  });

  // preview gambar
  const previewImg = document.getElementById("preview-image");
  const previewLabel = document.getElementById("preview-label");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImg.src = reader.result;
        previewImg.style.display = "block";
        previewLabel.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      previewImg.src = "";
      previewImg.style.display = "none";
      previewLabel.style.display = "block";
    }
  });

  // Reset Button
  const resetBtn = document.getElementById("reset-btn");
  resetBtn.addEventListener("click", () => {
    fileInput.value = "";
    labelCell.textContent = "-";
    presentaseCell.textContent = "-";
    deskripsiCell.textContent = "-";

    previewImg.src = "";
    previewImg.style.display = "none";
    previewLabel.style.display = "block";
  });

  // Modal Interaction
  const modal = document.getElementById("about-modal");
  const aboutUsBtn = document.getElementById("about-us-btn");
  const closeBtn = document.querySelector(".close-btn");

  aboutUsBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
    if (e.target === document.getElementById("install-prompt")) {
      document.getElementById("install-prompt").style.display = "none";
    }
  });

  // Function to show notification
  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }
  
  // Add this to access notification from other scripts
  window.showNotification = showNotification;
  
  // Local storage functions for offline capabilities
  function saveRecentResult(result) {
    localStorage.setItem('recentResult', JSON.stringify(result));
  }
  
  function loadRecentResult() {
    const savedResult = localStorage.getItem('recentResult');
    if (savedResult) {
      return JSON.parse(savedResult);
    }
    return null;
  }
  
  // Load recent result if we're offline
  if (!navigator.onLine) {
    const recentResult = loadRecentResult();
    if (recentResult) {
      labelCell.textContent = recentResult.label;
      presentaseCell.textContent = recentResult.presentase;
      deskripsiCell.textContent = recentResult.deskripsi + " (Hasil dari analisis terakhir)";
      showNotification("Menampilkan hasil terakhir (offline mode)");
    }
  }
  
  // Online/Offline status event listeners
  window.addEventListener('online', () => {
    showNotification('Anda kembali online');
  });
  
  window.addEventListener('offline', () => {
    showNotification('Anda sedang offline');
  });
});