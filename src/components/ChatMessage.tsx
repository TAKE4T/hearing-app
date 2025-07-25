import React from 'react';
import { Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { Message } from '../utils/chat';

interface ChatMessageProps {
  message: Message;
  onOptionSelect?: (option: string) => void;
}

export function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
  const isBot = message.type === 'bot';
  const isSystem = message.type === 'system';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted/50 text-muted-foreground text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isBot ? 'order-2' : 'order-1'}`}>
        <Card className={`${isBot ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.metadata?.hasOptions && message.metadata?.options && (
              <div className="flex gap-2 mt-3">
                {message.metadata.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={isBot ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => onOptionSelect?.(option)}
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className={`text-xs text-muted-foreground mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
          {message.timestamp.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {!isBot && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}