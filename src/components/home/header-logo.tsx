import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link href={"/"}>
      <div className="flex gap-2 items-center">
        <Image src={"/logo.jpeg"} alt="logo" width={60} height={60} />
        <p className="text-lg font-bold">Kalida</p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
