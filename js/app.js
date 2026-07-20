/**
 * AllBot - Chatbot Engine Core (js/app.js)
 * Berfungsi murni sebagai penggerak data yang memproses input berdasarkan button.json.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Inisialisasi class Chatbot bawaan project
    const chatbot = new Chatbot();
    await chatbot.init();

    // Selektor DOM Element
    const chatContainer = document.querySelector(".chat-messages");
    const buttonContainer = document.getElementById("bot-options-container");

    // State global penampung elemen animasi mengetik
    let typingBubbleElement = null;

    /**
     * Fungsi Helper Reusable: Memberikan jeda waktu (delay) berbasis Promise.
     * @param {number} ms - Durasi milidetik
     */
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Fungsi Helper Reusable: Menggulung obrolan otomatis ke bagian paling bawah.
     */
    const scrollToBottom = () => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    /**
     * Menginisialisasi aplikasi dan menampilkan menu pembuka pertama kali.
     */
    function init() {
        // MENGINTEGRASIKAN STATUS HANDLER: Aktifkan pemantau status saat pertama kali chatbot dimuat
        if (window.botStatusHandler) {
            window.botStatusHandler.init();
        }

        // Memulai chatbot dengan memanggil menu/kategori awal (biasanya 'start')
        renderButtons("start");
    }

    /**
     * Menampilkan bubble chat ke layar (User / Bot).
     * @param {string} text - Pesan teks yang dikirim.
     * @param {'user'|'bot'} sender - Identitas pengirim.
     */
    function showMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}`;

        const messageText = document.createElement("div");
        messageText.className = "message-text";
        messageText.textContent = text;

        const messageTime = document.createElement("span");
        messageTime.className = "message-time";

        const now = new Date();
        messageTime.textContent = 
            now.getHours().toString().padStart(2, "0") + ":" +
            now.getMinutes().toString().padStart(2, "0");

        msgDiv.appendChild(messageText);
        msgDiv.appendChild(messageTime);
        chatContainer.appendChild(msgDiv);

        scrollToBottom();
    }

    /**
     * Menampilkan indikator animasi mengetik AllBot dengan siklus titik otomatis.
     */
    function showTyping() {
        if (typingBubbleElement) return;

        typingBubbleElement = document.createElement("div");
        typingBubbleElement.className = "message bot typing-indicator";

        const messageText = document.createElement("div");
        messageText.className = "message-text";
        messageText.textContent = "AllBot sedang mengetik.";

        // PERBAIKAN: Memasukkan messageText ke dalam bubble, bukan memuat dirinya sendiri
        typingBubbleElement.appendChild(messageText);
        chatContainer.appendChild(typingBubbleElement);
        scrollToBottom();

        // Animasi siklus titik (●, ●●, ●●●)
        let dots = 1;
        typingBubbleElement.dataset.intervalId = setInterval(() => {
            if (!typingBubbleElement) return;
            messageText.textContent = `AllBot sedang mengetik ${"●".repeat(dots)}`;
            dots = (dots % 3) + 1;
        }, 400);
    }

    /**
     * Menghentikan animasi mengetik dan menghapus elemennya dari layar.
     */
    function hideTyping() {
        if (typingBubbleElement) {
            clearInterval(Number(typingBubbleElement.dataset.intervalId));
            typingBubbleElement.remove();
            typingBubbleElement = null;
            scrollToBottom();
        }
    }

    /**
     * Mengalkulasi durasi delay berpikir cerdas berdasarkan panjang teks balasan.
     * @param {string} text - Teks balasan bot
     * @returns {number} Durasi waktu dalam milidetik (ms)
     */
    function calculateDelay(text) {
        const length = text ? text.length : 8000;
        if (length < 40) return 2000;
        if (length <= 120) return 2000;
        return 4500;
    }

    /**
     * Mengubah status aktif/nonaktif tombol menu agar terhindar dari spam klik.
     * @param {boolean} disabled - True jika ingin menonaktifkan.
     */
    function toggleButtonsState(disabled) {
        const buttons = buttonContainer.querySelectorAll(".bot-menu-btn");
        buttons.forEach(btn => btn.disabled = disabled);
    }

    /**
     * Menerjemahkan dan mengeksekusi parameter 'action' yang dibawa oleh data tombol JSON.
     * @param {Object} button - Objek data tombol lengkap dari JSON.
     */
    function executeAction(button) {
        const { action, value } = button;

        if (!action) return;

        switch (action) {
            case "reply":
                break;
                
            case "menu":
                break;

            case "url":
                if (value) window.open(value, "_blank");
                break;

            case "copy":
                if (value) navigator.clipboard.writeText(value);
                break;

            case "fullscreen":
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen();
                }
                break;

            case "share":
                if (navigator.share) {
                    navigator.share({ title: button.label, url: value }).catch(() => {});
                } else {
                    console.warn("Navigator share tidak didukung di browser ini.");
                }
                break;

            case "download":
                if (value) {
                    const link = document.createElement("a");
                    link.href = value;
                    link.download = value.split("/").pop() || "download";
                    link.click();
                }
                break;

            case "function":
                if (value && typeof window[value] === "function") {
                    window[value]();
                } else {
                    console.warn(`Fungsi global bernama '${value}' tidak ditemukan.`);
                }
                break;

            default:
                console.warn(`Action tipe '${action}' belum didukung oleh engine.`);
                break;
        }
    }

    /**
     * Merender daftar tombol pilihan ke dalam kontainer berdasarkan menuId/categoryId.
     * @param {string} menuId - ID Menu/Kategori yang akan dipanggil dari chatbot.js
     */
    function renderButtons(menuId) {
        buttonContainer.innerHTML = "";

        const buttons = chatbot.getAvailableButtons(menuId);
        if (!buttons || buttons.length === 0) return;

        buttons.forEach(btnData => {
            const buttonElement = document.createElement("button");
            buttonElement.className = "bot-menu-btn";
            buttonElement.textContent = btnData.label;

            buttonElement.onclick = () => {
                handleButtonClick(btnData);
            };

            buttonContainer.appendChild(buttonElement);
        });
    }

    /**
     * Handler Utama Alur Chatbot (Async/Await) ketika tombol ditekan.
     * Terintegrasi dengan sistem Status Idle Pintar Fleksibel (Lock & Reset dinamis).
     * @param {Object} button - Objek data tombol yang ditekan.
     */
    async function handleButtonClick(button) {
        // MENGINTEGRASIKAN STATUS HANDLER: Kunci status tetap Online agar tidak terputus saat proses berjalan
        if (window.botStatusHandler) {
            window.botStatusHandler.lockAsWorking();
        }

        // Jeda dasar antargelembung chat (jika multi-pesan) agar tidak menumpuk instan
        const EXTRA_DELAY_BETWEEN_MESSAGES = 400; 

        // 1. Kunci tombol agar terhindar dari spam klik dan langsung hapus dari layar
        toggleButtonsState(true);
        buttonContainer.innerHTML = "";

        // 2. Tampilkan pesan pilihan User ke layar
        showMessage(button.label, "user");

        // Proses ekstraksi seluruh ID atau data reply menjadi array
        let itemsToProcess = [];

        if (button.reply) {
            itemsToProcess.push({ type: 'direct', value: button.reply });
        } else {
            const rawIds = button.id || button.ids || [];
            const idsArray = Array.isArray(rawIds) ? rawIds : [rawIds];
            
            idsArray.forEach(id => {
                itemsToProcess.push({ type: 'json', value: id });
            });
        }

        if (itemsToProcess.length === 0) {
            itemsToProcess.push({ type: 'direct', value: "Maaf, menu sedang mengalami gangguan." });
        }

        // 3. Loop utama: Menampilkan balasan satu per satu menjadi gelembung chat terpisah
        for (let i = 0; i < itemsToProcess.length; i++) {
            let textToDisplay = "";
            const currentItem = itemsToProcess[i];

            if (currentItem.type === 'direct') {
                textToDisplay = currentItem.value;
            } else {
                const responseData = chatbot.responses[currentItem.value];
                if (responseData) {
                    textToDisplay = Array.isArray(responseData)
                        ? responseData[Math.floor(Math.random() * responseData.length)]
                        : responseData;
                }
            }

            if (!textToDisplay) continue;

            // Berikan jeda dasar antarpesan terlebih dahulu jika ini bukan pesan pertama
            if (i > 0) {
                await sleep(EXTRA_DELAY_BETWEEN_MESSAGES);
            }

            // ==========================================
            // LOGIKA JEDA DIAM SEBELUM BOT MENGETIK
            // ==========================================
            if (button.delay && (!Array.isArray(button.delay) || button.delay.length > 0)) {
                let preTypingDelay;
                if (Array.isArray(button.delay)) {
                    const delayIndex = Math.min(i, button.delay.length - 1);
                    preTypingDelay = button.delay[delayIndex];
                } else {
                    preTypingDelay = button.delay;
                }
                // Bot akan DIAM (tidak ngetik) selama waktu yang diatur di JSON
                await sleep(preTypingDelay);
            }

            // Setelah jeda diam selesai, baru memunculkan animasi mengetik
            showTyping();

            // Durasi mengetik otomatis dihitung murni berdasarkan panjang teks balasan
            const typingDuration = calculateDelay(textToDisplay);
            await sleep(typingDuration);

            // Hilangkan animasi mengetik sebelum memunculkan pesan asli
            hideTyping();

            // Tampilkan jawaban AllBot ke layar sebagai bubble baru
            showMessage(textToDisplay, "bot");

            // DETEKSI AKTIVITAS CHAT: Setiap kali 1 bubble terkirim, perbarui timer detakan idle
            if (window.botStatusHandler) {
                window.botStatusHandler.resetTimer();
            }
        }

        // 4. Jalankan fungsionalitas aksi pendukung (URL, Copy, Share, dsb) jika tersemat
        executeAction(button);

        // Update konteks internal sistem
        const firstIdRef = button.id || button.ids;
        chatbot.activeContext = Array.isArray(firstIdRef) ? firstIdRef[0] : (firstIdRef || "");

        // 5. Tampilkan tombol menu berikutnya ('next')
        renderButtons(button.next);

        // MENGINTEGRASIKAN STATUS HANDLER: Buka kembali kunci status setelah seluruh rentetan chat selesai dikirim
        if (window.botStatusHandler) {
            window.botStatusHandler.unlockAndReset();
        }
    }        

    // Jalankan mesin utama AllBot saat DOM siap
    init();
});
