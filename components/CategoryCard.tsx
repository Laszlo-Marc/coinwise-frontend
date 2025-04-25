
import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: 'food' | 'health';
  amount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, amount }) => {
  const getIcon = () => {
    switch (icon) {
      case 'food':
        return <ShoppingCart size={20} />;
      case 'health':
        return <Heart size={20} />;
      default:
        return <ShoppingCart size={20} />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-lg">
          <span className="text-gray-400 text-xl">...</span>
        </div>
      </div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-lg font-semibold">${amount.toFixed(2)}</div>
    </div>
  );
};

export default CategoryCard;
