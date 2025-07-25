import React from 'react';
import { Leaf, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Recipe } from '../utils/chat';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeCard({ recipe, className = "" }: RecipeCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative h-32">
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            <Leaf className="w-3 h-3 mr-1" />
            蒸しレシピ
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-base leading-tight">{recipe.name}</CardTitle>
        <CardDescription className="text-xs">{recipe.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">主な成分</p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
              <Badge key={index} variant="outline" className="text-xs py-0">
                {ingredient}
              </Badge>
            ))}
            {recipe.ingredients.length > 3 && (
              <Badge variant="outline" className="text-xs py-0">
                +{recipe.ingredients.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">期待効果</p>
          <div className="flex flex-wrap gap-1">
            {recipe.benefits.slice(0, 2).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs py-0">
                {benefit}
              </Badge>
            ))}
            {recipe.benefits.length > 2 && (
              <Badge variant="secondary" className="text-xs py-0">
                +{recipe.benefits.length - 2}
              </Badge>
            )}
          </div>
        </div>
        
        {recipe.instructions && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">使用方法</p>
            </div>
            <p className="text-xs">{recipe.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}