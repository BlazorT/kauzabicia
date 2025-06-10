import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link href={"/"}>
      <div className="flex gap-2 items-center">
        <Image src={"/logo.png"} alt="logo" width={45} height={45} />
        <p className="text-lg font-bold">Mealz & Dealz</p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
