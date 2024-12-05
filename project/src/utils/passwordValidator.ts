interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Mínimo de 8 caracteres
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  // Pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Pelo menos um número
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  // Pelo menos um caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }

  // Não permitir senhas comuns
  const commonPasswords = [
    'password', 'password123', '123456', 'admin123',
    'qwerty', 'letmein', 'welcome', 'monkey123'
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Esta senha é muito comum. Por favor, escolha uma senha mais forte');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPasswordStrength(password: string): {
  score: number;
  feedback: string;
} {
  let score = 0;
  
  // Comprimento
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  // Complexidade
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Variedade de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 2;
  else if (uniqueChars >= 6) score += 1;

  // Feedback baseado no score
  let feedback = '';
  if (score >= 7) feedback = 'Senha muito forte';
  else if (score >= 5) feedback = 'Senha forte';
  else if (score >= 3) feedback = 'Senha moderada';
  else feedback = 'Senha fraca';

  return { score, feedback };
}
