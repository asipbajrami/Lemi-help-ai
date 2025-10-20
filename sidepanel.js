// Side Panel Chat Logic
let apiKey = null;
let conversationHistory = [];
let detectedFields = [];
let currentImage = null; // Store uploaded image
let currentChatId = null; // Track current chat for auto-save
let currentLanguage = 'sq'; // Default to Albanian (sq = shqip)

// Translations
const translations = {
  sq: { // Albanian
    appTitle: 'lemi ndihmë',
    ready: 'Gati',
    apiKeyRequired: 'Çelësi API i Kërkuar',
    enterApiKey: 'Vendosni çelësin tuaj Claude API',
    saveKey: 'Ruaj Çelësin',
    getApiKey: 'Merrni çelësin tuaj API nga',
    welcomeMessage: 'Përshëndetje! Unë jam asistenti juaj AI për plotësimin e formularëve. Mund të shkruani atë që dëshironi të plotësoni, ose të ngarkoni një imazh (si një kartë identiteti, kartë biznesi, ose dokument) dhe unë do të nxjerr informacionin për të plotësuar fushat e formularit.',
    typeMessage: 'Shkruani një mesazh ose ngarkoni një imazh...',
    clearChat: 'Pastro Bisedën',
    scanPage: 'Skano Faqen',
    chatHistory: 'Historia e Bisedave',
    viewManageChats: 'Shikoni dhe menaxhoni bisedat tuaja të ruajtura',
    searchConversations: 'Kërko biseda...',
    today: 'Sot',
    yesterday: 'Dje',
    thisWeek: 'Këtë Javë',
    older: 'Më të vjetra',
    delete: 'Fshi',
    noChatsYet: 'Ende nuk ka biseda të ruajtura',
    noChatsFound: 'Nuk u gjetën biseda',
    settings: 'Cilësimet',
    darkMode: 'Mënyra e Errët',
    toggleTheme: 'Ndryshoni midis temës së çelët dhe të errët',
    claudeApiKey: 'Çelësi Claude API',
    apiKeyStored: 'Çelësi juaj API ruhet lokalisht dhe nuk ndahet kurrë',
    cancel: 'Anulo',
    saveChanges: 'Ruaj Ndryshimet',
    close: 'Mbyll',
    apiKeySaved: 'Çelësi API u ruajt! Tani mund të filloni të bisedoni.',
    apiKeyUpdated: 'Çelësi API u përditësua me sukses!',
    chatCleared: 'Biseda u pastrua. Historia e bisedës u rivendos.',
    imageUploaded: 'Imazhi u ngarkua:',
    imageRemoved: 'Imazhi u hoq.',
    scanningPage: 'Po skanon faqen...',
    fieldsFound: 'fusha u gjetën',
    noFieldsFound: 'Nuk u gjetën fusha',
    detectingFields: 'Po zbulon fushat...',
    fieldsFilled: 'Fushat u plotësuan!',
    error: 'Gabim',
    justNow: 'Tani',
    minutesAgo: 'm më parë',
    hoursAgo: 'o më parë',
    daysAgo: 'd më parë',
    loadedChat: 'Biseda e ngarkuar:',
    deleteChatConfirm: 'Jeni të sigurt që dëshironi të fshini këtë bisedë?',
    poweredBy: 'Mundësuar nga DATAFYNOW',
    imageTooLarge: 'Imazhi shumë i madh',
    imageUseSmaller: 'Ju lutemi përdorni një imazh më të vogël se 5MB.',
    analyzingImage: 'Po analizon imazhin e ngarkuar...',
    errorFillingFields: 'Gabim në plotësimin e fushave. Ju lutemi rifreskoni faqen.',
    errorCouldNotAccess: 'Nuk mund të hynte në skedën aktuale. Ju lutemi provoni përsëri.',
    thinking: 'Po mendoj...',
    appearance: 'Pamja',
    apiConfiguration: 'Konfigurimi API'
  },
  en: { // English
    appTitle: 'lemi help',
    ready: 'Ready',
    apiKeyRequired: 'API Key Required',
    enterApiKey: 'Enter your Claude API key',
    saveKey: 'Save Key',
    getApiKey: 'Get your API key from',
    welcomeMessage: 'Hi! I\'m your AI form assistant. You can either type what you\'d like to fill out, or upload an image (like an ID card, business card, or document) and I\'ll extract the information to fill the form fields.',
    typeMessage: 'Type a message or upload an image...',
    clearChat: 'Clear Chat',
    scanPage: 'Scan Page',
    chatHistory: 'Chat History',
    viewManageChats: 'View and manage your saved conversations',
    searchConversations: 'Search conversations...',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    older: 'Older',
    delete: 'Delete',
    noChatsYet: 'No saved chats yet',
    noChatsFound: 'No chats found',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    toggleTheme: 'Toggle between light and dark theme',
    claudeApiKey: 'Claude API Key',
    apiKeyStored: 'Your API key is stored locally and never shared',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    close: 'Close',
    apiKeySaved: 'API key saved! You can now start chatting.',
    apiKeyUpdated: 'API key updated successfully!',
    chatCleared: 'Chat cleared. Conversation history reset.',
    imageUploaded: 'Image uploaded:',
    imageRemoved: 'Image removed.',
    scanningPage: 'Scanning page...',
    fieldsFound: 'fields found',
    noFieldsFound: 'No fields found',
    detectingFields: 'Detecting fields...',
    fieldsFilled: 'Fields filled!',
    error: 'Error',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    loadedChat: 'Loaded chat:',
    deleteChatConfirm: 'Are you sure you want to delete this chat?',
    poweredBy: 'Powered by DATAFYNOW',
    imageTooLarge: 'Image too large',
    imageUseSmaller: 'Please use an image smaller than 5MB.',
    analyzingImage: 'Analyzing uploaded image...',
    errorFillingFields: 'Error filling fields. Please refresh the page.',
    errorCouldNotAccess: 'Could not access current tab. Please try again.',
    thinking: 'Thinking...',
    appearance: 'Appearance',
    apiConfiguration: 'API Configuration'
  }
};

function t(key) {
  return translations[currentLanguage][key] || translations['en'][key] || key;
}

// DOM Elements
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChat');
const detectFieldsBtn = document.getElementById('detectFields');
const statusText = document.getElementById('statusText');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const cancelSettings = document.getElementById('cancelSettings');
const saveSettings = document.getElementById('saveSettings');
const settingsApiKeyInput = document.getElementById('settingsApiKeyInput');
const imageInput = document.getElementById('imageInput');
const uploadImageBtn = document.getElementById('uploadImageBtn');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImage');
const themeToggleSwitch = document.getElementById('themeToggleSwitch');
const languageBtn = document.getElementById('languageBtn');
const languageIndicator = document.getElementById('languageIndicator');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const cancelHistory = document.getElementById('cancelHistory');
const savedChatsList = document.getElementById('savedChatsList');
const historySearch = document.getElementById('historySearch');

// Theme Management
function initTheme() {
  // Load saved theme or default to dark
  chrome.storage.sync.get(['theme'], (result) => {
    const theme = result.theme || 'dark';
    // Sync with localStorage for instant loading
    localStorage.setItem('theme', theme);
    setTheme(theme);
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeToggle(theme);
  // Save to both chrome storage and localStorage for instant loading
  chrome.storage.sync.set({ theme: theme });
  localStorage.setItem('theme', theme);
}

function updateThemeToggle(theme) {
  // Update toggle switch state (checked = dark mode)
  themeToggleSwitch.checked = (theme === 'dark');
}

// Theme toggle event listener
themeToggleSwitch.addEventListener('change', () => {
  const newTheme = themeToggleSwitch.checked ? 'dark' : 'light';
  setTheme(newTheme);
});

// Language Management
function initLanguage() {
  chrome.storage.sync.get(['language'], (result) => {
    currentLanguage = result.language || 'sq'; // Default to Albanian
    updateLanguageUI();
  });
}

function setLanguage(lang) {
  currentLanguage = lang;
  chrome.storage.sync.set({ language: lang });
  localStorage.setItem('language', lang);
  updateLanguageUI();
}

function updateLanguageUI() {
  // Update language indicator
  languageIndicator.textContent = currentLanguage === 'sq' ? 'AL' : 'EN';

  // Update all UI text
  document.title = t('appTitle');
  document.querySelector('h1').textContent = t('appTitle');
  document.querySelector('#statusText').textContent = t('ready');
  document.querySelector('.powered-by').textContent = t('poweredBy');

  // Update buttons
  document.querySelector('#clearChat').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    ${t('clearChat')}
  `;

  document.querySelector('#detectFields').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"></path>
    </svg>
    ${t('scanPage')}
  `;

  // Update placeholders
  if (userInput) userInput.placeholder = t('typeMessage');
  if (historySearch) historySearch.placeholder = t('searchConversations');
  if (apiKeyInput) apiKeyInput.placeholder = t('enterApiKey');
  if (settingsApiKeyInput) settingsApiKeyInput.placeholder = 'sk-ant-...';

  // Update API Key Section
  const apiKeyHeader = document.querySelector('.api-key-section .api-key-header span');
  if (apiKeyHeader) apiKeyHeader.textContent = t('apiKeyRequired');
  const saveKeyBtn = document.querySelector('#saveApiKey');
  if (saveKeyBtn) saveKeyBtn.textContent = t('saveKey');

  // Update History Modal
  const historyModalTitle = document.querySelector('#historyModal h3');
  if (historyModalTitle) historyModalTitle.textContent = t('chatHistory');
  const historyModalSubtitle = document.querySelector('#historyModal .modal-subtitle');
  if (historyModalSubtitle) historyModalSubtitle.textContent = t('viewManageChats');

  // Update Settings Modal
  const settingsModalTitle = document.querySelector('#settingsModal h3');
  if (settingsModalTitle) settingsModalTitle.textContent = t('settings');

  // Update Settings Modal sections
  const darkModeLabel = document.querySelector('.settings-row .settings-label-group label');
  if (darkModeLabel) darkModeLabel.textContent = t('darkMode');
  const darkModeHint = document.querySelector('.settings-row .settings-label-group .settings-hint');
  if (darkModeHint) darkModeHint.textContent = t('toggleTheme');

  const apiKeyLabel = document.querySelector('.settings-section label[for="settingsApiKeyInput"]');
  if (apiKeyLabel) apiKeyLabel.textContent = t('claudeApiKey');
  const apiKeyStoredHint = document.querySelector('.settings-section .settings-hint');
  if (apiKeyStoredHint) apiKeyStoredHint.textContent = t('apiKeyStored');

  // Update modal buttons
  const cancelSettingsBtn = document.querySelector('#cancelSettings');
  if (cancelSettingsBtn) cancelSettingsBtn.textContent = t('cancel');
  const saveSettingsBtn = document.querySelector('#saveSettings');
  if (saveSettingsBtn) saveSettingsBtn.textContent = t('saveChanges');

  // Update welcome message if chat is empty
  const firstMessage = chatMessages.querySelector('.message.bot .message-content');
  if (firstMessage && conversationHistory.length === 0) {
    firstMessage.textContent = t('welcomeMessage');
  }

  // Reload chat history if modal is open to update date labels
  if (!historyModal.classList.contains('hidden')) {
    loadSavedChatsList(historySearch.value.toLowerCase());
  }
}

languageBtn.addEventListener('click', () => {
  const newLang = currentLanguage === 'sq' ? 'en' : 'sq';
  setLanguage(newLang);
});

// Initialize
async function init() {
  // Initialize language first
  initLanguage();

  // Initialize theme
  initTheme();

  // Load API key
  const result = await chrome.storage.sync.get(['claudeApiKey']);
  if (result.claudeApiKey) {
    apiKey = result.claudeApiKey;
    apiKeySection.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    detectFields();
  } else {
    apiKeySection.classList.remove('hidden');
    chatContainer.classList.add('hidden');
  }
}

// Save API Key
saveApiKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    alert(t('enterApiKey'));
    return;
  }

  await chrome.storage.sync.set({ claudeApiKey: key });
  apiKey = key;
  apiKeySection.classList.add('hidden');
  chatContainer.classList.remove('hidden');
  addMessage('System', t('apiKeySaved'), 'system');
  detectFields();
});

// Settings Modal
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
  // Load current API key (masked)
  if (apiKey) {
    settingsApiKeyInput.value = apiKey;
  }
  // Update theme toggle to show current theme
  const currentTheme = document.documentElement.getAttribute('data-theme');
  updateThemeToggle(currentTheme);
});

closeSettingsModal.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

cancelSettings.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

saveSettings.addEventListener('click', async () => {
  const newKey = settingsApiKeyInput.value.trim();
  if (!newKey) {
    alert(t('enterApiKey'));
    return;
  }

  await chrome.storage.sync.set({ claudeApiKey: newKey });
  apiKey = newKey;
  addMessage('System', t('apiKeyUpdated'), 'system');
  settingsModal.classList.add('hidden');
});

// Detect form fields on current page
async function detectFields() {
  updateStatus(t('scanningPage'));

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      updateStatus(t('error'));
      addMessage('System', `${t('error')}: ${t('errorCouldNotAccess')}`, 'system');
      return;
    }

    // Inject content script if not already injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (injectionError) {
      console.log('Content script already injected or injection failed:', injectionError);
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'detectFields' });
    detectedFields = response.fields || [];

    if (detectedFields.length > 0) {
      updateStatus(`${t('ready')} - ${detectedFields.length} ${t('fieldsFound')}`);
      addMessage('System', `✓ ${detectedFields.length} ${t('fieldsFound')}!`, 'system');
    } else {
      updateStatus(`${t('ready')} - ${t('noFieldsFound')}`);
      addMessage('System', t('noFieldsFound'), 'system');
    }
  } catch (error) {
    console.error('Error detecting fields:', error);
    updateStatus(t('error'));
    addMessage('System', `${t('error')}: ${error.message}`, 'system');
  }
}

detectFieldsBtn.addEventListener('click', detectFields);

// Image upload handlers
uploadImageBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    // Check file size (Claude API recommends < 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      addMessage('System', `${t('imageTooLarge')} (${(file.size / 1024 / 1024).toFixed(1)}MB). ${t('imageUseSmaller')}`, 'system');
      imageInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize if image is very large
        const maxDimension = 2048;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }

          // Create canvas to resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Get resized image as data URL
          currentImage = canvas.toDataURL('image/jpeg', 0.9);
        } else {
          currentImage = event.target.result;
        }

        imagePreview.src = currentImage;
        imagePreviewContainer.classList.remove('hidden');
        addMessage('System', `${t('imageUploaded')} ${file.name} (${(file.size / 1024).toFixed(0)}KB)`, 'system');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

removeImageBtn.addEventListener('click', () => {
  currentImage = null;
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
  imageInput.value = '';
  addMessage('System', t('imageRemoved'), 'system');
});

// Clear chat
clearChatBtn.addEventListener('click', () => {
  conversationHistory = [];
  currentImage = null;
  currentChatId = null; // Reset chat ID for new chat
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
  imageInput.value = '';
  chatMessages.innerHTML = `
    <div class="message bot">
      <div class="message-content">
        ${t('welcomeMessage')}
      </div>
    </div>
  `;
  addMessage('System', t('chatCleared'), 'system');
});

// Auto-resize textarea
function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = userInput.scrollHeight + 'px';
}

userInput.addEventListener('input', autoResizeTextarea);

// Send message
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const message = userInput.value.trim();
  const hasImage = currentImage !== null;

  if (!message && !hasImage) return;

  // Add user message to chat
  if (message) {
    addMessage('You', message, 'user');
  }
  if (hasImage) {
    addMessage('System', `📷 ${t('analyzingImage')}`, 'system');
  }

  userInput.value = '';
  userInput.style.height = 'auto'; // Reset height after sending

  // Disable send button
  sendBtn.disabled = true;
  updateStatus(t('thinking'));

  try {
    // Send to Claude API with image if available
    const response = await chatWithClaude(message || 'Please extract information from this image to fill the form fields.');

    // Clear image after sending
    if (hasImage) {
      currentImage = null;
      imagePreview.src = '';
      imagePreviewContainer.classList.add('hidden');
      imageInput.value = '';
    }

    if (response.success) {
      // Note: Message already added by streaming

      // Auto-save after each AI response
      await autoSaveChat();

      // Fill fields if any
      if (response.fieldValues && Object.keys(response.fieldValues).length > 0) {
        await fillFields(response.fieldValues);
        updateStatus(t('fieldsFilled'));
        setTimeout(() => updateStatus(t('ready')), 2000);
      } else {
        updateStatus(t('ready'));
      }
    } else {
      addMessage('System', `${t('error')}: ${response.error}`, 'system');
      updateStatus(t('error'));
    }
  } catch (error) {
    addMessage('System', `${t('error')}: ${error.message}`, 'system');
    updateStatus(t('error'));
  } finally {
    sendBtn.disabled = false;
  }
}

// Chat with Claude
async function chatWithClaude(userMessage) {
  if (!apiKey) {
    return { success: false, error: 'API key not set' };
  }

  // Build user message content (with image if available)
  let userContent;
  if (currentImage) {
    // Extract base64 data from data URL
    const base64Data = currentImage.split(',')[1];
    let mediaType = currentImage.split(';')[0].split(':')[1];

    // Normalize media type to Claude's accepted formats
    // Claude accepts: 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    if (mediaType === 'image/jpg') {
      mediaType = 'image/jpeg';
    } else if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType)) {
      // Default to jpeg if format is not recognized
      console.warn(`Unknown media type: ${mediaType}, defaulting to image/jpeg`);
      mediaType = 'image/jpeg';
    }

    console.log('Image info:', {
      mediaType,
      base64Length: base64Data.length,
      estimatedSize: (base64Data.length * 0.75 / 1024).toFixed(0) + 'KB'
    });

    userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data
        }
      },
      {
        type: 'text',
        text: userMessage
      }
    ];
  } else {
    userContent = userMessage;
  }

  // Add user message to history
  conversationHistory.push({
    role: 'user',
    content: userContent
  });

  // Build system prompt
  const systemPrompt = `You are a helpful AI form-filling assistant. The user is on a webpage with the following form fields:

${detectedFields.map((field, idx) => {
  let desc = `${idx}. ${field.label || field.name || field.placeholder || 'Unlabeled'} (${field.type})
   - Name: ${field.name || 'N/A'}
   - ID: ${field.id || 'N/A'}
   - Placeholder: ${field.placeholder || 'N/A'}
   - Current value: ${field.value || '(empty)'}`;

  if (field.options && field.options.length > 0) {
    desc += `\n   - Available options: ${field.options.join(', ')}`;
  }

  return desc;
}).join('\n\n')}

Based on the conversation (and any images the user sends), help the user fill out the form. When you have information to fill a field, respond with a JSON object:

{
  "message": "Your friendly response to the user",
  "fieldValues": {
    "fieldIndex": "value"
  },
  "needsMoreInfo": false
}

Rules:
1. Extract information naturally from the conversation AND from any uploaded images (like ID cards, business cards, driver's licenses, documents, etc.)
2. For dropdowns, choose from available options only
3. Map field indices (0-based) to their values
4. If you need more info, set needsMoreInfo to true
5. Be conversational and helpful
6. You can fill multiple fields at once
7. If an image is provided, analyze it carefully to extract ALL relevant information (names, addresses, phone numbers, emails, dates, etc.)

Example:
{
  "message": "Got it! I'll fill in your name and email now.",
  "fieldValues": {
    "0": "John Doe",
    "1": "john@example.com"
  },
  "needsMoreInfo": false
}`;

  try {
    const requestBody = {
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory,
      stream: true
    };

    console.log('Sending request to Claude API:', {
      model: requestBody.model,
      messageCount: conversationHistory.length,
      hasImage: currentImage !== null
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API Error:', errorData);
      const errorMsg = errorData.error?.message || JSON.stringify(errorData.error) || 'Claude API request failed';
      throw new Error(errorMsg);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let streamingMessageDiv = null;

    // Create streaming message bubble
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message bot';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content streaming';
    messageContainer.appendChild(contentDiv);
    chatMessages.appendChild(messageContainer);
    streamingMessageDiv = contentDiv;

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text || '';
              assistantMessage += text;
              // Render markdown in real-time during streaming
              streamingMessageDiv.innerHTML = parseMarkdown(assistantMessage);
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    // Remove streaming class when done
    streamingMessageDiv.classList.remove('streaming');

    // Parse JSON response
    const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
    let displayMessage = assistantMessage;
    let parsedData = {
      fieldValues: {},
      needsMoreInfo: true
    };

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        displayMessage = parsed.message || assistantMessage;
        parsedData = {
          fieldValues: parsed.fieldValues || {},
          needsMoreInfo: parsed.needsMoreInfo || false
        };
        // Update the displayed message to show only the message, not the JSON
        streamingMessageDiv.innerHTML = parseMarkdown(displayMessage);
      } catch (parseError) {
        // Keep original message if JSON parsing fails
      }
    }

    // Add to history
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });

    return {
      success: true,
      message: displayMessage,
      fieldValues: parsedData.fieldValues,
      needsMoreInfo: parsedData.needsMoreInfo
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fill fields on the page
async function fillFields(fieldValues) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'fillFields',
      fieldValues: fieldValues
    });
  } catch (error) {
    console.error('Error filling fields:', error);
    addMessage('System', t('errorFillingFields'), 'system');
  }
}

// Simple markdown parser
function parseMarkdown(text) {
  let html = text;

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Line breaks (2+ newlines = paragraph break)
  html = html.replace(/\n\n/g, '</p><p>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

// Add message to chat
function addMessage(sender, text, type = 'bot') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  // Parse markdown for bot and user messages
  if (type === 'bot' || type === 'user') {
    contentDiv.innerHTML = parseMarkdown(text);
  } else {
    contentDiv.textContent = text;
  }

  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update status
function updateStatus(text) {
  statusText.textContent = text;
}

// ============================================
// CHAT SAVE/LOAD FUNCTIONALITY (AUTO-SAVE)
// ============================================

// Generate AI-based chat name
async function generateChatName() {
  if (conversationHistory.length < 2) {
    // Fallback if not enough messages
    return `Chat ${new Date().toLocaleString()}`;
  }

  try {
    // Get first 2 messages (user and assistant)
    const messages = conversationHistory.slice(0, 2);

    // Extract text content from messages
    const messageTexts = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return msg.content;
      } else if (Array.isArray(msg.content)) {
        const textContent = msg.content.find(c => c.type === 'text');
        return textContent ? textContent.text : '';
      }
      return '';
    }).filter(text => text.length > 0);

    if (messageTexts.length === 0) {
      return `Chat ${new Date().toLocaleString()}`;
    }

    // Request AI to generate a short name
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `Based on these conversation messages, generate a very short, concise title (2-4 words max) that captures the main topic or request. Only return the title, nothing else.\n\nMessages:\n${messageTexts.join('\n')}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate name');
    }

    const data = await response.json();
    const generatedName = data.content[0].text.trim();

    // Clean up the name (remove quotes, extra punctuation)
    return generatedName.replace(/["']/g, '').replace(/\.$/, '').substring(0, 50);
  } catch (error) {
    console.error('Error generating chat name:', error);
    // Fallback to first message
    const firstMsg = conversationHistory[0];
    const msgText = typeof firstMsg.content === 'string'
      ? firstMsg.content
      : firstMsg.content.find(c => c.type === 'text')?.text || '';
    return msgText.substring(0, 40) + (msgText.length > 40 ? '...' : '');
  }
}

// Auto-save chat after each AI response
async function autoSaveChat() {
  if (conversationHistory.length === 0) return;

  const chatData = {
    name: '',
    date: new Date().toISOString(),
    conversationHistory: conversationHistory,
    messages: Array.from(chatMessages.children).map(msg => ({
      type: msg.className.replace('message ', ''),
      content: msg.querySelector('.message-content').innerHTML
    }))
  };

  // Save or update existing chat
  const result = await chrome.storage.local.get(['savedChats']);
  const savedChats = result.savedChats || [];

  if (currentChatId !== null && currentChatId < savedChats.length) {
    // Update existing chat (keep original name)
    chatData.name = savedChats[currentChatId].name;
    savedChats[currentChatId] = chatData;
  } else {
    // Save new chat - generate AI name
    chatData.name = await generateChatName();
    savedChats.push(chatData);
    currentChatId = savedChats.length - 1;
  }

  await chrome.storage.local.set({ savedChats: savedChats });
}

// Open history modal
historyBtn.addEventListener('click', async () => {
  historyModal.classList.remove('hidden');
  historySearch.value = ''; // Clear search
  await loadSavedChatsList();
});

// Search functionality
historySearch.addEventListener('input', () => {
  loadSavedChatsList(historySearch.value.toLowerCase());
});

// Close history modal
closeHistoryModal.addEventListener('click', () => {
  historyModal.classList.add('hidden');
});

cancelHistory.addEventListener('click', () => {
  historyModal.classList.add('hidden');
});

// Load and display saved chats list
async function loadSavedChatsList(searchQuery = '') {
  const result = await chrome.storage.local.get(['savedChats']);
  const savedChats = result.savedChats || [];

  savedChatsList.innerHTML = '';

  if (savedChats.length === 0) {
    savedChatsList.innerHTML = `<div class="no-saved-chats">${t('noChatsYet')}</div>`;
    return;
  }

  // Sort by date (newest first)
  savedChats.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter by search query
  const filteredChats = searchQuery
    ? savedChats.filter(chat => chat.name.toLowerCase().includes(searchQuery))
    : savedChats;

  if (filteredChats.length === 0) {
    savedChatsList.innerHTML = `<div class="no-saved-chats">${t('noChatsFound')}</div>`;
    return;
  }

  // Group by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = {
    today: [],
    yesterday: [],
    week: [],
    older: []
  };

  filteredChats.forEach((chat, originalIndex) => {
    const chatDate = new Date(chat.date);
    const chatWithIndex = { ...chat, originalIndex: savedChats.indexOf(chat) };

    if (chatDate.toDateString() === today.toDateString()) {
      groups.today.push(chatWithIndex);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groups.yesterday.push(chatWithIndex);
    } else if (chatDate > lastWeek) {
      groups.week.push(chatWithIndex);
    } else {
      groups.older.push(chatWithIndex);
    }
  });

  // Render groups
  if (groups.today.length > 0) {
    savedChatsList.innerHTML += `<div class="chat-group-label">${t('today')}</div>`;
    groups.today.forEach(chat => renderChatItem(chat, chat.originalIndex));
  }

  if (groups.yesterday.length > 0) {
    savedChatsList.innerHTML += `<div class="chat-group-label">${t('yesterday')}</div>`;
    groups.yesterday.forEach(chat => renderChatItem(chat, chat.originalIndex));
  }

  if (groups.week.length > 0) {
    savedChatsList.innerHTML += `<div class="chat-group-label">${t('thisWeek')}</div>`;
    groups.week.forEach(chat => renderChatItem(chat, chat.originalIndex));
  }

  if (groups.older.length > 0) {
    savedChatsList.innerHTML += `<div class="chat-group-label">${t('older')}</div>`;
    groups.older.forEach(chat => renderChatItem(chat, chat.originalIndex));
  }
}

// Render individual chat item
function renderChatItem(chat, index) {
    const chatItem = document.createElement('div');
    chatItem.className = 'saved-chat-item';

    const chatInfo = document.createElement('div');
    chatInfo.className = 'saved-chat-info';

    const chatName = document.createElement('div');
    chatName.className = 'saved-chat-name';
    chatName.textContent = chat.name;

    const chatDate = document.createElement('div');
    chatDate.className = 'saved-chat-date';
    chatDate.textContent = formatDate(chat.date);

    chatInfo.appendChild(chatName);
    chatInfo.appendChild(chatDate);

    const actions = document.createElement('div');
    actions.className = 'saved-chat-actions';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-chat';
    deleteBtn.textContent = t('delete');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteSavedChat(index);
    };

    actions.appendChild(deleteBtn);

    chatItem.appendChild(chatInfo);
    chatItem.appendChild(actions);

    // Load chat when clicked
    chatItem.onclick = () => {
      loadSavedChat(chat, index);
    };

    savedChatsList.appendChild(chatItem);
}

// Format date for display
function formatDate(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('justNow');
  if (diffMins < 60) return `${diffMins}${t('minutesAgo')}`;
  if (diffHours < 24) return `${diffHours}${t('hoursAgo')}`;
  if (diffDays < 7) return `${diffDays}${t('daysAgo')}`;

  return date.toLocaleDateString();
}

// Load a saved chat
function loadSavedChat(chat, index) {
  // Clear current chat
  chatMessages.innerHTML = '';
  conversationHistory = chat.conversationHistory || [];
  currentChatId = index; // Track which chat we're viewing

  // Restore messages
  chat.messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.type}`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = msg.content;
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
  });

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  addMessage('System', `${t('loadedChat')} "${chat.name}"`, 'system');
  historyModal.classList.add('hidden');
}

// Delete a saved chat
async function deleteSavedChat(index) {
  if (!confirm(t('deleteChatConfirm'))) {
    return;
  }

  const result = await chrome.storage.local.get(['savedChats']);
  const savedChats = result.savedChats || [];

  savedChats.splice(index, 1);

  // Reset currentChatId if we deleted the current chat
  if (currentChatId === index) {
    currentChatId = null;
  } else if (currentChatId > index) {
    currentChatId--;
  }

  await chrome.storage.local.set({ savedChats: savedChats });
  await loadSavedChatsList();
}

// Close modals when clicking outside
historyModal.addEventListener('click', (e) => {
  if (e.target === historyModal) {
    historyModal.classList.add('hidden');
  }
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add('hidden');
  }
});

// Keyboard support for settings modal
settingsApiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveSettings.click();
  } else if (e.key === 'Escape') {
    settingsModal.classList.add('hidden');
  }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    historyModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
  }
});

// Initialize on load
init();
