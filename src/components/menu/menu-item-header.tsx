// src/components/menu/MenuItem/components/MenuItemHeader.tsx
interface MenuItemHeaderProps {
  name: string;
  unitName?: string;
  variations?: Array<{ unitname: string }>;
}

export const MenuItemHeader = ({
  name,
  unitName,
  variations,
}: MenuItemHeaderProps) => {
  return (
    <div>
      <h3 className="font-medium text-lg">{name}</h3>
      <p className="text-sm text-gray-600">
        {variations && variations?.length > 1
          ? variations.map((v) => v.unitname).join(" / ")
          : unitName}
      </p>
    </div>
  );
};
