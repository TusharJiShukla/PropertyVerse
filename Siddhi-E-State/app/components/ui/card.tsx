import React from "react";
import Image from "next/image";
import Link from "next/link";

// Base Card Props
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  hover?: boolean;
  onClick?: () => void;
};

export const Card = ({ 
  className = "", 
  hover = true, 
  onClick, 
  children, 
  ...props 
}: CardProps) => {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-2xl shadow-sm 
        ${hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const CardHeader = ({ className = "", ...props }: CardHeaderProps) => {
  return (
    <div 
      className={`px-4 pt-4 pb-2 border-b border-gray-100 ${className}`} 
      {...props} 
    />
  );
};

// Card Title
type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string;
};

export const CardTitle = ({ className = "", children, ...props }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

// Card Description
type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string;
};

export const CardDescription = ({ className = "", ...props }: CardDescriptionProps) => {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props} />
  );
};

// Card Content
type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  noPadding?: boolean;
};

export const CardContent = ({ 
  className = "", 
  noPadding = false, 
  ...props 
}: CardContentProps) => {
  return (
    <div className={!noPadding ? `p-4 ${className}` : className} {...props} />
  );
};

// Card Footer
type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const CardFooter = ({ className = "", ...props }: CardFooterProps) => {
  return (
    <div 
      className={`px-4 pb-4 pt-2 border-t border-gray-100 ${className}`} 
      {...props} 
    />
  );
};

// Card Image
type CardImageProps = {
  src: string;
  alt: string;
  className?: string;
  height?: number;
  priority?: boolean;
};

export const CardImage = ({ 
  src, 
  alt, 
  className = "", 
  height = 200,
  priority = false 
}: CardImageProps) => {
  return (
    <div className={`relative w-full overflow-hidden rounded-t-2xl`} style={{ height: `${height}px` }}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        priority={priority}
      />
    </div>
  );
};

// Card Badge
type CardBadgeProps = {
  text: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
};

export const CardBadge = ({ 
  text, 
  variant = "default", 
  className = "" 
}: CardBadgeProps) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>
      {text}
    </span>
  );
};

// Card Price
type CardPriceProps = {
  price: number;
  originalPrice?: number;
  currency?: string;
  className?: string;
};

export const CardPrice = ({ 
  price, 
  originalPrice, 
  currency = "₹", 
  className = "" 
}: CardPriceProps) => {
  const formatPrice = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    }
    return value.toLocaleString();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl font-bold text-[#d6a243]">
        {currency}{formatPrice(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-sm line-through text-gray-400">
          {currency}{formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
};

// Card Stats
type CardStatsProps = {
  items: Array<{ label: string; value: string | number; icon?: React.ReactNode }>;
  className?: string;
};

export const CardStats = ({ items, className = "" }: CardStatsProps) => {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.icon && <span className="text-gray-400">{item.icon}</span>}
          <div>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-sm font-medium text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Card Button
type CardButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
};

export const CardButton = ({ 
  children, 
  href, 
  onClick, 
  variant = "primary", 
  fullWidth = false,
  className = "" 
}: CardButtonProps) => {
  const variants = {
    primary: "bg-[#d6a243] hover:bg-[#b48735] text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    outline: "border border-[#d6a243] text-[#d6a243] hover:bg-[#d6a243] hover:text-white",
  };

  const buttonClasses = `
    px-4 py-2 rounded-lg font-medium transition-all duration-300
    ${variants[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
};

// Property Card (Combined component for property listings)
type PropertyCardProps = {
  id: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  image: string;
  bedrooms?: number;
  area?: number;
  areaUnit?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "info";
  onViewDetails?: () => void;
};

export const PropertyCard = ({
  id,
  title,
  location,
  price,
  originalPrice,
  image,
  bedrooms,
  area,
  areaUnit = "sq.ft",
  badge,
  badgeVariant = "default",
  onViewDetails,
}: PropertyCardProps) => {
  return (
    <Card hover>
      <CardImage src={image} alt={title} height={200} />
      <CardContent>
        {badge && (
          <div className="mb-2">
            <CardBadge text={badge} variant={badgeVariant} />
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{location}</CardDescription>
        
        <div className="mt-3 flex items-center justify-between">
          <CardPrice price={price} originalPrice={originalPrice} />
          {(bedrooms || area) && (
            <div className="text-sm text-gray-600">
              {bedrooms && <span>{bedrooms} BHK</span>}
              {bedrooms && area && <span className="mx-1">•</span>}
              {area && <span>{area} {areaUnit}</span>}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <CardButton 
            href={`/schedule-visit?property=${id}`}
            variant="primary" 
            fullWidth
          >
            Schedule Visit
          </CardButton>
        </div>
      </CardContent>
    </Card>
  );
};

// Export all components as default
export default {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardBadge,
  CardPrice,
  CardStats,
  CardButton,
  PropertyCard,
};