'use client';

import { FullscreenLoader, MainContainer, PageLayout, SignInPrompt } from '@/components/layouts';
import { useAuth } from '@/features/auth';

import { EditorHeader } from './components/EditorHeader';
import { InputSection } from './components/InputSection';
import { ScriptPreview } from './components/ScriptPreview';
import { useEditor } from './hooks/useEditor';

export default function Editor() {
  const { user, loading: authLoading, signIn } = useAuth();

  const {
    inputText,
    setInputText,
    title,
    setTitle,
    isGenerating,
    script,
    error,
    handleGenerateScript,
    handleSaveAndGenerate,
  } = useEditor(user);

  if (authLoading) {
    return <FullscreenLoader />;
  }

  if (!user) {
    return (
      <SignInPrompt
        onSignIn={signIn}
        title="Sign In Required"
        description="Please sign in to create projects"
      />
    );
  }

  return (
    <PageLayout>
      <EditorHeader script={script} onSaveAndGenerate={handleSaveAndGenerate} />

      <MainContainer>
        <div className="grid gap-6 lg:grid-cols-2">
          <InputSection
            title={title}
            setTitle={setTitle}
            inputText={inputText}
            setInputText={setInputText}
            error={error}
            isGenerating={isGenerating}
            onGenerateScript={handleGenerateScript}
          />

          <ScriptPreview script={script} />
        </div>
      </MainContainer>
    </PageLayout>
  );
}
