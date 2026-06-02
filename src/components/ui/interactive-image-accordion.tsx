"use client";

import React, { useState } from 'react';

// --- Types ---
export interface AccordionItemData {
  id: number | string;
  title: string;
  imageUrl: string;
  category?: string;
}

interface AccordionItemProps {
  item: AccordionItemData;
  isActive: boolean;
  onMouseEnter: () => void;
}

// --- Accordion Item Component ---
const AccordionItem: React.FC<AccordionItemProps> = ({ item, isActive, onMouseEnter }) => {
  return (
    <div
      className={`
        relative h-[450px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out
        ${isActive ? 'w-[400px] flex-grow md:flex-grow-0' : 'w-[60px] shrink-0'}
      `}
      onMouseEnter={onMouseEnter}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
        onError={(e) => { 
          e.currentTarget.onerror = null; 
          e.currentTarget.src = 'https://placehold.co/400x450/2d3748/ffffff?text=Image+Error'; 
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Caption Text */}
      <span
        className={`
          absolute text-white text-lg font-semibold whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${
            isActive
              ? 'bottom-6 left-1/2 -translate-x-1/2 rotate-0' // Active state: horizontal, bottom-center
              // Inactive state: vertical, positioned at the bottom, for all screen sizes
              : 'w-auto text-left bottom-24 left-1/2 -translate-x-1/2 -rotate-90'
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
};

// --- Data for the image accordion ---
const defaultAccordionItems: AccordionItemData[] = [
  {
    id: 1,
    title: 'Voice Assistant',
    imageUrl: 'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'AI Image Generation',
    imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'AI Chatbot + Local RAG',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'AI Agent',
    imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2090&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Visual Understanding',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop',
  },
];

// --- Main App Component ---
export function LandingAccordionItem({ items = defaultAccordionItems }: { items?: AccordionItemData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleItemHover = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-white font-sans">
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Side: Text Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tighter">
              Accelerate Gen-AI Tasks on Any Device
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
              Build high-performance AI apps on-device without the hassle of model compression or edge deployment.
            </p>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-block bg-gray-900 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Right Side: Image Accordion */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-row items-center justify-center gap-4 overflow-x-auto p-4">
              {items.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => handleItemHover(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
