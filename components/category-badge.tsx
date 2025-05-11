import { Badge } from "@/components/ui/badge"

interface CategoryBadgeProps {
  name: string
  color: string
  className?: string
}

export function CategoryBadge({ name, color, className = "" }: CategoryBadgeProps) {
  // Create a style with the category color
  const style = {
    backgroundColor: `${color}20`, // 20% opacity
    borderColor: `${color}50`, // 50% opacity
    color: color,
  }

  return (
    <Badge variant="outline" className={`font-medium ${className}`} style={style}>
      {name}
    </Badge>
  )
}
