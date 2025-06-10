import { DealItemProps } from "./deal-item";

const DealPrice: React.FC<DealItemProps> = ({ dealItem }) => {
  return (
    <div className="justify-center flex items-baseline gap-2 text-lg font-semibold">
      <p className="text-lg font-bold text-foreground">
        {dealItem?.dealPrice?.toFixed(2)}
      </p>
      <p className="text-primary text-base line-through">
        {dealItem?.schemeAmount?.toFixed(2)}
      </p>
    </div>
  );
};

export default DealPrice;
