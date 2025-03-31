/**
 * Enhanced Portfolio Site JavaScript
 * - Optimized for performance
 * - Improved accessibility
 * - Clean, maintainable code structure
 */

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const elements = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.querySelector('.overlay'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    typewriterEl: document.getElementById('typewriter'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    projects: document.querySelectorAll('.project-card'),
    navLinks: document.querySelectorAll('.nav-links a'),
    heroSection: document.querySelector('.hero'),
    scrollIndicator: document.querySelector('.scroll-indicator'),
    scrollTopBtn: document.getElementById('back-to-top'),
    forms: document.querySelectorAll('form'),
    logo: document.getElementById('logoSVG'),
    navToggle: document.getElementById('nav-toggle'),
    closeBtn: document.getElementById('close-btn')
  };

  // Utility functions
  const utils = {
    // Throttle function for events that fire rapidly
    throttle: (func, wait = 100) => {
      let timer = null;
      return function(...args) {
        if (timer === null) {
          timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
          }, wait);
        }
      };
    },

    // Debounce function to delay execution until after events stop firing
    debounce: (func, wait = 100) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(this, args);
        }, wait);
      };
    }
  };

  /**
   * Sidebar functionality
   */
  const sidebar = {
    toggle: () => {
      if (!elements.sidebar) return;
      
      elements.sidebar.classList.toggle('active');
      
      if (elements.overlay) {
        elements.overlay.classList.toggle('active');
      }
      
      // Update ARIA attributes
      const isExpanded = elements.sidebar.classList.contains('active');
      document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.setAttribute('aria-expanded', isExpanded);
      });
      
      // Toggle body scroll
      document.body.style.overflow = isExpanded ? 'hidden' : '';
      
      // Add/remove ESC key listener
      if (isExpanded) {
        document.addEventListener('keydown', sidebar.closeOnEsc);
      } else {
        document.removeEventListener('keydown', sidebar.closeOnEsc);
      }
    },

    closeOnEsc: (e) => {
      if (e.key === 'Escape' && elements.sidebar?.classList.contains('active')) {
        sidebar.toggle();
      }
    },

    init: () => {
      if (elements.navToggle) {
        elements.navToggle.addEventListener('click', sidebar.toggle);
      }
      
      if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', sidebar.toggle);
      }
      
      if (elements.overlay) {
        elements.overlay.addEventListener('click', sidebar.toggle);
      }
      
      // Global function for HTML onclick attributes
      window.toggleSidebar = sidebar.toggle;
    }
  };

  /**
   * Dark mode functionality
   */
  const darkMode = {
    toggle: () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('dark-mode', isDarkMode);
      
      // Update ARIA attributes and icons
      const darkModeButtons = document.querySelectorAll('[data-theme-toggle], #dark-mode-toggle, #theme-toggle');
      darkModeButtons.forEach(el => {
        el.setAttribute('aria-pressed', isDarkMode);
        
        const icon = el.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-moon', !isDarkMode);
          icon.classList.toggle('fa-sun', isDarkMode);
        }
      });
      
      // Dispatch theme change event
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { isDarkMode } 
      }));
    },

    init: () => {
      const isDarkMode = localStorage.getItem('dark-mode') === 'true';
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        
        // Update icons
        document.querySelectorAll('[data-theme-toggle], #dark-mode-toggle, #theme-toggle').forEach(el => {
          el.setAttribute('aria-pressed', 'true');
          const icon = el.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
          }
        });
      }
      
      // Add event listeners to dark mode toggle buttons
      document.querySelectorAll('[data-theme-toggle], #dark-mode-toggle, #theme-toggle').forEach(button => {
        if (button) {
          button.addEventListener('click', darkMode.toggle);
        }
      });
    }
  };

  /**
   * Typewriter effect
   */
  const typewriter = {
    effect: (element, text, speed = 100) => {
      if (!element) return;
      
      let index = 0;
      element.textContent = ''; // Clear existing text
      
      const typeNextCharacter = () => {
        if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
          setTimeout(typeNextCharacter, speed);
        } else {
          // Add CSS class for cursor blink effect when done typing
          element.classList.add('typewriter-done');
        }
      };
      
      // Start with slight delay for better perceived performance
      setTimeout(typeNextCharacter, 500);
    },

    init: () => {
      if (elements.typewriterEl) {
        typewriter.effect(elements.typewriterEl, "I am a Developer, Designer & AI Enthusiast.");
      }
    }
  };

  /**
   * Portfolio filtering
   */
  const portfolioFilter = {
    init: () => {
      if (elements.filterButtons.length > 0) {
        // Use event delegation for better performance
        const filterContainer = document.querySelector('.filter-buttons');
        
        if (filterContainer) {
          filterContainer.addEventListener('click', (event) => {
            const target = event.target.closest('.filter-btn');
            
            if (!target) return;

            // Update active button state
            elements.filterButtons.forEach(btn => {
              btn.classList.remove('active');
              btn.setAttribute('aria-pressed', 'false');
            });
            
            target.classList.add('active');
            target.setAttribute('aria-pressed', 'true');
            
            // Filter projects
            const filter = target.getAttribute('data-filter');
            
            elements.projects.forEach(project => {
              const shouldShow = filter === 'all' || project.classList.contains(filter);
              
              if (shouldShow) {
                project.style.display = 'block';
                setTimeout(() => {
                  project.style.opacity = '1';
                  project.style.transform = 'translateY(0)';
                }, 10);
              } else {
                project.style.opacity = '0';
                project.style.transform = 'translateY(20px)';
                
                // Wait for animation to complete before hiding
                setTimeout(() => {
                  project.style.display = 'none';
                }, 300);
              }
            });
          });
        }
      }
    }
  };

  /**
   * Smooth scrolling
   */
  const scrolling = {
    smoothScroll: (targetId, offset = 70) => {
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;
      
      const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition - offset;
      
      let startTime = null;
      const duration = 1000; // ms
      
      const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smoother animation
        const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    },

    updateActiveNavLink: () => {
      const scrollPosition = window.scrollY + 100; // Add offset for better detection
      const sections = document.querySelectorAll('section[id]');
      
      // Find current section
      let currentSectionId = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = '#' + section.id;
        }
      });
      
      // Update nav links
      if (currentSectionId) {
        // Remove active class from all links
        document.querySelectorAll('.nav-links a, .sidebar-menu a, .sidebar ul a, .scroll-nav-item').forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to current links
        document.querySelectorAll(`.nav-links a[href="${currentSectionId}"], .sidebar-menu a[href="${currentSectionId}"], .sidebar ul a[href="${currentSectionId}"], .scroll-nav-item[data-target="${currentSectionId}"]`).forEach(link => {
          link.classList.add('active');
        });
      }
    },

    updateScrollIndicator: () => {
      if (!elements.scrollIndicator) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      requestAnimationFrame(() => {
        elements.scrollIndicator.style.width = scrollPercent + '%';
      });
    },

    updateBackToTopButton: () => {
      if (!elements.scrollTopBtn) return;
      
      elements.scrollTopBtn.classList.toggle('active', window.pageYOffset > 300);
    },

    init: () => {
      // Use event delegation for nav links
      document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.nav-links a, .sidebar a, .sidebar ul a, .scroll-nav-item');
        if (!link) return;
        
        const href = link.getAttribute('href') || link.getAttribute('data-target');
        
        if (href && href.startsWith('#')) {
          event.preventDefault();
          scrolling.smoothScroll(href);
          
          // Close sidebar if open
          if (elements.sidebar && elements.sidebar.classList.contains('active')) {
            sidebar.toggle();
          }
        }
      });
      
      // Scroll events with throttling
      const handleScroll = utils.throttle(() => {
        scrolling.updateScrollIndicator();
        scrolling.updateBackToTopButton();
        scrolling.updateActiveNavLink();
      }, 100);
      
      window.addEventListener('scroll', handleScroll);
      
      // Back to top button
      if (elements.scrollTopBtn) {
        elements.scrollTopBtn.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
    }
  };

  /**
   * Background image rotation
   */
  const bgImageRotation = {
    init: () => {
      if (!elements.heroSection) return;
      
      // Get background images from data attribute or use defaults
      const images = elements.heroSection.dataset.backgrounds ? 
        elements.heroSection.dataset.backgrounds.split(',') : 
        ["IMG_1.jpeg", "IMG_2.jpeg", "hero-bg.jpg"];
      
      let bgIndex = 0;
      
      // Preload images
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
      
      const changeBackground = () => {
        // Prepare next image
        const nextIndex = (bgIndex + 1) % images.length;
        const nextImage = new Image();
        nextImage.src = images[nextIndex];
        
        // Add transition class
        elements.heroSection.classList.add('bg-transitioning');
        
        // Change background image
        elements.heroSection.style.backgroundImage = `url('${images[bgIndex]}')`;
        
        // Remove transition class after animation completes
        setTimeout(() => {
          elements.heroSection.classList.remove('bg-transitioning');
        }, 1000);
        
        bgIndex = nextIndex;
      };
      
      // Initial background
      changeBackground();
      
      // Set interval for rotation
      setInterval(changeBackground, 10000);
    }
  };

  /**
   * Lazy loading images
   */
  const lazyLoad = {
    init: () => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      if (!lazyImages.length) return;
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const image = entry.target;
              
              // Create a new image to preload
              const img = new Image();
              
              img.onload = () => {
                // Only swap src once image is loaded
                requestAnimationFrame(() => {
                  image.src = image.dataset.src;
                  image.classList.add('loaded');
                  image.removeAttribute('data-src');
                });
              };
              
              img.src = image.dataset.src;
              imageObserver.unobserve(image);
            }
          });
        }, {
          rootMargin: '200px' // Start loading images when they're 200px away from viewport
        });
        
        lazyImages.forEach(img => {
          imageObserver.observe(img);
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          img.removeAttribute('data-src');
        });
      }
    }
  };
  
  /**
 * Form validation with real-time feedback and Formspree integration
 */
const formValidation = {
  init: () => {
    if (!elements.forms.length) return;
    
    elements.forms.forEach(form => {
      form.setAttribute('novalidate', true);
      
      // Enhanced real-time validation
      const formInputs = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
      formInputs.forEach(input => {
        // Add validation icon container
        const formGroup = input.closest('.form-group') || input.parentNode;
        if (!formGroup.querySelector('.validation-icon')) {
          const validationIcon = document.createElement('span');
          validationIcon.className = 'validation-icon';
          formGroup.appendChild(validationIcon);
        }
        
        // Real-time validation on input
        input.addEventListener('input', function() {
          formValidation.validateInput(input);
        });
        
        // Validation on blur
        input.addEventListener('blur', function() {
          formValidation.validateInput(input, true);
        });
      });
      
      // Contact form specific handling
      if (form.id === 'contact-form') {
        // Create loading spinner element
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          const loadingSpinner = document.createElement('span');
          loadingSpinner.className = 'loading-spinner';
          loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          loadingSpinner.style.display = 'none';
          
          // Append spinner to button
          submitBtn.appendChild(loadingSpinner);
        }
        
        // Replace default form submission with Formspree handling
        form.addEventListener('submit', function(event) {
          event.preventDefault();
          formValidation.handleContactSubmit(form);
        });
      } else {
        // Standard form validation for non-contact forms
        form.addEventListener('submit', function(event) {
          formValidation.handleStandardSubmit(event, form);
        });
      }
    });
  },
  
  validateInput: (input, isBlur = false) => {
    const formGroup = input.closest('.form-group') || input.parentNode;
    
    // Only show errors on blur or if the form has been submitted once
    if (!isBlur && !input.dataset.touched && !formGroup.closest('form').classList.contains('was-validated')) {
      return;
    }
    
    // Mark input as touched
    input.dataset.touched = 'true';
    
    if (!input.checkValidity()) {
      formGroup.classList.add('error');
      input.classList.add('input-error');
      input.classList.remove('input-valid');
      
      // Add or update error message
      let errorElement = formGroup.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
      }
      
      // Set appropriate error message
      if (input.validity.valueMissing) {
        errorElement.textContent = 'This field is required';
      } else if (input.validity.typeMismatch) {
        errorElement.textContent = input.type === 'email' ? 
          'Please enter a valid email address' : 
          'Please enter a valid format';
      } else if (input.validity.tooShort) {
        errorElement.textContent = `Please enter at least ${input.minLength} characters`;
      } else {
        errorElement.textContent = input.validationMessage || 'Invalid input';
      }
    } else {
      formGroup.classList.remove('error');
      input.classList.remove('input-error');
      input.classList.add('input-valid');
      
      // Remove error message if it exists
      const errorElement = formGroup.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    }
  },
  
  handleContactSubmit: (form) => {
    // Mark form as validated for styling
    form.classList.add('was-validated');
    
    // Check if form is valid
    if (!form.checkValidity()) {
      // Validate all inputs to show errors
      form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
        formValidation.validateInput(input, true);
      });
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    const originalText = submitBtn.childNodes[0].textContent.trim();
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'inline-block';
    }
    submitBtn.childNodes[0].textContent = 'Sending...';
    
    // Get form data for sending
    const formData = new FormData(form);
    
    // Send data to Formspree
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Response data:', data);
      
      if (data.ok) { // Formspree uses "ok: true" for success
        // Show success message
        formValidation.showSuccessMessage(form);
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(input => {
          input.classList.remove('input-valid');
          delete input.dataset.touched;
        });
        
        // Remove any existing error containers
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
          errorContainer.remove();
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    })
    .catch(error => {
      console.error('Error details:', error);
      
      // Remove any existing error containers
      const existingError = document.querySelector('.error-container');
      if (existingError) {
        existingError.remove();
      }
      
      // Create an error message element
      const errorContainer = document.createElement('div');
      errorContainer.className = 'error-container';
      errorContainer.innerHTML = `
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="error-content">
          <h4>Message Not Sent</h4>
          <p>${error.message || 'There was a problem sending your message. Please try again later or contact me directly at parth459.a@gmail.com'}</p>
        </div>
        <button class="close-message" aria-label="Close message">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Add the error container after the form
      form.parentNode.insertBefore(errorContainer, form.nextSibling);
      
      // Add event listener to close button
      const closeBtn = errorContainer.querySelector('.close-message');
      closeBtn.addEventListener('click', () => {
        errorContainer.remove();
      });
      
      // Auto-remove after 8 seconds
      setTimeout(() => {
        if (errorContainer.parentNode) {
          errorContainer.remove();
        }
      }, 8000);
    })
    .finally(() => {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.childNodes[0].textContent = originalText;
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
    });
  },
  
  showSuccessMessage: (form) => {
    // Find or create success message
    let successMessage = document.querySelector('.success-message');
    
    // Remove existing success message if it exists
    if (successMessage) {
      successMessage.remove();
    }
    
    // Create new success message
    successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    
    // Create success message content with check icon
    successMessage.innerHTML = `
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="success-content">
        <h4>Message Sent!</h4>
        <p>Your message has been sent successfully. I'll get back to you soon!</p>
      </div>
    `;
    
    // Add to the DOM after the form
    form.parentNode.insertBefore(successMessage, form.nextSibling);
    
    // Show message with animation
    setTimeout(() => {
      successMessage.classList.add('active');
    }, 10);
    
    // Add close button to success message
    if (!successMessage.querySelector('.close-message')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-message';
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      closeBtn.setAttribute('aria-label', 'Close message');
      
      closeBtn.addEventListener('click', () => {
        successMessage.classList.remove('active');
        setTimeout(() => {
          if (successMessage.parentNode) {
            successMessage.remove();
          }
        }, 300);
      });
      
      successMessage.appendChild(closeBtn);
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.classList.remove('active');
        setTimeout(() => {
          if (successMessage.parentNode) {
            successMessage.remove();
          }
        }, 300);
      }
    }, 5000);
  },
  
  handleStandardSubmit: (event, form) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      
      // Validate all inputs to show errors
      form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
        formValidation.validateInput(input, true);
      });
    }
    
    form.classList.add('was-validated');
  }
};

  /**
   * Animate elements when they come into view
   */
  const animations = {
    init: () => {
      const elementsToAnimate = document.querySelectorAll('.fade-in, .slide-in, .reveal');
      
      if (!elementsToAnimate.length) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              entry.target.classList.add('active');
            });
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      });
      
      elementsToAnimate.forEach(element => {
        observer.observe(element);
      });
    }
  };

  /**
   * Modal functionality
   */
  const modals = {
    closeModal: (modal, previouslyFocused) => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      
      // Return focus to the element that had focus before modal was opened
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    },

    init: () => {
      // Get all modal triggers
      const modalTriggers = document.querySelectorAll('[data-modal]');
      
      if (!modalTriggers.length) return;
      
      modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const modalId = trigger.getAttribute('data-modal');
          const modal = document.getElementById(modalId);
          
          if (!modal) return;
          
          // Store the element that had focus before opening modal
          const previouslyFocused = document.activeElement;
          
          // Open modal
          modal.classList.add('show');
          document.body.style.overflow = 'hidden'; // Prevent background scrolling
          
          // Set focus on first focusable element for accessibility
          const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          
          if (focusableElements.length) {
            focusableElements[0].focus();
          }
          
          // Close button functionality
          const closeBtn = modal.querySelector('.modal-close');
          
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              modals.closeModal(modal, previouslyFocused);
            });
          }
          
          // Close on overlay click
          modal.addEventListener('click', (event) => {
            if (event.target === modal) {
              modals.closeModal(modal, previouslyFocused);
            }
          });
          
          // Close on Escape key
          const handleKeydown = (event) => {
            if (event.key === 'Escape' && modal.classList.contains('show')) {
              modals.closeModal(modal, previouslyFocused);
              document.removeEventListener('keydown', handleKeydown);
            }
          };
          
          document.addEventListener('keydown', handleKeydown);
          
          // Trap focus inside modal for accessibility
          modal.addEventListener('keydown', function (event) {
            if (event.key === 'Tab') {
              if (focusableElements.length === 0) return;
              
              const firstElement = focusableElements[0];
              const lastElement = focusableElements[focusableElements.length - 1];
              
              if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
              } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
              }
            }
          });
        });
      });
    }
  };

  /**
   * Logo animation
   */
  const logo = {
    animate: () => {
      if (!elements.logo) return;
      
      const stem = document.querySelector('.stem');
      const crossbar = document.querySelector('.crossbar');
      const topLoop = document.querySelector('.top-loop');
      const bottomCurve = document.querySelector('.bottom-curve');
      const diagonal = document.querySelector('.diagonal');
      const period = document.querySelector('.period');
      
      if (!stem || !crossbar || !topLoop || !bottomCurve || !diagonal || !period) return;
      
      // Reset animations
      [stem, crossbar, topLoop, bottomCurve, diagonal].forEach(el => {
        el.style.strokeDasharray = '1000';
        el.style.strokeDashoffset = '1000';
        el.style.animation = 'none';
      });
      
      period.style.opacity = '0';
      
      // Force reflow
      void stem.offsetWidth;
      
      // Animate each part sequentially
      stem.style.animation = 'draw 1s forwards';
      
      setTimeout(() => {
        crossbar.style.animation = 'draw 0.8s forwards';
      }, 800);
      
      setTimeout(() => {
        topLoop.style.animation = 'draw 0.8s forwards';
      }, 1600);
      
      setTimeout(() => {
        bottomCurve.style.animation = 'draw 0.8s forwards';
      }, 2400);
      
      setTimeout(() => {
        diagonal.style.animation = 'draw 0.8s forwards';
      }, 3200);
      
      setTimeout(() => {
        period.style.opacity = '1';
        period.style.animation = 'fadeIn 0.5s forwards';
      }, 4000);
    },

    showLetters: () => {
      const letterHighlights = document.querySelectorAll('.letter-highlight');
      letterHighlights.forEach(letter => {
        letter.style.opacity = letter.style.opacity === '1' ? '0' : '1';
      });
    },

    init: () => {
      // Initial logo animation with delay
      if (elements.logo) {
        setTimeout(() => {
          logo.animate();
        }, 1000);
        
        // Add click handler to logo for replaying animation
        const logoElement = document.querySelector('.logo');
        if (logoElement) {
          logoElement.addEventListener('click', (e) => {
            if (e.target.closest('.logo') && e.currentTarget.getAttribute('href') === '#') {
              e.preventDefault();
              logo.animate();
            }
          });
        }
      }
      
      // Expose functions globally for HTML onclick attributes
      window.animateLogo = logo.animate;
      window.showLetters = logo.showLetters;
    }
  };

  /**
   * Add CSS animations for logo
   */
  const addLogoAnimationStyles = () => {
    // Add CSS animations if they don't exist
    if (!document.querySelector('style#animation-styles')) {
      const style = document.createElement('style');
      style.id = 'animation-styles';
      style.textContent = `
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  /**
   * Navbar scroll behavior
   */
  const navbar = {
    init: () => {
      const navbarElement = document.querySelector('.navbar');
      if (navbarElement) {
        window.addEventListener('scroll', utils.throttle(() => {
          navbarElement.classList.toggle('scrolled', window.scrollY > 100);
        }, 100));
      }
    }
  };

  /**
   * Cross-page navigation fix
   */
  const crossPageNavigation = {
    init: () => {
      // Handle scroll nav items
      document.querySelectorAll('.scroll-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
          const targetPath = this.getAttribute('data-target');
          
          // If it's a cross-page link (contains .html)
          if (targetPath && targetPath.includes('.html')) {
            // Navigate to the page
            window.location.href = targetPath;
          }
        });
      });

      // Check if we're on resource pages and handle back-to-top links
      if (window.location.pathname.includes('resource')) {
        document.querySelectorAll('.back-to-top a').forEach(link => {
          link.setAttribute('href', 'index.html#home');
        });
      }
    }
  };

  // Initialize all components
  const init = () => {
    // Add animation styles
    addLogoAnimationStyles();
    
    // Core UI components
    sidebar.init();
    darkMode.init();
    navbar.init();
    
    // Content features
    typewriter.init();
    portfolioFilter.init();
    scrolling.init();
    bgImageRotation.init();
    
    // Performance optimizations
    lazyLoad.init();
    
    // Form handling
    formValidation.init();
    
    // UI enhancements
    animations.init();
    modals.init();
    logo.init();
    
    // Navigation
    crossPageNavigation.init();
  };

  // Call the init function
  init();
});