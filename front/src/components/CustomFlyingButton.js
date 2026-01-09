import React, { useState } from 'react';

export default function CustomFlyingButton({ 
    children, 
    src, 
    targetSelector = '#cart-icon', // CSS selector for target element
    animationDuration = 100,
    flyingItemStyling = { 
        startWidth: '120px', 
        startHeight: '120px', 
        endWidth: '30px', 
        endHeight: '30px', 
        borderRadius: '8px' 
    }
}) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = (e) => {
        // Prevent default behavior
        e.preventDefault();
        e.stopPropagation();

        // Get the clicked element's position
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        // Find the target element (cart icon)
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            console.warn(`Target element with selector "${targetSelector}" not found. Falling back to approximate position.`);
            // Fallback to approximate cart position
            const targetX = window.innerWidth * 0.9;
            const targetY = window.innerHeight * 0.1;
            
            // Create flying element with fallback position
            const flyingElement = document.createElement('div');
            flyingElement.style.position = 'fixed';
            flyingElement.style.left = startX + 'px';
            flyingElement.style.top = startY + 'px';
            flyingElement.style.width = flyingItemStyling.startWidth;
            flyingElement.style.height = flyingItemStyling.startHeight;
            flyingElement.style.borderRadius = flyingItemStyling.borderRadius;
            flyingElement.style.backgroundImage = `url(${src})`;
            flyingElement.style.backgroundSize = 'cover';
            flyingElement.style.backgroundPosition = 'center';
            flyingElement.style.zIndex = '9999';
            flyingElement.style.pointerEvents = 'none';
            flyingElement.style.transition = `all ${animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            flyingElement.style.transform = 'translate(-50%, -50%) scale(1)';
            flyingElement.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            flyingElement.style.border = '3px solid white';

            document.body.appendChild(flyingElement);

            requestAnimationFrame(() => {
                flyingElement.style.left = targetX + 'px';
                flyingElement.style.top = targetY + 'px';
                flyingElement.style.width = flyingItemStyling.endWidth;
                flyingElement.style.height = flyingItemStyling.endHeight;
                flyingElement.style.opacity = '0.9';
                flyingElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            });

            setTimeout(() => {
                if (flyingElement.parentNode) {
                    flyingElement.parentNode.removeChild(flyingElement);
                }
                setIsAnimating(false);
            }, animationDuration);

            setIsAnimating(true);

            // Call original onClick
            if (children.props.onClick) {
                children.props.onClick(e);
            }
            return;
        }

        // Get target element position
        const targetRect = targetElement.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        // Create flying element - starts BIG
        const flyingElement = document.createElement('div');
        flyingElement.style.position = 'fixed';
        flyingElement.style.left = startX + 'px';
        flyingElement.style.top = startY + 'px';
        flyingElement.style.width = flyingItemStyling.startWidth;
        flyingElement.style.height = flyingItemStyling.startHeight;
        flyingElement.style.borderRadius = flyingItemStyling.borderRadius;
        flyingElement.style.backgroundImage = `url(${src})`;
        flyingElement.style.backgroundSize = 'cover';
        flyingElement.style.backgroundPosition = 'center';
        flyingElement.style.zIndex = '9999';
        flyingElement.style.pointerEvents = 'none';
        flyingElement.style.transition = `all ${animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        flyingElement.style.transform = 'translate(-50%, -50%) scale(1)';
        flyingElement.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        flyingElement.style.border = '3px solid white';
        flyingElement.style.opacity = '1';

        document.body.appendChild(flyingElement);

        // Trigger animation - fly to cart and shrink
        requestAnimationFrame(() => {
            flyingElement.style.left = targetX + 'px';
            flyingElement.style.top = targetY + 'px';
            flyingElement.style.width = flyingItemStyling.endWidth;
            flyingElement.style.height = flyingItemStyling.endHeight;
            flyingElement.style.opacity = '0.9';
            flyingElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });

        // Add enhanced bounce effect to the cart icon
        if (targetElement) {
            // First bounce - bigger
            targetElement.style.transform = 'scale(1.3)';
            targetElement.style.transition = 'transform 150ms ease-out';
            
            setTimeout(() => {
                // Second bounce - smaller
                targetElement.style.transform = 'scale(0.95)';
            }, 150);
            
            setTimeout(() => {
                // Return to normal
                targetElement.style.transform = 'scale(1)';
                setTimeout(() => {
                    targetElement.style.transition = '';
                }, 200);
            }, 300);
        }

        // Remove element after animation with slight delay for effect
        setTimeout(() => {
            if (flyingElement.parentNode) {
                // Fade out effect before removal
                flyingElement.style.opacity = '0';
                flyingElement.style.transform = 'translate(-50%, -50%) scale(0.1)';
                
                setTimeout(() => {
                    if (flyingElement.parentNode) {
                        flyingElement.parentNode.removeChild(flyingElement);
                    }
                }, 200);
            }
            setIsAnimating(false);
        }, animationDuration - 200);

        setIsAnimating(true);

        // Call original onClick if it exists
        if (children.props.onClick) {
            children.props.onClick(e);
        }
    };

    return React.cloneElement(children, {
        onClick: handleClick,
        disabled: isAnimating || children.props.disabled
    });
}