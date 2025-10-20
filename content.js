// Content script for detecting and filling form fields

console.log('AI Chat Form Filler content script loaded');

// Cache for detected fields
let cachedFields = null;

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectFields') {
    const fields = detectFormFields();
    cachedFields = fields;
    sendResponse({ fields: fields });
  } else if (request.action === 'fillFields') {
    fillFormFields(request.fieldValues);
    sendResponse({ success: true });
  }

  return true;
});

// Detect all form fields on the page
function detectFormFields() {
  const fields = [];

  // Find all input, select, and textarea elements
  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach((element, index) => {
    // Skip hidden, submit, button, and image inputs
    const type = element.type?.toLowerCase() || 'text';
    if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'image' || type === 'reset') {
      return;
    }

    // Get label
    let label = '';
    if (element.id) {
      const labelElement = document.querySelector(`label[for="${element.id}"]`);
      if (labelElement) {
        label = labelElement.textContent.trim();
      }
    }

    // If no label found, try to find nearby text
    if (!label) {
      const parent = element.parentElement;
      if (parent) {
        const parentText = parent.textContent;
        if (parentText && parentText.length < 100) {
          label = parentText.trim().replace(element.value || '', '').trim();
        }
      }
    }

    // Get options for select elements
    let options = [];
    if (element.tagName.toLowerCase() === 'select') {
      options = Array.from(element.options).map(opt => opt.value || opt.text);
    }

    // Build field object
    const field = {
      index: fields.length,
      tag: element.tagName.toLowerCase(),
      type: type,
      name: element.name || '',
      id: element.id || '',
      placeholder: element.placeholder || '',
      label: label,
      value: element.value || '',
      options: options,
      element: null // Don't store the actual element, we'll find it later
    };

    fields.push(field);
  });

  console.log(`Detected ${fields.length} form fields`);
  return fields;
}

// Fill form fields with provided values
function fillFormFields(fieldValues) {
  const inputs = document.querySelectorAll('input, select, textarea');
  let filledCount = 0;

  // Convert inputs to array for indexing
  const validInputs = [];
  inputs.forEach(element => {
    const type = element.type?.toLowerCase() || 'text';
    if (type !== 'hidden' && type !== 'submit' && type !== 'button' && type !== 'image' && type !== 'reset') {
      validInputs.push(element);
    }
  });

  // Fill each field
  for (const [indexStr, value] of Object.entries(fieldValues)) {
    const index = parseInt(indexStr, 10);
    if (index >= 0 && index < validInputs.length) {
      const element = validInputs[index];

      // Set value based on element type
      if (element.tagName.toLowerCase() === 'select') {
        // For select elements, find matching option
        const options = Array.from(element.options);
        const matchingOption = options.find(opt =>
          opt.value.toLowerCase() === value.toLowerCase() ||
          opt.text.toLowerCase() === value.toLowerCase()
        );

        if (matchingOption) {
          element.value = matchingOption.value;
        } else {
          element.value = value;
        }
      } else if (element.type === 'checkbox') {
        // For checkboxes, set checked state
        element.checked = value === 'true' || value === true || value === 'yes' || value === '1';
      } else if (element.type === 'radio') {
        // For radio buttons, check if value matches
        if (element.value.toLowerCase() === value.toLowerCase()) {
          element.checked = true;
        }
      } else {
        // For text inputs, textareas, etc.
        element.value = value;
      }

      // Trigger events to notify the page
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));

      // Visual feedback
      element.style.transition = 'background-color 0.3s ease';
      element.style.backgroundColor = '#a5d6a7';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);

      filledCount++;
    }
  }

  console.log(`Filled ${filledCount} form fields`);
}

// Auto-detect fields when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    cachedFields = detectFormFields();
  }, 500);
});
