document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = "AIzaSyBJEcQFnkgzxFaG6WAOIhlduyd1Q1tiY4A";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const TYPING_SPEED = 30;

    // Elements
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('.send-button');
    const droopthinkButton = document.getElementById('droopthink-button');
    const chatMessagesContainer = document.querySelector('.chat-messages');
    const initialGreeting = document.querySelector('.initial-greeting');
    const newChatButton = document.querySelector('.new-chat-button');
    const menuIcon = document.querySelector('.menu-icon');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const closeSidebarButton = document.querySelector('.close-sidebar-button');
    const versionList = document.querySelector('.version-list');

    // Promo Modal Elements
    const promoModalOverlay = document.querySelector('.promo-modal-overlay');
    const promoModal = document.querySelector('.promo-modal');
    const promoModalTitle = document.querySelector('.promo-modal .modal-title');
    const promoCodeInput = document.querySelector('.promo-modal .promo-code-input');
    const confirmPromoButton = document.querySelector('.promo-modal .confirm-promo-button');

    let isDroopThinkActive = false;
    let activeDroopBiingVersion = 'V1';

    // Initial persona for DroopThink (V1)
    const droopThinkPersona = `أنت مساعد ذكي واحترافي يتحدث بلغة عربية سليمة، وقادر على تبسيط المعلومات المعقدة، ويُجيب بدقة، اختصار عند الحاجة، وتفصيل عند الضرورة. أسلوبك مهني لكن ودود. تجيب بناءً على المعرفة المتوفرة لديك، وتُظهر دائماً أنك مساعد موثوق ومتوازن. عندما لا تكون لديك معلومة مؤكدة، تعترف بذلك بوضوح دون تخمين. استخدم لهجة عربية فصحى بسيطة، أو دارجة مغربية إذا طلب المستخدم ذلك. كن متجاوبًا، سريعا، ومفيدًا.`;

    // Developer related keywords (case-insensitive)
    const developerKeywords = [
        'مطور', 'من صنعك', 'من طورك', 'من أنتجك', 'من قام ببرمجتك', 'من هو مبدعك',
        'who made you', 'who created you', 'who is your developer', 'your developer', 'who is your creator', 'who is aymar', 'aymar'
    ];
    const developerAnswer = "المطور AIMAR."; // This can also be localized if needed

    // --- Translations Object ---
    const translations = {
        'en': {
            'appTitle': 'DroopBiing Chat',
            'newChatTitle': 'New chat',
            'greetingHi': "Hi, I'm DroopBiing.",
            'greetingHelp': 'How can I help you today?',
            'messagePlaceholder': 'Message DroopBiing',
            'droopThinkName': 'DroopThink (V1)',
            'searchButton': 'Search',
            'sidebarTitle': 'DroopBiing Versions',
            'freeBadge': '(Free)',
            'paidBadge': '(Paid)',
            'copyrightText': '© 2023 DroopBiing. All rights reserved.',
            'enterPromoCode': 'Enter the promotion code to use the version for free',
            'promoCodePlaceholder': 'Enter code here...',
            'confirmButton': 'Confirm',
            'emptyPromoCodeAlert': 'Please enter a promotion code.',
            'promoSuccessMessage': 'DroopBiing V1.3 successfully activated! Enjoy the extra features.'
        },
        'ar': {
            'appTitle': 'دردشة DroopBiing',
            'newChatTitle': 'دردشة جديدة',
            'greetingHi': 'مرحباً، أنا DroopBiing.',
            'greetingHelp': 'كيف يمكنني مساعدتك اليوم؟',
            'messagePlaceholder': 'أرسل رسالة إلى DroopBiing',
            'droopThinkName': 'DroopThink (V1)',
            'searchButton': 'بحث',
            'sidebarTitle': 'إصدارات DroopBiing',
            'freeBadge': '(مجانية)',
            'paidBadge': '(مدفوعة)',
            'copyrightText': '© 2023 DroopBiing. جميع الحقوق محفوظة.',
            'enterPromoCode': 'ادخل الرمز الترويجي لاستخدام النسخة بشكل مجاني',
            'promoCodePlaceholder': 'ادخل الرمز هنا...',
            'confirmButton': 'تأكيد',
            'emptyPromoCodeAlert': 'الرجاء إدخال رمز ترويجي.',
            'promoSuccessMessage': 'تم تفعيل DroopBiing V1.3 بنجاح! استمتع بالميزات الإضافية.'
        }
        // Add more languages (e.g., 'fr', 'es') and their translations here
    };

    // Function to get localized text
    function getLocalizedText(key) {
        // Get user's preferred language, e.g., "en-US" -> "en"
        const userLang = navigator.language.split('-')[0];
        // Use userLang if available, otherwise fallback to 'ar'
        const currentTranslations = translations[userLang] || translations['ar'];
        return currentTranslations[key] || `[${key} not translated]`; // Fallback for missing key
    }

    // Function to apply translations to the DOM
    function applyTranslations() {
        // Set document language attribute
        document.documentElement.lang = navigator.language.split('-')[0] || 'ar';

        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = getLocalizedText(key);
        });

        // Translate elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.setAttribute('placeholder', getLocalizedText(key));
        });

        // Set promo modal title (already using getLocalizedText)
        promoModalTitle.textContent = getLocalizedText('enterPromoCode');
    }

    // --- Utility Functions (rest of the code remains similar) ---

    // Function for typing effect
    function typeWriterEffect(element, text, speed, callback) {
        let i = 0;
        element.textContent = '';
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                scrollToBottom();
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, speed);
    }

    // Function to add messages to the chat interface with animation
    function addMessageToChat(text, sender) {
        if (initialGreeting.style.display !== 'none') {
            initialGreeting.style.display = 'none';
            chatMessagesContainer.style.display = 'flex';
            chatMessagesContainer.style.justifyContent = 'flex-start';
        }

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', sender);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageWrapper.appendChild(messageElement);

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('message-actions');
        messageWrapper.appendChild(actionsContainer);

        if (sender === 'bot') {
            typeWriterEffect(messageElement, text, TYPING_SPEED, () => {
                actionsContainer.classList.add('visible');
                
                // Copy button
                const copyButton = document.createElement('button');
                copyButton.classList.add('copy-button');
                copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                copyButton.title = 'Copy message'; // You might want to localize title attribute too
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(text).then(() => {
                        copyButton.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => { copyButton.innerHTML = '<i class="fas fa-copy"></i>'; }, 1000);
                    }).catch(err => { console.error('Failed to copy text: ', err); });
                });
                actionsContainer.appendChild(copyButton);

                // Like button
                const likeButton = document.createElement('button');
                likeButton.classList.add('like-button');
                likeButton.innerHTML = '<i class="fas fa-thumbs-up"></i>';
                likeButton.title = 'Like message';
                likeButton.addEventListener('click', () => {
                    likeButton.classList.toggle('liked');
                    if (dislikeButton.classList.contains('disliked')) { dislikeButton.classList.remove('disliked'); }
                });
                actionsContainer.appendChild(likeButton);

                // Dislike button
                const dislikeButton = document.createElement('button');
                dislikeButton.classList.add('dislike-button');
                dislikeButton.innerHTML = '<i class="fas fa-thumbs-down"></i>';
                dislikeButton.title = 'Dislike message';
                dislikeButton.addEventListener('click', () => {
                    dislikeButton.classList.toggle('disliked');
                    if (likeButton.classList.contains('liked')) { likeButton.classList.remove('liked'); }
                });
                actionsContainer.appendChild(dislikeButton);
            });
        } else { // User message
            messageElement.textContent = text;
            actionsContainer.classList.add('visible');
        }

        chatMessagesContainer.appendChild(messageWrapper);
        setTimeout(() => {
            messageWrapper.classList.add('fade-in');
        }, 50);
        scrollToBottom();
    }

    // Function to scroll chat to the bottom
    function scrollToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // Function to send message to Gemini API
    async function sendMessageToAPI(message) {
        addMessageToChat(message, 'user');

        const normalizedMessage = message.toLowerCase();

        const isDeveloperQuestion = developerKeywords.some(keyword => normalizedMessage.includes(keyword));
        if (isDeveloperQuestion) {
            addMessageToChat(developerAnswer, 'bot');
            return;
        }

        let fullPrompt;
        if (isDroopThinkActive) {
            fullPrompt = `${droopThinkPersona}\n\nسؤال المستخدم: ${message}`;
        } else {
            fullPrompt = message;
        }

        console.log(`Sending message using DroopBiing ${activeDroopBiingVersion}`);

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: fullPrompt
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const botResponse = data.candidates[0].content.parts[0].text;
            addMessageToChat(botResponse, 'bot');
        } catch (error) {
            console.error("Error communicating with Gemini API:", error);
            addMessageToChat("عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.", 'bot');
        }
    }

    // --- Event Listeners ---

    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            sendMessageToAPI(message);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    droopthinkButton.addEventListener('click', () => {
        isDroopThinkActive = !isDroopThinkActive;
        droopthinkButton.classList.toggle('active', isDroopThinkActive);
        
        if (isDroopThinkActive) {
            console.log("DroopThink (V1) Activated!");
        } else {
            console.log("DroopThink (V1) Deactivated!");
        }
    });

    newChatButton.addEventListener('click', () => {
        chatMessagesContainer.innerHTML = '';
        chatMessagesContainer.style.display = 'none';
        initialGreeting.style.display = 'block';
        messageInput.value = '';
        isDroopThinkActive = false;
        droopthinkButton.classList.remove('active');
        scrollToBottom();
    });

    // --- Sidebar Logic ---
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }

    menuIcon.addEventListener('click', openSidebar);
    closeSidebarButton.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    versionList.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.version-item');
        if (clickedItem) {
            const version = clickedItem.dataset.version;
            
            if (version === 'V1.3') {
                closeSidebar();
                showPromoModal();
            } else {
                document.querySelectorAll('.version-item').forEach(item => {
                    item.classList.remove('active');
                });
                clickedItem.classList.add('active');
                activeDroopBiingVersion = version;
                console.log(`DroopBiing Version set to: ${activeDroopBiingVersion}`);
                closeSidebar();
            }
        }
    });

    // --- Promo Modal Logic ---
    function showPromoModal() {
        promoModalOverlay.classList.add('open');
        promoCodeInput.value = '';
        promoCodeInput.focus();
    }

    function hidePromoModal() {
        promoModalOverlay.classList.remove('open');
    }

    promoModalOverlay.addEventListener('click', (event) => {
        if (event.target === promoModalOverlay) {
            hidePromoModal();
        }
    });

    confirmPromoButton.addEventListener('click', () => {
        const promoCode = promoCodeInput.value.trim();
        if (promoCode) {
            document.querySelectorAll('.version-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector('.version-item[data-version="V1.3"]').classList.add('active');
            activeDroopBiingVersion = 'V1.3';
            console.log(`DroopBiing Version set to: ${activeDroopBiingVersion} via promo code.`);
            hidePromoModal();
            addMessageToChat(getLocalizedText('promoSuccessMessage'), 'bot');
        } else {
            alert(getLocalizedText('emptyPromoCodeAlert'));
        }
    });

    // --- Initial setup ---
    // Apply translations on page load
    applyTranslations();
    // Set default active version on load
    document.querySelector('.version-item[data-version="V1"]').classList.add('active');
});