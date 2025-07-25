import React, { useState, useEffect, useRef } from 'react';
import { Leaf, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { RecipeCard } from './components/RecipeCard';
import { 
  type Message, 
  type ChatState, 
  healthQuestions, 
  generateDiagnosis 
} from './utils/chat';
import { diagnoseWithLLM, getChatResponse } from './utils/llm-api';

export default function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    isComplete: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    // 初期メッセージを追加
    if (chatState.messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "こんにちは！健康診断チャットボットです🌿\n\nいくつかの質問にお答えいただくことで、あなたに最適な蒸しレシピをご提案します。\n\n準備はよろしいですか？",
          {
            hasOptions: true,
            options: ['はい、始めます', '質問について教えて']
          }
        );
      }, 500);
    }
  }, []);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const addBotMessage = (content: string, metadata?: Message['metadata']) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content,
        metadata
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2秒の遅延でタイピング感を演出
  };

  const addUserMessage = (content: string) => {
    addMessage({
      type: 'user',
      content
    });
  };

  const startQuestionnaire = () => {
    addUserMessage('はい、始めます');
    setTimeout(() => {
      askNextQuestion(0);
    }, 500);
  };

  const askNextQuestion = (questionIndex: number) => {
    if (questionIndex < healthQuestions.length) {
      const question = healthQuestions[questionIndex];
      addBotMessage(
        `質問 ${questionIndex + 1}/${healthQuestions.length}\n\n${question.question}`,
        {
          questionId: question.id,
          isQuestion: true,
          hasOptions: true,
          options: ['はい', 'いいえ']
        }
      );
    } else {
      // 診断完了
      completeDiagnosis();
    }
  };

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    const isYes = answer === 'はい';
    
    setChatState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: isYes
      },
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));

    addUserMessage(answer);
    
    setTimeout(() => {
      if (chatState.currentQuestionIndex + 1 < healthQuestions.length) {
        askNextQuestion(chatState.currentQuestionIndex + 1);
      } else {
        completeDiagnosis();
      }
    }, 1000);
  };

  const completeDiagnosis = async () => {
    addBotMessage("AIが診断結果を分析しています...");
    
    try {
      // 回答から症状を抽出
      const answeredQuestions = Object.entries(chatState.userAnswers)
        .filter(([_, answered]) => answered)
        .map(([questionId, _]) => {
          const question = healthQuestions.find(q => q.id === questionId);
          return question?.question || questionId;
        });

      // LLMで診断実行
      const llmResult = await diagnoseWithLLM(answeredQuestions, chatState.userAnswers);
      
      // 診断結果をチャット形式に変換
      const diagnosis = {
        category: llmResult.diagnosis.category,
        statusSummary: llmResult.diagnosis.statusSummary,
        advice: llmResult.diagnosis.advice,
        recommendedRecipes: [{
          id: '1',
          name: `${llmResult.diagnosis.category}専用ブレンド`,
          description: llmResult.diagnosis.statusSummary,
          ingredients: llmResult.diagnosis.recommendedHerbs,
          benefits: llmResult.diagnosis.benefits,
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
          instructions: llmResult.diagnosis.instructions
        }]
      };
      
      setChatState(prev => ({
        ...prev,
        isComplete: true,
        diagnosis
      }));

      addBotMessage(
        `🌟 AI診断が完了しました！\n\n【あなたの状態】\n${diagnosis.category}\n\n${diagnosis.statusSummary}\n\n【推奨ハーブ】\n${llmResult.diagnosis.recommendedHerbs.join('、')}\n\n【アドバイス】\n${diagnosis.advice}\n\n【使用方法】\n${llmResult.diagnosis.instructions}\n\n右側に詳細なレシピを表示しています 💚`
      );

      if (llmResult.note) {
        setTimeout(() => {
          addMessage({
            type: 'system',
            content: `⚠️ ${llmResult.note}`
          });
        }, 1000);
      }
    } catch (error) {
      console.error('LLM診断エラー:', error);
      // フォールバック: 従来の診断を使用
      const diagnosis = generateDiagnosis(chatState.userAnswers);
      
      setChatState(prev => ({
        ...prev,
        isComplete: true,
        diagnosis
      }));

      addBotMessage(
        `診断が完了しました！✨\n\n【診断結果】\n${diagnosis.category}\n\n${diagnosis.statusSummary}\n\n${diagnosis.advice}\n\n右側におすすめのレシピを表示しました。ぜひお試しください！`
      );
      
      addMessage({
        type: 'system',
        content: '⚠️ AI診断が利用できないため、基本診断を使用しています'
      });
    }
  };

  const handleOptionSelect = (option: string) => {
    if (option === 'はい、始めます') {
      startQuestionnaire();
    } else if (option === '質問について教えて') {
      addUserMessage('質問について教えて');
      addBotMessage(
        "この診断では、あなたの現在の体調や生活習慣について${healthQuestions.length}個の質問をお聞きします。\n\n質問内容：\n• ストレスや睡眠について\n• 体の冷えや疲労について\n• 女性特有のお悩みについて\n• 美容や健康状態について\n\n回答いただいた内容を基に、最適な蒸しレシピをご提案いたします。",
        {
          hasOptions: true,
          options: ['診断を始める']
        }
      );
    } else if (option === '診断を始める') {
      startQuestionnaire();
    } else if (option === 'はい' || option === 'いいえ') {
      // 現在の質問に対する回答
      const currentQuestion = healthQuestions[chatState.currentQuestionIndex];
      if (currentQuestion) {
        handleQuestionAnswer(currentQuestion.id, option);
      }
    }
  };

  const handleRestart = () => {
    setChatState({
      messages: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      isComplete: false
    });
    
    setTimeout(() => {
      addBotMessage(
        "診断をリセットしました。もう一度診断を開始しますか？",
        {
          hasOptions: true,
          options: ['はい、始めます']
        }
      );
    }, 500);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg">健康診断チャットボット</h1>
                <p className="text-sm text-muted-foreground">
                  {chatState.isComplete 
                    ? '診断完了 - レシピをご確認ください' 
                    : chatState.messages.length > 1 
                      ? `質問 ${Math.min(chatState.currentQuestionIndex + 1, healthQuestions.length)}/${healthQuestions.length}` 
                      : 'あなたに最適な蒸しレシピを提案します'
                  }
                </p>
              </div>
            </div>
            
            {chatState.messages.length > 2 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestart}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                リセット
              </Button>
            )}
          </div>
        </div>

        {/* チャットメッセージエリア */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {chatState.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onOptionSelect={handleOptionSelect}
              />
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 入力エリア */}
        <ChatInput
          onSendMessage={async (message) => {
            addUserMessage(message);
            if (chatState.isComplete) {
              // 診断完了後は自由な質問に対応
              try {
                setIsTyping(true);
                const response = await getChatResponse(message, {
                  diagnosis: chatState.diagnosis,
                  isComplete: true
                });
                setTimeout(() => {
                  addBotMessage(response);
                }, 1000);
              } catch (error) {
                setTimeout(() => {
                  addBotMessage("申し訳ございませんが、現在応答できません。しばらくしてからもう一度お試しください。");
                }, 1000);
              }
            } else {
              addBotMessage("申し訳ございませんが、診断中は上記の選択肢からお選びください。");
            }
          }}
          disabled={isTyping}
          placeholder={
            chatState.isComplete 
              ? "追加の質問をどうぞ..." 
              : "選択肢からお答えください"
          }
        />
      </div>

      {/* 右サイドバー - レシピ表示エリア */}
      <div className="w-80 bg-secondary/30 border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2>おすすめレシピ</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {chatState.isComplete 
              ? `${chatState.diagnosis?.category} に最適なレシピ`
              : '診断完了後に表示されます'
            }
          </p>
        </div>

        <div className="flex-1 p-4">
          {chatState.isComplete && chatState.diagnosis ? (
            <div className="space-y-4">
              {/* 診断結果サマリー */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary" />
                    診断結果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="mb-2">{chatState.diagnosis.category}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {chatState.diagnosis.statusSummary}
                  </p>
                </CardContent>
              </Card>

              {/* レシピカード */}
              {chatState.diagnosis.recommendedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Leaf className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">診断中...</p>
              <p className="text-sm text-muted-foreground">
                チャットで質問にお答えいただくと、<br />
                こちらにおすすめレシピが表示されます
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}