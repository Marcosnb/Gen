import { supabase } from '../lib/supabase';

// Níveis de log
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Interface para o log
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string | null;
  metadata?: any;
}

// Configuração do logger
const config = {
  enableConsoleInDev: process.env.NODE_ENV === 'development',
  logToSupabase: true,
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
};

// Função principal de logging
export async function log(
  level: LogLevel,
  message: string,
  metadata?: any
) {
  const timestamp = new Date().toISOString();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  const logEntry: LogEntry = {
    level,
    message,
    timestamp,
    userId,
    metadata
  };

  // Log no console em desenvolvimento
  if (config.enableConsoleInDev) {
    const consoleMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error
    }[level];

    consoleMethod?.(`[${level}] ${message}`, metadata);
  }

  // Log no Supabase em produção
  if (config.logToSupabase && level >= config.minLevel) {
    try {
      await supabase.from('logs').insert([logEntry]);
    } catch (error) {
      // Fallback para console em caso de erro ao salvar no Supabase
      console.error('Erro ao salvar log:', error);
    }
  }
}

// Funções auxiliares
export const logger = {
  debug: (message: string, metadata?: any) => log(LogLevel.DEBUG, message, metadata),
  info: (message: string, metadata?: any) => log(LogLevel.INFO, message, metadata),
  warn: (message: string, metadata?: any) => log(LogLevel.WARN, message, metadata),
  error: (message: string, metadata?: any) => log(LogLevel.ERROR, message, metadata)
};
