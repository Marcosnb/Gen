import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { MobileHeader } from './MobileHeader';

export function HeaderWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar se é mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px é o breakpoint padrão para tablets/mobile
    };

    // Verifica inicialmente
    checkIfMobile();

    // Adiciona listener para mudanças no tamanho da tela
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <>
      {isMobile ? <MobileHeader /> : <Header />}
    </>
  );
}
