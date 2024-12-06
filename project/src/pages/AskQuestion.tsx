import React, { useState, useEffect, useRef } from 'react';
import { TagInput } from '../components/TagInput';
import { ArrowLeft, Send, Mic, Square, Play, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AiGenerateButton } from '../components/AiGenerateButton';

interface Tag {
  id: string;
  label: string;
}

export function AskQuestion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login', { replace: true });
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setIsAnonymous(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Erro ao acessar o microfone. Verifique as permissões do navegador.');
      console.error('Erro ao iniciar gravação:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audioBlob);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!title.trim()) {
        throw new Error('O título é obrigatório');
      }
      if (!content.trim()) {
        throw new Error('O conteúdo é obrigatório');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Você precisa estar logado para fazer uma pergunta');
      }

      let audioUrl = null;
      if (audioBlob) {
        const audioFileName = `audio-${Date.now()}.wav`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('question-audios')
          .upload(audioFileName, audioBlob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = await supabase.storage
          .from('question-audios')
          .getPublicUrl(audioFileName);
          
        audioUrl = publicUrl;
      }

      const questionData = {
        user_id: isAnonymous ? null : session.user.id,
        title: title.trim(),
        content: content.trim(),
        is_anonymous: isAnonymous,
        tags: tags.map(tag => tag.id),
        audio_url: audioUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        upvotes: 0,
        points_spent: 0
      };

      const { error: insertError } = await supabase
        .from('questions')
        .insert([questionData]);

      if (insertError) throw insertError;

      setSuccess('Pergunta publicada com sucesso!');
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao publicar pergunta');
      console.error('Erro ao publicar pergunta:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Mensagens de feedback */}
      {(error || success) && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-lg shadow-sm">
          {/* Cabeçalho */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-muted/80 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Fazer uma Pergunta</h1>
                <p className="mt-1 text-muted-foreground">
                  Compartilhe seus conhecimentos com a comunidade
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Seção do Título */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6">Informações da Pergunta</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="title" className="text-sm font-medium">
                      Título da Pergunta
                    </label>
                    <AiGenerateButton
                      type="title"
                      onGenerate={setTitle}
                      disabled={isLoading || !title.trim()}
                      currentTitle={title}
                    />
                  </div>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input w-full"
                    placeholder="Ex: Como fazer um bolo de cenoura com chocolate?"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Seja específico e imagine que está fazendo uma pergunta para outra pessoa
                  </p>
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="content" className="text-sm font-medium">
                      Detalhes da Pergunta
                    </label>
                    <AiGenerateButton
                      type="content"
                      onGenerate={setContent}
                      disabled={isLoading || !content.trim()}
                      currentTitle={content}
                    />
                  </div>
                  <div className="relative">
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="input w-full resize-none pr-16"
                      placeholder="Descreva todos os detalhes que possam ajudar alguém a responder sua pergunta..."
                      required
                      disabled={isLoading}
                      maxLength={120}
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {content.length}/120
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inclua todo o contexto necessário, código relevante e o que você já tentou fazer
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </label>
                  <TagInput
                    selectedTags={tags}
                    onChange={setTags}
                    maxTags={3}
                    disabled={isLoading}
                    className="min-h-[56px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adicione até 3 tags para ajudar outras pessoas a encontrar sua pergunta
                  </p>
                </div>

                {/* Gravação de Áudio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Áudio da Pergunta (Opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    {!audioBlob ? (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            : 'border border-primary text-primary hover:bg-primary/5'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Square className="h-4 w-4 mr-2 text-primary" />
                            <span>Parar Gravação</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2 text-primary" />
                            <span>Gravar Áudio</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={playAudio}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                        >
                          <Play className="h-4 w-4" />
                          <span>Reproduzir</span>
                        </button>
                        <button
                          type="button"
                          onClick={deleteAudio}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
                  <p className="text-xs text-muted-foreground">
                    Grave um áudio para complementar sua pergunta (máximo 2 minutos)
                  </p>
                </div>
              </div>
            </div>

            {/* Seção de Opções de Publicação */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 border-t border-border pt-6">Opções de Publicação</h3>

              <div className="flex flex-col sm:flex-row items-start gap-3 p-6 bg-muted/40 rounded-lg">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <label htmlFor="anonymous" className="text-sm font-medium">
                      Postar anonimamente
                    </label>
                    {isAnonymous && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] sm:text-xs font-medium bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-500/30 rounded-full shadow-sm backdrop-blur-sm animate-fadeIn transition-all duration-300 hover:shadow hover:border-amber-300/80 dark:hover:border-amber-500/50 w-full sm:w-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="relative font-semibold tracking-wide whitespace-normal sm:whitespace-nowrap">
                          Não será possivel apagar ou ganhar moedas
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Sua pergunta será publicada sem mostrar seu nome ou informações de perfil
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Link
                to="/"
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publicar Pergunta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
