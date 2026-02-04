// Article Preview Component - Share Functionality
// Handles both mobile (footer transformation) and desktop/tablet (tooltip) behaviors


const shareButton = document.querySelector('.share-button');
const socialLinks = document.querySelector('.social-links');
const footer = document.querySelector('.footer');

// Configuration for sharing
const SHARE_CONFIG = {
  url: window.location.href, // Current page URL
  title: document.querySelector('h1')?.textContent || 'Check out this article!',
  description: document.querySelector('.description p')?.textContent || '',

};

/**
 * Social Media Sharing Functions
 */
const ShareHandlers = {
  facebook: function(url, title) {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, 'facebook-share', 'width=580,height=400');
  },
  
  twitter: function(url, title, description) {
    // Twitter/X sharing
    const text = description ? `${title} - ${description}` : title;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, 'twitter-share', 'width=580,height=400');
  },
  
  pinterest: function(url, title, description) {
    // Pinterest requires an image - get the article image
    const imageElement = document.querySelector('.image-container img');
    const imageUrl = imageElement ? imageElement.src : '';
    
    const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`;
    window.open(shareUrl, 'pinterest-share', 'width=580,height=400');
  },
  
  // Native Web Share API (for modern browsers, especially mobile)
  native: async function(url, title, description) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url
        });
        console.log('Shared successfully');
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      console.log('Web Share API not supported');
    }
  }
};

/**
 * Handle social link clicks
 */
function handleSocialClick(e, platform) {
  e.preventDefault();
  
  const { url, title, description } = SHARE_CONFIG;
  
  switch(platform) {
    case 'facebook':
      ShareHandlers.facebook(url, title);
      break;
    case 'twitter':
      ShareHandlers.twitter(url, title, description);
      break;
    case 'pinterest':
      ShareHandlers.pinterest(url, title, description);
      break;
    default:
      console.log('Unknown platform:', platform);
  }
  
  // Close the share menu after sharing
  closeShareMenu();
  
  // Optional: Track analytics
  // trackShareEvent(platform);
}

/**
 * Toggle share menu based on current state and viewport size
 */
function toggleShareMenu() {
  const isActive = shareButton.getAttribute('aria-expanded') === 'true';
  const isMobile = window.innerWidth < 608;
  
  if (!isActive) {
    // Opening the menu
    shareButton.setAttribute('aria-expanded', 'true');
    socialLinks.removeAttribute('aria-hidden');
    
    // Make social links focusable
    const socialLinkElements = socialLinks.querySelectorAll('a');
    socialLinkElements.forEach(link => {
      link.removeAttribute('tabindex');
    });
    
    if (isMobile) {
      // Mobile: Transform entire footer
      footer.classList.add('is-share-active');
    } else {
      // Desktop/Tablet: Show tooltip above button
      socialLinks.classList.add('show');
    }
    
    // Move focus to first social link after menu opens
    setTimeout(() => {
      const firstLink = socialLinks.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    }, 100);
    
  } else {
    // Closing the menu
    closeShareMenu();
  }
}

/**
 * Close share menu
 */
function closeShareMenu() {
  const isActive = shareButton.getAttribute('aria-expanded') === 'true';
  
  if (!isActive) return;
  
  const isMobile = window.innerWidth < 608;
  
  // Update ARIA attributes
  shareButton.setAttribute('aria-expanded', 'false');
  socialLinks.setAttribute('aria-hidden', 'true');
  
  // Make social links not focusable
  const socialLinkElements = socialLinks.querySelectorAll('a');
  socialLinkElements.forEach(link => {
    link.setAttribute('tabindex', '-1');
  });
  
  // Remove visual classes
  if (isMobile) {
    footer.classList.remove('is-share-active');
  } else {
    socialLinks.classList.remove('show');
  }
  
  // Return focus to share button
  shareButton.focus();
}

/**
 * Reset all states (used on resize)
 */
function resetStates() {
  footer.classList.remove('is-share-active');
  socialLinks.classList.remove('show');
  shareButton.setAttribute('aria-expanded', 'false');
  socialLinks.setAttribute('aria-hidden', 'true');
  
  // Reset tabindex on social links
  const socialLinkElements = socialLinks.querySelectorAll('a');
  socialLinkElements.forEach(link => {
    link.setAttribute('tabindex', '-1');
  });
}

// Event Listeners - All wrapped in DOMContentLoaded to ensure DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize ARIA attributes
  shareButton.setAttribute('aria-expanded', 'false');
  socialLinks.setAttribute('aria-hidden', 'true');
  
  // Make social links not focusable by default (hidden state)
  const socialLinkElements = socialLinks.querySelectorAll('a');
  socialLinkElements.forEach(link => {
    link.setAttribute('tabindex', '-1');
  });
  
  // Get all social links and add click handlers
  const facebookLink = document.querySelector('a[aria-label*="Facebook"]');
  const twitterLink = document.querySelector('a[aria-label*="Twitter"]');
  const pinterestLink = document.querySelector('a[aria-label*="Pinterest"]');
  
  if (facebookLink) {
    facebookLink.addEventListener('click', (e) => handleSocialClick(e, 'facebook'));
  }
  
  if (twitterLink) {
    twitterLink.addEventListener('click', (e) => handleSocialClick(e, 'twitter'));
  }
  
  if (pinterestLink) {
    pinterestLink.addEventListener('click', (e) => handleSocialClick(e, 'pinterest'));
  }
  
  // Share button click
  shareButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleShareMenu();
  });
  
  // Close on click outside
  document.addEventListener('click', (e) => {
    const isClickInside = shareButton.contains(e.target) || socialLinks.contains(e.target);
    
    if (!isClickInside) {
      closeShareMenu();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShareMenu();
    }
  });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reset all states when viewport changes to prevent layout issues
      resetStates();
    }, 250);
  });
  
  // Prevent social links clicks from closing the menu immediately
  socialLinks.addEventListener('click', (e) => {
    // Allow the link navigation but don't close menu
    // (Links will navigate away anyway)
    e.stopPropagation();
  });
  
  // Enhanced keyboard navigation within social links
  socialLinks.addEventListener('keydown', (e) => {
    const links = socialLinks.querySelectorAll('a');
    const currentIndex = Array.from(links).indexOf(document.activeElement);
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % links.length;
      links[nextIndex].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + links.length) % links.length;
      links[prevIndex].focus();
    } else if (e.key === 'Tab' && e.shiftKey && currentIndex === 0) {
      // Shift+Tab on first link - close menu and return to button
      e.preventDefault();
      closeShareMenu();
    } else if (e.key === 'Tab' && !e.shiftKey && currentIndex === links.length - 1) {
      // Tab on last link - close menu and return to button
      e.preventDefault();
      closeShareMenu();
    }
  });
});