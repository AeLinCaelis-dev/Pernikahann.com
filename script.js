document.addEventListener('DOMContentLoaded', function () {
  const openBtn = document.getElementById('openInvitationBtn');
  const modal = document.getElementById('invitationModal');
  const mainContent = document.getElementById('mainContent');

  // --- Logika Kontrol Musik (ambil referensi di awal) ---
  const backgroundMusic = document.getElementById('background-music');
  const musicToggleButton = document.getElementById('music-toggle-btn');
  const musicIcon = musicToggleButton ? musicToggleButton.querySelector('i') : null;

  // Mendapatkan nama tamu dari parameter URL dengan fallback
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') ? decodeURIComponent(urlParams.get('to').replace(/\+/g, ' ')) : 'Tamu Undangan';
  const guestNameElement = document.getElementById('guest-name');
  if (guestNameElement) {
    guestNameElement.textContent = guestName;
  }

  // --- Fungsi untuk menyimpan dan memulihkan posisi scroll ---
  function saveScrollPosition() {
    sessionStorage.setItem('scrollPos', window.scrollY);
  }

  function restoreScrollPosition() {
    const scrollPos = sessionStorage.getItem('scrollPos');
    if (scrollPos) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPos, 10));
        sessionStorage.removeItem('scrollPos');
      }, 50);
    }
  }

  window.addEventListener('beforeunload', saveScrollPosition);

  // --- Fungsi untuk memainkan musik ---
  function playMusic() {
    if (backgroundMusic) {
      backgroundMusic.play().then(() => {
        if (musicIcon) {
          musicIcon.classList.remove('fa-volume-mute');
          musicIcon.classList.add('fa-music');
        }
      }).catch(error => {
        console.error("Autoplay music failed:", error);
        // User interaction is required for autoplay in many browsers.
        if (musicIcon) {
          musicIcon.classList.remove('fa-music');
          musicIcon.classList.add('fa-volume-mute');
        }
      });
    }
  }

  // --- Fungsi untuk menjeda musik ---
  function pauseMusic() {
    if (backgroundMusic) {
      backgroundMusic.pause();
      if (musicIcon) {
        musicIcon.classList.remove('fa-music');
        musicIcon.classList.add('fa-volume-mute');
      }
    }
  }

  // --- Logika pembukaan modal berdasarkan sessionStorage ---
  if (openBtn && modal && mainContent) {
    const modalOpenedInSession = sessionStorage.getItem('modalOpened');

    if (modalOpenedInSession === 'true') {
      // Jika modal sudah pernah dibuka di sesi ini, langsung tampilkan konten utama
      modal.style.display = 'none';
      mainContent.classList.remove('hidden');
      document.body.style.overflow = 'auto';
      restoreScrollPosition();
      // Tampilkan tombol musik dan coba play saat halaman utama dimuat dari sesi sebelumnya
      if (musicToggleButton) {
        musicToggleButton.style.display = 'flex';
        playMusic();
      }
    } else {
      // Jika modal belum pernah dibuka, tampilkan modal seperti biasa
      document.body.style.overflow = 'hidden';

      openBtn.addEventListener('click', function () {
        modal.style.opacity = '0';
        setTimeout(() => {
          modal.style.display = 'none';
          mainContent.classList.remove('hidden');
          document.body.style.overflow = 'auto';
          sessionStorage.setItem('modalOpened', 'true');
          restoreScrollPosition();
          // Tampilkan tombol musik dan coba play setelah "Buka Undangan" diklik
          if (musicToggleButton) {
            musicToggleButton.style.display = 'flex';
            playMusic();
          }
        }, 500);
      });
    }
  } else {
    console.error("Satu atau lebih elemen tidak ditemukan: openInvitationBtn, invitationModal, atau mainContent.");
  }

  // --- Logika Form Ucapan & Komentar ---
  const wishForm = document.getElementById('wish-form');
  const wishNameInput = document.getElementById('wish-name');
  const wishMessageInput = document.getElementById('wish-message');
  const attendanceStatusSelect = document.getElementById('attendance-status');
  const charCountSpan = document.getElementById('char-count');
  const wishesContainer = document.getElementById('wishes-container');
  const commentCountSpan = document.getElementById('comment-count');

  const maxLength = 500; // Maksimal karakter untuk ucapan

  // Inisialisasi komentar dari localStorage
  let wishes = JSON.parse(localStorage.getItem('weddingWishes')) || [];
  renderWishes();

  if (wishMessageInput && charCountSpan) {
    wishMessageInput.addEventListener('input', function () {
      const currentLength = wishMessageInput.value.length;
      charCountSpan.textContent = `${currentLength}/${maxLength}`;
    });
  }

  if (wishForm) {
    wishForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = wishNameInput.value.trim();
      const message = wishMessageInput.value.trim();
      const attendance = attendanceStatusSelect.value;

      if (!name || !message || !attendance) {
        const messageBox = document.createElement('div');
        messageBox.textContent = 'Mohon isi semua kolom (Nama, Ucapan, dan Konfirmasi Kehadiran).';
        messageBox.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #f44336; color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
        document.body.appendChild(messageBox);
        setTimeout(() => messageBox.remove(), 3000);
        return;
      }

      const newWish = {
        name: name,
        message: message,
        attendance: attendance,
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      wishes.push(newWish);
      localStorage.setItem('weddingWishes', JSON.stringify(wishes));
      renderWishes();
      wishForm.reset();
      if (charCountSpan) charCountSpan.textContent = `0/${maxLength}`;
      const messageBox = document.createElement('div');
      messageBox.textContent = 'Ucapan Anda berhasil dikirim!';
      messageBox.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
      document.body.appendChild(messageBox);
      setTimeout(() => messageBox.remove(), 3000);
    });
  }

  function renderWishes() {
    if (wishesContainer) {
      wishesContainer.innerHTML = '';
      let currentCommentCount = 0;

      [...wishes].reverse().forEach((wish, originalIndex) => {
        const wishItem = document.createElement('div');
        wishItem.classList.add('comment-item');

        const statusIcon = wish.attendance === 'hadir' ? '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>' : '<i class="fas fa-times-circle" style="color: #f44336;"></i>';
        const statusText = wish.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir';

        wishItem.innerHTML = `
          <p class="comment-author">${wish.name} <span class="attendance-status-badge">${statusIcon} ${statusText}</span></p>
          <p class="comment-text">${wish.message}</p>
          <p class="comment-date">${wish.date}</p>
        `;
        wishesContainer.appendChild(wishItem);
        currentCommentCount++;
      });

      if (commentCountSpan) {
        commentCountSpan.textContent = currentCommentCount;
      }

      if (currentCommentCount === 0) {
        wishesContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-light);">Belum ada ucapan. Jadilah yang pertama!</p>';
      }
    } else {
      console.error("Elemen wishesContainer tidak ditemukan.");
    }
  }

  // Logika untuk tombol salin rekening
  const clipboard = new ClipboardJS('.btn-copy');

  clipboard.on('success', function(e) {
    console.log('Nomor rekening disalin:', e.text);
    const originalText = e.trigger.innerHTML;
    e.trigger.innerHTML = '<i class="fas fa-check"></i> Disalin!';
    e.trigger.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
      e.trigger.innerHTML = originalText;
      e.trigger.style.backgroundColor = '';
    }, 2000);
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
    console.error('Gagal menyalin:', e.action);
    alert('Gagal menyalin nomor rekening. Silakan salin manual.');
  });

  // Event listener untuk tombol kontrol musik
  // Ini tetap ada untuk memutar/menjeda secara manual setelah tombol muncul
  if (musicToggleButton && backgroundMusic && musicIcon) {
    musicToggleButton.addEventListener('click', function() {
      if (backgroundMusic.paused) {
        playMusic();
      } else {
        pauseMusic();
      }
    });

    // Inisialisasi ikon tombol saat DOMContentLoaded
    // Ini akan mengatur ikon yang tepat jika musik berhasil autoplay atau diblokir
    // hanya jika tombol musik sudah terlihat (dari sesi sebelumnya, misalnya).
    // Jika tombol tersembunyi, ikon akan diatur saat tombol ditampilkan.
    if (musicToggleButton.style.display !== 'none') {
        if (backgroundMusic.paused) {
            musicIcon.classList.remove('fa-music');
            musicIcon.classList.add('fa-volume-mute');
        } else {
            musicIcon.classList.remove('fa-volume-mute');
            musicIcon.classList.add('fa-music');
        }
    }
  } else {
    console.error("Elemen musik atau tombol kontrol musik tidak ditemukan.");
  }
});